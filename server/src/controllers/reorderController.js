import prisma from '../config/prisma.js';

/**
 * GET /api/reorder/suggestions
 * Returns real, database-driven reorder suggestions scoped to the authenticated store.
 */
export const getReorderSuggestions = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { category, search } = req.query;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store context is required.' });
    }

    // 1. Fetch all active products for the authenticated store
    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        ...(category && category !== 'ALL' && category !== 'All Categories' ? {
          category: { name: { contains: category, mode: 'insensitive' } }
        } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ]
        } : {}),
      },
      include: {
        category: true,
        preferredSupplier: true,
        purchaseOrderItems: {
          where: {
            purchaseOrder: {
              status: { in: ['PENDING', 'PARTIALLY_RECEIVED'] },
            },
          },
          select: {
            orderedQuantity: true,
            receivedQuantity: true,
          },
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    });

    // 2. Evaluate reorder threshold and calculate suggested replenishment quantities
    const suggestions = products
      .filter((p) => p.currentStock <= p.reorderLevel)
      .map((p, idx) => {
        // Pending incoming stock from open purchase orders
        const incomingStock = p.purchaseOrderItems.reduce(
          (sum, item) => sum + Math.max(0, item.orderedQuantity - item.receivedQuantity),
          0
        );

        const target = p.targetStockLevel && p.targetStockLevel > p.reorderLevel
          ? p.targetStockLevel
          : Math.ceil(p.reorderLevel * 2);

        // Replenishment formula: Target - Current Stock
        const netDeficit = target - p.currentStock;
        const suggestedQty = Math.max(1, Math.ceil(netDeficit));

        // Use real purchase cost from DB
        const unitCost = Number(p.purchasePrice) > 0
          ? Number(p.purchasePrice)
          : Number(p.sellingPrice) > 0
          ? Math.round(Number(p.sellingPrice) * 0.8)
          : 0;

        const estimatedCost = Math.round(suggestedQty * unitCost * 100) / 100;

        // Determine urgency priority
        let priority = 'Medium';
        if (p.currentStock <= 0 || p.currentStock <= p.reorderLevel * 0.3) {
          priority = 'Critical';
        } else if (p.currentStock <= p.reorderLevel * 0.7) {
          priority = 'High';
        }

        return {
          id: p.id,
          productId: p.id,
          rowNumber: idx + 1,
          name: p.name,
          sku: p.sku,
          category: p.category?.name || 'Uncategorized',
          currentStock: p.currentStock,
          unitOfMeasure: p.unitOfMeasure || 'units',
          reorderLevel: p.reorderLevel,
          targetStockLevel: target,
          incomingStock,
          suggestedQty,
          supplierId: p.preferredSupplierId || null,
          supplierName: p.preferredSupplier?.name || 'Needs Supplier Assignment',
          supplierCompany: p.preferredSupplier?.companyName || null,
          supplierPhone: p.preferredSupplier?.phone || null,
          priority,
          unitCost,
          estimatedCost,
          imageUrl: p.imageUrl || null,
          selected: true,
        };
      });

    const totalEstimatedCost = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0);

    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length,
      totalEstimatedCost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/reorder/batch-order
 * Transactionally creates real Purchase Orders grouped by supplier in PostgreSQL.
 */
export const placeBatchPurchaseOrders = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one product to place a purchase order.',
      });
    }

    // 1. Validate all products belong to the authenticated store
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
      },
      include: {
        preferredSupplier: true,
      },
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected products are invalid or not found in your store.',
      });
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Fetch or resolve supplier for each item
    const fallbackSupplier = await prisma.supplier.findFirst({
      where: { storeId, isActive: true },
    });

    let defaultSupplierId = fallbackSupplier?.id;
    if (!defaultSupplierId) {
      const createdSupplier = await prisma.supplier.create({
        data: {
          storeId,
          name: 'General FMCG Distributor',
          companyName: 'General Wholesale Supplies',
          phone: '9845012345',
          email: 'orders@fmcgdistributors.com',
          address: 'Main Wholesale Market',
        },
      });
      defaultSupplierId = createdSupplier.id;
    }

    // 3. Group items by supplierId
    const supplierGroups = new Map();

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);
      const supplierId = item.supplierId || dbProduct.preferredSupplierId || defaultSupplierId;
      const quantity = Math.max(1, parseInt(item.quantity || item.suggestedQty, 10) || 1);
      const unitCost = Number(dbProduct.purchasePrice) > 0
        ? Number(dbProduct.purchasePrice)
        : Number(item.unitCost) || 0;

      if (!supplierGroups.has(supplierId)) {
        supplierGroups.set(supplierId, []);
      }

      supplierGroups.get(supplierId).push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        quantity,
        unitCost,
        lineTotal: Math.round(quantity * unitCost * 100) / 100,
      });
    }

    // 4. Create Purchase Orders and Line Items transactionally
    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const [supplierId, groupItems] of supplierGroups.entries()) {
        const orderNumber = `PO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const subtotal = groupItems.reduce((sum, gi) => sum + gi.lineTotal, 0);

        const po = await tx.purchaseOrder.create({
          data: {
            storeId,
            supplierId,
            orderNumber,
            status: 'PENDING',
            subtotal,
            taxAmount: 0,
            totalAmount: subtotal,
            notes: `Auto-generated from Smart Reorders Engine (${groupItems.length} items)`,
            createdBy: req.user?.fullName || 'Store Owner',
          },
        });

        for (const gi of groupItems) {
          await tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId: po.id,
              productId: gi.productId,
              orderedQuantity: gi.quantity,
              receivedQuantity: 0,
              unitCost: gi.unitCost,
              lineTotal: gi.lineTotal,
            },
          });
        }

        orders.push({
          ...po,
          itemCount: groupItems.length,
        });
      }

      return orders;
    });

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdOrders.length} Purchase Order(s) for ${items.length} restock items.`,
      data: createdOrders,
    });
  } catch (error) {
    next(error);
  }
};
