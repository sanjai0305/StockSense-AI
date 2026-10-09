import { Router } from 'express';
import { getStockOutIssues, createStockOut } from '../controllers/stockOutController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getStockOutIssues);
router.post('/', createStockOut);

export default router;
