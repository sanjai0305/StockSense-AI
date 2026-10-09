import React from 'react';
import {
  Zap,
  Package,
  FileText,
  TrendingUp,
  Truck,
  Bell,
  Store,
  ShieldCheck,
  Star,
  AlertTriangle,
  Box,
  ShoppingCart,
} from 'lucide-react';

const AuthPromotionalPanel = () => {
  return (
    <div className="flex flex-col justify-between space-y-4 select-none max-w-2xl w-full">
      {/* Top Tag & Main Headline */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100/90 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200/80 shadow-xs">
          <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
          <span>AI Powered Inventory</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
          Manage Your Supermarket <span className="text-[#059669]">Smarter</span>
        </h1>

        <p className="text-slate-600 text-xs sm:text-[12.5px] font-normal max-w-lg leading-relaxed">
          Real-time stock tracking, smart reorder alerts, sales insights and complete inventory management for your supermarket.
        </p>
      </div>

      {/* Supermarket Visual Hero & Live Floating Widgets */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-100/50 border border-emerald-200/60 p-3 sm:p-3.5 shadow-md">
        {/* Background Supermarket Image with balanced aspect ratio */}
        <div className="relative h-44 sm:h-48 lg:h-52 w-full rounded-xl overflow-hidden border border-white shadow-inner">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80"
            alt="Supermarket Grocery Cart"
            className="w-full h-full object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-black/20" />

          {/* Hanging Dark Green Chalkboard Sign */}
          <div className="absolute top-2.5 right-3 bg-[#064E3B] text-white p-2 sm:p-2.5 rounded-xl shadow-lg border border-emerald-400/40 text-center transform rotate-1">
            <div className="flex justify-center mb-0.5">
              <span className="text-xs">🌿</span>
            </div>
            <p className="text-[11.5px] font-black tracking-tight leading-tight">Fresh Stock</p>
            <p className="text-[11.5px] font-black tracking-tight text-emerald-300 leading-tight">Better Business</p>
          </div>

          {/* Floating Metric 1: Today's Sales */}
          <div className="absolute top-2.5 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Today's Sales</p>
              <p className="text-xs font-black text-slate-900 leading-tight">₹48,520</p>
            </div>
          </div>

          {/* Floating Metric 2: Low Stock Items */}
          <div className="absolute bottom-2.5 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Low Stock</p>
              <p className="text-xs font-black text-rose-600 leading-tight">18 items</p>
            </div>
          </div>

          {/* Floating Metric 3: Total Products */}
          <div className="absolute bottom-2.5 right-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#0969FF] flex items-center justify-center flex-shrink-0">
              <Box className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Total Products</p>
              <p className="text-xs font-black text-slate-900 leading-tight">1,248</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Feature Badges in 2 Columns */}
      <div className="grid grid-cols-2 gap-2 text-left">
        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Package className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Real-time Stock Tracking</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Purchase Orders</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Sales & Profit Insights</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Supplier Management</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Bell className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Smart Reorder Alerts</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xs rounded-xl border border-emerald-100 shadow-2xs">
          <div className="w-6 h-6 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Store className="w-3 h-3 stroke-[2]" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 leading-tight">Multi-Store Support</span>
        </div>
      </div>

      {/* Bottom Trust Bar */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white p-2.5 sm:p-3 rounded-xl shadow-md flex items-center justify-around divide-x divide-emerald-700/60">
        <div className="flex items-center gap-2 px-2">
          <Store className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <div className="text-left">
            <p className="text-xs sm:text-[13px] font-black leading-none">5,000+</p>
            <p className="text-[9px] text-emerald-200 font-medium mt-0.5">Stores Trust Us</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <div className="text-left">
            <p className="text-xs sm:text-[13px] font-black leading-none">99.9%</p>
            <p className="text-[9px] text-emerald-200 font-medium mt-0.5">Uptime & Secure</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <Star className="w-4 h-4 text-amber-300 fill-amber-300 flex-shrink-0" />
          <div className="text-left">
            <p className="text-xs sm:text-[13px] font-black leading-none">4.8/5</p>
            <p className="text-[9px] text-emerald-200 font-medium mt-0.5">Customer Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPromotionalPanel;
