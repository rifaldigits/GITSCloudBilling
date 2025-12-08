import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

/**
 * Create a new subscription
 */
export async function createSubscription(data: Prisma.SubscriptionCreateInput) {
    return await prisma.subscription.create({ data });
}

/**
 * Update an existing subscription by ID
 */
export async function updateSubscription(id: string, data: Prisma.SubscriptionUpdateInput) {
    return await prisma.subscription.update({
        where: { id },
        data,
    });
}

/**
 * Get a single subscription by ID
 */
export async function getSubscriptionById(id: string) {
    return await prisma.subscription.findUnique({
        where: { id },
        include: {
            client: true,
            product: true,
        },
    });
}

/**
 * List all subscriptions for a specific client
 */
export async function listSubscriptionsByClient(clientId: string) {
    return await prisma.subscription.findMany({
        where: { clientId },
        include: {
            product: true,
        },
        orderBy: { startDate: 'desc' },
    });
}

/**
 * List active subscriptions for a client that overlap with a specific billing period
 * 
 * Overlap rule:
 * A subscription overlaps a period if:
 * - subscription.startDate <= periodEnd AND
 * - (subscription.endDate is null OR subscription.endDate >= periodStart)
 */
export async function listActiveSubscriptionsByClientAndPeriod(
    clientId: string,
    periodStart: Date,
    periodEnd: Date
) {
    return await prisma.subscription.findMany({
        where: {
            clientId,
            status: 'ACTIVE',
            startDate: { lte: periodEnd },
            OR: [
                { endDate: null },
                { endDate: { gte: periodStart } },
            ],
        },
        include: {
            product: true,
        },
        // ... existing code ...
        orderBy: { startDate: 'asc' },
    });
}

/**
 * Delete a subscription by ID
 */
export async function deleteSubscription(id: string) {
    return await prisma.subscription.delete({
        where: { id },
    });
}
