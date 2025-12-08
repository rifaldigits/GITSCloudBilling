import { Request, Response } from 'express';
import * as quotationService from '../services/quotationService';

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

export const sendEmail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const overrides = req.body; // { toEmail, subject, htmlBody, textBody }

        const result = await quotationService.sendQuotationEmail(id, overrides);
        res.json(result);
    } catch (error: any) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: error.message || 'Failed to send email' });
    }
};
