import { google } from 'googleapis';
import { UserRole } from '@prisma/client';
import prisma from '../prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
);

export function getGoogleAuthUrl(state?: string): string {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.send'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state: state
    });
}

export async function handleGoogleCallback(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const checkOauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });

    const userInfo = await checkOauth2.userinfo.get();

    if (!userInfo.data.email || !userInfo.data.id) {
        throw new Error("Could not retrieve user info from Google");
    }

    const { email, id: googleId, name, picture } = userInfo.data;

    // Upsert user
    // First try to find by googleId
    let user = await prisma.user.findUnique({
        where: { googleId }
    });

    if (!user) {
        // Try to find by email
        user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Link existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    googleEmail: email,
                    pictureUrl: picture,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || undefined, // Only update if provided
                    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
                }
            });
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name: name ?? "No Name",
                    role: UserRole.ADMIN, // Default to ADMIN for now as per requirements
                    googleId,
                    googleEmail: email,
                    pictureUrl: picture,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
                }
            });
        }
    } else {
        // Update tokens for existing google user
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || undefined, // Only update if new one provided
                tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                pictureUrl: picture, // Update picture if changed
                name: name || user.name
            }
        });
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
}
