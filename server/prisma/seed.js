import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for StockSense AI Supermarket...');

  // 1. Clean existing records
  await prisma.notification.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.billItem.deleteMany({});
  await prisma.bill.deleteMany({});
  await prisma.stockIssueItem.deleteMany({});
  await prisma.stockIssue.deleteMany({});
  await prisma.stockReceiptItem.deleteMany({});
  await prisma.stockReceipt.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.store.deleteMany({});

  // 2. Create Store matching the reference
  const store = await prisma.store.create({
    data: {
      name: 'Sri Lakshmi Supermarket',
      address: '42, Meyyanur Main Road, 5 Roads Junction',
      city: 'Salem',
      state: 'Tamil Nadu',
      phone: '+91 98427 12345',
      alternatePhone: '+91 427 2445566',
      email: 'contact@srilakshmi.com',
      currencySymbol: '₹',
      logoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create Store Owner User & Staff Cashier
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const owner = await prisma.user.create({
    data: {
      storeId: store.id,
      fullName: 'Sanjai R',
      email: 'owner@stocksense.com',
      phone: '+91 98427 12345',
      passwordHash,
      role: 'STORE_OWNER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
  });

  await prisma.user.create({
    data: {
      storeId: store.id,
      fullName: 'Murugan K',
      email: 'cashier@stocksense.com',
      phone: '+91 98427 99887',
      passwordHash,
      role: 'CASHIER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  });

  // 4. Create Categories matching the reference
  const categoryDefs = [
    { name: 'Dairy Products', color: '#10B981', description: 'Fresh milk, curd, paneer, butter and cheese' },
    { name: 'Cooking Oil', color: '#F59E0B', description: 'Sunflower, groundnut, mustard, and sesame oils' },
    { name: 'Rice & Grains', color: '#D97706', description: 'Basmati rice, ponni rice, wheat, and pulses' },
    { name: 'Beverages', color: '#06B6D4', description: 'Cold drinks, juices, bottled water, tea and coffee' },
    { name: 'Snacks', color: '#EF4444', description: 'Instant noodles, biscuits, chips and chocolates' },
    { name: 'Personal Care', color: '#8B5CF6', description: 'Soaps, shampoos, body washes and lotions' },
    { name: 'Household', color: '#3B82F6', description: 'Detergents, floor cleaners, dishwashers' },
  ];

  const categories = {};
  for (const cat of categoryDefs) {
    const created = await prisma.category.create({
      data: {
        storeId: store.id,
        name: cat.name,
        color: cat.color,
        description: cat.description,
      },
    });
    categories[cat.name] = created;
  }

  // 5. Create Suppliers matching screenshot
  const supplierDefs = [
    { name: 'Amul Distributors', companyName: 'Gujarat Co-operative Milk Mktg Fed', phone: '+91 98450 67890', email: 'amul.salem@amul.coop', address: 'Suramangalam, Salem', leadTimeDays: 1 },
    { name: 'FreshMart Wholesale', companyName: 'FreshMart Wholesale Suppliers Ltd', phone: '+91 98450 12345', email: 'orders@freshmart.com', address: 'Salem Logistics Park, Salem', leadTimeDays: 2 },
    { name: 'Rice & Grains Co.', companyName: 'Rice & Grains Milling & Supply Co', phone: '+91 98450 23456', email: 'sales@ricegrains.in', address: 'Shevapet Market, Salem', leadTimeDays: 3 },
    { name: 'Sri Balaji Traders', companyName: 'Sri Balaji Agro Commodities', phone: '+91 98450 34567', email: 'orders@balajitraders.com', address: 'Junction Road, Salem', leadTimeDays: 2 },
    { name: 'City Fresh Suppliers', companyName: 'City Fresh Poultry & Egg Farms', phone: '+91 98450 45678', email: 'cityfresh@poultry.com', address: 'Namakkal Highway, Salem', leadTimeDays: 1 },
    { name: 'Nestle Distributors', companyName: 'Nestlé India Distribution Agency', phone: '+91 98450 56789', email: 'orders@nestledist.com', address: 'Omalur Main Road, Salem', leadTimeDays: 2 },
    { name: 'Coca-Cola India', companyName: 'Hindustan Coca-Cola Beverages Pvt Ltd', phone: '+91 98450 78901', email: 'sales@coca-cola.in', address: 'NH44 Distribution Hub, Salem', leadTimeDays: 2 },
    { name: 'Britannia Industries', companyName: 'Britannia Daily Logistics', phone: '+91 98450 89012', email: 'orders@britannia.com', address: 'Five Roads, Salem', leadTimeDays: 1 },
  ];

  const suppliers = {};
  for (const s of supplierDefs) {
    const created = await prisma.supplier.create({
      data: {
        storeId: store.id,
        name: s.name,
        companyName: s.companyName,
        phone: s.phone,
        email: s.email,
        address: s.address,
        leadTimeDays: s.leadTimeDays,
        paymentTerms: 'Net 15',
      },
    });
    suppliers[s.name] = created;
  }

  // 6. Create Customers
  const customerDefs = [
    { name: 'Rajesh Kumar', phone: '9842100111', email: 'rajesh.k@gmail.com', address: 'Fairlands, Salem', loyaltyPoints: 240 },
    { name: 'Priya Sharma', phone: '9842100222', email: 'priya.s@gmail.com', address: 'Alagapuram, Salem', loyaltyPoints: 180 },
    { name: 'Karthik N', phone: '9842100333', email: 'karthik.n@yahoo.com', address: 'Hasthampatti, Salem', loyaltyPoints: 420 },
    { name: 'Ananya S', phone: '9842100444', email: 'ananya.s@outlook.com', address: 'Ammapet, Salem', loyaltyPoints: 95 },
  ];

  const createdCustomers = [];
  for (const cust of customerDefs) {
    const c = await prisma.customer.create({
      data: {
        storeId: store.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        loyaltyPoints: cust.loyaltyPoints,
      },
    });
    createdCustomers.push(c);
  }

  // 7. Seed Products matching reference table and fast-moving cards
  const productData = [
    {
      name: 'Amul Fresh Milk 1L',
      sku: 'AMU-MLK-1L',
      barcode: '8901260701239',
      category: 'Dairy Products',
      currentStock: 12,
      reorderLevel: 50,
      targetStockLevel: 92,
      unitOfMeasure: 'packets',
      purchasePrice: 55,
      sellingPrice: 62,
      supplier: 'Amul Distributors',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sunflower Oil 1L',
      sku: 'SUN-OIL-1L',
      barcode: '8901764023456',
      category: 'Cooking Oil',
      currentStock: 8,
      reorderLevel: 30,
      targetStockLevel: 68,
      unitOfMeasure: 'pouches',
      purchasePrice: 120,
      sellingPrice: 140,
      supplier: 'FreshMart Wholesale',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'India Gate Rice 5kg',
      sku: 'IND-RIC-5KG',
      barcode: '8901030701234',
      category: 'Rice & Grains',
      currentStock: 16,
      reorderLevel: 40,
      targetStockLevel: 56,
      unitOfMeasure: 'bags',
      purchasePrice: 220,
      sellingPrice: 260,
      supplier: 'Rice & Grains Co.',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sugar 1kg',
      sku: 'BAL-SUG-1KG',
      barcode: '8901030901237',
      category: 'Rice & Grains',
      currentStock: 6,
      reorderLevel: 30,
      targetStockLevel: 56,
      unitOfMeasure: 'kg',
      purchasePrice: 45,
      sellingPrice: 52,
      supplier: 'Sri Balaji Traders',
      imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fresh Eggs (30)',
      sku: 'EGG-TR-30',
      barcode: '8901030101238',
      category: 'Dairy Products',
      currentStock: 20,
      reorderLevel: 60,
      targetStockLevel: 60,
      unitOfMeasure: 'trays',
      purchasePrice: 150,
      sellingPrice: 180,
      supplier: 'City Fresh Suppliers',
      imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Maggi Noodles 70g',
      sku: 'MAG-70G-003',
      barcode: '8901058912346',
      category: 'Snacks',
      currentStock: 18,
      reorderLevel: 40,
      targetStockLevel: 90,
      unitOfMeasure: 'packs',
      purchasePrice: 12,
      sellingPrice: 14,
      supplier: 'Nestle Distributors',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Coca-Cola 500ml',
      sku: 'COK-500ML',
      barcode: '8901764012345',
      category: 'Beverages',
      currentStock: 22,
      reorderLevel: 35,
      targetStockLevel: 80,
      unitOfMeasure: 'bottles',
      purchasePrice: 32,
      sellingPrice: 40,
      supplier: 'Coca-Cola India',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Britannia Bread',
      sku: 'BRI-BRD-400',
      barcode: '8901030801234',
      category: 'Snacks',
      currentStock: 14,
      reorderLevel: 30,
      targetStockLevel: 60,
      unitOfMeasure: 'packs',
      purchasePrice: 35,
      sellingPrice: 45,
      supplier: 'Britannia Industries',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dove Soap 100g',
      sku: 'DOV-100G-004',
      barcode: '8901030901239',
      category: 'Personal Care',
      currentStock: 8,
      reorderLevel: 25,
      targetStockLevel: 60,
      unitOfMeasure: 'pcs',
      purchasePrice: 48,
      sellingPrice: 58,
      supplier: 'FreshMart Wholesale',
      imageUrl: 'https://images.unsplash.com/photo-1608248597358-1e4268e3d0e2?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Head & Shoulders Shampoo',
      sku: 'HNS-SHM-180',
      barcode: '8901491101234',
      category: 'Personal Care',
      currentStock: 15,
      reorderLevel: 25,
      targetStockLevel: 50,
      unitOfMeasure: 'bottles',
      purchasePrice: 145,
      sellingPrice: 175,
      supplier: 'FreshMart Wholesale',
      imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=120&auto=format&fit=crop&q=80',
    },
  ];

  const createdProducts = [];
  for (const p of productData) {
    const prod = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categories[p.category].id,
        preferredSupplierId: suppliers[p.supplier]?.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        unitOfMeasure: p.unitOfMeasure,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
        targetStockLevel: p.targetStockLevel,
        imageUrl: p.imageUrl,
      },
    });

    createdProducts.push(prod);

    // Initial movement
    await prisma.stockMovement.create({
      data: {
        storeId: store.id,
        productId: prod.id,
        movementType: 'INITIAL_STOCK',
        quantityChange: p.currentStock,
        quantityBefore: 0,
        quantityAfter: p.currentStock,
        unitCost: p.purchasePrice,
        notes: 'Opening inventory baseline',
        createdBy: owner.fullName,
      },
    });
  }

  // 8. Create 7 Pending Purchase Orders matching screenshot (7 total, 2 awaiting approval)
  const poStatuses = ['PENDING', 'PENDING', 'DRAFT', 'DRAFT', 'SUBMITTED', 'APPROVED', 'APPROVED'];
  for (let i = 0; i < 7; i++) {
    const supp = Object.values(suppliers)[i % Object.values(suppliers).length];
    const po = await prisma.purchaseOrder.create({
      data: {
        storeId: store.id,
        supplierId: supp.id,
        orderNumber: `PO-202610-00${i + 1}`,
        status: poStatuses[i],
        orderDate: new Date(),
        subtotal: 12500 + i * 1500,
        totalAmount: 12500 + i * 1500,
        notes: `Replenishment Order #${i + 1}`,
        createdBy: owner.fullName,
      },
    });

    await prisma.purchaseOrderItem.create({
      data: {
        purchaseOrderId: po.id,
        productId: createdProducts[i % createdProducts.length].id,
        orderedQuantity: 50 + i * 10,
        receivedQuantity: 0,
        unitCost: createdProducts[i % createdProducts.length].purchasePrice,
        lineTotal: (50 + i * 10) * createdProducts[i % createdProducts.length].purchasePrice,
      },
    });
  }

  // 9. Seed Today's Bills (Totalling ~₹48,520 matching screenshot)
  const billAmounts = [12400, 15300, 8820, 12000];
  for (let i = 0; i < billAmounts.length; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const b = await prisma.bill.create({
      data: {
        storeId: store.id,
        billNumber: `BILL-202610-${1000 + i}`,
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        subtotal: billAmounts[i],
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: billAmounts[i],
        amountPaid: billAmounts[i],
        changeAmount: 0,
        paymentMethod: i % 2 === 0 ? 'UPI' : 'CASH',
        paymentStatus: 'PAID',
        billStatus: 'COMPLETED',
        notes: 'POS Register Checkout',
        createdBy: 'Murugan K',
        createdAt: new Date(),
      },
    });

    await prisma.billItem.create({
      data: {
        billId: b.id,
        productId: createdProducts[i % createdProducts.length].id,
        productNameSnapshot: createdProducts[i % createdProducts.length].name,
        skuSnapshot: createdProducts[i % createdProducts.length].sku,
        quantity: 20 + i * 10,
        unitSellingPrice: createdProducts[i % createdProducts.length].sellingPrice,
        unitCostSnapshot: createdProducts[i % createdProducts.length].purchasePrice,
        lineTotal: billAmounts[i],
      },
    });
  }

  // 10. Seed Notifications (3 unread)
  await prisma.notification.createMany({
    data: [
      {
        storeId: store.id,
        type: 'LOW_STOCK',
        title: 'Critical Stock: Amul Fresh Milk 1L',
        message: 'Only 12 units remaining. Reorder threshold is 50.',
        entityType: 'PRODUCT',
        entityId: createdProducts[0].id,
        isRead: false,
      },
      {
        storeId: store.id,
        type: 'LOW_STOCK',
        title: 'Critical Stock: Sunflower Oil 1L',
        message: 'Only 8 units left in stock. High stockout risk.',
        entityType: 'PRODUCT',
        entityId: createdProducts[1].id,
        isRead: false,
      },
      {
        storeId: store.id,
        type: 'PURCHASE_ORDER',
        title: 'Purchase Order Approval Required',
        message: 'PO-202610-006 is awaiting approval for dispatch.',
        entityType: 'PURCHASE_ORDER',
        isRead: false,
      },
    ],
  });

  console.log('✅ StockSense AI Database successfully seeded with reference store & items!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
