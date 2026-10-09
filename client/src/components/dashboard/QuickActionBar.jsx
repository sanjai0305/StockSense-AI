import React from 'react';
import { Plus, ArrowDownLeft, ShoppingCart, Sparkles, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionBar = ({ onAddProduct, onStockIn, onStockOut, onGenerateReorder, onPrintReport }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-3 my-5">
      {/* 1. Add Product */}
      <button
        onClick={onAddProduct || (() => navigate('/products?action=new'))}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-[13px] font-bold rounded-xl shadow-sm hover:shadow transition-all flex-1 sm:flex-none justify-center"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Add Product</span>
      </button>

      {/* 2. Stock In (Purchase) */}
      <button
        onClick={onStockIn || (() => navigate('/stock-in'))}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-sm hover:shadow transition-all flex-1 sm:flex-none justify-center"
      >
        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
        <span>Stock In (Purchase)</span>
      </button>

      {/* 3. Stock Out (Sales) */}
      <button
        onClick={onStockOut || (() => navigate('/stock-out'))}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#EF4444] hover:bg-rose-600 text-white text-[13px] font-bold rounded-xl shadow-sm hover:shadow transition-all flex-1 sm:flex-none justify-center"
      >
        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
        <span>Stock Out (Sales)</span>
      </button>

      {/* 4. Generate Reorder List */}
      <button
        onClick={onGenerateReorder || (() => navigate('/reorder-suggestions'))}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-purple-700 text-white text-[13px] font-bold rounded-xl shadow-sm hover:shadow transition-all flex-1 sm:flex-none justify-center"
      >
        <Sparkles className="w-4 h-4 stroke-[2.5]" />
        <span>Generate Reorder List</span>
      </button>

      {/* 5. Print Report */}
      <button
        onClick={onPrintReport || (() => window.print())}
        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[13px] font-bold rounded-xl shadow-sm hover:shadow transition-all flex-1 sm:flex-none justify-center"
      >
        <Printer className="w-4 h-4 text-slate-500 stroke-[2.2]" />
        <span>Print Report</span>
      </button>
    </div>
  );
};

export default QuickActionBar;
