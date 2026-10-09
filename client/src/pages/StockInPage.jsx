import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownLeft, Plus, Search, Calendar, Eye, Download, Truck, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import StockInModal from '../components/modals/StockInModal';

const StockInPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewReceipt, setViewReceipt] = useState(null);

  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const [recRes, supRes, prodRes] = await Promise.all([
        api.get(`/stock-in?supplierId=${supplierFilter}`),
        api.get('/suppliers'),
        api.get('/products'),
      ]);

      if (recRes.success) setReceipts(recRes.data);
      if (supRes.success) setSuppliers(supRes.data);
      if (prodRes.success) setProducts(prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [supplierFilter]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const totalReceivedValue = receipts.reduce((sum, r) => sum + r.subtotal, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-emerald-600" />
            Stock In (Purchases & Consignments)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Record incoming physical goods from distributors and update stock levels
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Record New Stock In
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Purchase Transactions</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{receipts.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Received Value</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(totalReceivedValue)}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Active Suppliers</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{suppliers.length}</h3>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Receipts History</h3>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5"
          >
            <option value="">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FBFBFC] text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Receipt No.</th>
                <th className="py-3 px-3 font-semibold">Invoice No.</th>
                <th className="py-3 px-3 font-semibold">Supplier</th>
                <th className="py-3 px-3 font-semibold">Items Count</th>
                <th className="py-3 px-3 font-semibold">Total Amount</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Received By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    Loading stock-in receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No stock-in receipts recorded yet.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{r.receiptNumber}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">{r.invoiceNumber}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{r.supplier?.name}</td>
                    <td className="py-3 px-3 font-semibold text-slate-600">{r.items?.length || 0} line items</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{formatCurrency(r.subtotal)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(r.receiptDate)}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{r.createdBy || 'Staff'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewReceipt(r)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockInModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchReceipts}
        suppliers={suppliers}
        products={products}
      />

      {/* Receipt Details Modal */}
      {viewReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Receipt #{viewReceipt.receiptNumber}</h3>
              <button onClick={() => setViewReceipt(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p><strong>Supplier:</strong> {viewReceipt.supplier?.name} ({viewReceipt.supplier?.phone})</p>
              <p><strong>Invoice No:</strong> {viewReceipt.invoiceNumber}</p>
              <p><strong>Receipt Date:</strong> {formatDate(viewReceipt.receiptDate)}</p>

              <div className="mt-3 border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Cost</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewReceipt.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{it.product?.name}</td>
                        <td className="p-2">{it.quantityReceived}</td>
                        <td className="p-2">{formatCurrency(it.unitCost)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setViewReceipt(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInPage;
