import { Request, Response } from 'express';
import * as quotationService from '../services/quotationService';
import { AuthRequest } from '../middleware/authMiddleware';

// ... (previous imports and functions)

export const generateQuotation = async (req: Request, res: Response) => {
    try {
        const { clientId, periodStart, periodEnd, fxRateUsdToIdr, taxRate } = req.body;

        if (!clientId || !periodStart || !periodEnd || taxRate === undefined) {
            return res.status(400).json({ error: 'clientId, periodStart, periodEnd, and taxRate are required' });
        }

        const quotation = await quotationService.createQuotationForClientPeriod({
            clientId,
            periodStart,
            periodEnd,
            fxRateUsdToIdr,
            taxRate
        });

        res.status(201).json(quotation);
    } catch (error: any) {
        console.error('Quotation generation error:', error);
        res.status(500).json({ error: error.message || 'Failed to generate quotation' });
    }
};

export const getQuotation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quotation = await quotationService.getQuotationById(id);

        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        res.json(quotation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quotation' });
    }
};

export const getEmailPreview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const preview = await quotationService.getQuotationForPreview(id);
        res.json(preview);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to fetch email preview' });
    }
};

// ... (existing functions generateQuotation, getQuotation, getEmailPreview)

export const acceptQuotation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await quotationService.setQuotationStatus(id, 'ACCEPTED');
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to accept quotation' });
    }
};

export const denyQuotation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await quotationService.setQuotationStatus(id, 'DENIED');
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Failed to deny quotation' });
    }
};

export const sendEmail = async (req: AuthRequest, res: Response) => {
    console.log('sendEmail - req.user = ', req.user);
    try {
        const { id } = req.params;
        const overrides = req.body; // { toEmail, subject, htmlBody, textBody }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const result = await quotationService.sendQuotationEmail(id, req.user.id, overrides);
        res.json(result);
    } catch (error: any) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
};
