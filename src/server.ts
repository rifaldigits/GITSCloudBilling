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

app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/quotations', quotationRoutes);
// Usage routes are also mounted standalone if needed, but mainly under subscriptions.
// However, the controller supports /api/usage-daily if desired, but requirements emphasized nested.
// But I created usageDailyRoutes so I should mount it.
// Wait, in step 59 I created usageDailyRoutes.ts 
// And I decided to use it.
// Let's mount it at /api/usage-daily or just rely on subscription nested routes?
// I implemented nested routes in subscriptionRoutes.ts.
// usageDailyRoutes.ts was also created. 
// If I mount it at /api/usage-daily, it exposes /api/usage-daily/ (GET, PUT, DELETE).
// This is fine and good for flexibility.
app.use('/api/usage-daily', usageDailyRoutes);
app.use('/api/fx-rates', fxRateRoutes);

app.listen(env.PORT, () => {
    console.log(`Server started on port ${env.PORT}`);
});
