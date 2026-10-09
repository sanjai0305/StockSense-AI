/**
 * StockSense AI - AI Chat Controller
 * Manages chat requests, input validation, authenticated store context, and response formatting.
 */
import { z } from 'zod';
import geminiService from '../services/geminiService.js';
import ragService from '../services/ragKnowledgeService.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message is too long'),
  conversationId: z.string().optional(),
  history: z
    .array(
      z.object({
        sender: z.enum(['user', 'ai']),
        text: z.string(),
      })
    )
    .optional()
    .default([]),
});

/**
 * Process authenticated user question through Gemini & Live Database
 */
export const handleAiChat = async (req, res, next) => {
  try {
    const validated = chatSchema.parse(req.body);
    const storeId = req.storeId;
    const user = req.user;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: 'No active supermarket store associated with this user account.',
      });
    }

    const context = {
      storeId,
      userId: user?.id,
      userName: user?.fullName || 'Store Owner',
      userEmail: user?.email,
      role: user?.role,
    };

    const result = await geminiService.processAiChat({
      message: validated.message,
      history: validated.history,
      context,
    });

    res.json({
      success: true,
      data: {
        reply: result.reply,
        toolsUsed: result.toolsUsed || [],
        sources: result.sources || [],
        conversationId: validated.conversationId || `conv-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0]?.message || 'Invalid request payload',
      });
    }
    next(error);
  }
};

/**
 * Get dynamic suggested prompt questions
 */
export const getSuggestedQuestions = async (req, res) => {
  res.json({
    success: true,
    data: [
      'Which products are running low on stock?',
      'Which products should I reorder today?',
      "What are today's total sales?",
      'Which products are selling the fastest?',
      'Which purchase orders are pending?',
      'How do I calculate safety stock for groceries?',
    ],
  });
};

/**
 * Get indexed RAG knowledge documents overview
 */
export const getKnowledgeOverview = async (req, res) => {
  res.json({
    success: true,
    data: {
      totalDocuments: ragService.KNOWLEDGE_DOCUMENTS.length,
      topics: [
        'Safety Stock & Reorder Point Policy',
        'Expiry Date & FIFO Management',
        'Supplier Purchase Order & Lead Time Workflow',
        'POS Billing, GST & Loyalty Program',
        'Physical Inventory Audit & Discrepancy Reconciliation',
      ],
      documents: ragService.KNOWLEDGE_DOCUMENTS.map((d) => ({
        id: d.id,
        topic: d.topic,
        title: d.title,
        source: d.source,
        tags: d.tags,
      })),
    },
  });
};

export default {
  handleAiChat,
  getSuggestedQuestions,
  getKnowledgeOverview,
};
