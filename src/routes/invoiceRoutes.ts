import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as invoiceController from '../controllers/invoiceController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(process.cwd(), 'storage', 'tax-invoices');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Unique filename: tax-inv-{timestamp}-{random}.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'tax-inv-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

router.get('/', authMiddleware, invoiceController.getInvoices);
router.get('/:id', authMiddleware, invoiceController.getInvoiceById);

// Upload Tax Invoice
router.post('/:id/tax-invoice', authMiddleware, upload.single('file'), invoiceController.uploadTaxInvoice);

// Email
router.get('/:id/email-preview', authMiddleware, invoiceController.getEmailPreview);
router.post('/:id/send-email', authMiddleware, invoiceController.sendInvoiceEmail);

export default router;
