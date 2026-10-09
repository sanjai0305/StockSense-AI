import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const BatchOrderModal = ({ isOpen, onClose, onSuccess, selectedItems = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const totalCost = selectedItems.reduce(
    (sum, item) => sum + (item.estimatedCost || (item.suggestedQty || 1) * (item.unitCost || item.purchasePrice || 0)),
    0
  );

  const handleConfirmOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        items: selectedItems.map((item) => ({
          productId: item.productId || item.id,
          quantity: item.suggestedQty || item.quantity || 10,
          unitCost: item.unitCost || item.purchasePrice || 0,
          supplierId: item.supplierId || item.preferredSupplierId || null,
        })),
      };

      const res = await api.post('/reorder/batch-order', payload);
      setSuccessMsg(res.message || 'Purchase Orders placed successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to place purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-[#14231C] text-base">
                Confirm Purchase Order Placement
              </h3>
              <p className="text-xs text-[#66756C] font-medium">
                Generate official Purchase Orders grouped by distributor
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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

          <div className="bg-[#FBFDFB] p-4 rounded-2xl border border-[#DCEBE1]">
            <p className="text-xs font-black text-[#14231C] mb-2.5">
              Selected Products for Replenishment ({selectedItems.length} items):
            </p>

            <div className="divide-y divide-[#DCEBE1]/60">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#DCEBE1] overflow-hidden flex items-center justify-center flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#14231C]">{item.name}</p>
                      <p className="text-[11px] text-[#66756C]">
                        {item.supplier || item.supplierName || 'Primary Distributor'} • Qty: <strong className="text-[#00966B]">{item.suggestedQty || item.quantity} units</strong>
                      </p>
                    </div>
                  </div>
                  <div className="font-black text-[#14231C]">
                    {formatCurrency(item.estimatedCost || (item.suggestedQty || 1) * (item.unitCost || item.purchasePrice || 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
            <strong>Procurement Workflow:</strong> Placing this batch purchase order generates official PO numbers and records them under pending supplier orders. Stock levels will be updated automatically when physical items are received on the <strong>Stock In</strong> page.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DCEBE1] flex items-center justify-between bg-[#FBFDFB]">
          <div>
            <p className="text-[11px] text-[#66756C] font-semibold">Total Purchase Value</p>
            <h4 className="text-xl font-black text-[#00966B]">
              {formatCurrency(totalCost)}
            </h4>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#14231C] text-xs font-bold rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={loading || selectedItems.length === 0}
              className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{loading ? 'Creating POs...' : 'Confirm & Place Orders'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchOrderModal;
