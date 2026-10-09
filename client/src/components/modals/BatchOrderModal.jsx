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
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to place purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E2F0E7] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2F0E7] flex items-center justify-between bg-[#E8F8EE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-[#059669] flex items-center justify-center font-bold shadow-xs">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-base">
                Confirm Purchase Order Placement
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Generate official Purchase Orders grouped by distributor
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
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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

          <div className="bg-[#FAFCFA] p-3.5 rounded-2xl border border-[#E2F0E7]">
            <p className="text-xs font-bold text-[#0F172A] mb-2">
              Selected Products for Replenishment ({selectedItems.length} items):
            </p>

            <div className="divide-y divide-[#F1F5F9]">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#E2F0E7] overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A]">{item.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {item.supplier || item.supplierName || 'Primary Distributor'} • Qty: {item.suggestedQty || item.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-[#0F172A]">
                    {formatCurrency(item.estimatedCost || (item.suggestedQty || 1) * (item.unitCost || item.purchasePrice || 0))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
            <strong>Note:</strong> Placing a purchase order generates official PO numbers and sets status to <span className="font-semibold">PENDING</span>. Stock quantities will update only when physical goods are received on the Stock In page.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2F0E7] flex items-center justify-between bg-slate-50/50">
          <div>
            <p className="text-xs text-[#64748B] font-medium">Total Order Amount</p>
            <h4 className="text-lg font-extrabold text-[#0F172A]">
              {formatCurrency(totalCost)}
            </h4>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmOrder}
              disabled={loading || selectedItems.length === 0}
              className="px-5 py-2 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
