import { Router } from 'express';
import * as subscriptionController from '../controllers/subscriptionController';
import * as usageDailyController from '../controllers/usageDailyController';

const router = Router();

router.get('/:id', subscriptionController.getSubscriptionById);
router.post('/', subscriptionController.createSubscription);
router.put('/:id', subscriptionController.updateSubscription);
router.delete('/:id', subscriptionController.deleteSubscription);

// Usage routes nested under subscription
// GET /api/subscriptions/:subscriptionId/usage?start=YYYY-MM-DD&end=YYYY-MM-DD
// PUT /api/subscriptions/:subscriptionId/usage
// DELETE /api/subscriptions/:subscriptionId/usage
router.get('/:subscriptionId/usage', usageDailyController.getUsage);
router.put('/:subscriptionId/usage', usageDailyController.upsertUsage);
router.delete('/:subscriptionId/usage', usageDailyController.deleteUsage);

export default router;
