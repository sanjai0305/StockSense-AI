import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getUsers);
router.post('/', authorize(['STORE_OWNER', 'MANAGER']), createUser);
router.put('/:id', authorize(['STORE_OWNER', 'MANAGER']), updateUser);

export default router;
