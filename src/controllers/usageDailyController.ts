import { Request, Response } from 'express';
import * as usageRepo from '../repositories/usageDailyRepository';

export const getUsage = async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({ error: 'Start and end dates are required' });
        }

        const usage = await usageRepo.getUsageForSubscriptionAndPeriod(
            subscriptionId,
            new Date(start as string),
            new Date(end as string)
        );
        res.json(usage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
};

export const upsertUsage = async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const { date, quantity, source } = req.body;

        if (!date || quantity === undefined) {
            return res.status(400).json({ error: 'Date and quantity are required' });
        }

        const usage = await usageRepo.upsertDailyUsage(
            subscriptionId,
            new Date(date),
            quantity,
            source
        );
        res.json(usage);
    } catch (error) {
        res.status(400).json({ error: 'Failed to upsert usage' });
    }
};

export const deleteUsage = async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        await usageRepo.deleteUsageBySubscription(subscriptionId);
        res.json({ message: 'Usage deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete usage' });
    }
};
