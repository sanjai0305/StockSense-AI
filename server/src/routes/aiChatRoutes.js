/**
 * StockSense AI - AI Chat Routes
 */
import { Router } from 'express';
import { handleAiChat, getSuggestedQuestions, getKnowledgeOverview } from '../controllers/aiChatController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All AI endpoints require authentication and store scoping
router.use(authenticate);

router.post('/chat', handleAiChat);
router.get('/suggested-questions', getSuggestedQuestions);
router.get('/knowledge', getKnowledgeOverview);

export default router;
