import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Create a new FX rate record
 */
export async function createFxRate(data: Prisma.FxRateCreateInput) {
    return await prisma.fxRate.create({ data });
}

/**
 * Get the currently active FX rate
 * If multiple active rates exist, returns the one with the latest dateEffective
 */
export async function getActiveFxRate() {
    return await prisma.fxRate.findFirst({
        where: { active: true },
        orderBy: { dateEffective: 'desc' },
    });
}

/**
 * Get the applicable FX rate for a specific date
 * Returns the latest rate where dateEffective <= specified date
 */
export async function getFxRateForDate(date: Date) {
    return await prisma.fxRate.findFirst({
        where: {
            dateEffective: { lte: date },
            active: true,
        },
        orderBy: { dateEffective: 'desc' },
    });
}

/**
 * Deactivate all currently active FX rates
 * Useful when setting a new active rate
 */
export async function deactivateAllActiveRates() {
    return await prisma.fxRate.updateMany({
        where: { active: true },
        data: { active: false },
    });
}
