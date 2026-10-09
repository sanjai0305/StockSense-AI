import { z } from 'zod';
import prisma from '../config/prisma.js';
import { InventoryService } from '../services/inventoryService.js';

const stockOutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitSellingPrice: z.number().min(0, 'Selling price cannot be negative'),
});

const stockOutSchema = z.object({
  customerId: z.string().optional().nullable(),
  transactionType: z.enum([
    'RETAIL_SALE',
    'DAMAGED_GOODS',
    'EXPIRED_GOODS',
    'INTERNAL_ADJUSTMENT',
    'RETURN_TO_SUPPLIER',
  ]).default('RETAIL_SALE'),
  transactionDate: z.string().optional(),
  referenceNumber: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CREDIT']).default('CASH'),
  discount: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(stockOutItemSchema).min(1, 'At least one item must be included'),
});

export const getStockOutIssues = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, transactionType, startDate, endDate } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId: req.storeId,
      ...(transactionType ? { transactionType } : {}),
      ...(startDate || endDate
        ? {
            transactionDate: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [issues, total] = await Promise.all([
      prisma.stockIssue.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.stockIssue.count({ where }),
    ]);

    res.json({
      success: true,
      data: issues,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStockOut = async (req, res, next) => {
  try {
    const data = stockOutSchema.parse(req.body);

    const transactionNumber = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check stock availability for all items first
      const productMap = new Map();
      for (const item of data.items) {
        const prod = await tx.product.findFirst({
          where: { id: item.productId, storeId: req.storeId },
        });

        if (!prod) {
          throw new Error(`Product not found with ID ${item.productId}`);
        }

        if (prod.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${prod.currentStock} ${prod.unitOfMeasure}, Requested: ${item.quantity}.`
          );
        }

        productMap.set(item.productId, prod);
      }

      // 2. Calculate totals
      let subtotal = 0;
      data.items.forEach((item) => {
        subtotal += item.quantity * item.unitSellingPrice;
      });
      const totalAmount = Math.max(0, subtotal - data.discount);

      // 3. Create StockIssue
      const issue = await tx.stockIssue.create({
        data: {
          storeId: req.storeId,
          customerId: data.customerId || null,
          transactionNumber,
          transactionType: data.transactionType,
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
          referenceNumber: data.referenceNumber || null,
          subtotal,
          discount: data.discount,
          totalAmount,
          paymentMethod: data.paymentMethod,
          notes: data.notes || null,
          createdBy: req.user.fullName,
        },
      });

      // 4. Process each item: record item, reduce stock atomically
      const processedItems = [];
      for (const item of data.items) {
        const prod = productMap.get(item.productId);
        const lineTotal = item.quantity * item.unitSellingPrice;

        const issueItem = await tx.stockIssueItem.create({
          data: {
            issueId: issue.id,
            productId: item.productId,
            quantity: item.quantity,
            unitSellingPrice: item.unitSellingPrice,
            unitCost: prod.purchasePrice,
            lineTotal,
          },
        });

        await InventoryService.recordStockMovement(tx, {
          storeId: req.storeId,
          productId: item.productId,
          movementType: 'STOCK_OUT',
          quantityChange: -item.quantity,
          unitCost: prod.purchasePrice,
          referenceType: 'STOCK_ISSUE',
          referenceId: issue.id,
          notes: `${data.transactionType} - #${transactionNumber}`,
          createdBy: req.user.fullName,
        });

        processedItems.push(issueItem);
      }

      // 5. Update Customer loyalty points if retail sale
      if (data.customerId && data.transactionType === 'RETAIL_SALE') {
        const pointsEarned = Math.floor(totalAmount / 100);
        if (pointsEarned > 0) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: { loyaltyPoints: { increment: pointsEarned } },
          });
        }
      }

      return { issue, processedItems };
    });

    res.status(201).json({
      success: true,
      message: `Stock out recorded successfully. Transaction #${transactionNumber}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
