import React, { useState, useEffect } from 'react';
import { X, Plus, Package, Barcode, DollarSign, Layers, Truck } from 'lucide-react';
import api from '../../services/api';

const AddProductModal = ({ isOpen, onClose, onSuccess, initialData = null, categories = [], suppliers = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    preferredSupplierId: '',
    description: '',
    unitOfMeasure: 'packs',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '0',
    reorderLevel: '20',
    targetStockLevel: '100',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        categoryId: initialData.categoryId || (categories[0]?.id || ''),
        preferredSupplierId: initialData.supplierId || initialData.preferredSupplierId || '',
        description: initialData.description || '',
        unitOfMeasure: initialData.unitOfMeasure || 'packs',
        purchasePrice: initialData.purchasePrice !== undefined ? String(initialData.purchasePrice) : '',
        sellingPrice: initialData.sellingPrice !== undefined ? String(initialData.sellingPrice) : '',
        currentStock: initialData.currentStock !== undefined ? String(initialData.currentStock) : '0',
        reorderLevel: initialData.minStock || initialData.reorderLevel !== undefined ? String(initialData.minStock || initialData.reorderLevel) : '20',
        targetStockLevel: initialData.targetStockLevel !== undefined ? String(initialData.targetStockLevel) : '100',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        categoryId: categories[0]?.id || '',
        preferredSupplierId: suppliers[0]?.id || '',
        description: '',
        unitOfMeasure: 'packs',
        purchasePrice: '',
        sellingPrice: '',
        currentStock: '0',
        reorderLevel: '20',
        targetStockLevel: '100',
        imageUrl: '',
      });
    }
    setError('');
  }, [initialData, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        barcode: formData.barcode || null,
        categoryId: formData.categoryId,
        preferredSupplierId: formData.preferredSupplierId || null,
        description: formData.description || null,
        unitOfMeasure: formData.unitOfMeasure,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        currentStock: parseFloat(formData.currentStock) || 0,
        reorderLevel: parseFloat(formData.reorderLevel) || 20,
        targetStockLevel: parseFloat(formData.targetStockLevel) || 100,
        imageUrl: formData.imageUrl || null,
      };

      if (initialData?.id) {
        await api.put(`/products/${initialData.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
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
              <Package className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-[#14231C] text-base">
                {initialData ? 'Edit Product Item' : 'Add New Inventory Product'}
              </h3>
              <p className="text-xs text-[#66756C] font-medium">
                Enter product specifications, category mapping, and stock thresholds
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aashirvaad Shudh Chakki Atta (5kg)"
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                SKU / Item Code *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1 flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5 text-[#66756C]" />
                Barcode / EAN-13
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="e.g. 8901030382912"
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B] cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Supplier */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Preferred Distributor / Supplier
              </label>
              <select
                value={formData.preferredSupplierId}
                onChange={(e) => setFormData({ ...formData, preferredSupplierId: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B] cursor-pointer"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Purchase Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Selling Price / MRP (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="0.00"
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#00966B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Initial Stock (Only on creation) */}
            {!initialData && (
              <div>
                <label className="block text-xs font-bold text-[#14231C] mb-1">
                  Initial Available Stock
                </label>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
                />
              </div>
            )}

            {/* Unit of Measure */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unitOfMeasure}
                onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B] cursor-pointer"
              >
                <option value="packs">packs</option>
                <option value="bottles">bottles</option>
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="pouches">pouches</option>
                <option value="tubes">tubes</option>
                <option value="boxes">boxes</option>
              </select>
            </div>

            {/* Reorder Threshold (Min Stock) */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Reorder Threshold (Min Stock) *
              </label>
              <input
                type="number"
                required
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Target Stock Level */}
            <div>
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Target Stock Level (Max) *
              </label>
              <input
                type="number"
                required
                value={formData.targetStockLevel}
                onChange={(e) => setFormData({ ...formData, targetStockLevel: e.target.value })}
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#14231C] mb-1">
                Product Image URL (Optional)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#F4FAF6] border border-[#DCEBE1] rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-[#14231C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00966B]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#DCEBE1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#14231C] text-xs font-bold rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white text-xs font-bold rounded-2xl shadow-emerald transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
