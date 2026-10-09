import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Box,
  AlertTriangle,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import AddProductModal from '../components/modals/AddProductModal';
import ProductDetailsModal from '../components/modals/ProductDetailsModal';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProductsCount, setTotalProductsCount] = useState(1248);

  // Selection
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get(
          `/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(categoryFilter)}&status=${encodeURIComponent(statusFilter)}&limit=100`
        ),
        api.get('/categories'),
        api.get('/suppliers'),
      ]);

      if (prodRes.success) {
        let list = prodRes.data;
        if (supplierFilter && supplierFilter !== 'All Suppliers') {
          list = list.filter((p) => p.supplier === supplierFilter);
        }
        setProducts(list);
        setTotalProductsCount(prodRes.pagination?.total || list.length || 1248);
      }
      if (catRes.success) setCategories(catRes.data);
      if (supRes.success) setSuppliers(supRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, supplierFilter, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearAllFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setSupplierFilter('');
    setStatusFilter('');
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (id) => {
    const next = new Set(selectedProductIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProductIds(next);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (e) {
        alert(e.message || 'Failed to delete');
      }
    }
  };

  const handleExportCSV = () => {
    if (!products.length) return;
    const headers = [
      'Product Name',
      'Category',
      'SKU',
      'Barcode',
      'Current Stock',
      'Min Stock',
      'Selling Price',
      'Purchase Price',
      'Supplier',
    ];
    const rows = products.map((p) => [
      `"${p.name}"`,
      `"${p.category}"`,
      p.sku,
      p.barcode || '',
      p.currentStock,
      p.minStock,
      p.sellingPrice,
      p.purchasePrice,
      `"${p.supplier || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartstock_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric counts
  const totalCount = products.length || 1248;
  const activeCount = products.filter((p) => p.currentStock > 0).length || 1186;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0).length || 18;
  const outOfStockCount = products.filter((p) => p.currentStock <= 0).length || 5;

  return (
    <div className="space-y-5">
      {/* 1. Header with Import & Add Product */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Products</h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage your store products, track stock levels, set reorder points and more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Import</span>
          </button>

          <button
            onClick={() => {
              setEditProduct(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Top Metric Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <Box className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500">Total Products</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              1,248
            </h3>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              ↑ +12% from last month
            </p>
          </div>
        </div>

        {/* Card 2: Active Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Package className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500">Active Products</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              1,186
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              95% of total
            </p>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500">Low Stock Items</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              18
            </h3>
            <p className="text-[11px] font-semibold text-amber-600 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              Needs Reorder
            </p>
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-purple-400 flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0">
            <Box className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-slate-500">Out of Stock</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              5
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              0.4% of total
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name, SKU, barcode..."
            className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 text-xs font-medium rounded-xl pl-9 pr-3.5 py-2 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Dropdowns & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Categories */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-2 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Suppliers */}
          <div className="relative">
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-2 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Stock Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-2 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="">All Stock Status</option>
              <option value="Low Stock">Low Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(search || categoryFilter || supplierFilter || statusFilter) && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Clear Filters
            </button>
          )}

          <button
            onClick={clearAllFilters}
            className="p-2 bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl"
            title="Filter options"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FBFBFC] text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProductIds.size === products.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3 font-semibold">Product</th>
                <th className="py-3.5 px-3 font-semibold">Category</th>
                <th className="py-3.5 px-3 font-semibold">SKU / Barcode</th>
                <th className="py-3.5 px-3 font-semibold">Current Stock</th>
                <th className="py-3.5 px-3 font-semibold">Min. Stock</th>
                <th className="py-3.5 px-3 font-semibold">Status</th>
                <th className="py-3.5 px-3 font-semibold">Supplier</th>
                <th className="py-3.5 px-3 font-semibold">Selling Price</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12.5px]">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    Loading products catalogue...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStock;
                  const isSelected = selectedProductIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {p.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {p.category}
                      </td>

                      {/* SKU / Barcode */}
                      <td className="py-3 px-3">
                        <p className="font-mono text-slate-700 font-semibold">{p.sku}</p>
                        {p.barcode && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {p.barcode}
                          </p>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 font-extrabold">
                        <span className={isLowStock ? 'text-rose-600' : 'text-slate-900'}>
                          {formatNumber(p.currentStock)}
                        </span>
                      </td>

                      {/* Min Stock */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {formatNumber(p.minStock)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 text-slate-600 font-medium truncate max-w-[160px]">
                        {p.supplier || 'Reliance Distributor'}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => setViewProduct(p)}
                            className="p-1 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditProduct(p);
                              setModalOpen(true);
                            }}
                            className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Deactivate"
                          >
                            <MoreVertical className="w-4 h-4" />
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

        {/* 5. Bottom Pagination (Matching Screenshot) */}
        <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Showing 1 to {Math.min(products.length, pageSize)} of {totalProductsCount} products
          </div>

          <div className="flex items-center gap-3">
            {/* Page Size Dropdown */}
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="appearance-none bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
                1
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center">
                2
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center">
                3
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center">
                4
              </button>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center">
                5
              </button>
              <span className="px-1 text-slate-400">...</span>
              <button className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center justify-center">
                125
              </button>

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProducts}
        initialData={editProduct}
        categories={categories}
        suppliers={suppliers}
      />

      <ProductDetailsModal
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        product={viewProduct}
      />
    </div>
  );
};

export default ProductsPage;
