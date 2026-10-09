import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, AlertOctagon, TrendingDown } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

const InventoryHealthCard = ({ summary }) => {
  const totalProducts = summary?.totalProducts?.value ?? 1248;
  const lowStockCount = summary?.lowStockItems?.value ?? 7;
  const outOfStockCount = summary?.outOfStockCount ?? 0;
  const healthyCount = Math.max(0, totalProducts - lowStockCount - outOfStockCount);
  const healthScore = summary?.healthScore ?? Math.round((healthyCount / totalProducts) * 100);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Inventory Health Overview
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Stock availability & risk distribution
            </p>
          </div>
        </div>

        <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-xl font-extrabold text-[12px] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{healthScore}% Healthy</span>
        </div>
      </div>

      {/* Health Progress Segments */}
      <div className="space-y-3 my-auto">
        {/* Tier 1: Optimal / In Stock */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Optimal In-Stock
            </span>
            <span className="font-extrabold text-slate-900">
              {formatNumber(healthyCount)} ({Math.round((healthyCount / totalProducts) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${(healthyCount / totalProducts) * 100}%` }}
            />
          </div>
        </div>

        {/* Tier 2: Low Stock Warning */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Low Stock Warning
            </span>
            <span className="font-extrabold text-amber-600">
              {formatNumber(lowStockCount)} ({Math.max(1, Math.round((lowStockCount / totalProducts) * 100))}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${Math.max(2, (lowStockCount / totalProducts) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tier 3: Critical / Out of Stock */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              Critical / Depleted
            </span>
            <span className="font-extrabold text-rose-600">
              {outOfStockCount} (0%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${outOfStockCount > 0 ? (outOfStockCount / totalProducts) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Advice Box */}
      <div className="mt-3 p-2.5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-600">
        <span className="text-base flex-shrink-0">💡</span>
        <p className="leading-tight">
          <strong className="text-slate-900">Health Status:</strong> Overall stock balance is resilient. Prioritize reorders for <strong>{lowStockCount} items</strong> to prevent customer bounce.
        </p>
      </div>
    </div>
  );
};

export default InventoryHealthCard;
