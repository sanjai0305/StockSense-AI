import { Router } from 'express';
import {
  getInventoryReport,
  getStockInReport,
  getStockOutReport,
  getStockMovementsReport,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/inventory', getInventoryReport);
router.get('/stock-in', getStockInReport);
router.get('/stock-out', getStockOutReport);
router.get('/movements', getStockMovementsReport);

export default router;
