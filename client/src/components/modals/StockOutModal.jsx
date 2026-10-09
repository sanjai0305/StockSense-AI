import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Plus, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const StockOutModal = ({ isOpen, onClose, onSuccess, products = [], customers = [] }) => {
  const [transactionType, setTransactionType] = useState('RETAIL_SALE');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('0');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTransactionType('RETAIL_SALE');
      setPaymentMethod('UPI');
      setCustomerId('');
      setDiscount('0');
      setError('');
      setSuccessMsg('');

      if (products.length > 0) {
        const first = products[0];
        setItems([
          {
            productId: first.id,
            productName: first.name,
            quantity: 1,
            unitSellingPrice: first.sellingPrice || 50,
            availableStock: first.currentStock || 0,
          },
        ]);
      } else {
        setItems([]);
      }
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const addItemRow = () => {
    const p = products[0] || {};
    setItems([
      ...items,
      {
        productId: p.id || '',
        productName: p.name || '',
        quantity: 1,
        unitSellingPrice: p.sellingPrice || 0,
        availableStock: p.currentStock || 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const copy = [...items];
    copy[index][field] = value;
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        copy[index].productName = prod.name;
        copy[index].unitSellingPrice = prod.sellingPrice || 0;
        copy[index].availableStock = prod.currentStock || 0;
      }
    }
    setItems(copy);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (sum, i) => sum + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitSellingPrice) || 0),
    0
  );

  const discountAmount = parseFloat(discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one product item.');
      return;
    }

    // Validate available stock
    for (const item of items) {
      if (item.quantity > item.availableStock) {
        setError(`Insufficient stock for "${item.productName}". Available: ${item.availableStock}, Requested: ${item.quantity}.`);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customerId: customerId || null,
        transactionType,
        paymentMethod,
        discount: discountAmount,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: parseFloat(i.quantity) || 1,
          unitSellingPrice: parseFloat(i.unitSellingPrice) || 0,
        })),
      };

      const res = await api.post('/stock-out', payload);
      setSuccessMsg(res.message || 'Sale recorded and stock updated!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to record stock out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Stock Out (Sales & Issues)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record counter billing, retail checkout, or damage write-offs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Transaction metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="RETAIL_SALE">Retail Sale (Counter)</option>
                <option value="DAMAGED_GOODS">Damaged Goods</option>
                <option value="EXPIRED_GOODS">Expired Goods</option>
                <option value="INTERNAL_ADJUSTMENT">Internal Stock Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer (Optional)
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="CREDIT">Store Credit</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700">Billing Items</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Item
              </button>
            </div>

            <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                >
                  <div className="col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Product (Available: {item.availableStock})
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={item.availableStock || 999}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitSellingPrice}
                      onChange={(e) => updateItem(idx, 'unitSellingPrice', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount & Total */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Discount (₹):</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
              />
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Grand Total: </span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#EF4444] hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
              <span>{loading ? 'Processing...' : 'Complete Sale & Deduct Stock'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockOutModal;
