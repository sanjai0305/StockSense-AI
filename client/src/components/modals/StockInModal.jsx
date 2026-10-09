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
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to record stock in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-[#14231C] text-base">
                Stock In (Receive Purchased Goods)
              </h3>
              <p className="text-xs text-[#66756C] font-medium">
                Record physical shipment received from distributor & increase inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#66756C] hover:text-[#14231C] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#E8F8EE] border border-[#CDE9D6] text-[#00966B] text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Supplier & Invoice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FBFDFB] p-4 rounded-2xl border border-[#DCEBE1]">
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Distributor / Supplier *
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B] cursor-pointer"
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
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Supplier Invoice / DC No. *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-white border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#14231C] focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="border border-[#DCEBE1] rounded-2xl overflow-hidden">
            <div className="bg-[#F4FAF6] px-4 py-2.5 flex items-center justify-between border-b border-[#DCEBE1]">
              <span className="text-xs font-bold text-[#14231C]">Delivered Line Items</span>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-bold text-[#00966B] hover:text-[#007A56] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Item
              </button>
            </div>

            <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center bg-[#FBFDFB] p-2.5 rounded-2xl border border-[#DCEBE1]"
                >
                  <div className="col-span-5">
                    <label className="block text-[10px] font-bold text-[#66756C] mb-0.5">
                      Product
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                      className="w-full bg-white border border-[#DCEBE1] rounded-xl px-2 py-1.5 text-xs font-semibold text-[#14231C]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-[#66756C] mb-0.5">
                      Qty Received
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantityReceived}
                      onChange={(e) => updateItem(idx, 'quantityReceived', e.target.value)}
                      className="w-full bg-white border border-[#DCEBE1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#14231C]"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-[#66756C] mb-0.5">
                      Unit Cost (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updateItem(idx, 'unitCost', e.target.value)}
                      className="w-full bg-white border border-[#DCEBE1] rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#00966B]"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center pt-3">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[#66756C] hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Total & Submit */}
          <div className="pt-3 border-t border-[#DCEBE1] flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#66756C] font-semibold">Total Consignment Value</p>
              <h4 className="text-xl font-black text-[#00966B]">
                {formatCurrency(totalAmount)}
              </h4>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#14231C] text-xs font-bold rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all flex items-center gap-2"
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
