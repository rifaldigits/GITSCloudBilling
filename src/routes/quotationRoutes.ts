import { Router } from 'express';
import * as quotationController from '../controllers/quotationController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/generate', quotationController.generateQuotation);
router.get('/:id', quotationController.getQuotation);
router.get('/:id/email-preview', quotationController.getEmailPreview);
// ...
router.post('/:id/accept', authMiddleware, quotationController.acceptQuotation);
router.post('/:id/deny', authMiddleware, quotationController.denyQuotation);
router.post(
    '/:id/send-email',
    authMiddleware,     // <—— wajib
    quotationController.sendEmail,
);


export default router;
