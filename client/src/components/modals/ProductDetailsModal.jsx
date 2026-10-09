import React from 'react';
import { X, Package, Barcode, Calendar, History } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const isLowStock = product.currentStock <= (product.minStock || product.reorderLevel);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product Details
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Info Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Category: <span className="font-semibold text-slate-700">{product.category}</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isLowStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]">
                    Low Stock
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
                    In Stock
                  </span>
                )}
                <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Current Stock</p>
              <p className={`text-xl font-extrabold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                {formatNumber(product.currentStock)} {product.unitOfMeasure}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Min. Threshold</p>
              <p className="text-xl font-extrabold text-slate-800">
                {formatNumber(product.minStock || product.reorderLevel)} {product.unitOfMeasure}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Purchase Price</p>
              <p className="text-base font-bold text-slate-700">
                {formatCurrency(product.purchasePrice)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Selling Price (MRP)</p>
              <p className="text-base font-bold text-slate-700">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 text-xs">
            <p className="font-bold text-slate-700">Preferred Supplier</p>
            <p className="text-slate-900 font-semibold text-sm mt-0.5">
              {product.supplier || 'Primary Distributor'}
            </p>
          </div>

          {/* Barcode details */}
          {product.barcode && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Barcode / EAN:</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                {product.barcode}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
