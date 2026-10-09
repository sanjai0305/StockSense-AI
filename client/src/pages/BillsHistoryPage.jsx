import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Search, Eye, Printer, Calendar, Download, DollarSign, User } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

const BillsHistoryPage = () => {
  const [bills, setBills] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bills?search=${encodeURIComponent(search)}&paymentMethod=${encodeURIComponent(paymentFilter)}`);
      if (res.success) {
        setBills(res.data);
        setTotalRevenue(res.totalSalesRevenue || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, paymentFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-blue-600" />
            Bills & Sales History
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit customer checkout invoices, payment modes, and sales turnover
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Sales Summary
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Customer Invoices</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{bills.length} bills</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-500">Total Counter Revenue</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalRevenue)}</h3>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs font-bold text-slate-500">Avg. Bill Ticket Size</p>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
            {formatCurrency(bills.length > 0 ? totalRevenue / bills.length : 0)}
          </h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 no-print">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill Number, customer name or phone..."
            className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 focus:bg-white cursor-pointer"
        >
          <option value="">All Payment Modes</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other / Credit</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FBFBFC] text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Bill No.</th>
                <th className="py-3 px-3 font-semibold">Date & Time</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Items</th>
                <th className="py-3 px-3 font-semibold">Payment Mode</th>
                <th className="py-3 px-3 font-semibold">Amount</th>
                <th className="py-3 px-3 font-semibold">Cashier</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">Loading bills history...</td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">No customer bills recorded yet.</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{bill.billNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(bill.createdAt)}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {bill.customerName || bill.customer?.name || 'Walk-in'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">{bill.items?.length || 0} items</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-3 px-3 text-slate-600">{bill.createdBy || 'Staff'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Bill
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill View Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-slate-900 text-base">Invoice #{selectedBill.billNumber}</h3>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="py-3 space-y-2 text-xs">
              <p><strong>Customer:</strong> {selectedBill.customerName || selectedBill.customer?.name || 'Walk-in'}</p>
              <p><strong>Date:</strong> {formatDate(selectedBill.createdAt)} | <strong>Cashier:</strong> {selectedBill.createdBy}</p>
              <p><strong>Payment:</strong> {selectedBill.paymentMethod} ({selectedBill.paymentStatus})</p>

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
                    {selectedBill.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{it.productNameSnapshot}</td>
                        <td className="p-2">{it.quantity}</td>
                        <td className="p-2">{formatCurrency(it.unitSellingPrice)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-right text-xs space-y-1">
                <p>Subtotal: {formatCurrency(selectedBill.subtotal)}</p>
                {selectedBill.discountAmount > 0 && <p className="text-rose-600">Discount: -{formatCurrency(selectedBill.discountAmount)}</p>}
                <p className="text-sm font-extrabold text-slate-900">Total: {formatCurrency(selectedBill.totalAmount)}</p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setSelectedBill(null)}
                className="px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-bold"
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

export default BillsHistoryPage;
