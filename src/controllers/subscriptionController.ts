import { Request, Response } from 'express';
import * as subscriptionRepo from '../repositories/subscriptionRepository';
import { Prisma } from '@prisma/client';

export const getClientSubscriptions = async (req: Request, res: Response) => {
    try {
        const { clientId } = req.params;
        const subscriptions = await subscriptionRepo.listSubscriptionsByClient(clientId);
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};

export const getSubscriptionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const subscription = await subscriptionRepo.getSubscriptionById(id);
        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const data: any = { ...req.body };

        // Convert date strings to Date objects
        if (data.startDate) {
            data.startDate = new Date(data.startDate);
        }
        if (data.endDate) {
            data.endDate = new Date(data.endDate);
        }

        const subscription = await subscriptionRepo.createSubscription(data);
        res.status(201).json(subscription);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create subscription' });
    }
};

export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data: any = { ...req.body };

        // Convert date strings to Date objects
        if (data.startDate) {
            data.startDate = new Date(data.startDate);
        }
        if (data.endDate) {
            data.endDate = new Date(data.endDate);
        }

        const subscription = await subscriptionRepo.updateSubscription(id, data);
        res.json(subscription);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update subscription' });
    }
};

export const deleteSubscription = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Check if there is a delete method? Repository doesn't expose hard delete?
        // Wait, looking at repo code previously, I didn't verify delete method existence in subscriptionRepo.
        // Let's check if there is a delete method. If not, I might need to add it or just use update to set status CANCELLED?
        // The requirements say "DELETE ... (hard delete for now)" or "Cancel/Delete".
        // Let's assume I need to check the repo again or add it.
        // I will optimistically check repo again in next step.
        // For now let's implement soft delete (update status) if hard delete is missing, or just throw error.
        // Actually, looking at previous view_file output for subscriptionRepository.ts, there was NO deleteSubscription exported!
        // Only create, update, getById, list...
        // I should ADD deleteSubscription to the repository or implement it here via prisma directly (bad practice) or just use update.
        // Requirement says: "DELETE /api/subscriptions/:id -> delete (hard delete for now)" in the prompt.
        // Wait, prompt says "DELETE /api/products/:id -> delete (hard delete for now)".
        // For subscriptions: "DELETE /api/subscriptions/:id". It doesn't explicitly say hard delete but implies it.
        // I will assume I need to add `deleteSubscription` to the repository.
        // I will write this controller aiming for it to exist, and I'll add it to repo in a moment.
        await subscriptionRepo.deleteSubscription(id);
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete subscription' });
    }
};
