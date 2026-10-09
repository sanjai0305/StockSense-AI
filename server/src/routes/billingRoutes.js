import { Router } from 'express';
import {
  getBillingProducts,
  previewBill,
  createBill,
  getBills,
  getBillById,
} from '../controllers/billingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/products', getBillingProducts);
router.post('/preview', previewBill);
router.post('/', createBill);
router.get('/', getBills);
router.get('/:id', getBillById);

export default router;
