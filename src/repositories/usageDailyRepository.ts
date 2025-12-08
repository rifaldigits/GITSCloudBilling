import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Upsert daily usage record (create if not exists, update if exists)
 * Uses unique constraint on (subscriptionId, date)
 */
export async function upsertDailyUsage(
    subscriptionId: string,
    date: Date,
    quantity: number | Prisma.Decimal,
    source: string = 'manual'
) {
    return await prisma.usageDaily.upsert({
        where: {
            subscriptionId_date: {
                subscriptionId,
                date,
            },
        },
        update: {
            quantity,
            source,
        },
        create: {
            subscriptionId,
            date,
            quantity,
            source,
        },
    });
}

/**
 * Get usage records for a subscription within a specific period
 */
export async function getUsageForSubscriptionAndPeriod(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date
) {
    return await prisma.usageDaily.findMany({
        where: {
            subscriptionId,
            date: {
                gte: periodStart,
                lte: periodEnd,
            },
        },
        orderBy: { date: 'asc' },
    });
}

/**
 * Delete all usage records for a specific subscription
 * Useful for cleanup operations
 */
export async function deleteUsageBySubscription(subscriptionId: string) {
    return await prisma.usageDaily.deleteMany({
        where: { subscriptionId },
    });
}
