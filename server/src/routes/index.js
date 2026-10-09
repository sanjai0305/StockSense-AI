import { Router } from 'express';
import authRoutes from './authRoutes.js';
import storeRoutes from './storeRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import supplierRoutes from './supplierRoutes.js';
import customerRoutes from './customerRoutes.js';
import stockInRoutes from './stockInRoutes.js';
import stockOutRoutes from './stockOutRoutes.js';
import billingRoutes from './billingRoutes.js';
import purchaseOrderRoutes from './purchaseOrderRoutes.js';
import reorderRoutes from './reorderRoutes.js';
import reportRoutes from './reportRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/store', storeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/stock-in', stockInRoutes);
router.use('/stock-out', stockOutRoutes);
router.use('/billing', billingRoutes);
router.use('/bills', billingRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/reorder', reorderRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);

export default router;
