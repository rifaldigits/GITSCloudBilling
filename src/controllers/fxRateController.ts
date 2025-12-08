import { Request, Response } from 'express';
import * as fxRateRepo from '../repositories/fxRateRepository';
import { Prisma } from '@prisma/client';

export const getActiveFxRate = async (req: Request, res: Response) => {
    try {
        const fxRate = await fxRateRepo.getActiveFxRate();
        if (!fxRate) {
            return res.status(404).json({ error: 'No active FX rate found' });
        }
        res.json(fxRate);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active FX rate' });
    }
};

export const getFxRates = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (date) {
            const fxRate = await fxRateRepo.getFxRateForDate(new Date(date as string));
            if (!fxRate) {
                return res.status(404).json({ error: 'FX rate not found for date' });
            }
            return res.json(fxRate);
        }

        res.status(501).json({ error: 'Listing all history not implemented yet' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FX rates' });
    }
};

export const createFxRate = async (req: Request, res: Response) => {
    try {
        const { dateEffective, usdToIdr, source, active } = req.body;

        if (!dateEffective || !usdToIdr) {
            return res.status(400).json({ error: 'dateEffective and usdToIdr are required' });
        }

        if (active) {
            await fxRateRepo.deactivateAllActiveRates();
        }

        const fxRate = await fxRateRepo.createFxRate({
            dateEffective: new Date(dateEffective),
            usdToIdr,
            source,
            active
        });
        res.status(201).json(fxRate);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create FX rate' });
    }
};
