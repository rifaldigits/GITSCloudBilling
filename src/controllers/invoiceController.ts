import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as invoiceService from '../services/invoiceService';
import * as emailService from '../services/emailService';
import prisma from '../prisma/client';

export const sendInvoiceEmail = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const overrides = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await invoiceService.sendInvoiceEmail(id, req.user.id, overrides);
        res.json(result);
    } catch (error: any) {
        console.error('Invoice email error:', error);
        res.status(500).json({ error: error.message || 'Failed to send invoice email' });
    }
};

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const invoices = await invoiceService.getInvoices(status as string);
        res.json(invoices);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

export const getInvoiceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await invoiceService.getInvoiceById(id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
        res.json(invoice);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

export const uploadTaxInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await invoiceService.processTaxInvoiceUpload(id, file, req.user?.id);
        res.json(result);
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload tax invoice' });
    }
};

export const getEmailPreview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { client: true }
        });

        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const template = emailService.buildInvoiceEmailTemplate(invoice, invoice.client);
        res.json({ ...template, toEmailDefault: invoice.client.billingEmail });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to preview email' });
    }
};
