import prisma from '../config/prisma.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const suppliers = await prisma.supplier.findMany({
      where: {
        storeId: req.storeId,
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { products: true, purchaseOrders: true, stockReceipts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id: req.params.id, storeId: req.storeId },
      include: {
        products: true,
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        stockReceipts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: { include: { product: true } } },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const { name, companyName, phone, email, address, gstin, paymentTerms, leadTimeDays, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Supplier name and phone are required' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        storeId: req.storeId,
        name,
        companyName: companyName || name,
        phone,
        email: email || '',
        address: address || '',
        gstin: gstin || null,
        paymentTerms: paymentTerms || 'Net 15',
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
        notes: notes || null,
      },
    });

    res.status(201).json({ success: true, message: 'Supplier added successfully', data: supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, companyName, phone, email, address, gstin, paymentTerms, leadTimeDays, notes } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name || undefined,
        companyName: companyName || undefined,
        phone: phone || undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
        gstin: gstin !== undefined ? gstin : undefined,
        paymentTerms: paymentTerms !== undefined ? paymentTerms : undefined,
        leadTimeDays: leadTimeDays !== undefined ? parseInt(leadTimeDays, 10) : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    res.json({ success: true, message: 'Supplier updated successfully', data: supplier });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Supplier deactivated successfully' });
  } catch (error) {
    next(error);
  }
};
