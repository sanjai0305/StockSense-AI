import { z } from 'zod';
import prisma from '../config/prisma.js';
import { InventoryService } from '../services/inventoryService.js';

const billItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitSellingPrice: z.number().min(0).optional(),
  discountAmount: z.number().min(0).default(0),
});

const createBillSchema = z.object({
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'OTHER']).default('CASH'),
  discountAmount: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  amountPaid: z.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  items: z.array(billItemInputSchema).min(1, 'At least one product item is required for checkout'),
});

export const getBillingProducts = async (req, res, next) => {
  try {
    const { search = '', categoryId = '' } = req.query;

    const products = await prisma.product.findMany({
      where: {
        storeId: req.storeId,
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category.name,
      categoryId: p.categoryId,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice,
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      unitOfMeasure: p.unitOfMeasure,
      imageUrl: p.imageUrl,
      isOutOfStock: p.currentStock <= 0,
      isLowStock: p.currentStock <= p.reorderLevel,
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const previewBill = async (req, res, next) => {
  try {
    const { items = [], discountAmount = 0, taxAmount = 0 } = req.body;

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = await prisma.product.findFirst({
        where: { id: item.productId, storeId: req.storeId },
      });

      if (!prod) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      const rate = item.unitSellingPrice !== undefined ? Number(item.unitSellingPrice) : prod.sellingPrice;
      const lineTotal = Number(item.quantity) * rate - (Number(item.discountAmount) || 0);
      subtotal += lineTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        quantity: Number(item.quantity),
        rate,
        availableStock: prod.currentStock,
        lineTotal,
      });
    }

    const totalAmount = Math.max(0, subtotal - Number(discountAmount) + Number(taxAmount));

    res.json({
      success: true,
      data: {
        subtotal,
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        totalAmount,
        items: validatedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBill = async (req, res, next) => {
  try {
    const data = createBillSchema.parse(req.body);

    const billNumber = `BILL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch & lock/validate all products from DB
      let subtotal = 0;
      const validatedItems = [];

      for (const item of data.items) {
        const prod = await tx.product.findFirst({
          where: { id: item.productId, storeId: req.storeId },
        });

        if (!prod || !prod.isActive) {
          throw new Error(`Product not found or inactive: ${item.productId}`);
        }

        if (prod.currentStock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${prod.currentStock} ${prod.unitOfMeasure}, Requested: ${item.quantity}.`
          );
        }

        const unitSellingPrice = item.unitSellingPrice !== undefined ? item.unitSellingPrice : prod.sellingPrice;
        const lineTotal = item.quantity * unitSellingPrice - (item.discountAmount || 0);
        subtotal += lineTotal;

        validatedItems.push({
          product: prod,
          quantity: item.quantity,
          unitSellingPrice,
          unitCostSnapshot: prod.purchasePrice,
          discountAmount: item.discountAmount || 0,
          lineTotal,
        });
      }

      const totalAmount = Math.max(0, subtotal - data.discountAmount + data.taxAmount);
      const amountPaid = data.amountPaid > 0 ? data.amountPaid : totalAmount;
      const changeAmount = Math.max(0, amountPaid - totalAmount);

      // 2. Create Bill Record
      const bill = await tx.bill.create({
        data: {
          storeId: req.storeId,
          billNumber,
          customerId: data.customerId || null,
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          subtotal,
          discountAmount: data.discountAmount,
          taxAmount: data.taxAmount,
          totalAmount,
          amountPaid,
          changeAmount,
          paymentMethod: data.paymentMethod,
          paymentStatus: amountPaid >= totalAmount ? 'PAID' : 'PARTIAL',
          billStatus: 'COMPLETED',
          notes: data.notes || null,
          createdBy: req.user.fullName,
        },
      });

      // 3. Process items & reduce stock atomically
      const createdBillItems = [];
      for (const item of validatedItems) {
        const billItem = await tx.billItem.create({
          data: {
            billId: bill.id,
            productId: item.product.id,
            productNameSnapshot: item.product.name,
            skuSnapshot: item.product.sku,
            quantity: item.quantity,
            unitSellingPrice: item.unitSellingPrice,
            unitCostSnapshot: item.unitCostSnapshot,
            discountAmount: item.discountAmount,
            taxAmount: 0,
            lineTotal: item.lineTotal,
          },
        });

        createdBillItems.push(billItem);

        // Atomic inventory reduction + movement record
        await InventoryService.recordStockMovement(tx, {
          storeId: req.storeId,
          productId: item.product.id,
          movementType: 'SALE_BILL',
          quantityChange: -item.quantity,
          unitCost: item.unitCostSnapshot,
          referenceType: 'BILL',
          referenceId: bill.id,
          notes: `Customer Bill #${billNumber}`,
          createdBy: req.user.fullName,
        });
      }

      // 4. Update Customer loyalty points if customer selected
      if (data.customerId) {
        const pointsEarned = Math.floor(totalAmount / 100);
        if (pointsEarned > 0) {
          await tx.customer.update({
            where: { id: data.customerId },
            data: { loyaltyPoints: { increment: pointsEarned } },
          });
        }
      }

      return { bill, items: createdBillItems };
    });

    res.status(201).json({
      success: true,
      message: `Bill #${billNumber} generated successfully! Stock deducted.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBills = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      paymentMethod = '',
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId: req.storeId,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { billNumber: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerPhone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.bill.count({ where }),
    ]);

    const totalSalesSum = await prisma.bill.aggregate({
      where: { storeId: req.storeId, billStatus: 'COMPLETED' },
      _sum: { totalAmount: true },
    });

    res.json({
      success: true,
      data: bills,
      totalSalesRevenue: totalSalesSum._sum.totalAmount || 0,
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

export const getBillById = async (req, res, next) => {
  try {
    const bill = await prisma.bill.findFirst({
      where: { id: req.params.id, storeId: req.storeId },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        store: true,
      },
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};
