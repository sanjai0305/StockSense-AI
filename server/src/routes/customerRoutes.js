import { Router } from 'express';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);

export default router;
