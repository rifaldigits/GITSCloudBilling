import { Router } from 'express';
import * as clientController from '../controllers/clientController';
import * as subscriptionController from '../controllers/subscriptionController';

const router = Router();

router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Subscriptions for partial client route
// GET /api/clients/:clientId/subscriptions
router.get('/:clientId/subscriptions', subscriptionController.getClientSubscriptions);

export default router;
