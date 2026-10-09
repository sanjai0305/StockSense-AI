import prisma from '../config/prisma.js';

export const getStore = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.storeId },
    });
    res.json({ success: true, store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const { name, address, city, state, phone, alternatePhone, email, logoUrl, currencySymbol } = req.body;

    const store = await prisma.store.update({
      where: { id: req.storeId },
      data: {
        name: name || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        phone: phone || undefined,
        alternatePhone: alternatePhone !== undefined ? alternatePhone : undefined,
        email: email || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        currencySymbol: currencySymbol || undefined,
      },
    });

    res.json({ success: true, message: 'Store settings updated successfully', store });
  } catch (error) {
    next(error);
  }
};
