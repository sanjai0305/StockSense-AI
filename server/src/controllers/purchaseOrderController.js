import { z } from 'zod';
import prisma from '../config/prisma.js';

const poItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  orderedQuantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
});

const poSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDeliveryDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(poItemSchema).min(1, 'At least one product item is required'),
});

export const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, supplierId, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId: req.storeId,
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(supplierId ? { supplierId } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
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

export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await prisma.purchaseOrder.findFirst({
      where: { id: req.params.id, storeId: req.storeId },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        stockReceipts: {
          include: { items: { include: { product: true } } },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const data = poSchema.parse(req.body);

    const orderNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    let subtotal = 0;
    data.items.forEach((i) => {
      subtotal += i.orderedQuantity * i.unitCost;
    });

    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          storeId: req.storeId,
          supplierId: data.supplierId,
          orderNumber,
          status: 'PENDING',
          expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
          subtotal,
          taxAmount: 0,
          totalAmount: subtotal,
          notes: data.notes || null,
          createdBy: req.user.fullName,
        },
      });

      for (const item of data.items) {
        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            productId: item.productId,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: 0,
            unitCost: item.unitCost,
            lineTotal: item.orderedQuantity * item.unitCost,
          },
        });
      }

      return po;
    });

    res.status(201).json({
      success: true,
      message: `Purchase Order #${orderNumber} created successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePurchaseOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, message: `PO status updated to ${status}`, data: po });
  } catch (error) {
    next(error);
  }
};
