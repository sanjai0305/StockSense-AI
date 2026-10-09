/**
 * StockSense AI - Python Analytics & PDF Client Service
 * Bridges Node.js backend with internal Python FastAPI Analytics & ReportLab PDF engine.
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_ANALYTICS_URL || 'http://127.0.0.1:8001';

/**
 * Generate high-resolution ReportLab PDF through Python microservice
 */
export const generatePdfFromPython = async ({
  reportType = 'inventory',
  storeName = 'StockSense Supermarket',
  products = [],
  summary = null,
  lowStock = null,
  reorders = null,
  salesSummary = null,
  transactions = [],
  period = 'Today',
}) => {
  try {
    const res = await fetch(`${PYTHON_SERVICE_URL}/api/pdf/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type: reportType,
        store_name: storeName,
        products,
        summary,
        low_stock: lowStock,
        reorders,
        sales_summary: salesSummary,
        transactions,
        period,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Python PDF generator error (${res.status}): ${errText}`);
    }

    const pdfBuffer = await res.arrayBuffer();
    const filenameHeader = res.headers.get('content-disposition');
    let filename = `StockSense_${reportType.toUpperCase()}_Report.pdf`;
    if (filenameHeader && filenameHeader.includes('filename=')) {
      const match = filenameHeader.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    return {
      success: true,
      buffer: Buffer.from(pdfBuffer),
      filename,
      contentType: 'application/pdf',
    };
  } catch (error) {
    console.error('Python Analytics Service Error:', error.message);
    throw error;
  }
};

/**
 * Compute inventory math via Python Analytics microservice
 */
export const computePythonInventorySummary = async (products, categories = []) => {
  try {
    const res = await fetch(`${PYTHON_SERVICE_URL}/api/analytics/inventory-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products, categories }),
    });

    if (!res.ok) {
      throw new Error(`Python analytics error: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Failed to compute Python summary:', error.message);
    return null;
  }
};

export default {
  generatePdfFromPython,
  computePythonInventorySummary,
  PYTHON_SERVICE_URL,
};
