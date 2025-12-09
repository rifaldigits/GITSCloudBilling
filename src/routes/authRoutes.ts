import { Router } from 'express';
import { getGoogleAuthUrl, handleGoogleCallback } from '../services/googleAuthService';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prisma/client';

const router = Router();

router.get('/google/url', (req, res) => {
    const url = getGoogleAuthUrl();
    res.json({ url });
});

router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing code parameter' });
    }

    try {
        const { user, token } = await handleGoogleCallback(code);
        // Return JSON with token and user info
        // Frontend should extract token and store it
        res.json({ token, user });
    } catch (error) {
        console.error('Error in google callback:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Exclude sensitive fields if any (accessToken etc we might not want to send)
        const { accessToken, refreshToken, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
