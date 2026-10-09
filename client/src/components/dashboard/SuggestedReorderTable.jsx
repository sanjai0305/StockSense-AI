import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  ChevronDown,
  ShoppingCart,
  Copy,
  Check,
} from 'lucide-react';

const SuggestedReorderTable = ({
  suggestions = [],
  categories = [],
  onAddToPo,
  onBulkAddToPo,
  loading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fallbackItems = [
    {
      id: '1',
      productId: '1',
      name: 'Amul Fresh Milk 1L',
      sku: 'AMU-MLK-1L',
      category: 'Dairy Products',
      currentStock: '12 units',
      reorderPoint: 50,
      suggestedQty: '80 units',
      supplier: 'Amul Distributors',
      priority: 'Critical',
      estCost: '₹4,400',
      unitCost: 55,
      qtyVal: 80,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      productId: '2',
      name: 'Sunflower Oil 1L',
      sku: 'SUN-OIL-1L',
      category: 'Cooking Oil',
      currentStock: '8 units',
      reorderPoint: 30,
      suggestedQty: '60 units',
      supplier: 'FreshMart Wholesale',
      priority: 'Critical',
      estCost: '₹7,200',
      unitCost: 120,
      qtyVal: 60,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      productId: '3',
      name: 'India Gate Rice 5kg',
      sku: 'IND-RIC-5KG',
      category: 'Rice & Grains',
      currentStock: '16 units',
      reorderPoint: 40,
      suggestedQty: '40 units',
      supplier: 'Rice & Grains Co.',
      priority: 'High',
      estCost: '₹8,800',
      unitCost: 220,
      qtyVal: 40,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      productId: '4',
      name: 'Sugar 1kg',
      sku: 'BAL-SUG-1KG',
      category: 'Rice & Grains',
      currentStock: '6 units',
      reorderPoint: 30,
      suggestedQty: '50 units',
      supplier: 'Sri Balaji Traders',
      priority: 'Critical',
      estCost: '₹2,250',
      unitCost: 45,
      qtyVal: 50,
      imageUrl: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      productId: '5',
      name: 'Fresh Eggs (30)',
      sku: 'EGG-TR-30',
      category: 'Dairy Products',
      currentStock: '20 units',
      reorderPoint: 60,
      suggestedQty: '40 units',
      supplier: 'City Fresh Suppliers',
      priority: 'High',
      estCost: '₹6,000',
      unitCost: 150,
      qtyVal: 40,
      imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const items = (suggestions && suggestions.length > 0 ? suggestions : fallbackItems)
    .filter((item) => {
      const matchCat =
        selectedCategory === 'All Categories' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Suggested Reorder List{' '}
            <span className="text-[#64748B] font-normal text-xs">(18 items)</span>
          </h3>
        </div>

        {/* Filters & Bulk Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11.5px] font-semibold text-[#334155] pl-3 pr-7 py-1.5 outline-none hover:border-emerald-300 transition-colors cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              <option value="Dairy Products">Dairy Products</option>
              <option value="Cooking Oil">Cooking Oil</option>
              <option value="Rice & Grains">Rice & Grains</option>
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Personal Care">Personal Care</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11.5px] text-[#0F172A] pl-8 pr-3 py-1.5 outline-none focus:border-emerald-400 focus:bg-white transition-all placeholder:text-[#94A3B8] w-36 sm:w-44"
            />
          </div>

          {/* Bulk Add Button */}
          <button
            onClick={() => onBulkAddToPo(items)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-[11.5px] font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Bulk Add to PO</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-[#94A3B8] border-b border-[#F1F5F9]">
              <th className="py-2 px-2 text-center w-8">#</th>
              <th className="py-2 px-3">Product</th>
              <th className="py-2 px-2 text-center">Current Stock</th>
              <th className="py-2 px-2 text-center">Reorder Point</th>
              <th className="py-2 px-2 text-center">Suggested Qty</th>
              <th className="py-2 px-3">Supplier</th>
              <th className="py-2 px-2 text-center">Priority</th>
              <th className="py-2 px-2 text-right">Est. Cost</th>
              <th className="py-2 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F8FAFC]">
            {items.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-[#F9FCFA] transition-colors text-[12px] group"
              >
                {/* Row Number */}
                <td className="py-2.5 px-2 text-center text-[#64748B] font-medium text-[11px]">
                  {idx + 1}
                </td>

                {/* Product with Image */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">🛒</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F172A] leading-tight">
                        {row.name}
                      </h4>
                    </div>
                  </div>
                </td>

                {/* Current Stock (Red) */}
                <td className="py-2.5 px-2 text-center">
                  <span className="text-[#EF4444] font-bold">
                    {typeof row.currentStock === 'number'
                      ? `${row.currentStock} units`
                      : row.currentStock}
                  </span>
                </td>

                {/* Reorder Point */}
                <td className="py-2.5 px-2 text-center text-[#475569] font-semibold">
                  {row.reorderPoint || row.reorderLevel}
                </td>

                {/* Suggested Qty (Green) */}
                <td className="py-2.5 px-2 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-[#E8F8EE] text-[#059669] font-bold text-[11px]">
                    {typeof row.suggestedQty === 'number'
                      ? `${row.suggestedQty} units`
                      : row.suggestedQty}
                  </span>
                </td>

                {/* Supplier */}
                <td className="py-2.5 px-3 text-[#475569] font-medium text-[11.5px]">
                  {row.supplier || row.supplierName}
                </td>

                {/* Priority Badge */}
                <td className="py-2.5 px-2 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                      row.priority === 'Critical'
                        ? 'bg-red-50 text-red-600 border border-red-200/60'
                        : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        row.priority === 'Critical' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    {row.priority}
                  </span>
                </td>

                {/* Estimated Cost */}
                <td className="py-2.5 px-2 text-right font-extrabold text-[#0F172A]">
                  {typeof row.estCost === 'string'
                    ? row.estCost
                    : `₹${(row.estimatedCost || row.estCost || 0).toLocaleString()}`}
                </td>

                {/* Action Buttons */}
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleCopy(row.id, `${row.name} - ${row.suggestedQty}`)}
                      title="Copy item info"
                      className="p-1 rounded-lg text-[#94A3B8] hover:text-[#059669] hover:bg-[#E8F8EE] transition-colors"
                    >
                      {copiedId === row.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onAddToPo(row)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#059669] text-[#059669] hover:text-white border border-[#BDE8CC] hover:border-[#059669] text-[11px] font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add to PO</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuggestedReorderTable;
