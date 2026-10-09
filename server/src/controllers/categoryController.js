import prisma from '../config/prisma.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { storeId: req.storeId, isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: {
        storeId: req.storeId,
        name,
        description,
        color: color || '#2563EB',
      },
    });

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        color: color || undefined,
      },
    });

    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if products exist in this category
    const productCount = await prisma.product.count({
      where: { categoryId: id, isActive: true },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. There are ${productCount} active products in this category.`,
      });
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) {
    next(error);
  }
};
