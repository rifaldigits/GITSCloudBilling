import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import { Quotation, Client } from '@prisma/client';
import prisma from '../prisma/client';
import { env } from '../config/env';

const OAuth2 = google.auth.OAuth2;

// Load env vars (still needed for Client ID/Secret)
const YOUR_CLIENT_ID = env.GOOGLE_CLIENT_ID;
const YOUR_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const YOUR_REDIRECT_URL = env.GOOGLE_REDIRECT_URI;

export function buildQuotationEmailTemplate(quotation: Quotation, client: Client) {
    const formatDate = (date: Date) =>
        date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    const formatCurrencyIdr = (value: any) =>
        `Rp ${Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

    const periodStart = formatDate(quotation.periodStart);
    const periodEnd = formatDate(quotation.periodEnd);

    const subtotalIdr = quotation.subtotalIdr ?? quotation.totalIdr; // fallback kalau belum ada field
    const taxAmountIdr = quotation.taxAmountIdr ?? 0;
    const totalIdr = quotation.totalIdr;

    const taxRatePercent =
        quotation.taxRate != null ? Math.round(Number(quotation.taxRate) * 100) : null;

    const subject = `Penawaran Layanan - ${client.name} (${quotation.quoteNumber})`;

    const textBody =
        `Yth. Tim Keuangan ${client.name},\n\n` +
        `Berikut kami sampaikan dokumen penawaran (quotation) dengan nomor ${quotation.quoteNumber} ` +
        `untuk periode ${periodStart} s.d. ${periodEnd}.\n\n` +
        `Ringkasan nilai penawaran:\n` +
        `- Subtotal     : ${formatCurrencyIdr(subtotalIdr)}\n` +
        (taxRatePercent !== null
            ? `- PPN ${taxRatePercent}% : ${formatCurrencyIdr(taxAmountIdr)}\n`
            : "") +
        `- Total        : ${formatCurrencyIdr(totalIdr)}\n\n` +
        `Detail lengkap penawaran dapat Anda lihat pada dokumen PDF terlampir.\n\n` +
        `Apabila informasi pada penawaran ini sudah sesuai, mohon konfirmasinya melalui balasan email ini.\n` +
        `Jika terdapat pertanyaan atau membutuhkan penyesuaian, jangan ragu untuk menghubungi kami.\n\n` +
        `Terima kasih atas kerja sama dan kepercayaannya.\n\n` +
        `Hormat kami,\n` +
        `GITS Cloud Billing Team`;

    const htmlBody =
        `<p>Yth. Tim Keuangan <strong>${client.name}</strong>,</p>` +
        `<p>` +
        `Berikut kami sampaikan dokumen penawaran (quotation) dengan nomor ` +
        `<strong>${quotation.quoteNumber}</strong> untuk periode ` +
        `<strong>${periodStart}</strong> s.d. <strong>${periodEnd}</strong>.` +
        `</p>` +
        `<p><strong>Ringkasan nilai penawaran:</strong></p>` +
        `<ul>` +
        `<li>Subtotal: <strong>${formatCurrencyIdr(subtotalIdr)}</strong></li>` +
        (taxRatePercent !== null
            ? `<li>PPN ${taxRatePercent}%: <strong>${formatCurrencyIdr(taxAmountIdr)}</strong></li>`
            : "") +
        `<li>Total: <strong>${formatCurrencyIdr(totalIdr)}</strong></li>` +
        `</ul>` +
        `<p>Detail lengkap penawaran dapat Anda lihat pada dokumen PDF yang kami lampirkan.</p>` +
        `<p>` +
        `Apabila informasi pada penawaran ini sudah sesuai, mohon konfirmasinya ` +
        `dengan membalas email ini. Bila terdapat pertanyaan lebih lanjut atau membutuhkan penyesuaian, ` +
        `silakan hubungi kami.` +
        `</p>` +
        `<p>Terima kasih atas kerja sama dan kepercayaannya.</p>` +
        `<p>Hormat kami,<br/>GITS Cloud Billing Team</p>`;

    return { subject, htmlBody, textBody };
}

export function buildInvoiceEmailTemplate(invoice: any, client: Client) {
    const formatDate = (date: Date) =>
        date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

    const formatCurrencyIdr = (value: any) =>
        `Rp ${Number(value).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

    const dueDate = formatDate(invoice.dueDate);
    const totalIdr = invoice.totalIdr;

    const subject = `Invoice ${invoice.invoiceNumber} - ${client.name}`;

    const textBody =
        `Yth. Tim Keuangan ${client.name},\n\n` +
        `Berikut kami sampaikan Invoice dengan nomor ${invoice.invoiceNumber} ` +
        `yang akan jatuh tempo pada tanggal ${dueDate}.\n\n` +
        `Total Tagihan: ${formatCurrencyIdr(totalIdr)}\n\n` +
        `Mohon untuk dapat melakukan pembayaran sebelum tanggal jatuh tempo. ` +
        `Detail lengkap invoice dapat Anda lihat pada dokumen PDF terlampir.\n\n` +
        `Terima kasih atas kerja sama dan kepercayaannya.\n\n` +
        `Hormat kami,\n` +
        `GITS Cloud Billing Team`;

    const htmlBody =
        `<p>Yth. Tim Keuangan <strong>${client.name}</strong>,</p>` +
        `<p>` +
        `Berikut kami sampaikan Invoice dengan nomor <strong>${invoice.invoiceNumber}</strong> ` +
        `yang akan jatuh tempo pada tanggal <strong>${dueDate}</strong>.` +
        `</p>` +
        `<p><strong>Total Tagihan: ${formatCurrencyIdr(totalIdr)}</strong></p>` +
        `<p>Mohon untuk dapat melakukan pembayaran sebelum tanggal jatuh tempo. ` +
        `Detail lengkap invoice dapat Anda lihat pada dokumen PDF yang kami lampirkan.</p>` +
        `<p>Terima kasih atas kerja sama dan kepercayaannya.</p>` +
        `<p>Hormat kami,<br/>GITS Cloud Billing Team</p>`;

    return { subject, htmlBody, textBody };
}

interface SendEmailParams {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    attachments?: { filename: string; path: string }[];
}

async function getOauth2ClientForUser(userId: string): Promise<{ oauth2Client: OAuth2Client, userEmail: string }> {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user || !user.accessToken || !user.refreshToken) {
        throw new Error('User not found or not authenticated with Google (missing tokens).');
    }

    const oauth2Client = new OAuth2(
        YOUR_CLIENT_ID,
        YOUR_CLIENT_SECRET,
        YOUR_REDIRECT_URL
    );

    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expiry_date: user.tokenExpiry ? user.tokenExpiry.getTime() : undefined
    });

    return { oauth2Client, userEmail: user.email };
}

export async function sendEmailAsUser(userId: string, params: SendEmailParams): Promise<{ gmailMessageId: string }> {
    if (!YOUR_CLIENT_ID || !YOUR_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials not configured in .env');
    }

    const { oauth2Client, userEmail } = await getOauth2ClientForUser(userId);

    const MailComposer = require('nodemailer/lib/mail-composer');

    const mailOptions = {
        from: `GITS Cloud Billing <${userEmail}>`,
        to: params.to,
        subject: params.subject,
        text: params.textBody,
        html: params.htmlBody,
        attachments: params.attachments
    };

    const composer = new MailComposer(mailOptions);
    const message = await composer.compile().build();

    // Encode as URL-safe Base64
    const raw = message.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: raw
            }
        });

        return { gmailMessageId: res.data.id || 'unknown' };
    } catch (error: any) {
        console.error('Gmail API send error:', error);
        throw new Error(`Failed to send email via Gmail API: ${error.message}`);
    }
}
