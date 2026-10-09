import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Search, Eye, Printer, Calendar, Download, DollarSign, User, TrendingUp, ShoppingBag } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card no-print">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <Receipt className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Bills & Sales History
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Audit customer checkout invoices, payment modes, and daily turnover
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] text-xs font-bold rounded-2xl shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 stroke-[2.2]" />
            Print Sales Summary
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Customer Bills</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">{formatNumber(bills.length)} invoices</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Settled register receipts</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Total Counter Revenue</p>
            <h3 className="text-2xl font-black text-[#00966B] mt-1.5">{formatCurrency(totalRevenue)}</h3>
            <p className="text-[11px] text-[#66756C] mt-1">Gross POS transactions</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Avg. Ticket Size</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">
              {formatCurrency(bills.length > 0 ? totalRevenue / bills.length : 0)}
            </h3>
            <p className="text-[11px] text-[#66756C] mt-1">Average basket value</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#DCEBE1] shadow-card flex flex-wrap items-center gap-3 no-print">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#66756C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bill Number, customer name or phone..."
            className="w-full bg-[#F4FAF6] border border-[#DCEBE1] text-[#14231C] text-xs font-semibold rounded-2xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-[#F4FAF6] border border-[#DCEBE1] text-[#14231C] text-xs font-bold rounded-2xl px-4 py-2.5 focus:bg-white cursor-pointer"
        >
          <option value="">All Payment Modes</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="CARD">Card</option>
          <option value="OTHER">Other / Credit</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBE1] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCEBE1] bg-[#F4FAF6] text-[11px] font-bold text-[#66756C] uppercase tracking-wider">
                <th className="py-3.5 px-5">Bill No.</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Cashier</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE1]/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Loading bills history...</span>
                    </div>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#66756C]">
                    <p className="text-sm font-semibold">No customer bills recorded yet.</p>
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#F4FAF6]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-[#00966B]">{bill.billNumber}</td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{formatDate(bill.createdAt)}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#14231C]">
                      {bill.customerName || bill.customer?.name || <span className="text-[#66756C] font-normal">Walk-in</span>}
                    </td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{bill.items?.length || 0} items</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6]">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#14231C]">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-3.5 px-4 text-[#66756C] font-medium">{bill.createdBy || 'Staff'}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="px-3 py-1.5 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] font-bold text-xs rounded-xl border border-[#CDE9D6] transition-colors inline-flex items-center gap-1.5 shadow-sm"
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-[#DCEBE1] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCEBE1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-[#14231C] text-base">Invoice #{selectedBill.billNumber}</h3>
              </div>
              <button onClick={() => setSelectedBill(null)} className="text-[#66756C] hover:text-[#14231C] font-bold p-1">✕</button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F4FAF6] p-3.5 rounded-2xl border border-[#DCEBE1]">
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Customer</span>
                  <strong className="text-[#14231C] text-xs">{selectedBill.customerName || selectedBill.customer?.name || 'Walk-in'}</strong>
                </div>
                <div>
                  <span className="text-[#66756C] block text-[10px] font-bold uppercase">Payment & Status</span>
                  <strong className="text-[#00966B] text-xs font-mono">{selectedBill.paymentMethod} • {selectedBill.paymentStatus}</strong>
                  <span className="text-[#66756C] block text-[11px]">{formatDate(selectedBill.createdAt)}</span>
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
                    {selectedBill.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-[#14231C]">{it.productNameSnapshot}</td>
                        <td className="p-2.5 font-semibold text-[#14231C]">{it.quantity}</td>
                        <td className="p-2.5 text-[#66756C]">{formatCurrency(it.unitSellingPrice)}</td>
                        <td className="p-2.5 text-right font-black text-[#00966B]">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 text-right text-xs space-y-1 bg-[#FBFDFB] p-3 rounded-2xl border border-[#DCEBE1]">
                <p className="text-[#66756C]">Subtotal: <span className="font-bold text-[#14231C]">{formatCurrency(selectedBill.subtotal)}</span></p>
                {selectedBill.discountAmount > 0 && (
                  <p className="text-red-600 font-bold">Discount: -{formatCurrency(selectedBill.discountAmount)}</p>
                )}
                <p className="text-base font-black text-[#00966B]">Total Payable: {formatCurrency(selectedBill.totalAmount)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCEBE1] flex justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-emerald transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-bold text-[#14231C] transition-colors"
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
