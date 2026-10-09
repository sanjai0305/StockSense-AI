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
  PackageCheck
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
  const [completedBill, setCompletedBill] = useState(null);

  const searchInputRef = useRef(null);

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
      console.error(e);
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
        setError(`Only ${product.currentStock} ${product.unitOfMeasure} of "${product.name}" available in stock.`);
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
          sellingPrice: product.sellingPrice,
          quantity: 1,
          unitOfMeasure: product.unitOfMeasure,
          currentStock: product.currentStock,
          imageUrl: product.imageUrl,
        },
      ]);
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
      setError(`Cannot exceed available stock of ${prod.currentStock} ${prod.unitOfMeasure} for "${prod.name}".`);
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

  const clearCart = () => {
    setCart([]);
    setDiscountAmount('0');
    setAmountTendered('');
    setError('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const discountVal = parseFloat(discountAmount) || 0;
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
        clearCart();
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
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Supermarket POS & Billing Counter
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Step 3 & 4: Instant barcode/item checkout with automated stock deduction
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold">
            Cashier: {user?.fullName || 'Sanjai R'}
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Bill
          </button>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 no-print">
        {/* Left Section: Product Catalogue & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan barcode, enter SKU or search product..."
                className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === c.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-400">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">No products found.</div>
            ) : (
              products.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLowStock = p.currentStock <= p.reorderLevel;

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between cursor-pointer select-none ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="w-full h-24 rounded-xl bg-slate-100 border border-slate-100 overflow-hidden flex items-center justify-center mb-2.5 relative">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                        <span
                          className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm ${
                            isOutOfStock
                              ? 'bg-red-600 text-white'
                              : isLowStock
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : `${p.currentStock} left`}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.sku}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                      <button
                        disabled={isOutOfStock}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" /> Add
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Current Bill / Checkout Cart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-card p-4 sm:p-5 flex flex-col justify-between h-[680px]">
          <div>
            {/* Bill Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Active Customer Bill</h3>
                  <p className="text-[11px] text-slate-400 font-medium">{cart.length} unique items</p>
                </div>
              </div>

              {/* Customer Selector */}
              <div className="w-44">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-1">
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-slate-400">Click products on the left or scan barcodes to add items</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 text-xs transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate leading-tight">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {formatCurrency(item.sellingPrice)} × {item.quantity} ={' '}
                        <strong className="text-slate-900">{formatCurrency(item.sellingPrice * item.quantity)}</strong>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                      >
                        <Minus className="w-3 h-3 stroke-[3]" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.currentStock}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, e.target.value)}
                        className="w-8 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-red-500 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Totals & Payment Section */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {/* Payment Mode Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'CASH', label: 'Cash', icon: DollarSign },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                  { id: 'OTHER', label: 'Credit', icon: User },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMethod(mode.id)}
                    className={`py-1.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      paymentMethod === mode.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-20 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold"
                />
              </div>

              {paymentMethod === 'CASH' && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cash Received (₹):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-24 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-right font-bold text-emerald-600"
                  />
                </div>
              )}

              {changeDue > 0 && (
                <div className="flex justify-between text-emerald-700 font-extrabold pt-1 border-t border-slate-200">
                  <span>Change Due to Customer:</span>
                  <span>{formatCurrency(changeDue)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCompleteSale}
              disabled={processing || cart.length === 0}
              className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>{processing ? 'Processing Sale...' : `Complete Sale (${formatCurrency(grandTotal)})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {completedBill && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            {/* Printable Receipt Area */}
            <div id="thermal-receipt" className="text-center space-y-3 font-mono text-xs text-slate-800">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-base tracking-tight text-slate-900 uppercase">
                  {store?.name || 'Sanjai Supermarket'}
                </h3>
                <p className="text-[11px] text-slate-500">{store?.address || 'Salem, Tamil Nadu'}</p>
                <p className="text-[11px] text-slate-500">Ph: {store?.phone || '+91 98427 12345'}</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-1.5 text-left text-[11px] space-y-0.5">
                <p><strong>Bill No:</strong> {completedBill.billNumber}</p>
                <p><strong>Date:</strong> {formatDate(completedBill.createdAt)}</p>
                <p><strong>Cashier:</strong> {completedBill.createdBy || 'Staff'}</p>
                <p><strong>Customer:</strong> {completedBill.customerName || 'Walk-in'}</p>
              </div>

              {/* Items List */}
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
            <div className="mt-5 pt-3 border-t flex gap-2 no-print">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={() => setCompletedBill(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
