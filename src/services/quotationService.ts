import prisma from '../prisma/client';
import * as invoiceService from './invoiceService';
import { Prisma, Quotation, PricingType } from '@prisma/client';
import * as billingEngine from './billingEngine';
import * as pdfService from './pdfService';
import * as emailService from './emailService';
import * as fxRateRepo from '../repositories/fxRateRepository';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

interface CreateQuotationParams {
    clientId: string;
    periodStart: string | Date;
    periodEnd: string | Date;
    fxRateUsdToIdr?: number;
    taxRate: number;
}

export async function createQuotationForClientPeriod(params: CreateQuotationParams): Promise<Quotation> {
    const { clientId, taxRate } = params;
    const periodStart = new Date(params.periodStart);
    const periodEnd = new Date(params.periodEnd);

    // 1. Resolve FX Rate
    let fxRate = params.fxRateUsdToIdr;
    if (!fxRate) {
        const activeFx = await fxRateRepo.getActiveFxRate();
        if (!activeFx) {
            throw new Error('No active FX rate found and none provided.');
        }
        fxRate = activeFx.usdToIdr.toNumber();
    }

    // 2. Compute Billing Lines
    const billingResult = await billingEngine.computeBillingLinesForClientPeriod(
        clientId,
        periodStart,
        periodEnd,
        fxRate,
        taxRate
    );

    // 3. Generate Quote Number (Q-YYYYMMDD-HEX4)
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const quoteNumber = `Q-${dateStr}-${randomSuffix}`;

    // 4. Persist Quotation & Lines
    const quotation = await prisma.$transaction(async (tx) => {
        const createdQuot = await tx.quotation.create({
            data: {
                quoteNumber,
                clientId,
                periodStart,
                periodEnd,
                fxRateUsdToIdr: fxRate,
                taxRate,
                subtotalUsd: billingResult.subtotalUsd,
                subtotalIdr: billingResult.subtotalIdr,
                taxAmountIdr: billingResult.taxAmountIdr,
                totalIdr: billingResult.totalIdr,
                status: 'DRAFT',
                lines: {
                    create: billingResult.lines.map(line => ({
                        subscriptionId: line.subscriptionId,
                        productNameSnapshot: line.productName,
                        pricingTypeSnapshot: line.pricingType as PricingType,
                        unitNameSnapshot: 'unit',
                        periodStart: periodStart,
                        periodEnd: periodEnd,
                        quantityTotal: line.quantityTotal,
                        unitPriceUsd: line.amountUsd.div(line.quantityTotal || 1),
                        amountUsd: line.amountUsd,
                        amountIdr: line.amountIdr
                    }))
                }
            },
            include: {
                client: true,
                lines: true
            }
        });
        return createdQuot;
    });

    // 5. Generate PDF
    const pdfPath = await pdfService.generateQuotationPdf(quotation);

    // Update quotation with PDF path
    const finalQuotation = await prisma.quotation.update({
        where: { id: quotation.id },
        data: { pdfPath },
        include: { lines: true }
    });

    return finalQuotation;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
    return await prisma.quotation.findUnique({
        where: { id },
        include: {
            lines: true,
            client: true
        }
    });
}

export async function getQuotationForPreview(id: string) {
    const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: { client: true }
    });

    if (!quotation) throw new Error('Quotation not found');

    const template = emailService.buildQuotationEmailTemplate(quotation, quotation.client);

    return {
        ...template,
        toEmailDefault: quotation.client.billingEmail
    };
}

export async function sendQuotationEmail(id: string, currentUserId: string, overrides?: {
    toEmail?: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
}) {
    const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: { client: true }
    });

    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'DRAFT' && quotation.status !== 'SENT') {
        throw new Error(`Cannot send quotation in status ${quotation.status}`);
    }

    // 1. Prepare Template
    const template = emailService.buildQuotationEmailTemplate(quotation, quotation.client);

    // 2. Apply Overrides
    const toEmail = overrides?.toEmail || quotation.client.billingEmail;
    const subject = overrides?.subject || template.subject;
    const htmlBody = overrides?.htmlBody || template.htmlBody;
    const textBody = overrides?.textBody || template.textBody;

    // 3. Resolve PDF Path
    let pdfPath = quotation.pdfPath;
    if (!pdfPath) {
        // Regenerate if missing
        const fullQuot = await prisma.quotation.findUnique({ where: { id }, include: { lines: true, client: true } });
        pdfPath = await pdfService.generateQuotationPdf(fullQuot!);
        // Update DB
        await prisma.quotation.update({ where: { id }, data: { pdfPath } });
    }

    // Resolve absolute path
    const absolutePath = path.resolve(process.cwd(), pdfPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`PDF file not found at ${absolutePath}`);
    }

    // 4. Send Email as User
    const result = await emailService.sendEmailAsUser(currentUserId, {
        to: toEmail,
        subject,
        htmlBody,
        textBody,
        attachments: [{
            filename: `${quotation.quoteNumber}.pdf`,
            path: absolutePath
        }]
    });

    // 5. Log Email
    await prisma.emailLog.create({
        data: {
            relatedType: 'QUOTATION',
            relatedId: quotation.id,
            toEmail,
            subject,
            bodyPreview: textBody.substring(0, 200),
            gmailMessageId: result.gmailMessageId,
            sentAt: new Date()
        }
    });

    // 6. Update Quotation Status
    const updatedQuotation = await prisma.quotation.update({
        where: { id },
        data: {
            status: 'SENT',
            sentAt: new Date()
        }
    });

    return updatedQuotation;
}

export async function setQuotationStatus(id: string, status: 'ACCEPTED' | 'DENIED') {
    const quotation = await prisma.quotation.findUnique({
        where: { id },
        include: { lines: true }
    });

    if (!quotation) throw new Error('Quotation not found');

    if (quotation.status === 'ACCEPTED' || quotation.status === 'DENIED') {
        throw new Error(`Quotation is already ${quotation.status}`);
    }

    // Allow transition from DRAFT or SENT

    const updated = await prisma.quotation.update({
        where: { id },
        data: {
            status,
            acceptedAt: status === 'ACCEPTED' ? new Date() : undefined,
            deniedAt: status === 'DENIED' ? new Date() : undefined
        }
    });

    if (status === 'ACCEPTED') {
        const fullQuot = await prisma.quotation.findUnique({ where: { id }, include: { lines: true } });
        await invoiceService.createInvoiceFromQuotation(fullQuot);
    }

    return updated;
}
