import { Router } from 'express';
import * as fxRateController from '../controllers/fxRateController';

const router = Router();

router.get('/active', fxRateController.getActiveFxRate);
router.get('/', fxRateController.getFxRates);
router.post('/', fxRateController.createFxRate);

export default router;
