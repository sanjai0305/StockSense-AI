import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Search, Calendar, Eye, Download, CreditCard, Tag, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import StockOutModal from '../components/modals/StockOutModal';

const StockOutPage = () => {
  const [issues, setIssues] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewIssue, setViewIssue] = useState(null);

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const [issRes, prodRes, custRes] = await Promise.all([
        api.get(`/stock-out?transactionType=${typeFilter}`),
        api.get('/products'),
        api.get('/customers'),
      ]);

      if (issRes.success) setIssues(issRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (custRes.success) setCustomers(custRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const totalSalesValue = issues
    .filter((i) => i.transactionType === 'RETAIL_SALE')
    .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Stock Out (Retail Sales & Issue Transactions)
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Record retail counter billing, damaged stock write-offs, and stock adjustments
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record New Sale / Issue
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Sales Transactions</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">{formatNumber(issues.length)}</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Total customer checkouts</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Turnover (Revenue)</p>
            <h3 className="text-2xl font-black text-[#00966B] mt-1.5">
              {formatCurrency(totalSalesValue)}
            </h3>
            <p className="text-[11px] text-[#66756C] mt-1">Retail sales revenue</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Registered Customers</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">{customers.length}</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Loyalty club members</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBE1] shadow-card overflow-hidden">
        <div className="p-5 border-b border-[#DCEBE1]/60 flex flex-wrap items-center justify-between gap-3 bg-[#FBFDFB]">
          <div>
            <h3 className="font-bold text-[#14231C] text-base">Sales & Outward Movement History</h3>
            <p className="text-xs text-[#66756C]">Verified checkout & stock adjustment log</p>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-[#DCEBE1] text-xs font-bold text-[#14231C] rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00966B] shadow-sm cursor-pointer"
          >
            <option value="">All Transaction Types</option>
            <option value="RETAIL_SALE">Retail Sale</option>
            <option value="DAMAGED_GOODS">Damaged Goods</option>
            <option value="EXPIRED_GOODS">Expired Goods</option>
            <option value="INTERNAL_ADJUSTMENT">Internal Adjustment</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCEBE1] bg-[#F4FAF6] text-[11px] font-bold text-[#66756C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Txn No.</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE1]/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Loading sales records...</span>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <p className="text-sm font-semibold">No sales or issues recorded yet.</p>
                    <p className="text-xs text-[#66756C] mt-0.5">Click "Record New Sale / Issue" to start billing.</p>
                  </td>
                </tr>
              ) : (
                issues.map((i) => (
                  <tr key={i.id} className="hover:bg-[#F4FAF6]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#14231C]">{i.transactionNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        i.transactionType === 'RETAIL_SALE'
                          ? 'bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6]'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {i.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#14231C] font-semibold">
                      {i.customer ? i.customer.name : <span className="text-[#66756C] font-normal">Walk-in Customer</span>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#14231C]">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-mono">{i.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{i.items?.length || 0} line items</td>
                    <td className="py-3.5 px-4 font-black text-[#14231C]">{formatCurrency(i.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{formatDate(i.transactionDate)}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setViewIssue(i)}
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

      <StockOutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchIssues}
        products={products}
        customers={customers}
      />

      {/* Bill Details Modal */}
      {viewIssue && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCEBE1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">Receipt #{viewIssue.transactionNumber}</h3>
              </div>
              <button onClick={() => setViewIssue(null)} className="text-[#66756C] hover:text-[#14231C] font-bold p-1">✕</button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F4FAF6] p-3.5 rounded-2xl border border-[#DCEBE1]">
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Customer</span>
                  <strong className="text-[#14231C] text-xs">{viewIssue.customer?.name || 'Walk-in Counter Customer'}</strong>
                  {viewIssue.customer?.phone && <span className="text-[#66756C] block text-[11px]">{viewIssue.customer.phone}</span>}
                </div>
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Payment & Date</span>
                  <strong className="text-[#14231C] text-xs font-mono">{viewIssue.paymentMethod} • {viewIssue.transactionType}</strong>
                  <span className="text-[#66756C] block text-[11px]">{formatDate(viewIssue.transactionDate)}</span>
                </div>
              </div>

              <div className="mt-3 border border-[#DCEBE1] rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#F4FAF6] border-b border-[#DCEBE1] text-[11px] font-bold text-[#66756C]">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Rate</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCEBE1]/60 text-xs">
                    {viewIssue.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-[#14231C]">{it.product?.name}</td>
                        <td className="p-2.5 font-semibold text-[#14231C]">{it.quantity}</td>
                        <td className="p-2.5 text-[#66756C]">{formatCurrency(it.unitSellingPrice)}</td>
                        <td className="p-2.5 text-right font-black text-[#00966B]">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-4 border-t border-[#DCEBE1] flex justify-end">
              <button
                onClick={() => setViewIssue(null)}
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

export default StockOutPage;
