import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: UserRole;
    };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: UserRole };
        req.user = {
            id: decoded.userId,
            role: decoded.role
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
