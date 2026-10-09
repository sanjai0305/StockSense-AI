import React from 'react';
import { X, Package, Barcode, Calendar, History, Truck } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';

const ProductDetailsModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const isLowStock = product.currentStock <= (product.minStock || product.reorderLevel);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#DCEBE1] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCEBE1] flex items-center justify-between bg-[#F4FAF6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F8EE] text-[#00966B] flex items-center justify-center font-bold">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-[#14231C] text-base">
                Product Specification & Stock Audit
              </h3>
              <p className="text-xs text-[#66756C] font-medium">
                Live inventory snapshot from database
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
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Info Header */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F4FAF6] border border-[#DCEBE1] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
            </div>
            <div>
              <h4 className="text-base font-black text-[#14231C] leading-tight">
                {product.name}
              </h4>
              <p className="text-xs text-[#66756C] font-medium mt-0.5">
                Category: <span className="font-bold text-[#14231C]">{product.category}</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                {isLowStock ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
                    Low Stock Alert
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6]">
                    Healthy Stock
                  </span>
                )}
                <span className="text-xs font-mono text-[#66756C]">SKU: {product.sku}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Grid */}
          <div className="grid grid-cols-2 gap-3.5 bg-[#FBFDFB] p-4 rounded-2xl border border-[#DCEBE1]">
            <div>
              <p className="text-[10px] font-bold text-[#66756C] uppercase">Current Available Stock</p>
              <p className={`text-xl font-black ${isLowStock ? 'text-red-600' : 'text-[#14231C]'}`}>
                {formatNumber(product.currentStock)} {product.unitOfMeasure}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66756C] uppercase">Reorder Threshold</p>
              <p className="text-xl font-black text-[#14231C]">
                {formatNumber(product.minStock || product.reorderLevel)} {product.unitOfMeasure}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66756C] uppercase">Purchase Cost</p>
              <p className="text-base font-bold text-[#66756C]">
                {formatCurrency(product.purchasePrice)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#66756C] uppercase">Selling Price (MRP)</p>
              <p className="text-base font-black text-[#00966B]">
                {formatCurrency(product.sellingPrice)}
              </p>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-[#E8F8EE] p-4 rounded-2xl border border-[#CDE9D6] text-xs">
            <div className="flex items-center gap-2 text-[#00966B] font-bold mb-1">
              <Truck className="w-4 h-4" />
              <span>Preferred Distributor / Supplier</span>
            </div>
            <p className="text-[#14231C] font-black text-sm">
              {product.supplier || product.supplierName || 'Direct Distributor'}
            </p>
          </div>

          {/* Barcode details */}
          {product.barcode && (
            <div className="p-3.5 bg-[#F4FAF6] rounded-2xl border border-[#DCEBE1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-[#66756C]" />
                <span className="text-xs font-bold text-[#14231C]">Barcode / EAN-13:</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#14231C] bg-white px-2.5 py-1 rounded-xl border border-[#DCEBE1]">
                {product.barcode}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DCEBE1] flex justify-end bg-[#FBFDFB]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#F1FAF4] hover:bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] text-xs font-bold rounded-2xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
