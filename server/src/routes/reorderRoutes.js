import { Router } from 'express';
import { getReorderSuggestions, placeBatchPurchaseOrders } from '../controllers/reorderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/suggestions', getReorderSuggestions);
router.post('/batch-order', placeBatchPurchaseOrders);

export default router;
