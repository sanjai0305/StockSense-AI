import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingCart,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Box,
  AlertCircle,
  TrendingDown,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import BatchOrderModal from '../components/modals/BatchOrderModal';

const ReorderSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reorder/suggestions');
      if (res.success && Array.isArray(res.data)) {
        setSuggestions(res.data);
        // By default, select all items needing restock
        setSelectedIds(new Set(res.data.map((i) => i.id)));
      } else {
        setError(res.message || 'Failed to load reorder suggestions.');
      }
    } catch (e) {
      console.error('Error loading reorder suggestions:', e);
      setError(e.message || 'Failed to connect to the server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === suggestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(suggestions.map((i) => i.id)));
    }
  };

  const toggleItem = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const updateQuantity = (id, newQty) => {
    const val = Math.max(1, parseInt(newQty, 10) || 1);
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const unitCost = Number(s.unitCost) || 0;
          return {
            ...s,
            suggestedQty: val,
            estimatedCost: Math.round(val * unitCost * 100) / 100,
          };
        }
        return s;
      })
    );
  };

  const selectedItems = suggestions.filter((s) => selectedIds.has(s.id));
  const totalCost = selectedItems.reduce((sum, s) => sum + (Number(s.estimatedCost) || 0), 0);

  const handleOrderSuccess = () => {
    setSuccessBanner('Purchase orders placed successfully! Check status on the Stock In & Purchase history.');
    setTimeout(() => setSuccessBanner(''), 5000);
    fetchSuggestions();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Message */}
      {successBanner && (
        <div className="p-4 bg-[#E8F8EE] border border-[#CDE9D6] text-[#00966B] text-xs font-bold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#00966B] flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-[#00966B] hover:text-[#007A56] font-black text-base p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCEBE1] shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#14231C]">
              Smart Reorder Recommendations
            </h2>
            <p className="text-xs text-[#66756C] font-medium mt-0.5">
              Automated supermarket restock formulas: Suggested Qty = Target Stock Level − Current Available Stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] text-xs font-bold rounded-2xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Recalculating...' : 'Recalculate'}</span>
          </button>
          <button
            onClick={() => setBatchModalOpen(true)}
            disabled={selectedItems.length === 0 || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-emerald transition-all cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>Place Purchase Orders ({selectedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Items Needing Restock */}
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Items Needing Restock</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">
              {suggestions.length} products
            </h3>
            <p className="text-[11px] text-red-600 font-semibold mt-0.5">
              Below safe minimum thresholds
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* Card 2: Selected for Order */}
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Selected for Order</p>
            <h3 className="text-2xl font-black text-[#00966B] mt-1.5">
              {selectedItems.length} products
            </h3>
            <p className="text-[11px] text-[#66756C] font-medium mt-0.5">
              Ready to generate Purchase Order
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Card 3: Estimated Total Order Cost */}
        <div className="bg-white p-5 rounded-3xl border border-[#DCEBE1] shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#66756C] uppercase tracking-wider">Estimated Order Cost</p>
            <h3 className="text-2xl font-black text-[#14231C] mt-1.5">
              {formatCurrency(totalCost)}
            </h3>
            <p className="text-[11px] text-[#66756C] font-medium mt-0.5">
              Based on current supplier unit costs
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F1FAF4] text-[#00966B] flex items-center justify-center font-bold">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSuggestions}
            className="px-3.5 py-1.5 bg-white border border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Suggestions List Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBE1] shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#DCEBE1]/60 flex items-center justify-between bg-[#FBFDFB]">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suggestions.length > 0 && selectedIds.size === suggestions.length}
              onChange={toggleSelectAll}
              disabled={suggestions.length === 0}
              className="w-4 h-4 text-[#00966B] rounded-lg border-[#DCEBE1] focus:ring-[#00966B] cursor-pointer"
            />
            <span className="text-xs font-black text-[#14231C]">
              Select All Replenishment Items ({selectedIds.size}/{suggestions.length})
            </span>
          </label>

          <div className="text-[11px] text-[#66756C] font-semibold hidden sm:block">
            Database-synchronized live stock evaluations
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCEBE1] bg-[#F4FAF6] text-[11px] font-bold text-[#66756C] uppercase tracking-wider">
                <th className="py-3.5 px-5 w-10 text-center">Select</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min Threshold</th>
                <th className="py-3.5 px-4">Target Level</th>
                <th className="py-3.5 px-4 text-center">Suggested Order</th>
                <th className="py-3.5 px-4">Preferred Supplier</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
                <th className="py-3.5 px-5 text-right">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCEBE1]/60 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-[#66756C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-[#00966B] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-[#66756C] font-medium">
                        Evaluating inventory replenishment formulas from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-[#66756C]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <h4 className="text-sm font-bold text-[#14231C] mt-1">
                        All products are currently above their minimum thresholds.
                      </h4>
                      <p className="text-xs text-[#66756C] max-w-sm">
                        No restock orders required at this moment. Inventory is monitored in real-time as POS checkouts occur.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                suggestions.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-[#F4FAF6]/60 transition-colors ${
                        isSelected ? 'bg-[#E8F8EE]/30' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(s.id)}
                          className="w-4 h-4 text-[#00966B] rounded border-[#DCEBE1] focus:ring-[#00966B] cursor-pointer"
                        />
                      </td>

                      {/* Product Name & SKU & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#F4FAF6] border border-[#DCEBE1] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                            {s.imageUrl ? (
                              <img
                                src={s.imageUrl}
                                alt={s.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base">📦</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-[#14231C] leading-tight">
                              {s.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10.5px] font-bold text-[#00966B] bg-[#E8F8EE] px-2 py-0.5 rounded-full border border-[#CDE9D6]">
                                {s.category}
                              </span>
                              {s.sku && (
                                <span className="text-[10px] text-[#66756C] font-mono">
                                  {s.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4">
                        <span className="font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl text-xs">
                          {formatNumber(s.currentStock)} {s.unitOfMeasure}
                        </span>
                      </td>

                      {/* Minimum Threshold */}
                      <td className="py-3.5 px-4 font-semibold text-[#66756C]">
                        {formatNumber(s.reorderLevel)} {s.unitOfMeasure}
                      </td>

                      {/* Target Level */}
                      <td className="py-3.5 px-4 font-bold text-[#14231C]">
                        {formatNumber(s.targetStockLevel)} {s.unitOfMeasure}
                      </td>

                      {/* Suggested Order Input */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="number"
                          min="1"
                          value={s.suggestedQty}
                          onChange={(e) => updateQuantity(s.id, e.target.value)}
                          className="w-20 bg-white border border-[#DCEBE1] focus:border-[#00966B] focus:ring-2 focus:ring-[#00966B]/20 rounded-xl px-2.5 py-1.5 text-xs font-black text-[#00966B] text-center outline-none transition-all shadow-sm"
                        />
                      </td>

                      {/* Supplier Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#00966B] flex-shrink-0" />
                          <span className="font-semibold text-[#14231C] text-xs">
                            {s.supplierName}
                          </span>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-4 text-right font-medium text-[#66756C]">
                        {formatCurrency(s.unitCost)}
                      </td>

                      {/* Estimated Total Line Cost */}
                      <td className="py-3.5 px-5 text-right font-black text-[#14231C]">
                        {formatCurrency(s.estimatedCost)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Order Modal */}
      <BatchOrderModal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={handleOrderSuccess}
        selectedItems={selectedItems}
      />
    </div>
  );
};

export default ReorderSuggestionsPage;
