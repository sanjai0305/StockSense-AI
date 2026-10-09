import prisma from '../config/prisma.js';

export const getInventoryReport = async (req, res, next) => {
  try {
    const { categoryId, status } = req.query;

    const products = await prisma.product.findMany({
      where: {
        storeId: req.storeId,
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true, preferredSupplier: true },
      orderBy: { name: 'asc' },
    });

    let filtered = products;
    if (status === 'LOW') filtered = filtered.filter((p) => p.currentStock <= p.reorderLevel);
    if (status === 'IN_STOCK') filtered = filtered.filter((p) => p.currentStock > p.reorderLevel);

    const totalValuation = filtered.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
    const totalPotentialSales = filtered.reduce((sum, p) => sum + p.currentStock * p.sellingPrice, 0);
    const totalUnits = filtered.reduce((sum, p) => sum + p.currentStock, 0);

    res.json({
      success: true,
      summary: {
        totalItems: filtered.length,
        totalUnits,
        totalValuation,
        totalPotentialSales,
        potentialProfit: totalPotentialSales - totalValuation,
      },
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockInReport = async (req, res, next) => {
  try {
    const { startDate, endDate, supplierId } = req.query;

    const receipts = await prisma.stockReceipt.findMany({
      where: {
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
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
      orderBy: { receiptDate: 'desc' },
    });

    const totalPurchasedValue = receipts.reduce((sum, r) => sum + r.subtotal, 0);
    const totalReceipts = receipts.length;

    res.json({
      success: true,
      summary: {
        totalPurchasedValue,
        totalReceipts,
      },
      data: receipts,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockOutReport = async (req, res, next) => {
  try {
    const { startDate, endDate, transactionType } = req.query;

    const issues = await prisma.stockIssue.findMany({
      where: {
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
      },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { transactionDate: 'desc' },
    });

    const totalSalesValue = issues
      .filter((i) => i.transactionType === 'RETAIL_SALE')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const totalDiscounts = issues.reduce((sum, i) => sum + i.discount, 0);

    res.json({
      success: true,
      summary: {
        totalSalesValue,
        totalDiscounts,
        totalTransactions: issues.length,
      },
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockMovementsReport = async (req, res, next) => {
  try {
    const { productId, movementType, limit = 50 } = req.query;

    const movements = await prisma.stockMovement.findMany({
      where: {
        storeId: req.storeId,
        ...(productId ? { productId } : {}),
        ...(movementType ? { movementType } : {}),
      },
      include: {
        product: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10) || 50,
    });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate high-resolution PDF report using Python microservice
 */
export const exportPdfReport = async (req, res, next) => {
  try {
    const reportType = (req.params.reportType || req.query.reportType || 'inventory').toLowerCase();
    const storeId = req.storeId;
    const storeName = req.store?.name || "StockSense Supermarket";

    // Query live authorized store products & suppliers
    const products = await prisma.product.findMany({
      where: { storeId, isActive: true },
      include: { category: true, preferredSupplier: true },
      orderBy: { currentStock: 'asc' },
    });

    let salesSummary = null;
    let transactions = [];

    if (reportType === 'sales' || reportType === 'revenue' || reportType === 'pos') {
      const issues = await prisma.stockIssue.findMany({
        where: { storeId, transactionType: 'RETAIL_SALE' },
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { transactionDate: 'desc' },
        take: 100,
      });

      const totalSales = issues.reduce((sum, i) => sum + i.totalAmount, 0);
      const totalDiscount = issues.reduce((sum, i) => sum + i.discount, 0);

      salesSummary = {
        total_sales: totalSales,
        total_bills: issues.length,
        average_bill_value: issues.length > 0 ? totalSales / issues.length : 0,
        total_discount: totalDiscount,
      };
      transactions = issues;
    }

    const { generatePdfFromPython } = await import('../services/pythonAnalyticsService.js');
    const result = await generatePdfFromPython({
      reportType,
      storeName,
      products,
      salesSummary,
      transactions,
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(result.buffer);
  } catch (error) {
    console.error('PDF export error:', error);
    next(error);
  }
};

