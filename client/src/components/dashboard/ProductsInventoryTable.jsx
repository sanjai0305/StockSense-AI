import React, { useState } from 'react';
import { Search, ChevronDown, Edit2, Eye, MoreVertical, Plus } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

const ProductsInventoryTable = ({
  products = [],
  categories = [],
  loading = false,
  onSearchChange,
  onCategoryFilter,
  onStatusFilter,
  onAddProduct,
  onEditProduct,
  onViewProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('Stock Status');

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    if (onCategoryFilter) onCategoryFilter(val);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setSelectedStatus(val);
    if (onStatusFilter) onStatusFilter(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-slate-900 text-base">
          Products Inventory
        </h3>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search products..."
              className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Stock Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Stock Status">Stock Status</option>
              <option value="Low Stock">Low Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add Product Blue Button */}
          <button
            onClick={onAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-[#FBFBFC] text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-3 font-semibold">Category</th>
              <th className="py-3 px-3 font-semibold">Current Stock</th>
              <th className="py-3 px-3 font-semibold">Min. Stock</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Supplier</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[12.5px]">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  Loading inventory products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-400">
                  No products found matching filters.
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isLowStock = p.currentStock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Product Name & Image */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs">📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 leading-tight truncate">
                            {p.name}
                          </p>
                          {p.sku && (
                            <p className="text-[11px] text-slate-400 font-mono">
                              {p.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    {/* Current Stock */}
                    <td className="py-2.5 px-3 font-extrabold">
                      <span className={isLowStock ? 'text-rose-600' : 'text-slate-800'}>
                        {formatNumber(p.currentStock)}
                      </span>
                    </td>

                    {/* Min Stock */}
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {formatNumber(p.minStock)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5]">
                          In Stock
                        </span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="py-2.5 px-3 text-slate-600 font-medium truncate max-w-[160px]">
                      {p.supplier || 'Direct'}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-400">
                        <button
                          onClick={() => onEditProduct && onEditProduct(p)}
                          className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onViewProduct && onViewProduct(p)}
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsInventoryTable;
