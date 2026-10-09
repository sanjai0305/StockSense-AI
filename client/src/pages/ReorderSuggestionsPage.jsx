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
    setSuccessBanner('Purchase orders placed successfully! Check status on the Purchase Orders page.');
    setTimeout(() => setSuccessBanner(''), 5000);
    fetchSuggestions();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Message */}
      {successBanner && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#059669]" />
            Smart Reorder Suggestions Engine
          </h2>
          <p className="text-xs text-[#64748B] font-medium mt-0.5">
            Suggested Quantity = Target Stock Level − Current Available Stock
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#334155] text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Recalculating...' : 'Recalculate'}</span>
          </button>
          <button
            onClick={() => setBatchModalOpen(true)}
            disabled={selectedItems.length === 0 || loading}
            className="flex items-center gap-2 px-5 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            <span>Place Purchase Orders ({selectedItems.length})</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Items Needing Restock */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B]">Items Needing Restock</p>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1.5">
            {suggestions.length} products
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            Below safe minimum thresholds
          </p>
        </div>

        {/* Card 2: Selected for Order */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B]">Selected for Order</p>
            <CheckCircle2 className="w-4 h-4 text-[#059669]" />
          </div>
          <h3 className="text-2xl font-black text-[#059669] mt-1.5">
            {selectedItems.length} products
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Ready to generate PO
          </p>
        </div>

        {/* Card 3: Estimated Total Order Cost */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#64748B]">Estimated Total Order Cost</p>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] mt-1.5">
            {formatCurrency(totalCost)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Based on current purchase costs
          </p>
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
            className="px-3 py-1 bg-white border border-red-300 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Suggestions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#FAFCFA]">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={suggestions.length > 0 && selectedIds.size === suggestions.length}
              onChange={toggleSelectAll}
              disabled={suggestions.length === 0}
              className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-emerald-400 cursor-pointer"
            />
            <span className="text-xs font-bold text-[#334155]">
              Select All Restock Items ({selectedIds.size}/{suggestions.length})
            </span>
          </label>

          <div className="text-[11px] text-[#64748B] font-medium hidden sm:block">
            Database-synchronized live stock evaluations
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAF9] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">Select</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Min Threshold</th>
                <th className="py-3 px-3">Target Level</th>
                <th className="py-3 px-3 text-center">Suggested Order</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-slate-500 font-medium">
                        Evaluating inventory replenishment needs from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : suggestions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] mt-1">
                        All products are currently above their reorder thresholds.
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No replenishment required at this time. Stock levels will be monitored in real-time as sales occur.
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
                      className={`hover:bg-[#F0FDF4]/50 transition-colors ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(s.id)}
                          className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-emerald-400 cursor-pointer"
                        />
                      </td>

                      {/* Product Name & SKU & Category */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#E2F0E7] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
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
                            <p className="font-bold text-[#0F172A] leading-tight">
                              {s.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10.5px] font-semibold text-[#059669] bg-emerald-50 px-1.5 py-0.2 rounded">
                                {s.category}
                              </span>
                              {s.sku && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {s.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3">
                        <span className="font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg text-xs">
                          {formatNumber(s.currentStock)} {s.unitOfMeasure}
                        </span>
                      </td>

                      {/* Minimum Threshold */}
                      <td className="py-3.5 px-3 font-semibold text-[#475569]">
                        {formatNumber(s.reorderLevel)} {s.unitOfMeasure}
                      </td>

                      {/* Target Level */}
                      <td className="py-3.5 px-3 font-bold text-[#0F172A]">
                        {formatNumber(s.targetStockLevel)} {s.unitOfMeasure}
                      </td>

                      {/* Suggested Order Input */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={s.suggestedQty}
                          onChange={(e) => updateQuantity(s.id, e.target.value)}
                          className="w-20 bg-white border border-[#D5E5D8] focus:border-[#059669] focus:ring-2 focus:ring-emerald-100 rounded-xl px-2.5 py-1 text-xs font-black text-[#059669] text-center outline-none transition-all shadow-2xs"
                        />
                      </td>

                      {/* Supplier Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-[#334155] text-xs">
                            {s.supplierName}
                          </span>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-3 text-right font-medium text-[#475569]">
                        {formatCurrency(s.unitCost)}
                      </td>

                      {/* Estimated Total Line Cost */}
                      <td className="py-3.5 px-4 text-right font-black text-[#0F172A]">
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
