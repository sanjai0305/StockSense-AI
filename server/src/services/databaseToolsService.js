/**
 * StockSense AI - Safe Database Tools Service
 * Executes authorized, read-only queries against PostgreSQL/Prisma with store scoping.
 */
import prisma from '../config/prisma.js';

/**
 * 1. Get high-level inventory KPIs, valuation, and category summary
 */
export const getInventorySummary = async ({ storeId }) => {
  const [totalProducts, lowStockProducts, outOfStockProducts, categories, suppliers] = await Promise.all([
    prisma.product.count({ where: { storeId, isActive: true } }),
    prisma.product.count({
      where: {
        storeId,
        isActive: true,
        currentStock: { lte: prisma.product.fields ? undefined : 20 }, // fallback handled below
      },
    }),
    prisma.product.count({ where: { storeId, isActive: true, currentStock: { lte: 0 } } }),
    prisma.category.count({ where: { storeId, isActive: true } }),
    prisma.supplier.count({ where: { storeId, isActive: true } }),
  ]);

  // Query actual products for exact stock valuation and low stock count
  const allProducts = await prisma.product.findMany({
    where: { storeId, isActive: true },
    select: { currentStock: true, reorderLevel: true, purchasePrice: true, sellingPrice: true },
  });

  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalPurchaseValuation = 0;
  let totalRetailValuation = 0;
  let totalUnitsInStore = 0;

  allProducts.forEach((p) => {
    totalUnitsInStore += p.currentStock;
    totalPurchaseValuation += p.currentStock * p.purchasePrice;
    totalRetailValuation += p.currentStock * p.sellingPrice;
    if (p.currentStock <= 0) {
      outOfStockCount++;
      lowStockCount++;
    } else if (p.currentStock <= p.reorderLevel) {
      lowStockCount++;
    }
  });

  const inStockCount = totalProducts - lowStockCount;

  return {
    totalProducts,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    totalCategories: categories,
    totalSuppliers: suppliers,
    totalUnitsInStore: Math.round(totalUnitsInStore),
    inventoryPurchaseValuation: Math.round(totalPurchaseValuation),
    inventoryRetailValuation: Math.round(totalRetailValuation),
    potentialProfitMargin: Math.round(totalRetailValuation - totalPurchaseValuation),
    storeHealthScore: totalProducts > 0 ? Math.round(((totalProducts - lowStockCount) / totalProducts) * 100) : 100,
  };
};

/**
 * 2. Search specific products or query live stock counts
 */
export const getProductStock = async ({ storeId, search = '', sku = '', categoryName = '', lowStockOnly = false, limit = 10 }) => {
  const where = {
    storeId,
    isActive: true,
    ...(sku ? { sku: { equals: sku, mode: 'insensitive' } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categoryName
      ? {
          category: {
            name: { contains: categoryName, mode: 'insensitive' },
          },
        }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      preferredSupplier: { select: { name: true, phone: true } },
    },
    take: limit,
    orderBy: { currentStock: 'asc' },
  });

  const formatted = products.map((p) => {
    const isLow = p.currentStock <= p.reorderLevel;
    const isOut = p.currentStock <= 0;
    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode || 'N/A',
      category: p.category?.name || 'Uncategorized',
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      targetStockLevel: p.targetStockLevel,
      unit: p.unitOfMeasure,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      supplier: p.preferredSupplier?.name || 'Direct / Local Supplier',
      status: isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'IN_STOCK',
      deficit: Math.max(0, p.reorderLevel - p.currentStock),
      suggestedOrderQty: Math.max(0, p.targetStockLevel - p.currentStock),
    };
  });

  return {
    count: formatted.length,
    products: lowStockOnly ? formatted.filter((p) => p.status !== 'IN_STOCK') : formatted,
  };
};

/**
 * 3. Get all critical low-stock items that require reordering
 */
export const getLowStockProducts = async ({ storeId, limit = 15, categoryId = null }) => {
  const products = await prisma.product.findMany({
    where: {
      storeId,
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      category: { select: { name: true } },
      preferredSupplier: { select: { name: true, phone: true, leadTimeDays: true } },
    },
    orderBy: { currentStock: 'asc' },
  });

  // Filter products at or below reorder level
  const lowStock = products
    .filter((p) => p.currentStock <= p.reorderLevel)
    .map((p) => {
      const deficit = Math.max(0, p.reorderLevel - p.currentStock);
      const suggestedReorder = Math.max(0, p.targetStockLevel - p.currentStock);
      const estimatedCost = Math.round(suggestedReorder * p.purchasePrice);
      const urgency = p.currentStock <= 0 ? 'CRITICAL (Out of Stock)' : p.currentStock <= p.reorderLevel * 0.3 ? 'URGENT' : 'HIGH';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || 'General',
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
        unit: p.unitOfMeasure,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        deficit,
        suggestedReorder,
        estimatedCost,
        urgency,
        supplier: p.preferredSupplier?.name || 'Local Supplier',
        leadTimeDays: p.preferredSupplier?.leadTimeDays || 3,
      };
    })
    .sort((a, b) => (a.currentStock === 0 ? -1 : a.currentStock - b.currentStock))
    .slice(0, limit);

  const totalReplenishmentCost = lowStock.reduce((sum, item) => sum + item.estimatedCost, 0);

  return {
    totalLowStockCount: lowStock.length,
    totalReplenishmentCost,
    items: lowStock,
  };
};

/**
 * 4. Get sales performance, revenue, bill counts, and payment breakdowns
 */
export const getSalesSummary = async ({ storeId, period = 'today', startDate = null, endDate = null }) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'yesterday') {
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(now.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'this_week' || period === 'week') {
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'this_month' || period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else {
    // Default today
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const bills = await prisma.bill.findMany({
    where: {
      storeId,
      createdAt: { gte: start, lte: end },
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, category: { select: { name: true } } } },
        },
      },
    },
  });

  let totalSalesAmount = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalItemsSold = 0;
  const paymentModes = { CASH: 0, UPI: 0, CARD: 0, OTHER: 0 };

  bills.forEach((b) => {
    totalSalesAmount += b.totalAmount || 0;
    totalDiscount += b.discountAmount || 0;
    totalTax += b.taxAmount || 0;

    const mode = (b.paymentMethod || 'CASH').toUpperCase();
    paymentModes[mode] = (paymentModes[mode] || 0) + (b.totalAmount || 0);

    b.items.forEach((item) => {
      totalItemsSold += item.quantity || 0;
    });
  });

  const totalBillsCount = bills.length;
  const averageBillValue = totalBillsCount > 0 ? Math.round(totalSalesAmount / totalBillsCount) : 0;

  return {
    period,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    totalBillsCount,
    totalSalesAmount: Math.round(totalSalesAmount),
    totalItemsSold: Math.round(totalItemsSold),
    averageBillValue,
    totalDiscount: Math.round(totalDiscount),
    totalTax: Math.round(totalTax),
    paymentModesBreakdown: paymentModes,
  };
};

/**
 * 5. Get top-selling products by volume and revenue
 */
export const getTopSellingProducts = async ({ storeId, limit = 8, days = 30 }) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const billItems = await prisma.billItem.findMany({
    where: {
      bill: {
        storeId,
        createdAt: { gte: startDate },
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          currentStock: true,
          sellingPrice: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  const productAggMap = {};

  billItems.forEach((item) => {
    const prodId = item.productId;
    if (!productAggMap[prodId]) {
      productAggMap[prodId] = {
        id: prodId,
        name: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || 'N/A',
        category: item.product?.category?.name || 'General',
        currentStock: item.product?.currentStock || 0,
        sellingPrice: item.product?.sellingPrice || item.unitPrice,
        totalQuantitySold: 0,
        totalRevenueGenerated: 0,
      };
    }
    productAggMap[prodId].totalQuantitySold += item.quantity;
    productAggMap[prodId].totalRevenueGenerated += item.lineTotal || item.quantity * item.unitPrice;
  });

  const sorted = Object.values(productAggMap)
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
    .slice(0, limit)
    .map((item) => ({
      ...item,
      totalRevenueGenerated: Math.round(item.totalRevenueGenerated),
      stockStatus: item.currentStock <= 20 ? 'LOW STOCK - REORDER SOON' : 'HEALTHY',
    }));

  return {
    daysAnalyzed: days,
    topProductsCount: sorted.length,
    topProducts: sorted,
  };
};

/**
 * 6. Get suppliers, contact details, and supplier-wise product counts
 */
export const getSuppliersAndOrders = async ({ storeId, supplierName = '', search = '' }) => {
  const suppliers = await prisma.supplier.findMany({
    where: {
      storeId,
      isActive: true,
      ...(supplierName ? { name: { contains: supplierName, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { companyName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      products: {
        where: { isActive: true },
        select: { id: true, name: true, currentStock: true, reorderLevel: true },
      },
      purchaseOrders: {
        where: { status: { in: ['PENDING', 'PARTIALLY_RECEIVED', 'DRAFT'] } },
        select: { id: true, orderNumber: true, status: true, totalAmount: true, expectedDeliveryDate: true },
      },
    },
  });

  const formatted = suppliers.map((s) => {
    const lowStockItemsFromSupplier = s.products.filter((p) => p.currentStock <= p.reorderLevel);
    return {
      id: s.id,
      name: s.name,
      company: s.companyName,
      phone: s.phone,
      email: s.email,
      paymentTerms: s.paymentTerms || 'Net 15',
      leadTimeDays: s.leadTimeDays || 3,
      totalSuppliedProducts: s.products.length,
      lowStockProductsCount: lowStockItemsFromSupplier.length,
      pendingOrdersCount: s.purchaseOrders.length,
      pendingOrders: s.purchaseOrders,
    };
  });

  return {
    count: formatted.length,
    suppliers: formatted,
  };
};

/**
 * 7. Get purchase orders by status
 */
export const getPurchaseOrders = async ({ storeId, status = null, limit = 10 }) => {
  const where = {
    storeId,
    ...(status && status !== 'ALL' ? { status: status.toUpperCase() } : {}),
  };

  const orders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: { select: { name: true, phone: true } },
      items: {
        include: {
          product: { select: { name: true, sku: true, unitOfMeasure: true } },
        },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const formatted = orders.map((po) => ({
    id: po.id,
    orderNumber: po.orderNumber,
    supplierName: po.supplier?.name || 'Vendor',
    status: po.status,
    totalAmount: Math.round(po.totalAmount),
    orderDate: po.orderDate?.toISOString().split('T')[0],
    expectedDeliveryDate: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString().split('T')[0] : 'TBD',
    itemsCount: po.items.length,
    itemsPreview: po.items.slice(0, 3).map((item) => `${item.product?.name || 'Product'} (${item.orderedQuantity} ${item.product?.unitOfMeasure || 'units'})`),
  }));

  return {
    totalReturned: formatted.length,
    orders: formatted,
  };
};

/**
 * 8. Smart Reorder Engine - generates grouped PO recommendation packages
 */
export const getReorderRecommendations = async ({ storeId, limit = 10 }) => {
  const products = await prisma.product.findMany({
    where: { storeId, isActive: true },
    include: {
      category: { select: { name: true } },
      preferredSupplier: { select: { id: true, name: true, phone: true, leadTimeDays: true } },
    },
    orderBy: { currentStock: 'asc' },
  });

  const needsReorder = products.filter((p) => p.currentStock <= p.reorderLevel);

  // Group by supplier
  const supplierGroupMap = {};
  let totalEstimatedCost = 0;

  needsReorder.forEach((p) => {
    const suppId = p.preferredSupplier?.id || 'unassigned';
    const suppName = p.preferredSupplier?.name || 'Local Wholesale Distributors';
    const leadTime = p.preferredSupplier?.leadTimeDays || 3;

    if (!supplierGroupMap[suppId]) {
      supplierGroupMap[suppId] = {
        supplierId: suppId,
        supplierName: suppName,
        leadTimeDays: leadTime,
        itemsCount: 0,
        totalCost: 0,
        items: [],
      };
    }

    const orderQty = Math.max(0, p.targetStockLevel - p.currentStock);
    const cost = Math.round(orderQty * p.purchasePrice);

    supplierGroupMap[suppId].itemsCount += 1;
    supplierGroupMap[suppId].totalCost += cost;
    totalEstimatedCost += cost;

    supplierGroupMap[suppId].items.push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || 'General',
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      targetStock: p.targetStockLevel,
      unit: p.unitOfMeasure,
      recommendedOrderQty: orderQty,
      purchasePrice: p.purchasePrice,
      estimatedCost: cost,
      urgency: p.currentStock <= 0 ? 'CRITICAL' : 'HIGH',
    });
  });

  return {
    totalItemsNeedingReorder: needsReorder.length,
    totalEstimatedProcurementCost: totalEstimatedCost,
    supplierPackages: Object.values(supplierGroupMap).slice(0, limit),
  };
};

/**
 * 9. Get recent stock movements (IN, OUT, ADJUSTMENT)
 */
export const getStockMovements = async ({ storeId, productId = null, limit = 10, type = null }) => {
  const where = {
    storeId,
    ...(productId ? { productId } : {}),
    ...(type ? { movementType: type.toUpperCase() } : {}),
  };

  const movements = await prisma.stockMovement.findMany({
    where,
    include: {
      product: { select: { name: true, sku: true, unitOfMeasure: true } },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const formatted = movements.map((m) => ({
    id: m.id,
    productName: m.product?.name || 'Product',
    sku: m.product?.sku || 'N/A',
    movementType: m.movementType,
    quantity: m.quantity,
    unit: m.product?.unitOfMeasure || 'units',
    previousStock: m.previousStock,
    newStock: m.newStock,
    reference: m.referenceNumber || 'N/A',
    notes: m.notes || 'Routine inventory update',
    date: m.createdAt.toISOString().replace('T', ' ').substring(0, 16),
  }));

  return {
    count: formatted.length,
    movements: formatted,
  };
};

/**
 * 10. Get customer loyalty and purchase summaries
 */
export const getCustomersSummary = async ({ storeId, search = '', limit = 10 }) => {
  const customers = await prisma.customer.findMany({
    where: {
      storeId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      bills: {
        select: { id: true, totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    take: limit,
    orderBy: { loyaltyPoints: 'desc' },
  });

  const formatted = customers.map((c) => {
    const totalSpent = c.bills.reduce((sum, b) => sum + b.totalAmount, 0);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      loyaltyPoints: c.loyaltyPoints,
      totalBillsCount: c.bills.length,
      totalLifetimeSpend: Math.round(totalSpent),
      lastPurchaseDate: c.bills[0] ? c.bills[0].createdAt.toISOString().split('T')[0] : 'None',
    };
  });

  return {
    count: formatted.length,
    customers: formatted,
  };
};

export default {
  getInventorySummary,
  getProductStock,
  getLowStockProducts,
  getSalesSummary,
  getTopSellingProducts,
  getSuppliersAndOrders,
  getPurchaseOrders,
  getReorderRecommendations,
  getStockMovements,
  getCustomersSummary,
};
