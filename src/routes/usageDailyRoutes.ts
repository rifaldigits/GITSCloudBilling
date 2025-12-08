import { Router } from 'express';
// Usage routes are mainly under subscriptions, but we might have a standalone one if needed.
// However, the requirement asked for /api/subscriptions/:subscriptionId/usage.
// So usage is handled in subscriptionRoutes technically.
// But wait, plan said:
// usageDailyRoutes: Mounts usage controller methods to `/`.
// And plan listed:
// GET /api/subscriptions/:subscriptionId/usage?start=... -> In Subscription Routes?
// OR /api/usage-daily?
// Requirement said:
// UsageDaily:
// - GET /api/subscriptions/:subscriptionId/usage...
// So it belongs nicely under /api/subscriptions router.
// OR we can make a router for usage and mount it?
// The usage routes are ALL under /subscriptions/:subscriptionId/...
// So I included them in subscriptionRoutes.ts as sub-routes.
// I will keep usageDailyRoutes.ts empty or redirect?
// Actually, I can just not create usageDailyRoutes.ts if I put them in subscriptionRoutes.ts.
// BUT to stick to the plan strictly, maybe I should have:
// /api/usage-daily/... ? No requirement says /api/subscriptions/...
// So best place is subscriptionRoutes.ts.
// I'll skip creating usageDailyRoutes.ts or make it a dummy/redirect if I must.
// The plan listed "src/routes/usageDailyRoutes.ts".
// I'll make it empty or comments explaining it's in subscriptionRoutes.
// OR I can separate it if I mount it at /api/subscriptions/:subscriptionId/usage?
// Express router merging params? 
// Let's just keep it in subscriptionRoutes.ts for simplicity and clarity of URL structure.
// I will not create usageDailyRoutes.ts, I will just mark it as handled in task.md.
// Wait, I should stick to plan if possible. 
// Can I mount usage router at /api/subscriptions/:subscriptionId/usage?
// Yes.
// In server.ts: app.use('/api/subscriptions', subscriptionRouter);
// In subscriptionRouter: router.use('/:subscriptionId/usage', usageRouter);
// This is cleaner.
import * as usageDailyController from '../controllers/usageDailyController';

const router = Router({ mergeParams: true });

router.get('/', usageDailyController.getUsage);
router.put('/', usageDailyController.upsertUsage);
router.delete('/', usageDailyController.deleteUsage);

export default router;
