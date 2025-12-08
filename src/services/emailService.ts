import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { Quotation, Client } from '@prisma/client';

const OAuth2 = google.auth.OAuth2;

// Load env vars
const YOUR_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const YOUR_REDIRECT_URL = process.env.GMAIL_REDIRECT_URL || 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.GMAIL_USER_EMAIL;

export function buildQuotationEmailTemplate(quotation: Quotation, client: Client) {
    const subject = `Quotation for ${client.name} - ${quotation.quoteNumber}`;

    const textBody = `Dear ${client.name},\n\n` +
        `Please find attached the quotation ${quotation.quoteNumber} for the period ` +
        `${quotation.periodStart.toISOString().split('T')[0]} to ${quotation.periodEnd.toISOString().split('T')[0]}.\n\n` +
        `Total Amount: Rp ${Number(quotation.totalIdr).toLocaleString('id-ID')}\n\n` +
        `Best regards,\nGITS Cloud Billing Team`;

    const htmlBody = `<p>Dear <strong>${client.name}</strong>,</p>` +
        `<p>Please find attached the quotation <strong>${quotation.quoteNumber}</strong> for the period ` +
        `<strong>${quotation.periodStart.toISOString().split('T')[0]}</strong> to <strong>${quotation.periodEnd.toISOString().split('T')[0]}</strong>.</p>` +
        `<p>Total Amount: <strong>Rp ${Number(quotation.totalIdr).toLocaleString('id-ID')}</strong></p>` +
        `<br/>` +
        `<p>Best regards,<br/>GITS Cloud Billing Team</p>`;

    return { subject, htmlBody, textBody };
}

interface SendEmailParams {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
    attachments?: { filename: string; path: string }[];
}

export async function sendEmail(params: SendEmailParams): Promise<{ gmailMessageId: string }> {
    if (!YOUR_CLIENT_ID || !YOUR_CLIENT_SECRET || !REFRESH_TOKEN || !EMAIL_USER) {
        throw new Error('Gmail credentials are not fully configured in environment variables.');
    }

    const oauth2Client = new OAuth2(
        YOUR_CLIENT_ID,
        YOUR_CLIENT_SECRET,
        YOUR_REDIRECT_URL
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
    });

    // Fetch access token (automatically handles refresh if possible, or we force it)
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
        throw new Error('Failed to retrieve access token');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: EMAIL_USER,
            clientId: YOUR_CLIENT_ID,
            clientSecret: YOUR_CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
        }
    });

    const mailOptions = {
        from: `GITS Cloud Billing <${EMAIL_USER}>`,
        to: params.to,
        subject: params.subject,
        text: params.textBody,
        html: params.htmlBody,
        attachments: params.attachments
    };

    const info = await transporter.sendMail(mailOptions);

    // Nodemailer with Gmail service usually returns messageId in the format <...>
    // To get the actual Gmail API ID, we might need to inspect nested responses or just use the nodemailer ID as reference.
    // Actually, nodemailer 'gmail' service wraps SMTP or API?
    // Using 'service: gmail' uses SMTP over oauth2. 
    // The messageId returned is usually helpful enough.

    return { gmailMessageId: info.messageId };
}
