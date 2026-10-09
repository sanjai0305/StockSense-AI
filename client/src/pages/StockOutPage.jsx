import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Plus, Search, Calendar, Eye, Download, CreditCard, Tag } from 'lucide-react';
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
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-500" />
            Stock Out (Retail Sales & Issue Transactions)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Record retail counter billing, damaged stock write-offs, and issues
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444] hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Record New Sale / Issue
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Sales Transactions</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{issues.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Turnover (Sales Revenue)</p>
          <h3 className="text-2xl font-extrabold text-rose-500 mt-1">
            {formatCurrency(totalSalesValue)}
          </h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
          <p className="text-xs font-bold text-slate-500">Registered Customers</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{customers.length}</h3>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Sales & Issue History</h3>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5"
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
              <tr className="border-b border-slate-100 bg-[#FBFBFC] text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Txn No.</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold">Items</th>
                <th className="py-3 px-3 font-semibold">Total Amount</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    Loading sales records...
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400">
                    No sales or issues recorded yet.
                  </td>
                </tr>
              ) : (
                issues.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{i.transactionNumber}</td>
                    <td className="py-3 px-3 font-semibold">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        i.transactionType === 'RETAIL_SALE'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {i.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {i.customer ? i.customer.name : 'Walk-in'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-600">{i.paymentMethod}</td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{i.items?.length || 0} line items</td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{formatCurrency(i.totalAmount)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(i.transactionDate)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewIssue(i)}
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Receipt #{viewIssue.transactionNumber}</h3>
              <button onClick={() => setViewIssue(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p><strong>Type:</strong> {viewIssue.transactionType} | <strong>Payment:</strong> {viewIssue.paymentMethod}</p>
              <p><strong>Customer:</strong> {viewIssue.customer?.name || 'Walk-in Counter Customer'}</p>
              <p><strong>Date:</strong> {formatDate(viewIssue.transactionDate)}</p>

              <div className="mt-3 border rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {viewIssue.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{it.product?.name}</td>
                        <td className="p-2">{it.quantity}</td>
                        <td className="p-2">{formatCurrency(it.unitSellingPrice)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setViewIssue(null)}
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

export default StockOutPage;
