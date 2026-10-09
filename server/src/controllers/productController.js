import { z } from 'zod';
import prisma from '../config/prisma.js';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  preferredSupplierId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unitOfMeasure: z.string().default('units'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  currentStock: z.number().min(0, 'Initial stock cannot be negative').default(0),
  reorderLevel: z.number().min(0).default(20),
  targetStockLevel: z.number().min(0).default(100),
  imageUrl: z.string().optional().nullable(),
});

export const getProducts = async (req, res, next) => {
  try {
    const storeId = req.storeId;
    const {
      search = '',
      category = '',
      status = '',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      storeId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { barcode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(category && category !== 'All Categories'
        ? {
            category: {
              name: { equals: category, mode: 'insensitive' },
            },
          }
        : {}),
    };

    let products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        preferredSupplier: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Stock Status filter (In Stock vs Low Stock)
    if (status && status !== 'Stock Status' && status !== 'All') {
      if (status === 'Low Stock') {
        products = products.filter(p => p.currentStock <= p.reorderLevel);
      } else if (status === 'In Stock') {
        products = products.filter(p => p.currentStock > p.reorderLevel);
      } else if (status === 'Out of Stock') {
        products = products.filter(p => p.currentStock <= 0);
      }
    }

    const total = products.length;
    const paginatedProducts = products.slice(skip, skip + limitNum);

    const formatted = paginatedProducts.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      description: p.description,
      category: p.category.name,
      categoryId: p.categoryId,
      currentStock: p.currentStock,
      minStock: p.reorderLevel,
      targetStockLevel: p.targetStockLevel,
      unitOfMeasure: p.unitOfMeasure,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      status: p.currentStock <= p.reorderLevel ? 'Low Stock' : 'In Stock',
      isOutOfStock: p.currentStock <= 0,
      supplier: p.preferredSupplier ? p.preferredSupplier.name : 'Direct / Other',
      supplierId: p.preferredSupplierId,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
    }));

    res.json({
      success: true,
      data: formatted,
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

export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, storeId: req.storeId },
      include: {
        category: true,
        preferredSupplier: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = productSchema.parse({
      ...req.body,
      purchasePrice: parseFloat(req.body.purchasePrice) || 0,
      sellingPrice: parseFloat(req.body.sellingPrice) || 0,
      currentStock: parseFloat(req.body.currentStock) || 0,
      reorderLevel: parseFloat(req.body.reorderLevel) || 20,
      targetStockLevel: parseFloat(req.body.targetStockLevel) || 100,
    });

    const existingSku = await prisma.product.findFirst({
      where: { storeId: req.storeId, sku: data.sku },
    });

    if (existingSku) {
      return res.status(400).json({ success: false, message: `A product with SKU "${data.sku}" already exists.` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          storeId: req.storeId,
          categoryId: data.categoryId,
          preferredSupplierId: data.preferredSupplierId || null,
          name: data.name,
          sku: data.sku,
          barcode: data.barcode || null,
          description: data.description || null,
          unitOfMeasure: data.unitOfMeasure || 'units',
          purchasePrice: data.purchasePrice,
          sellingPrice: data.sellingPrice,
          currentStock: data.currentStock,
          reorderLevel: data.reorderLevel,
          targetStockLevel: data.targetStockLevel,
          imageUrl: data.imageUrl || null,
        },
        include: { category: true, preferredSupplier: true },
      });

      if (data.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            storeId: req.storeId,
            productId: product.id,
            movementType: 'INITIAL_STOCK',
            quantityChange: data.currentStock,
            quantityBefore: 0,
            quantityAfter: data.currentStock,
            unitCost: data.purchasePrice,
            notes: 'Initial opening stock upon product creation',
            createdBy: req.user.fullName,
          },
        });
      }

      return product;
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      barcode,
      categoryId,
      preferredSupplierId,
      description,
      unitOfMeasure,
      purchasePrice,
      sellingPrice,
      reorderLevel,
      targetStockLevel,
      imageUrl,
    } = req.body;

    const existing = await prisma.product.findFirst({
      where: { id, storeId: req.storeId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name || undefined,
        sku: sku || undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        categoryId: categoryId || undefined,
        preferredSupplierId: preferredSupplierId !== undefined ? preferredSupplierId : undefined,
        description: description !== undefined ? description : undefined,
        unitOfMeasure: unitOfMeasure || undefined,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        reorderLevel: reorderLevel !== undefined ? parseFloat(reorderLevel) : undefined,
        targetStockLevel: targetStockLevel !== undefined ? parseFloat(targetStockLevel) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
      include: { category: true, preferredSupplier: true },
    });

    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
