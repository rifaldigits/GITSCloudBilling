import prisma from '../prisma/client';
import * as emailService from './emailService';
import * as pdfService from './pdfService';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Invoice } from '@prisma/client';

export async function createInvoiceFromQuotation(quotation: any): Promise<Invoice> {
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const client = await prisma.client.findUnique({ where: { id: quotation.clientId } });
    const termsFn = client?.paymentTermsDays || 30;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + termsFn);

    const invoice = await prisma.invoice.create({
        data: {
            invoiceNumber,
            clientId: quotation.clientId,
            quotationId: quotation.id,
            periodStart: quotation.periodStart,
            periodEnd: quotation.periodEnd,
            status: 'READY_FOR_TAX_INVOICE',
            subtotalIdr: quotation.subtotalIdr,
            taxRate: quotation.taxRate,
            taxAmountIdr: quotation.taxAmountIdr,
            totalIdr: quotation.totalIdr,
            dueDate: dueDate,
            lines: {
                create: quotation.lines.map((line: any) => ({
                    subscriptionId: line.subscriptionId,
                    productNameSnapshot: line.productNameSnapshot,
                    pricingTypeSnapshot: line.pricingTypeSnapshot,
                    unitNameSnapshot: line.unitNameSnapshot,
                    periodStart: line.periodStart,
                    periodEnd: line.periodEnd,
                    quantityTotal: line.quantityTotal,
                    unitPriceUsd: line.unitPriceUsd,
                    amountUsd: line.amountUsd,
                    amountIdr: line.amountIdr
                }))
            }
        },
        include: { lines: true }
    });

    // Generate PDF immediately
    const pdfPath = await pdfService.generateInvoicePdf(invoice.id);

    // Update invoice with PDF path
    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfPath },
        include: { lines: true }
    });

    return updatedInvoice;
}

export async function processTaxInvoiceUpload(invoiceId: string, file: Express.Multer.File, userId?: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error('Invoice not found');

    const relativePath = file.path.replace(/\\/g, '/');

    await prisma.taxInvoice.create({
        data: {
            invoiceId,
            filePath: relativePath,
            uploadedByUserId: userId
        }
    });

    await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'READY_TO_SEND' }
    });

    return { success: true, filePath: relativePath };
}

export async function getInvoices(status?: string) {
    return await prisma.invoice.findMany({
        where: status ? { status: status as any } : undefined,
        include: { client: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getInvoiceById(id: string) {
    return await prisma.invoice.findUnique({
        where: { id },
        include: { lines: true, client: true, taxInvoices: true }
    });
}

export async function sendInvoiceEmail(id: string, currentUserId: string, overrides?: {
    toEmail?: string;
    subject?: string;
    htmlBody?: string;
    textBody?: string;
}) {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { client: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    if (invoice.status !== 'READY_TO_SEND' && invoice.status !== 'SENT') {
        throw new Error(`Invoice status ${invoice.status} is not ready to send (needs tax invoice).`);
    }

    let pdfPath = invoice.pdfPath;
    if (!pdfPath) {
        pdfPath = await pdfService.generateInvoicePdf(id);
        await prisma.invoice.update({ where: { id }, data: { pdfPath } });
    }

    const absolutePath = path.resolve(process.cwd(), pdfPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`PDF file not found at ${absolutePath}`);
    }

    const taxInvoices = await prisma.taxInvoice.findMany({ where: { invoiceId: id } });
    const attachments = [{
        filename: `${invoice.invoiceNumber}.pdf`,
        path: absolutePath
    }];

    for (const taxInv of taxInvoices) {
        const taxPath = path.resolve(process.cwd(), taxInv.filePath);
        if (fs.existsSync(taxPath)) {
            attachments.push({
                filename: `TaxInvoice-${path.basename(taxInv.filePath)}`,
                path: taxPath
            });
        }
    }

    const template = emailService.buildInvoiceEmailTemplate(invoice, invoice.client);

    const subject = overrides?.subject || template.subject;
    const textBody = overrides?.textBody || template.textBody;
    const htmlBody = overrides?.htmlBody || template.htmlBody;

    const toEmail = overrides?.toEmail || invoice.client.billingEmail;

    const result = await emailService.sendEmailAsUser(currentUserId, {
        to: toEmail,
        subject,
        htmlBody,
        textBody,
        attachments
    });

    await prisma.emailLog.create({
        data: {
            relatedType: 'INVOICE',
            relatedId: invoice.id,
            toEmail,
            subject,
            bodyPreview: textBody.substring(0, 200),
            gmailMessageId: result.gmailMessageId,
            sentAt: new Date()
        }
    });

    await prisma.invoice.update({
        where: { id },
        data: { status: 'SENT', sentAt: new Date() }
    });

    return { success: true, messageId: result.gmailMessageId };
}
