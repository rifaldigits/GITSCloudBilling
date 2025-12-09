import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import prisma from './prisma/client';
import productRoutes from './routes/productRoutes';
import clientRoutes from './routes/clientRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import usageDailyRoutes from './routes/usageDailyRoutes';
import fxRateRoutes from './routes/fxRateRoutes';
import quotationRoutes from './routes/quotationRoutes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
// Serve storage folder statically to access PDFs
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

import authRoutes from './routes/authRoutes';

// ... (existing imports)

import invoiceRoutes from './routes/invoiceRoutes';

// ... (existing imports)

// Mount auth routes
app.use('/api/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/usage-daily', usageDailyRoutes);
app.use('/api/fx-rates', fxRateRoutes);

app.listen(env.PORT, () => {
    console.log(`Server started on port ${env.PORT}`);
});
