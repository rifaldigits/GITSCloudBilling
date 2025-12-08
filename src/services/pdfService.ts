import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { Quotation, QuotationLine, Client } from '@prisma/client';

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
            // Check page break
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
