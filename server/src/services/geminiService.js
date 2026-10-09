/**
 * StockSense AI - Google Gemini API & Multi-Tool Orchestrator
 * Connects Google Generative AI (Gemini 1.5/2.0) with Live Database Tools & RAG Knowledge.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbTools from './databaseToolsService.js';
import ragService from './ragKnowledgeService.js';

const SYSTEM_INSTRUCTION = `
You are the StockSense AI Supermarket Assistant — an intelligent, friendly, and highly accurate retail copilot for supermarket store owners, inventory managers, and cashiers.

STRICT GROUNDING & ACCURACY RULES:
1. Ground every answer in the actual live database query results and verified supermarket business knowledge provided by your tools.
2. NEVER invent, hallucinate, or estimate stock quantities, product prices, daily sales revenue, purchase order numbers, or supplier names.
3. If a product or record is not found in the database, clearly state: "No matching product or record was found in your store's database."
4. When reporting inventory or sales numbers:
   - Format Indian Rupees cleanly with the "₹" symbol (e.g. ₹48,520).
   - Specify exact units of measurement (e.g., 12 packs, 50 kg, 30 liters).
   - Highlight whether stock is Low, Out of Stock, or Healthy.
5. For Reorder / Replenishment questions:
   - Detail the suggested reorder quantity (Target Stock - Current Stock).
   - Group products by supplier where applicable.
   - Mention the supplier's estimated lead time.
6. Provide concise, well-structured Markdown responses with bold headings, bullet points, and tables where helpful.
7. Keep responses professional, encouraging, and actionable.
`;

// Function declarations for Gemini Function Calling
const GEMINI_FUNCTION_DECLARATIONS = [
  {
    name: 'getInventorySummary',
    description: 'Get high-level supermarket inventory KPIs: total active products, low-stock count, out-of-stock count, store valuation, and health score.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'getProductStock',
    description: 'Search for specific products by name, SKU, or category to get live current stock balance, prices, and suppliers.',
    parameters: {
      type: 'OBJECT',
      properties: {
        search: { type: 'STRING', description: 'Product name or search keyword (e.g. Amul milk, rice, oil)' },
        sku: { type: 'STRING', description: 'Product SKU code' },
        categoryName: { type: 'STRING', description: 'Category name filter' },
        lowStockOnly: { type: 'BOOLEAN', description: 'Filter only low stock items' },
      },
    },
  },
  {
    name: 'getLowStockProducts',
    description: 'Get all critical low-stock items at or below reorder threshold that urgently need replenishment.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Max number of items to return (default: 10)' },
      },
    },
  },
  {
    name: 'getSalesSummary',
    description: "Get sales performance, total revenue, bill count, items sold, and payment method breakdowns for today, yesterday, this week, or custom date range.",
    parameters: {
      type: 'OBJECT',
      properties: {
        period: { type: 'STRING', description: 'Time period: "today", "yesterday", "this_week", or "this_month"' },
      },
    },
  },
  {
    name: 'getTopSellingProducts',
    description: 'Get best-selling, fast-moving products ranked by units sold and revenue generated.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Number of top products (default: 5)' },
        days: { type: 'NUMBER', description: 'Days to analyze (default: 30)' },
      },
    },
  },
  {
    name: 'getSuppliersAndOrders',
    description: 'Get registered suppliers, contact numbers, payment terms, lead times, and associated products.',
    parameters: {
      type: 'OBJECT',
      properties: {
        supplierName: { type: 'STRING', description: 'Filter by specific supplier name' },
      },
    },
  },
  {
    name: 'getPurchaseOrders',
    description: 'Get purchase orders by status (PENDING, DRAFT, RECEIVED) with delivery dates and items.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', description: 'Filter by status: "PENDING", "DRAFT", "RECEIVED", or "ALL"' },
      },
    },
  },
  {
    name: 'getReorderRecommendations',
    description: 'Get smart reorder packages grouped by supplier with calculated replenishment quantities and estimated procurement costs.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'NUMBER', description: 'Number of supplier packages to return' },
      },
    },
  },
  {
    name: 'getStockMovements',
    description: 'Get recent stock-in, stock-out (sales), and adjustment audit logs.',
    parameters: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING', description: 'Movement type: "IN", "OUT", or "ADJUSTMENT"' },
        limit: { type: 'NUMBER', description: 'Max records (default: 10)' },
      },
    },
  },
  {
    name: 'searchBusinessKnowledge',
    description: 'Retrieve supermarket standard operating procedures, safety stock formulas, FIFO rules, loyalty points policies, and tax guidelines via RAG.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Policy or concept search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'generatePdfReport',
    description: 'Generate and download a high-resolution, branded PDF report for inventory status, low-stock alerts, or smart reorders.',
    parameters: {
      type: 'OBJECT',
      properties: {
        reportType: { type: 'STRING', description: 'Report type: "inventory", "low_stock", or "reorder"' },
      },
      required: ['reportType'],
    },
  },
];

/**
 * Execute an allowlisted database or RAG tool
 */
const executeTool = async (toolName, args, context) => {
  const { storeId } = context;

  switch (toolName) {
    case 'getInventorySummary':
      return await dbTools.getInventorySummary({ storeId });

    case 'getProductStock':
      return await dbTools.getProductStock({ storeId, ...args });

    case 'getLowStockProducts':
      return await dbTools.getLowStockProducts({ storeId, ...args });

    case 'getSalesSummary':
      return await dbTools.getSalesSummary({ storeId, ...args });

    case 'getTopSellingProducts':
      return await dbTools.getTopSellingProducts({ storeId, ...args });

    case 'getSuppliersAndOrders':
      return await dbTools.getSuppliersAndOrders({ storeId, ...args });

    case 'getPurchaseOrders':
      return await dbTools.getPurchaseOrders({ storeId, ...args });

    case 'getReorderRecommendations':
      return await dbTools.getReorderRecommendations({ storeId, ...args });

    case 'getStockMovements':
      return await dbTools.getStockMovements({ storeId, ...args });

    case 'getCustomersSummary':
      return await dbTools.getCustomersSummary({ storeId, ...args });

    case 'searchBusinessKnowledge':
      return await ragService.searchBusinessKnowledge(args.query);

    case 'generatePdfReport':
      return {
        status: 'READY',
        reportType: args.reportType || 'inventory',
        downloadUrl: `/api/reports/export-pdf/${args.reportType || 'inventory'}`,
      };

    default:
      throw new Error(`Unrecognized tool: ${toolName}`);
  }
};

/**
 * Intelligent Local Orchestration Fallback
 * Used when Gemini API key is not configured or in offline test mode.
 * Executes the EXACT same DB & RAG tools and generates structured, grounded answers.
 */
const generateLocalGroundedResponse = async (userMessage, context, history = []) => {
  const { storeId, userName = 'Store Owner' } = context;
  const q = userMessage.toLowerCase();
  const toolsUsed = [];
  const sources = [];

  // Check recent message history for context (e.g. previous question or response topic)
  const lastUserMsg = (history || [])
    .filter((m) => m.sender === 'user' || m.role === 'user')
    .slice(-2)[0]?.text?.toLowerCase() || '';
  const lastAiMsg = (history || [])
    .filter((m) => m.sender === 'ai' || m.role === 'model')
    .slice(-1)[0]?.text?.toLowerCase() || '';

  const isFollowUp = q.includes('these') || q.includes('those') || q.includes('them') || q.includes('this') || q.includes('their');

  // 0. PDF Report Generation queries
  if (q.includes('pdf') || q.includes('download report') || q.includes('export') || q.includes('generate report') || (isFollowUp && (q.includes('download') || q.includes('pdf')))) {
    const isLowStock = q.includes('low') || q.includes('shortage') || (isFollowUp && (lastUserMsg.includes('low') || lastAiMsg.includes('low stock')));
    const isReorder = q.includes('reorder') || (isFollowUp && (lastUserMsg.includes('reorder') || lastAiMsg.includes('reorder')));
    const reportType = isLowStock ? 'low_stock' : isReorder ? 'reorder' : 'inventory';
    
    toolsUsed.push('generatePdfReport');
    sources.push({ type: 'python_pdf', label: `Python ReportLab PDF Engine (${reportType})` });

    const summary = await dbTools.getInventorySummary({ storeId });
    const reportTitle = reportType === 'low_stock' ? 'Low Stock & Replenishment Alert Report' : reportType === 'reorder' ? 'Smart Reorder & Procurement Package Report' : 'Master Inventory Status & Valuation Report';

    return {
      reply: `📄 **${reportTitle} is Ready for Download!**\n\nOur Python analytics engine generated a high-resolution PDF report branded with your supermarket data.\n\n📊 **Report Summary Preview:**\n- **Total Active SKUs:** ${summary.totalProducts.toLocaleString('en-IN')}\n- **Healthy In-Stock Items:** ${summary.inStockCount.toLocaleString('en-IN')}\n- **Items Below Reorder Point:** ${summary.lowStockCount.toLocaleString('en-IN')}\n- **Current Inventory Valuation:** ₹${summary.inventoryRetailValuation.toLocaleString('en-IN')}\n\n📥 Click the **"Download PDF"** card below to save the official PDF document to your device.`,
      toolsUsed,
      sources,
      reportData: {
        reportType,
        reportTitle,
        downloadUrl: `/api/reports/export-pdf/${reportType}`,
        filename: `StockSense_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      },
    };
  }

  // 1. Low stock / stockout queries
  if (q.includes('low') || q.includes('shortage') || q.includes('run out') || q.includes('out of stock') || q.includes('deficit')) {
    toolsUsed.push('getLowStockProducts');
    const lowStock = await dbTools.getLowStockProducts({ storeId, limit: 8 });
    sources.push({ type: 'database', label: `Live Stock Database (${lowStock.totalLowStockCount} items low)` });

    if (lowStock.totalLowStockCount === 0) {
      return {
        reply: `🎉 **Excellent news, ${userName}!** All inventory items in your supermarket are currently above their configured reorder thresholds. No items are low or out of stock at this moment.`,
        toolsUsed,
        sources,
      };
    }

    let itemsTable = lowStock.items
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** (${p.category})\n   - **Current Stock:** \`${p.currentStock} ${p.unit}\` (Reorder Point: ${p.reorderLevel})\n   - **Status:** ${p.urgency}\n   - **Supplier:** ${p.supplier} (Lead Time: ${p.leadTimeDays} days)\n   - **Recommended Reorder:** \`${p.suggestedReorder} ${p.unit}\` (Est. Cost: ₹${p.estimatedCost.toLocaleString('en-IN')})`
      )
      .join('\n\n');

    return {
      reply: `⚠️ **Low Stock Alert (${lowStock.totalLowStockCount} Items Below Reorder Point)**\n\nHere are the critical items that need replenishment:\n\n${itemsTable}\n\n💡 **Total Estimated Replenishment Cost:** ₹${lowStock.totalReplenishmentCost.toLocaleString('en-IN')}\n\n👉 **Action:** Navigate to **Smart Reorders** in the sidebar to create consolidated purchase orders with one click.`,
      toolsUsed,
      sources,
    };
  }

  // 2. Reorder suggestions / Replenishment
  if (q.includes('reorder') || q.includes('replenish') || q.includes('order today') || q.includes('purchase list')) {
    toolsUsed.push('getReorderRecommendations');
    const recs = await dbTools.getReorderRecommendations({ storeId });
    sources.push({ type: 'database', label: `Smart Reorder Engine (${recs.totalItemsNeedingReorder} items)` });

    if (recs.totalItemsNeedingReorder === 0) {
      return {
        reply: `✅ **No Reorders Needed Today!** All products have sufficient stock levels based on sales velocity and target inventory thresholds.`,
        toolsUsed,
        sources,
      };
    }

    let pkgSummary = recs.supplierPackages
      .map(
        (pkg, idx) =>
          `**Package ${idx + 1}: ${pkg.supplierName}** (Lead Time: ~${pkg.leadTimeDays} days)\n- **Items to Order:** ${pkg.itemsCount} products\n- **Estimated Cost:** ₹${pkg.totalCost.toLocaleString('en-IN')}\n- **Top Items:** ${pkg.items.slice(0, 3).map((item) => `${item.name} (${item.recommendedOrderQty} ${item.unit})`).join(', ')}`
      )
      .join('\n\n');

    return {
      reply: `📦 **Recommended Reorder Packages for Today**\n\nOur AI reorder engine calculated replenishment orders for **${recs.totalItemsNeedingReorder} items** grouped across **${recs.supplierPackages.length} suppliers**:\n\n${pkgSummary}\n\n💰 **Total Estimated Order Value:** ₹${recs.totalEstimatedProcurementCost.toLocaleString('en-IN')}\n\n🛒 You can click **"Smart Reorders"** to view and generate Purchase Orders directly into your database.`,
      toolsUsed,
      sources,
    };
  }

  // 3. Sales & POS revenue queries
  if (q.includes('sale') || q.includes('revenue') || q.includes('turnover') || q.includes('bill') || q.includes('earned') || q.includes('income')) {
    toolsUsed.push('getSalesSummary');
    const period = q.includes('yesterday') ? 'yesterday' : q.includes('week') ? 'this_week' : q.includes('month') ? 'this_month' : 'today';
    const sales = await dbTools.getSalesSummary({ storeId, period });
    sources.push({ type: 'database', label: `POS Bills Database (${period})` });

    const periodLabel = period === 'today' ? "Today's" : period === 'yesterday' ? "Yesterday's" : period === 'this_week' ? "This Week's" : "This Month's";

    return {
      reply: `📊 **${periodLabel} Sales Performance Summary**\n\n- **Total Revenue:** ₹${sales.totalSalesAmount.toLocaleString('en-IN')}\n- **Completed Bills / Transactions:** ${sales.totalBillsCount} bills\n- **Total Items Sold:** ${sales.totalItemsSold} units\n- **Average Bill Value (ABV):** ₹${sales.averageBillValue.toLocaleString('en-IN')}\n- **Total Discounts Given:** ₹${sales.totalDiscount.toLocaleString('en-IN')}\n\n💳 **Payment Methods Breakdown:**\n- **Cash:** ₹${(sales.paymentModesBreakdown.CASH || 0).toLocaleString('en-IN')}\n- **UPI (GPay/PhonePe):** ₹${(sales.paymentModesBreakdown.UPI || 0).toLocaleString('en-IN')}\n- **Card / Net Banking:** ₹${(sales.paymentModesBreakdown.CARD || 0).toLocaleString('en-IN')}\n\n*Data retrieved live from authorized supermarket POS billing records.*`,
      toolsUsed,
      sources,
    };
  }

  // 4. Fast-moving / Top selling products
  if (q.includes('fast') || q.includes('top product') || q.includes('best selling') || q.includes('popular') || q.includes('velocity')) {
    toolsUsed.push('getTopSellingProducts');
    const top = await dbTools.getTopSellingProducts({ storeId, limit: 5, days: 30 });
    sources.push({ type: 'database', label: 'Sales Velocity Aggregation (Last 30 Days)' });

    if (top.topProducts.length === 0) {
      return {
        reply: `📈 No sales transactions were recorded in the last 30 days. Complete billing transactions at the **Create Bill / POS** page to populate velocity data.`,
        toolsUsed,
        sources,
      };
    }

    let topList = top.topProducts
      .map(
        (p, i) =>
          `${i + 1}. **${p.name}** (${p.category})\n   - **Quantity Sold:** \`${p.totalQuantitySold} units\`\n   - **Revenue Generated:** ₹${p.totalRevenueGenerated.toLocaleString('en-IN')}\n   - **Current Shelf Stock:** ${p.currentStock} units (${p.stockStatus})`
      )
      .join('\n\n');

    return {
      reply: `🔥 **Top 5 Fast-Moving Supermarket Items (Last 30 Days)**\n\n${topList}\n\n💡 **Insight:** Ensure high stock coverage for top-selling items to prevent costly stockouts during peak retail hours.`,
      toolsUsed,
      sources,
    };
  }

  // 5. Purchase Orders & Deliveries
  if (q.includes('purchase order') || q.includes('po') || q.includes('delivery') || q.includes('order status') || q.includes('pending order')) {
    toolsUsed.push('getPurchaseOrders');
    const pos = await dbTools.getPurchaseOrders({ storeId, status: 'ALL', limit: 6 });
    sources.push({ type: 'database', label: 'Purchase Orders System' });

    if (pos.orders.length === 0) {
      return {
        reply: `📋 **Purchase Orders Status:** There are currently no active purchase orders recorded in your store. You can create new purchase orders from the **Smart Reorders** or **Suppliers** module.`,
        toolsUsed,
        sources,
      };
    }

    let poList = pos.orders
      .map(
        (po) =>
          `- **${po.orderNumber}** — **${po.supplierName}**\n  - Status: \`${po.status}\` | Total: ₹${po.totalAmount.toLocaleString('en-IN')}\n  - Expected Delivery: ${po.expectedDeliveryDate} (${po.itemsCount} items)`
      )
      .join('\n');

    return {
      reply: `📋 **Recent Purchase Orders Overview (${pos.totalReturned} Orders)**\n\n${poList}\n\n👉 Navigate to **Smart Reorders** to inspect line items or track expected stock receipts.`,
      toolsUsed,
      sources,
    };
  }

  // 6. Suppliers
  if (q.includes('supplier') || q.includes('vendor') || q.includes('distributor')) {
    toolsUsed.push('getSuppliersAndOrders');
    const supp = await dbTools.getSuppliersAndOrders({ storeId });
    sources.push({ type: 'database', label: `Active Suppliers Database (${supp.count} vendors)` });

    let suppList = supp.suppliers
      .slice(0, 5)
      .map(
        (s, i) =>
          `${i + 1}. **${s.name}** (${s.company})\n   - **Phone:** ${s.phone} | **Email:** ${s.email}\n   - **Payment Terms:** ${s.paymentTerms} | **Lead Time:** ${s.leadTimeDays} days\n   - **Supplied Products:** ${s.totalSuppliedProducts} products (${s.lowStockProductsCount} currently low)`
      )
      .join('\n\n');

    return {
      reply: `🚚 **Registered Supermarket Suppliers (${supp.count} Vendors)**\n\n${suppList}\n\n📞 All contact details and order histories are synchronized with your store.`,
      toolsUsed,
      sources,
    };
  }

  // 7. Policy / RAG Knowledge queries (Formulas, FIFO, Expiry, Safety Stock, GST)
  if (
    q.includes('formula') ||
    q.includes('safety stock') ||
    q.includes('policy') ||
    q.includes('fifo') ||
    q.includes('expiry') ||
    q.includes('gst') ||
    q.includes('loyalty') ||
    q.includes('how to calculate') ||
    q.includes('spoilage') ||
    q.includes('audit')
  ) {
    toolsUsed.push('searchBusinessKnowledge');
    const docs = await ragService.searchBusinessKnowledge(userMessage);
    if (docs.length > 0) {
      sources.push({ type: 'rag', label: docs[0].title, source: docs[0].source });
      return {
        reply: `📚 **${docs[0].title}**\n\n${docs[0].content}\n\n*Reference: ${docs[0].source}*`,
        toolsUsed,
        sources,
      };
    }
  }

  // 8. Specific Product stock lookup
  toolsUsed.push('getProductStock');
  const searchResult = await dbTools.getProductStock({ storeId, search: userMessage, limit: 5 });
  if (searchResult.count > 0) {
    sources.push({ type: 'database', label: `Product Database (${searchResult.count} matches)` });
    let prodList = searchResult.products
      .map(
        (p) =>
          `- **${p.name}** (${p.category})\n  - **SKU:** \`${p.sku}\` | **Barcode:** ${p.barcode}\n  - **Current Stock:** \`${p.currentStock} ${p.unit}\` (Reorder Point: ${p.reorderLevel})\n  - **Price:** ₹${p.sellingPrice} (Cost: ₹${p.purchasePrice})\n  - **Status:** **${p.status}**\n  - **Supplier:** ${p.supplier}`
      )
      .join('\n\n');

    return {
      reply: `🔍 **Matching Product Stock Information:**\n\n${prodList}`,
      toolsUsed,
      sources,
    };
  }

  // 9. General High-Level Inventory Overview fallback
  toolsUsed.push('getInventorySummary');
  const summary = await dbTools.getInventorySummary({ storeId });
  sources.push({ type: 'database', label: 'Store Inventory Overview' });

  return {
    reply: `👋 Hello ${userName}! Here is your live **StockSense AI Supermarket Overview**:\n\n- **Total Active Products:** ${summary.totalProducts.toLocaleString('en-IN')} items\n- **Stock Health Score:** ${summary.storeHealthScore}%\n- **In-Stock Products:** ${summary.inStockCount} items\n- **Low / Out of Stock:** ${summary.lowStockCount} items\n- **Inventory Retail Valuation:** ₹${summary.inventoryRetailValuation.toLocaleString('en-IN')}\n- **Active Categories:** ${summary.totalCategories} | **Suppliers:** ${summary.totalSuppliers}\n\n💬 **How can I assist you further?** You can ask about:\n- *"Which products are running low on stock?"*\n- *"What are today's total sales?"*\n- *"What should I reorder today?"*\n- *"Show me top 5 fast-moving products"*`,
    toolsUsed,
    sources,
  };
};

/**
 * Main AI Chat Processor
 * Handles incoming chat messages with Google Gemini API and tool execution loop.
 */
export const processAiChat = async ({ message, history = [], context }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // If Gemini API Key is missing or empty, use our grounded local AI engine
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_server_side_api_key') {
    return await generateLocalGroundedResponse(message, context, history);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }],
    });

    // Format chat history for multi-turn context
    const formattedHistory = (history || [])
      .slice(-6)
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }],
      }))
      .filter((msg) => msg.parts[0].text);

    const chat = model.startChat({
      history: formattedHistory,
    });

    const toolsUsed = [];
    const sources = [];
    let reportData = null;

    // Send user message
    let result = await chat.sendMessage(message);
    let response = await result.response;
    let functionCalls = response.functionCalls();

    // Handle tool calling loop (max 3 tool hops)
    let iterations = 0;
    while (functionCalls && functionCalls.length > 0 && iterations < 3) {
      iterations++;
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        toolsUsed.push(name);

        try {
          const toolResult = await executeTool(name, args, context);
          sources.push({
            type: name === 'searchBusinessKnowledge' ? 'rag' : 'database',
            label: name,
          });

          if (name === 'generatePdfReport') {
            const reportType = args.reportType || 'inventory';
            reportData = {
              reportType,
              reportTitle: reportType === 'low_stock' ? 'Low Stock & Replenishment Alert Report' : reportType === 'reorder' ? 'Smart Reorder Package Report' : 'Master Inventory Valuation Report',
              downloadUrl: `/api/reports/export-pdf/${reportType}`,
              filename: `StockSense_${reportType.toUpperCase()}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            };
          }

          functionResponses.push({
            functionResponse: {
              name,
              response: { result: toolResult },
            },
          });
        } catch (toolErr) {
          console.error(`Tool execution error for ${name}:`, toolErr);
          functionResponses.push({
            functionResponse: {
              name,
              response: { error: toolErr.message },
            },
          });
        }
      }

      // Send tool results back to Gemini
      result = await chat.sendMessage(functionResponses);
      response = await result.response;
      functionCalls = response.functionCalls();
    }

    const replyText = response.text() || 'I have analyzed your store records. How else can I assist you?';

    return {
      reply: replyText,
      toolsUsed,
      sources,
      reportData,
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to grounded local engine:', error.message);
    // Graceful fallback to guaranteed grounded database engine
    return await generateLocalGroundedResponse(message, context, history);
  }
};

export default {
  processAiChat,
};
