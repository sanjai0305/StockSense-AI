import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Trash2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const StockInModal = ({ isOpen, onClose, onSuccess, initialProduct = null, suppliers = [], products = [] }) => {
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
      setNotes('');
      setError('');
      setSuccessMsg('');

      if (initialProduct) {
        setSupplierId(initialProduct.preferredSupplierId || suppliers[0]?.id || '');
        setItems([
          {
            productId: initialProduct.id,
            productName: initialProduct.name,
            quantityReceived: initialProduct.suggestedQty || 50,
            unitCost: initialProduct.purchasePrice || 100,
            batchNumber: `B-${Date.now().toString().slice(-4)}`,
            expiryDate: '',
          },
        ]);
      } else {
        setSupplierId(suppliers[0]?.id || '');
        if (products.length > 0) {
          const first = products[0];
          setItems([
            {
              productId: first.id,
              productName: first.name,
              quantityReceived: 50,
              unitCost: first.purchasePrice || 100,
              batchNumber: `B-${Date.now().toString().slice(-4)}`,
              expiryDate: '',
            },
          ]);
        } else {
          setItems([]);
        }
      }
    }
  }, [isOpen, initialProduct, suppliers, products]);

  if (!isOpen) return null;

  const addItemRow = () => {
    const p = products[0] || {};
    setItems([
      ...items,
      {
        productId: p.id || '',
        productName: p.name || '',
        quantityReceived: 10,
        unitCost: p.purchasePrice || 0,
        batchNumber: `B-${Date.now().toString().slice(-4)}`,
        expiryDate: '',
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
        copy[index].unitCost = prod.purchasePrice || 0;
      }
    }
    setItems(copy);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + (parseFloat(i.quantityReceived) || 0) * (parseFloat(i.unitCost) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Please add at least one product item.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        supplierId,
        invoiceNumber,
        notes,
        items: items.map((i) => ({
          productId: i.productId,
          quantityReceived: parseFloat(i.quantityReceived) || 0,
          unitCost: parseFloat(i.unitCost) || 0,
          batchNumber: i.batchNumber || null,
          expiryDate: i.expiryDate ? new Date(i.expiryDate).toISOString() : null,
        })),
      };

      const res = await api.post('/stock-in', payload);
      setSuccessMsg(res.message || 'Stock In recorded successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to record stock in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Stock In (Receive Purchased Goods)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record physical shipment received from distributor & increase inventory
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

          {/* Supplier & Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Distributor / Supplier *
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier Invoice / DC No. *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100/80 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700">Delivered Line Items</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
                      Product
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Qty Received
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantityReceived}
                      onChange={(e) => updateItem(idx, 'quantityReceived', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Unit Cost (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updateItem(idx, 'unitCost', e.target.value)}
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

          {/* Footer Total & Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Consignment Value</p>
              <h4 className="text-lg font-extrabold text-slate-900">
                {formatCurrency(totalAmount)}
              </h4>
            </div>

            <div className="flex items-center gap-2.5">
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
                className="px-5 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                <span>{loading ? 'Receiving...' : 'Record Goods Received'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
