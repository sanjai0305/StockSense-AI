import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Printer,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Barcode,
  RotateCcw,
  Sparkles,
  X,
  Package,
  ArrowRight,
  Receipt,
  Check,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

const BillingPage = () => {
  const { store, user } = useAuth();
  const { triggerRefresh } = useStore();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Cart / Bill state
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountTendered, setAmountTendered] = useState('');
  const [billNotes, setBillNotes] = useState('');

  // Checkout status & Receipt Modal
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [barcodeScanFeedback, setBarcodeScanFeedback] = useState(null);
  const [completedBill, setCompletedBill] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const searchInputRef = useRef(null);

  // Fetch live products catalog from database
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, custRes] = await Promise.all([
        api.get(`/billing/products?search=${encodeURIComponent(search)}&categoryId=${encodeURIComponent(selectedCategory)}`),
        api.get('/categories'),
        api.get('/customers'),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (custRes.success) setCustomers(custRes.data);
    } catch (e) {
      console.error('Catalog fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Add product to cart
  const addToCart = (product) => {
    if (product.currentStock <= 0) return;

    setError('');
    const existing = cart.find((item) => item.productId === product.id);

    if (existing) {
      if (existing.quantity >= product.currentStock) {
        setError(`Only ${product.currentStock} ${product.unitOfMeasure || 'units'} of "${product.name}" available in stock.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          sellingPrice: Number(product.sellingPrice),
          quantity: 1,
          unitOfMeasure: product.unitOfMeasure || 'pcs',
          currentStock: product.currentStock,
          imageUrl: product.imageUrl,
        },
      ]);
    }
  };

  // Keyboard-wedge Barcode Scanner & Enter Key Handler
  const handleBarcodeSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const rawQuery = search.trim();
      if (!rawQuery) return;

      // Exact barcode or SKU match
      const exactMatch = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === rawQuery.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === rawQuery.toLowerCase())
      );

      if (exactMatch) {
        if (exactMatch.currentStock <= 0) {
          setError(`Item "${exactMatch.name}" is currently Out of Stock.`);
        } else {
          addToCart(exactMatch);
          setBarcodeScanFeedback(`Added: ${exactMatch.name}`);
          setTimeout(() => setBarcodeScanFeedback(null), 2500);
          setSearch('');
        }
      } else if (products.length === 1 && !products[0].isOutOfStock) {
        // Single matching search result
        addToCart(products[0]);
        setBarcodeScanFeedback(`Added: ${products[0].name}`);
        setTimeout(() => setBarcodeScanFeedback(null), 2500);
        setSearch('');
      } else if (products.length === 0) {
        setError(`No product found matching barcode/SKU: "${rawQuery}"`);
      }
    }
  };

  // Update quantity in cart
  const updateQuantity = (productId, newQty) => {
    setError('');
    const prod = products.find((p) => p.id === productId) || cart.find((i) => i.productId === productId);
    const val = parseInt(newQty, 10);

    if (isNaN(val) || val <= 0) {
      removeFromCart(productId);
      return;
    }

    if (prod && val > prod.currentStock) {
      setError(`Cannot exceed available stock of ${prod.currentStock} ${prod.unitOfMeasure || 'units'} for "${prod.name}".`);
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: val } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const executeClearCart = () => {
    setCart([]);
    setDiscountAmount('0');
    setAmountTendered('');
    setError('');
    setShowResetConfirm(false);
  };

  const handleResetBillClick = () => {
    if (cart.length > 0) {
      setShowResetConfirm(true);
    } else {
      executeClearCart();
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const discountVal = Math.max(0, parseFloat(discountAmount) || 0);
  const grandTotal = Math.max(0, subtotal - discountVal);
  const tenderedVal = parseFloat(amountTendered) || 0;
  const changeDue = paymentMethod === 'CASH' && tenderedVal > grandTotal ? tenderedVal - grandTotal : 0;

  // Complete Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('Please add at least one product to the bill.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const selectedCustomer = customers.find((c) => c.id === customerId);

      const payload = {
        customerId: customerId || null,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        customerPhone: selectedCustomer ? selectedCustomer.phone : null,
        paymentMethod,
        discountAmount: discountVal,
        taxAmount: 0,
        amountPaid: tenderedVal > 0 ? tenderedVal : grandTotal,
        notes: billNotes || null,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitSellingPrice: item.sellingPrice,
        })),
      };

      const res = await api.post('/bills', payload);
      if (res.success) {
        setCompletedBill({
          ...res.data.bill,
          items: res.data.items,
          customer: selectedCustomer,
        });
        executeClearCart();
        fetchCatalog();
        triggerRefresh();
      }
    } catch (err) {
      setError(err.message || 'Failed to complete transaction.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER (Section 3) */}
      {/* ===================================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E2F0E7] shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F8EE] border border-[#BDE8CC] text-[#00966B] flex items-center justify-center shadow-2xs flex-shrink-0">
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              Supermarket POS & Billing Counter
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Fast checkout with barcode scanning and automatic stock updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] text-[#007A56] border border-[#CDE9D6] rounded-xl text-xs font-bold">
            <User className="w-3.5 h-3.5" />
            <span>Cashier: {user?.fullName || 'Cashier'}</span>
          </div>

          <button
            onClick={handleResetBillClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="Reset Active Bill"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bill</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Bill */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-[#CDE9D6] animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Reset Active Customer Bill?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              You have {cart.length} item(s) in the active cart. Clearing the bill will remove all items.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeClearCart}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Yes, Reset Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. MAIN 2-COLUMN POS WORKSPACE (Section 4) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 no-print">
        {/* =================================================================== */}
        {/* LEFT COLUMN: Product Discovery & Selection (7 Cols) */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Search Box & Barcode Scanner Area */}
          <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#E2F0E7] shadow-xs space-y-3">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                <Search className="w-4 h-4" />
                <Barcode className="w-3.5 h-3.5 text-[#00966B]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcodeSearchKeyDown}
                placeholder="Scan barcode, enter SKU, or search products..."
                className="w-full bg-[#F8FAF9] border border-[#CDE9D6] text-slate-900 text-xs sm:text-sm font-medium rounded-2xl pl-16 pr-9 py-2.5 focus:bg-white focus:outline-none focus:border-[#00966B] focus:ring-2 focus:ring-emerald-100 transition-all shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Barcode scan instant feedback chip */}
            {barcodeScanFeedback && (
              <div className="px-3 py-1.5 bg-[#E8F8EE] border border-[#BDE8CC] text-[#007A56] text-xs font-bold rounded-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <Check className="w-3.5 h-3.5 text-[#00966B] stroke-[3]" />
                <span>{barcodeScanFeedback}</span>
              </div>
            )}

            {/* Category Filter Chips (Section 6) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === ''
                    ? 'bg-[#00966B] text-white shadow-xs'
                    : 'bg-[#F4FAF6] text-slate-600 hover:bg-[#E8F8EE] hover:text-[#007A56] border border-[#E2F0E7]'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#00966B] text-white shadow-xs'
                      : 'bg-[#F4FAF6] text-slate-600 hover:bg-[#E8F8EE] hover:text-[#007A56] border border-[#E2F0E7]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid (Section 7) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-[#00966B] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-medium">Loading store products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-[#E2F0E7] p-8 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No products found</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Try clearing your search query or switching to "All Items".
                </p>
              </div>
            ) : (
              products.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock <= p.reorderLevel;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`bg-white rounded-3xl p-3 sm:p-3.5 border border-[#E2F0E7] shadow-xs hover:shadow-md transition-all flex flex-col justify-between select-none group cursor-pointer ${
                      isOutOfStock
                        ? 'opacity-55 cursor-not-allowed bg-slate-50'
                        : 'hover:border-[#00966B] hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      {/* Product Image / Placeholder with stock badge */}
                      <div className="w-full h-24 rounded-2xl bg-[#F8FAF9] border border-[#E8F3EC] overflow-hidden flex items-center justify-center mb-2.5 relative group-hover:border-[#CDE9D6] transition-colors">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}

                        <span
                          className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[9.5px] font-extrabold shadow-2xs border ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isLowStock
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-[#E8F8EE] text-[#007A56] border-[#BDE8CC]'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : `${p.currentStock} left`}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-[#00966B] transition-colors">
                        {p.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-400 font-mono mt-0.5 truncate">
                        SKU: {p.sku || 'N/A'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(p);
                        }}
                        className="px-2.5 py-1 bg-[#E8F8EE] hover:bg-[#00966B] text-[#007A56] hover:text-white disabled:bg-slate-100 disabled:text-slate-400 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Active Customer Bill & Checkout (5 Cols) (Section 8) */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E2F0E7] shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[660px]">
          <div>
            {/* Bill Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] flex items-center justify-center font-bold shadow-2xs">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">Active Customer Bill</h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'} in bill
                  </p>
                </div>
              </div>

              {/* Customer Selector */}
              <div className="w-40 sm:w-44">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#F8FAF9] border border-[#CDE9D6] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00966B]"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Alert Bar */}
            {error && (
              <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span className="truncate">{error}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="mt-3 space-y-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                /* Empty Cart State (Section 8) */
                <div className="py-14 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F8EE] text-[#00966B] border border-[#CDE9D6] flex items-center justify-center mx-auto shadow-2xs">
                    <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-800">Your cart is empty</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    Select a product or scan a barcode to get started.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-[#F8FAF9] hover:bg-[#F0FDF4] rounded-2xl border border-[#E2F0E7] flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate leading-tight">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {formatCurrency(item.sellingPrice)} × {item.quantity} ={' '}
                        <strong className="text-[#00966B] font-extrabold">
                          {formatCurrency(item.sellingPrice * item.quantity)}
                        </strong>
                      </p>
                    </div>

                    {/* Quantity Stepper Controls */}
                    <div className="flex items-center gap-1 bg-white border border-[#CDE9D6] rounded-xl p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-[#E8F8EE] text-slate-600 hover:text-[#00966B] rounded-lg transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.currentStock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="w-7 text-center text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-[#E8F8EE] text-slate-600 hover:text-[#00966B] rounded-lg transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Totals & Payment Section (Section 9 & 10) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {/* Payment Method Selector (Section 10) */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'CASH', label: 'Cash', icon: DollarSign },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'OTHER', label: 'Credit', icon: User },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id)}
                      className={`py-1.5 px-1 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00966B] text-white border-[#00966B] shadow-xs'
                          : 'bg-[#F8FAF9] text-slate-700 border-[#E2F0E7] hover:bg-[#E8F8EE]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-[#F8FAF9] p-3 rounded-2xl border border-[#E2F0E7] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 bg-white border border-[#CDE9D6] rounded-xl px-2 py-0.5 text-xs text-right font-bold text-slate-900 focus:outline-none focus:border-[#00966B]"
                />
              </div>

              {paymentMethod === 'CASH' && (
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Cash Received (₹):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-24 bg-white border border-[#CDE9D6] rounded-xl px-2 py-0.5 text-xs text-right font-bold text-[#00966B] focus:outline-none focus:border-[#00966B]"
                  />
                </div>
              )}

              {changeDue > 0 && (
                <div className="flex justify-between text-[#007A56] font-extrabold pt-1 border-t border-[#E2F0E7]">
                  <span>Change Due to Customer:</span>
                  <span>{formatCurrency(changeDue)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1.5 border-t border-[#E2F0E7]">
                <span>Grand Total:</span>
                <span className="text-base font-black text-[#00966B]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button (Section 11) */}
            <button
              onClick={handleCompleteSale}
              disabled={processing || cart.length === 0}
              className="w-full py-3 bg-gradient-to-r from-[#00966B] to-[#007A56] hover:opacity-95 disabled:opacity-45 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
              <span>{processing ? 'Processing Sale...' : `Complete Sale (${formatCurrency(grandTotal)})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. PRINTABLE THERMAL RECEIPT MODAL */}
      {/* ===================================================================== */}
      {completedBill && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-[#CDE9D6] animate-in fade-in zoom-in-95">
            {/* Printable Thermal Receipt Layout */}
            <div id="thermal-receipt" className="text-center space-y-3 font-mono text-xs text-slate-800">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                  {store?.name || 'StockSense Supermarket'}
                </h3>
                <p className="text-[11px] text-slate-500">{store?.address || 'Salem, Tamil Nadu'}</p>
                <p className="text-[11px] text-slate-500">Ph: {store?.phone || '+91 98450 12345'}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-1.5 text-left text-[11px] space-y-0.5">
                <p><strong>Bill No:</strong> {completedBill.billNumber}</p>
                <p><strong>Date:</strong> {formatDate(completedBill.createdAt)}</p>
                <p><strong>Cashier:</strong> {completedBill.createdBy || user?.fullName || 'Staff'}</p>
                <p><strong>Customer:</strong> {completedBill.customerName || 'Walk-in'}</p>
              </div>

              {/* Items Table */}
              <div className="text-left space-y-1 py-1">
                {completedBill.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold truncate">{item.productNameSnapshot}</p>
                      <p className="text-slate-500">{item.quantity} × {formatCurrency(item.unitSellingPrice)}</p>
                    </div>
                    <span className="font-bold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-right text-[11px]">
                <p>Subtotal: {formatCurrency(completedBill.subtotal)}</p>
                {completedBill.discountAmount > 0 && (
                  <p className="text-rose-600">Discount: -{formatCurrency(completedBill.discountAmount)}</p>
                )}
                <p className="text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  Total: {formatCurrency(completedBill.totalAmount)}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold">Payment: {completedBill.paymentMethod} (PAID)</p>
              </div>

              <div className="pt-2 text-[10px] text-slate-400">
                *** Thank You for Shopping! ***
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2 no-print">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-[#00966B] hover:bg-[#007A56] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedBill(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Next Sale (New)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
