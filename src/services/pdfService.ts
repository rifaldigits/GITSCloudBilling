import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Quotation, QuotationLine, Client } from '@prisma/client';
import prisma from '../prisma/client';

export async function generateQuotationPdf(quotation: Quotation & { client: Client; lines: QuotationLine[] }): Promise<string> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        // Ensure directory exists
        const storageDir = path.join(process.cwd(), 'storage', 'quotations');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        const fileName = `${quotation.quoteNumber}.pdf`;
        const filePath = path.join(storageDir, fileName);
        const relativePath = path.join('storage', 'quotations', fileName);

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // --- Header ---
        doc.fontSize(20).text('GITS Cloud Billing', { align: 'left' });
        doc.fontSize(10).text('123 Cloud Street, Tech City', { align: 'left' });
        doc.text('support@gits.cloud', { align: 'left' });
        doc.moveDown();

        doc.fontSize(25).text('QUOTATION', { align: 'right' });

        // --- Client & Meta Info ---
        const startY = 150;
        doc.fontSize(10);

        // Client Details
        doc.text('Bill To:', 50, startY);
        doc.font('Helvetica-Bold').text(quotation.client.name, 50, startY + 15);
        doc.font('Helvetica').text(quotation.client.billingEmail, 50, startY + 30);
        if (quotation.client.address) doc.text(quotation.client.address, 50, startY + 45);

        // Invoice/Quote Details
        const metaX = 400;
        doc.text('Quotation #:', metaX, startY);
        doc.font('Helvetica-Bold').text(quotation.quoteNumber, metaX + 80, startY);

        doc.font('Helvetica').text('Date:', metaX, startY + 15);
        doc.text(quotation.createdAt.toISOString().split('T')[0], metaX + 80, startY + 15);

        doc.text('Period Start:', metaX, startY + 30);
        doc.text(quotation.periodStart.toISOString().split('T')[0], metaX + 80, startY + 30);

        doc.text('Period End:', metaX, startY + 45);
        doc.text(quotation.periodEnd.toISOString().split('T')[0], metaX + 80, startY + 45);

        doc.moveDown(4);

        // --- Table Header ---
        const tableTop = 250;
        const itemX = 50;
        const qtyX = 300;
        const priceX = 370;
        const amountX = 470;

        doc.font('Helvetica-Bold');
        doc.text('Description', itemX, tableTop);
        doc.text('Qty', qtyX, tableTop);
        doc.text('Price (USD)', priceX, tableTop, { width: 90, align: 'right' });
        doc.text('Amount (USD)', amountX, tableTop, { width: 90, align: 'right' });

        doc.moveTo(itemX, tableTop + 15).lineTo(560, tableTop + 15).stroke();

        // --- Table Body ---
        let currentY = tableTop + 25;
        doc.font('Helvetica');

        for (const line of quotation.lines) {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            doc.text(line.productNameSnapshot, itemX, currentY);
            doc.text(line.quantityTotal.toString(), qtyX, currentY);
            doc.text(line.unitPriceUsd.toFixed(2), priceX, currentY, { width: 90, align: 'right' });
            doc.text(line.amountUsd.toFixed(2), amountX, currentY, { width: 90, align: 'right' });

            currentY += 20;
        }

        doc.moveTo(itemX, currentY).lineTo(560, currentY).stroke();
        currentY += 15;

        // --- Totals ---
        const totalsX = 350;
        const valuesX = 470;

        doc.font('Helvetica-Bold');
        doc.text('Subtotal (USD):', totalsX, currentY, { align: 'right', width: 110 });
        doc.text(quotation.subtotalUsd.toFixed(2), valuesX, currentY, { align: 'right', width: 90 });
        currentY += 20;

        doc.font('Helvetica');
        doc.text(`FX Rate (USD->IDR):`, totalsX, currentY, { align: 'right', width: 110 });
        doc.text(quotation.fxRateUsdToIdr.toFixed(2), valuesX, currentY, { align: 'right', width: 90 });
        currentY += 20;

        doc.font('Helvetica-Bold');
        doc.text('Subtotal (IDR):', totalsX, currentY, { align: 'right', width: 110 });
        doc.text(Number(quotation.subtotalIdr).toLocaleString('id-ID'), valuesX, currentY, { align: 'right', width: 90 });
        currentY += 20;

        doc.text(`Tax (${(Number(quotation.taxRate) * 100).toFixed(0)}%):`, totalsX, currentY, { align: 'right', width: 110 });
        doc.text(Number(quotation.taxAmountIdr).toLocaleString('id-ID'), valuesX, currentY, { align: 'right', width: 90 });
        currentY += 25;

        doc.fontSize(14).text('Total (IDR):', totalsX, currentY, { align: 'right', width: 110 });
        doc.text(`Rp ${Number(quotation.totalIdr).toLocaleString('id-ID')}`, valuesX, currentY, { align: 'right', width: 90 });

        // Finalize
        doc.end();

        writeStream.on('finish', () => {
            resolve(relativePath);
        });

        writeStream.on('error', (err) => {
            reject(err);
        });
    });
}

export async function generateInvoicePdf(invoiceId: string): Promise<string> {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            client: true,
            lines: true
        }
    });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    const storageDir = path.join(process.cwd(), 'storage', 'invoices');
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
    }

    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(storageDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const formatDate = (date: Date) => date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const formatCurrency = (value: any) => {
        const num = typeof value === 'number' ? value : Number(value);
        return `Rp ${num.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
    };

    // Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text('GITS Cloud Billing', { align: 'center' });
    doc.moveDown(1.5);

    const startY = doc.y;

    // Invoice Details
    doc.fontSize(10);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 50, startY);
    doc.text(`Invoice Date: ${formatDate(invoice.createdAt)}`, 50, startY + 15);
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 50, startY + 30);
    doc.text(`Period: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, 50, startY + 45);

    // Client Info
    doc.text('Bill To:', 350, startY, { width: 200 });
    doc.text(invoice.client.name, 350, startY + 15, { width: 200 });
    if (invoice.client.address) {
        doc.text(invoice.client.address, 350, startY + 30, { width: 200 });
    }
    if (invoice.client.taxId) {
        doc.text(`Tax ID: ${invoice.client.taxId}`, 350, startY + 60, { width: 200 });
    }

    doc.moveDown(3);

    // Table
    const tableTop = doc.y + 20;
    const columnPositions = [50, 250, 300, 360, 460];
    const columnWidths = [200, 50, 60, 100, 100];

    doc.fontSize(9).fillColor('#000000');
    doc.text('Description', columnPositions[0], tableTop);
    doc.text('Qty', columnPositions[1], tableTop, { width: columnWidths[1], align: 'right' });
    doc.text('Unit', columnPositions[2], tableTop, { width: columnWidths[2], align: 'right' });
    doc.text('Unit Price (IDR)', columnPositions[3], tableTop, { width: columnWidths[3], align: 'right' });
    doc.text('Amount (IDR)', columnPositions[4], tableTop, { width: columnWidths[4], align: 'right' });

    doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();

    let currentY = tableTop + 25;
    invoice.lines.forEach((line: any) => {
        const unitPrice = Number(line.amountIdr) / (Number(line.quantityTotal) || 1);

        doc.text(line.productNameSnapshot, columnPositions[0], currentY, { width: columnWidths[0] });
        doc.text(line.quantityTotal.toString(), columnPositions[1], currentY, { width: columnWidths[1], align: 'right' });
        doc.text(line.unitNameSnapshot, columnPositions[2], currentY, { width: columnWidths[2], align: 'right' });
        doc.text(formatCurrency(unitPrice), columnPositions[3], currentY, { width: columnWidths[3], align: 'right' });
        doc.text(formatCurrency(line.amountIdr), columnPositions[4], currentY, { width: columnWidths[4], align: 'right' });

        currentY += 20;
    });

    // Summary
    currentY += 10;
    doc.moveTo(50, currentY).lineTo(560, currentY).stroke();

    currentY += 15;
    const summaryX = 410;

    doc.text('Subtotal:', summaryX, currentY);
    doc.text(formatCurrency(invoice.subtotalIdr), 480, currentY, { width: 80, align: 'right' });

    currentY += 20;
    doc.text(`Tax (${Number(invoice.taxRate) * 100}%):`, summaryX, currentY);
    doc.text(formatCurrency(invoice.taxAmountIdr), 480, currentY, { width: 80, align: 'right' });

    currentY += 20;
    doc.fontSize(11).fillColor('#000000');
    doc.text('Total:', summaryX, currentY);
    doc.text(formatCurrency(invoice.totalIdr), 480, currentY, { width: 80, align: 'right' });

    // Footer
    doc.fontSize(8).fillColor('#666666');
    doc.text(
        'Please make payment before the due date. Thank you for your business!',
        50,
        doc.page.height - 100,
        { align: 'center', width: doc.page.width - 100 }
    );

    doc.end();

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    return `storage/invoices/${filename}`;
}
