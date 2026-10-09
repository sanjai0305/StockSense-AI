import prisma from '../config/prisma.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search = '' } = req.query;
    const customers = await prisma.customer.findMany({
      where: {
        storeId: req.storeId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { stockIssues: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required' });
    }

    const customer = await prisma.customer.create({
      data: {
        storeId: req.storeId,
        name,
        phone,
        email: email || null,
        address: address || null,
      },
    });

    res.status(201).json({ success: true, message: 'Customer added successfully', data: customer });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        email: email !== undefined ? email : undefined,
        address: address !== undefined ? address : undefined,
      },
    });

    res.json({ success: true, message: 'Customer updated successfully', data: customer });
  } catch (error) {
    next(error);
  }
};
