import { Router } from 'express';
import { getStore, updateStore } from '../controllers/storeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getStore);
router.put('/', updateStore);

export default router;
