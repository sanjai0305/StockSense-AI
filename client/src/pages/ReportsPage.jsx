import React, { useState, useEffect } from 'react';
import { BarChart3, Printer, Download, Calendar, DollarSign, Package, TrendingUp, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

import { downloadPdfReport } from '../services/reportDownloader';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('INVENTORY'); // 'INVENTORY' | 'STOCK_IN' | 'STOCK_OUT' | 'MOVEMENTS'
  const [inventoryData, setInventoryData] = useState(null);
  const [stockInData, setStockInData] = useState(null);
  const [stockOutData, setStockOutData] = useState(null);
  const [movementsData, setMovementsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        if (activeTab === 'INVENTORY') {
          const res = await api.get('/reports/inventory');
          if (res.success) setInventoryData(res);
        } else if (activeTab === 'STOCK_IN') {
          const res = await api.get('/reports/stock-in');
          if (res.success) setStockInData(res);
        } else if (activeTab === 'STOCK_OUT') {
          const res = await api.get('/reports/stock-out');
          if (res.success) setStockOutData(res);
        } else if (activeTab === 'MOVEMENTS') {
          const res = await api.get('/reports/movements');
          if (res.success) setMovementsData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      setPdfSuccessMessage(null);
      const reportType = activeTab === 'STOCK_OUT' ? 'sales' : activeTab === 'STOCK_IN' ? 'inventory' : 'inventory';
      const result = await downloadPdfReport(reportType);
      if (result.success) {
        setPdfSuccessMessage(`Downloaded: ${result.filename}`);
        setTimeout(() => setPdfSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(err.message || 'Failed to download PDF report');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#00966B]" />
            Inventory & Financial Reports
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time auditable valuation, consignment history, and movement trails
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00966B] hover:bg-[#007A56] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            {downloadingPdf ? 'Exporting PDF...' : 'Export PDF Report'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {pdfSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>✓ {pdfSuccessMessage}</span>
          <button onClick={() => setPdfSuccessMessage(null)} className="text-emerald-500">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 no-print overflow-x-auto">
        {[
          { id: 'INVENTORY', label: 'Inventory Valuation', icon: Package },
          { id: 'STOCK_IN', label: 'Stock In Purchases', icon: ArrowDownLeft },
          { id: 'STOCK_OUT', label: 'Stock Out Sales', icon: ArrowUpRight },
          { id: 'MOVEMENTS', label: 'Audit Trail Movements', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#00966B] text-[#00966B] bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <p className="text-xs font-bold text-slate-500">Total Items in Catalog</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatNumber(inventoryData?.summary?.totalItems || 0)}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <p className="text-xs font-bold text-slate-500">Total Units in Stock</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatNumber(inventoryData?.summary?.totalUnits || 0)}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <p className="text-xs font-bold text-slate-500">Total Cost Valuation</p>
              <h3 className="text-2xl font-extrabold text-[#00966B] mt-1">
                {formatCurrency(inventoryData?.summary?.totalValuation || 0)}
              </h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
              <p className="text-xs font-bold text-slate-500">Potential Gross Profit</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatCurrency(inventoryData?.summary?.potentialProfit || 0)}
              </h3>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold text-slate-900 text-sm">Detailed Stock Valuation by Product</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b">
                    <th className="p-3 px-4">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Cost Price</th>
                    <th className="p-3">Total Cost Value</th>
                    <th className="p-3">Selling Price</th>
                    <th className="p-3 text-right">Potential Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {inventoryData?.data?.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-600">{p.category?.name}</td>
                      <td className="p-3 font-extrabold">{p.currentStock} {p.unitOfMeasure}</td>
                      <td className="p-3">{formatCurrency(p.purchasePrice)}</td>
                      <td className="p-3 font-bold text-[#00966B]">{formatCurrency(p.currentStock * p.purchasePrice)}</td>
                      <td className="p-3">{formatCurrency(p.sellingPrice)}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">{formatCurrency(p.currentStock * p.sellingPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'STOCK_IN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Supplier Consignment Receipts</h3>
            <span className="text-xs font-bold text-emerald-600">
              Total Purchases: {formatCurrency(stockInData?.summary?.totalPurchasedValue || 0)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b">
                  <th className="p-3 px-4">Receipt No</th>
                  <th className="p-3">Invoice No</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {stockInData?.data?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 px-4 font-mono font-bold text-[#00966B]">{r.receiptNumber}</td>
                    <td className="p-3 font-mono">{r.invoiceNumber}</td>
                    <td className="p-3 font-semibold">{r.supplier?.name}</td>
                    <td className="p-3">{formatDate(r.receiptDate)}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(r.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STOCK_OUT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Sales & Counter Billing Logs</h3>
            <span className="text-xs font-bold text-rose-600">
              Total Revenue: {formatCurrency(stockOutData?.summary?.totalSalesValue || 0)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b">
                  <th className="p-3 px-4">Txn No</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {stockOutData?.data?.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 px-4 font-mono font-bold">{i.transactionNumber}</td>
                    <td className="p-3">{i.transactionType}</td>
                    <td className="p-3">{i.customer?.name || 'Walk-in'}</td>
                    <td className="p-3 font-semibold">{i.paymentMethod}</td>
                    <td className="p-3">{formatDate(i.transactionDate)}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(i.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-bold text-slate-900 text-sm">Audit Trail Movements</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b">
                  <th className="p-3 px-4">Date & Time</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Movement Type</th>
                  <th className="p-3">Quantity Delta</th>
                  <th className="p-3">Stock Before</th>
                  <th className="p-3">Stock After</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {movementsData?.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 px-4 text-slate-500">{formatDate(m.createdAt)}</td>
                    <td className="p-3 font-bold text-slate-900">{m.product?.name}</td>
                    <td className="p-3 font-semibold text-slate-700">{m.movementType}</td>
                    <td className="p-3 font-extrabold">
                      <span className={m.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{m.quantityBefore}</td>
                    <td className="p-3 font-bold text-slate-900">{m.quantityAfter}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{m.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
