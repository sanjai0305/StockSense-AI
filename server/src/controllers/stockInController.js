import { z } from 'zod';
import prisma from '../config/prisma.js';
import { InventoryService } from '../services/inventoryService.js';

const stockInItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityReceived: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  batchNumber: z.string().optional().nullable(),
  manufactureDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
});

const stockInSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  purchaseOrderId: z.string().optional().nullable(),
  invoiceNumber: z.string().min(1, 'Invoice / DC Number is required'),
  receiptDate: z.string().optional(),
  notes: z.string().optional().nullable(),
  items: z.array(stockInItemSchema).min(1, 'At least one product item must be included'),
});

export const getStockInReceipts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, supplierId, startDate, endDate } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId: req.storeId,
      ...(supplierId ? { supplierId } : {}),
      ...(startDate || endDate
        ? {
            receiptDate: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [receipts, total] = await Promise.all([
      prisma.stockReceipt.findMany({
        where,
        include: {
          supplier: true,
          purchaseOrder: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: { receiptDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.stockReceipt.count({ where }),
    ]);

    res.json({
      success: true,
      data: receipts,
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

export const createStockIn = async (req, res, next) => {
  try {
    const data = stockInSchema.parse(req.body);

    const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Calculate subtotal
      let subtotal = 0;
      data.items.forEach((item) => {
        subtotal += item.quantityReceived * item.unitCost;
      });

      // 2. Create StockReceipt
      const receipt = await tx.stockReceipt.create({
        data: {
          storeId: req.storeId,
          supplierId: data.supplierId,
          purchaseOrderId: data.purchaseOrderId || null,
          invoiceNumber: data.invoiceNumber,
          receiptNumber,
          receiptDate: data.receiptDate ? new Date(data.receiptDate) : new Date(),
          subtotal,
          notes: data.notes || null,
          createdBy: req.user.fullName,
        },
      });

      // 3. Process each item: Create receipt item, update stock & movement
      const processedItems = [];
      for (const item of data.items) {
        const lineTotal = item.quantityReceived * item.unitCost;

        const receiptItem = await tx.stockReceiptItem.create({
          data: {
            receiptId: receipt.id,
            productId: item.productId,
            quantityReceived: item.quantityReceived,
            unitCost: item.unitCost,
            lineTotal,
            batchNumber: item.batchNumber || null,
            manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : null,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          },
        });

        // Atomic inventory increase + movement
        await InventoryService.recordStockMovement(tx, {
          storeId: req.storeId,
          productId: item.productId,
          movementType: 'STOCK_IN',
          quantityChange: item.quantityReceived,
          unitCost: item.unitCost,
          referenceType: 'STOCK_RECEIPT',
          referenceId: receipt.id,
          notes: `Stock In Invoice #${data.invoiceNumber} from Supplier`,
          createdBy: req.user.fullName,
        });

        processedItems.push(receiptItem);
      }

      // 4. Update linked Purchase Order if applicable
      if (data.purchaseOrderId) {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: data.purchaseOrderId },
          include: { items: true },
        });

        if (po) {
          let allReceived = true;
          for (const item of data.items) {
            const poItem = po.items.find((i) => i.productId === item.productId);
            if (poItem) {
              const newReceivedQty = poItem.receivedQuantity + item.quantityReceived;
              await tx.purchaseOrderItem.update({
                where: { id: poItem.id },
                data: { receivedQuantity: newReceivedQty },
              });
              if (newReceivedQty < poItem.orderedQuantity) {
                allReceived = false;
              }
            }
          }

          await tx.purchaseOrder.update({
            where: { id: po.id },
            data: {
              status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
            },
          });
        }
      }

      return { receipt, processedItems };
    });

    res.status(201).json({
      success: true,
      message: `Stock received successfully. Receipt #${receiptNumber} created.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
