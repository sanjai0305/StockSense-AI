import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDownLeft, Plus, Search, Calendar, Eye, Download, Truck, CheckCircle2, Boxes } from 'lucide-react';
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

  const totalReceivedValue = receipts.reduce((sum, r) => sum + (r.subtotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Stock In (Purchases & Consignments)
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Record incoming physical goods from distributors and auto-update stock levels
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record New Stock In
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Purchases</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">{formatNumber(receipts.length)}</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Consignments recorded</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Received Value</p>
            <h3 className="text-2xl font-black text-[#00966B] mt-1.5">
              {formatCurrency(totalReceivedValue)}
            </h3>
            <p className="text-[11px] text-[#66756C] mt-1">Cumulative supplier cost</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Active Suppliers</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">{suppliers.length}</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Registered partner vendors</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBE1] shadow-card overflow-hidden">
        <div className="p-5 border-b border-[#DCEBE1]/60 flex flex-wrap items-center justify-between gap-3 bg-[#FBFDFB]">
          <div>
            <h3 className="font-bold text-[#14231C] text-base">Receipts & Delivery History</h3>
            <p className="text-xs text-[#66756C]">Audited supplier goods received notes</p>
          </div>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="bg-white border border-[#DCEBE1] text-xs font-bold text-[#14231C] rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00966B] shadow-sm cursor-pointer"
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
              <tr className="border-b border-[#DCEBE1] bg-[#F4FAF6] text-[11px] font-bold text-[#66756C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Receipt No.</th>
                <th className="py-3.5 px-4">Invoice No.</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Items Count</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Received By</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE1]/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Loading stock-in receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <p className="text-sm font-semibold">No stock-in receipts recorded yet.</p>
                    <p className="text-xs text-[#66756C] mt-0.5">Click "Record New Stock In" to add delivered goods.</p>
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F4FAF6]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#00966B]">{r.receiptNumber}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#14231C]">{r.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#14231C]">{r.supplier?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-medium text-[#66756C]">
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F8EE] text-[#00966B] text-[11px] font-bold">
                        {r.items?.length || 0} line items
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#14231C]">{formatCurrency(r.subtotal)}</td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{formatDate(r.receiptDate)}</td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{r.createdBy || 'Store Admin'}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setViewReceipt(r)}
                        className="px-3 py-1.5 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] font-bold text-xs rounded-xl border border-[#CDE9D6] transition-colors inline-flex items-center gap-1.5 shadow-sm"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCEBE1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">Receipt #{viewReceipt.receiptNumber}</h3>
              </div>
              <button onClick={() => setViewReceipt(null)} className="text-[#66756C] hover:text-[#14231C] font-bold p-1">✕</button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F4FAF6] p-3.5 rounded-2xl border border-[#DCEBE1]">
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Supplier</span>
                  <strong className="text-[#14231C] text-xs">{viewReceipt.supplier?.name}</strong>
                  {viewReceipt.supplier?.phone && <span className="text-[#66756C] block text-[11px]">{viewReceipt.supplier.phone}</span>}
                </div>
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Invoice No & Date</span>
                  <strong className="text-[#14231C] text-xs font-mono">{viewReceipt.invoiceNumber}</strong>
                  <span className="text-[#66756C] block text-[11px]">{formatDate(viewReceipt.receiptDate)}</span>
                </div>
              </div>

              <div className="mt-3 border border-[#DCEBE1] rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F4FAF6] border-b border-[#DCEBE1] text-[11px] font-bold text-[#66756C]">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Unit Cost</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCEBE1]/60 text-xs">
                    {viewReceipt.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-[#14231C]">{it.product?.name}</td>
                        <td className="p-2.5 font-semibold text-[#14231C]">{it.quantityReceived}</td>
                        <td className="p-2.5 text-[#66756C]">{formatCurrency(it.unitCost)}</td>
                        <td className="p-2.5 text-right font-black text-[#00966B]">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-4 border-t border-[#DCEBE1] flex justify-end">
              <button
                onClick={() => setViewReceipt(null)}
                className="px-5 py-2 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] text-xs font-bold rounded-xl transition-colors"
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
