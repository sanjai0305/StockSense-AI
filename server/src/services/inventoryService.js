import prisma from '../config/prisma.js';

export const InventoryService = {
  /**
   * Adjust product stock atomically inside a transaction and record movement
   */
  async recordStockMovement(tx, {
    storeId,
    productId,
    movementType,
    quantityChange, // positive for in, negative for out
    unitCost = 0,
    referenceType = null,
    referenceId = null,
    notes = null,
    createdBy = null,
  }) {
    // 1. Fetch current product state
    const product = await tx.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found in this store.`);
    }

    const quantityBefore = product.currentStock;
    const quantityAfter = quantityBefore + quantityChange;

    if (quantityAfter < 0 && movementType === 'STOCK_OUT') {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${quantityBefore}, Requested: ${Math.abs(quantityChange)}.`);
    }

    // 2. Update product current stock
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: quantityAfter,
        ...(movementType === 'STOCK_IN' && unitCost > 0 ? { purchasePrice: unitCost } : {}),
      },
    });

    // 3. Create stock movement record
    const movement = await tx.stockMovement.create({
      data: {
        storeId,
        productId,
        movementType,
        quantityChange,
        quantityBefore,
        quantityAfter,
        unitCost,
        referenceType,
        referenceId,
        notes,
        createdBy,
      },
    });

    // 4. Low stock notification check
    if (quantityAfter <= product.reorderLevel) {
      const isStockout = quantityAfter <= 0;
      const notifType = isStockout ? 'STOCKOUT' : 'LOW_STOCK';
      const notifTitle = isStockout
        ? `Out of Stock: ${product.name}`
        : `Low Stock Alert: ${product.name}`;
      const notifMessage = isStockout
        ? `${product.name} is completely out of stock! Immediate replenishment required.`
        : `${product.name} has only ${quantityAfter} ${product.unitOfMeasure} left (Threshold: ${product.reorderLevel}).`;

      // Check if unread notification already exists today to avoid duplicates
      const existingNotif = await tx.notification.findFirst({
        where: {
          storeId,
          entityId: productId,
          isRead: false,
          type: notifType,
        },
      });

      if (!existingNotif) {
        await tx.notification.create({
          data: {
            storeId,
            type: notifType,
            title: notifTitle,
            message: notifMessage,
            entityType: 'PRODUCT',
            entityId: productId,
          },
        });
      }
    }

    return { product: updatedProduct, movement };
  },

  /**
   * Calculate suggested reorder quantity: Target - Current
   */
  calculateSuggestedQuantity(product) {
    const target = product.targetStockLevel || product.reorderLevel * 2.5;
    const current = Math.max(0, product.currentStock);
    const suggested = Math.max(0, Math.ceil(target - current));
    return suggested;
  },
};
