import { Router } from 'express';
import * as quotationController from '../controllers/quotationController';

const router = Router();

router.post('/generate', quotationController.generateQuotation);
router.get('/:id', quotationController.getQuotation);
router.get('/:id/email-preview', quotationController.getEmailPreview);
router.post('/:id/send-email', quotationController.sendEmail);

export default router;
