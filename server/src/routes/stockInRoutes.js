import { Router } from 'express';
import { getStockInReceipts, createStockIn } from '../controllers/stockInController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getStockInReceipts);
router.post('/', createStockIn);

export default router;
