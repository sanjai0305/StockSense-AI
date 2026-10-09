/**
 * StockSense AI - RAG Knowledge Base Service
 * Indexes and retrieves approved supermarket business documents, operational policies,
 * reorder formulas, supplier guidelines, and compliance rules.
 */

// Supermarket Standard Operational & Business Knowledge Documents
const KNOWLEDGE_DOCUMENTS = [
  {
    id: 'doc-inv-001',
    topic: 'inventory_policy',
    title: 'Safety Stock & Reorder Point Calculation Policy',
    tags: ['reorder', 'safety_stock', 'formula', 'lead_time', 'stockout_risk'],
    content: `
StockSense AI Reorder Formulas:
1. Reorder Point (ROP) = (Average Daily Sales × Supplier Lead Time in Days) + Safety Stock.
   When current stock is less than or equal to ROP, an immediate replenishment purchase order should be generated.
2. Safety Stock (Buffer) = (Maximum Daily Sales × Maximum Lead Time) - (Average Daily Sales × Average Lead Time).
   For standard FMCG grocery items, a safety stock buffer of 20% to 30% of average weekly demand is recommended.
3. Target Stock Level (Order-Up-To Level) = Average Weekly Sales × 2 + Safety Stock.
4. Recommended Order Quantity = Target Stock Level - Current Stock - Pending Orders on the way.
5. Stockout Risk Priority:
   - CRITICAL: Current stock < 25% of reorder level (runout expected in < 48 hours).
   - HIGH: Current stock <= Reorder level (runout expected in 2 to 4 days).
   - MEDIUM: Current stock is within 10% above reorder level.
`,
    source: 'StockSense AI Supermarket Standard Operating Procedures (SOP-INV-01)',
  },
  {
    id: 'doc-inv-002',
    topic: 'spoilage_expiry',
    title: 'Expiry Date & FIFO (First-In, First-Out) Management',
    tags: ['fifo', 'expiry', 'dairy', 'perishables', 'spoilage', 'damaged'],
    content: `
Perishables & Expiry Management Rules:
1. First-In, First-Out (FIFO): Older stock batches must always be placed at the front of retail shelves, with newer batches at the rear.
2. Dairy & Fresh Produce (Milk, Curd, Bread): Shelf life is 2-5 days. Check stock levels twice daily (morning 7 AM and evening 4 PM).
3. Near-Expiry Protocol:
   - 7 Days to Expiry (Packaged Foods): Apply a 15% discount badge or bundle deal.
   - 3 Days to Expiry (Dairy/Bread): Apply 30% clearance discount or return to supplier if covered under return agreement.
   - Expired Stock: Must be written off via "Stock Out" with transaction type "EXPIRED_GOODS" immediately for health compliance.
`,
    source: 'Supermarket Food Safety & Hygiene Guidelines (SOP-PERISH-03)',
  },
  {
    id: 'doc-proc-001',
    topic: 'procurement_suppliers',
    title: 'Supplier Purchase Order & Lead Time Workflow',
    tags: ['purchase_order', 'suppliers', 'gst', 'lead_time', 'po_status', 'payment_terms'],
    content: `
Supplier Procurement Workflow:
1. PO Statuses:
   - DRAFT: Order prepared by manager, awaiting store owner approval.
   - PENDING: Order issued to supplier via WhatsApp/Email, awaiting physical delivery.
   - PARTIALLY_RECEIVED: Some line items received and verified against invoice; remaining items backordered.
   - RECEIVED: All items received, inspected, entered into system via "Stock In", updating inventory balance.
   - CANCELLED: Order cancelled before supplier dispatch.
2. Payment Terms:
   - Net 15: Payment due 15 days from delivery date.
   - Net 30: Payment due 30 days from delivery date.
   - COD (Cash on Delivery): Payment settled immediately upon unloading.
3. Batch Grouping: Always group reorder items by preferred supplier to minimize delivery freight charges and meet Minimum Order Quantities (MOQ).
`,
    source: 'Procurement & Vendor Management Manual (SOP-PROC-02)',
  },
  {
    id: 'doc-pos-001',
    topic: 'billing_pos',
    title: 'POS Billing, GST Rates & Customer Loyalty Program',
    tags: ['billing', 'pos', 'gst', 'loyalty', 'discount', 'payment_methods'],
    content: `
Point of Sale (POS) and Customer Loyalty Policies:
1. Billing Payment Modes: Cash, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, and Store Loyalty Redemption.
2. Loyalty Points System:
   - Customers earn 1 Loyalty Point for every ₹100 spent on eligible grocery items.
   - 1 Loyalty Point = ₹1 redeemable against future bills (minimum redemption threshold: 50 points).
3. Return & Exchange Policy:
   - Unopened packaged goods can be returned within 7 days with valid Bill Receipt.
   - Perishables and dairy items cannot be returned once purchased unless defective or spoiled at point of sale.
4. GST Application:
   - Unbranded grains/milk: 0% GST
   - Branded packaged food / snacks / oil: 5% - 12% GST
   - Personal care & beverages: 18% - 28% GST
`,
    source: 'Retail POS Operations & Taxation Policy (SOP-POS-04)',
  },
  {
    id: 'doc-ops-001',
    topic: 'stock_audit',
    title: 'Physical Inventory Audit & Discrepancy Reconciliation',
    tags: ['audit', 'stock_adjustment', 'shrinkage', 'theft', 'variance'],
    content: `
Stock Audit & Shrinkage Prevention:
1. Weekly Cycle Count: High-value categories (Dry Fruits, Ghee, Cosmetics, Cigarettes) must be counted every Monday morning.
2. Discrepancy Handling:
   - If physical stock is LESS than system stock: Record difference via Stock Out -> "INTERNAL_ADJUSTMENT" with reason note.
   - If physical stock is MORE than system stock: Record difference via Stock In with note "FOUND_INVENTORY".
3. Target Shrinkage Rate: Supermarket overall inventory loss/shrinkage must remain below 0.5% of total retail turnover.
`,
    source: 'Loss Prevention & Audit SOP (SOP-AUD-05)',
  },
];

/**
 * Retrieve relevant knowledge chunks matching user query
 */
export const searchBusinessKnowledge = async (query, options = {}) => {
  const { topic = null, limit = 3 } = options;
  if (!query || typeof query !== 'string') return [];

  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return [];

  const scoredDocs = KNOWLEDGE_DOCUMENTS.map((doc) => {
    let score = 0;
    const docText = `${doc.title} ${doc.tags.join(' ')} ${doc.content}`.toLowerCase();

    // Check exact phrase matches
    if (docText.includes(query.toLowerCase())) {
      score += 15;
    }

    // Check tag matches
    doc.tags.forEach((tag) => {
      if (queryTerms.includes(tag.toLowerCase())) {
        score += 8;
      }
    });

    // Check individual word matches
    queryTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}`, 'g');
      const matches = docText.match(regex);
      if (matches) {
        score += matches.length * 2;
      }
    });

    // Topic filter bonus
    if (topic && doc.topic === topic) {
      score += 10;
    }

    return {
      id: doc.id,
      title: doc.title,
      topic: doc.topic,
      content: doc.content.trim(),
      source: doc.source,
      tags: doc.tags,
      score,
    };
  });

  return scoredDocs
    .filter((d) => d.score > 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export default {
  searchBusinessKnowledge,
  KNOWLEDGE_DOCUMENTS,
};
