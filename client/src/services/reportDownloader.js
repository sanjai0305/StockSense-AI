/**
 * StockSense AI - PDF Report Downloader Service
 * Authenticated binary PDF retrieval with Blob handling, content verification, and automatic anchor downloads.
 */

export const downloadPdfReport = async (reportType = 'inventory', customFilename = null) => {
  const token = localStorage.getItem('smartstock_token');
  
  if (!token) {
    throw new Error('Authentication required. Please log in to download reports.');
  }

  const endpoint = `/api/reports/export-pdf/${encodeURIComponent(reportType)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMsg = `PDF generation failed (HTTP ${response.status})`;
      try {
        const errorJson = await response.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) {
      throw new Error('Server returned non-PDF data. Please retry.');
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty PDF document from server.');
    }

    // Determine filename
    let filename = customFilename;
    if (!filename) {
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
    }

    if (!filename) {
      const dateStr = new Date().toISOString().split('T')[0];
      const typeKey = reportType.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
      filename = `StockSense_${typeKey}_Report_${dateStr}.pdf`;
    }

    // Trigger browser download via object URL
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up DOM and memory
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 250);

    return {
      success: true,
      filename,
      size: blob.size,
    };
  } catch (error) {
    console.error('PDF Download Error:', error);
    throw error;
  }
};

export default {
  downloadPdfReport,
};
