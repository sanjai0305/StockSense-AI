import { Router } from 'express';
import {
  getDashboardSummary,
  getSalesStockTrend,
  getAiReorderInsights,
  getTopFastMovingProducts,
  getCategoryStockStatus,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/sales-stock-trend', getSalesStockTrend);
router.get('/stock-movements', getSalesStockTrend);
router.get('/ai-insights', getAiReorderInsights);
router.get('/top-selling', getTopFastMovingProducts);
router.get('/top-fast-moving', getTopFastMovingProducts);
router.get('/category-stock', getCategoryStockStatus);
router.get('/category-distribution', getCategoryStockStatus);

export default router;
