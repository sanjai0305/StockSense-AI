import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Box,
  BarChart3,
  Bell,
  Users,
  Store,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF6] text-[#0F172A] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background Supermarket Realistic Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EBF7F0]/90 via-[#F4FAF6]/95 to-[#E5F5EC]/85 pointer-events-none" />
      
      {/* Decorative Blur Spheres */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-teal-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[450px] h-[450px] bg-green-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP BRAND HEADER */}
      <header className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-3.5 sm:py-4 flex items-center justify-between z-20 relative">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/stocksense-logo.png"
            alt="StockSense AI — Supermarket Inventory Management"
            className="h-10 sm:h-11 w-auto object-contain max-w-[240px] group-hover:scale-102 transition-transform drop-shadow-xs"
          />
        </Link>

        {/* Top-Right Header Action */}
        <div className="flex items-center gap-3 text-xs sm:text-[13px]">
          <span className="text-[#64748B] font-medium hidden sm:inline">
            New to StockSense AI?
          </span>
          <Link
            to="/register"
            className="px-4 sm:px-5 py-2 bg-white hover:bg-emerald-50 text-[#059669] font-extrabold rounded-full border border-[#10B981] shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Create Store Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. MAIN SPLIT-SCREEN WORKSPACE */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-2 sm:py-3 flex items-start justify-between z-10 relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE: HERO HEADLINE, 3D SCENE & WIDGETS, 5 FEATURES, 3 CARDS (~62%) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 lg:space-y-5">
            
            {/* Top Headline & Subtitle */}
            <div className="space-y-1.5 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] tracking-tight leading-[1.08]">
                Manage Your <br />
                <span className="text-[#059669]">Supermarket Smarter</span>
              </h1>

              <p className="text-[#475569] text-xs sm:text-[13.5px] font-medium max-w-xl leading-relaxed pt-0.5">
                Real-time stock tracking, smart reorder alerts, sales insights and complete inventory management for your supermarket.
              </p>
            </div>

            {/* 5 Feature Blocks in a Row */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-xl text-center">
              {/* Feature 1 */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#E8F8EE] text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Box className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] leading-tight">
                  Real-time<br />Tracking
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs hover:shadow-xs hover:border-purple-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] leading-tight">
                  Sales<br />Insights
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] leading-tight">
                  Smart<br />Reorder Alerts
                </span>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs hover:shadow-xs hover:border-sky-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] leading-tight">
                  Supplier<br />Management
                </span>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white/80 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs hover:shadow-xs hover:border-pink-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Store className="w-4 h-4 stroke-[2.4]" />
                </div>
                <span className="text-[10.5px] sm:text-[11px] font-bold text-[#334155] leading-tight">
                  Multi-Store<br />Support
                </span>
              </div>
            </div>

            {/* 3D Supermarket Scene with 3 Floating Analytics Widgets */}
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-green-100/50 border border-[#CDE9D6] p-3 sm:p-4 shadow-xl">
              <div className="relative h-56 sm:h-64 lg:h-72 w-full rounded-2xl overflow-hidden border-2 border-white shadow-inner flex items-center justify-center">
                {/* Real High Quality Supermarket Interior Scene */}
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
                  alt="Supermarket Grocery Store"
                  className="w-full h-full object-cover brightness-95 transform scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-emerald-950/30 to-black/20" />

                {/* Hanging Fresh Produce Supermarket Sign */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#064E3B]/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full shadow-lg border border-emerald-400/40 text-center flex items-center gap-2">
                  <span className="text-xs">🌿</span>
                  <p className="text-[11.5px] font-extrabold tracking-wide uppercase text-emerald-200">
                    Fresh Produce Supermarket
                  </p>
                </div>

                {/* 3D AI Robot Assistant Mascot standing in aisle */}
                <div className="absolute bottom-4 right-10 flex flex-col items-center select-none filter drop-shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="relative flex items-center justify-center">
                    <span className="text-7xl sm:text-8xl">🤖</span>
                    {/* Handheld Smart Tablet */}
                    <div className="absolute -bottom-1 -left-2 bg-[#0F172A] text-white p-1 rounded-md border border-emerald-400 text-[8px] font-bold shadow-md flex items-center gap-1">
                      <span className="text-emerald-400">📊 100%</span>
                    </div>
                  </div>
                </div>

                {/* Supermarket Shopping Cart with Fresh Vegetables */}
                <div className="absolute bottom-3 right-36 hidden sm:block select-none filter drop-shadow-xl">
                  <span className="text-6xl sm:text-7xl">🛒</span>
                </div>

                {/* Floating Widget 1: Today's Sales Glass Card */}
                <div className="absolute top-4 right-4 bg-[#062A20]/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-emerald-400/40 text-white flex flex-col gap-1 w-44 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      Today's Sales
                    </span>
                    <span className="bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded-md text-[9px]">
                      +12.5%
                    </span>
                  </div>
                  <div className="text-base sm:text-lg font-black tracking-tight text-white">
                    ₹48,520
                  </div>
                  {/* Rising Green Neon Chart Line SVG */}
                  <div className="h-6 w-full pt-1">
                    <svg viewBox="0 0 100 25" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,20 Q20,15 35,18 T70,8 T100,2"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="2" r="3" fill="#10B981" className="animate-ping opacity-75" />
                      <circle cx="100" cy="2" r="2.5" fill="#34D399" />
                    </svg>
                  </div>
                </div>

                {/* Floating Widget 2: Low Stock Red Alert Pill */}
                <div className="absolute bottom-16 left-4 bg-[#2A0808]/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-red-500/40 text-white flex items-center justify-between gap-3 animate-in fade-in slide-in-from-left-4 duration-600">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-500/30 text-red-400 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[8.5px] text-red-300 font-bold uppercase tracking-wider">Low Stock</p>
                      <p className="text-xs font-black text-white">18 items</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-red-300" />
                </div>

                {/* Floating Widget 3: Total Products Emerald Card */}
                <div className="absolute bottom-4 left-4 bg-[#032A1C]/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-emerald-400/40 text-white flex items-center gap-2.5 animate-in fade-in slide-in-from-left-6 duration-700">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/30 text-emerald-300 flex items-center justify-center">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[8.5px] text-emerald-300 font-bold uppercase tracking-wider">Total Products</p>
                    <p className="text-xs font-black text-white">1,248</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Bottom Feature Visual Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-2xl">
              {/* Card 1 */}
              <div className="relative rounded-2xl overflow-hidden h-24 sm:h-28 border border-[#D5E5D8] group shadow-xs cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80"
                  alt="Track Stock in Real-Time"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                      Track Stock<br />in Real-Time
                    </span>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      →
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative rounded-2xl overflow-hidden h-24 sm:h-28 border border-[#D5E5D8] group shadow-xs cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&auto=format&fit=crop&q=80"
                  alt="Boost Sales with Insights"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                      Boost Sales<br />with Insights
                    </span>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      →
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative rounded-2xl overflow-hidden h-24 sm:h-28 border border-[#D5E5D8] group shadow-xs cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80"
                  alt="Never Run Out of Stock"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                      Never Run<br />Out of Stock
                    </span>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                      →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Curved Layered Green Statistics Section */}
            <div className="bg-gradient-to-r from-[#03543F] via-[#046C4E] to-[#059669] text-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-around divide-x divide-emerald-600/60 max-w-2xl">
              <div className="flex items-center gap-2 px-2">
                <Store className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">500+</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Stores Trust Us</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <Box className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">1M+</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Products Tracked</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <TrendingUp className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">99.9%</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Uptime & Reliability</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">Secure &</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Reliable Platform</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDE: LARGE WHITE LOGIN CARD (~38%) - ALIGNED UPWARD */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full lg:pt-1">
            <div className="w-full max-w-[450px] bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_20px_60px_-15px_rgba(5,150,105,0.15)] border border-white/80 p-6 sm:p-7 text-[#0F172A] animate-in fade-in zoom-in-95 duration-300">
              
              {/* Centered StockSense AI Logo */}
              <div className="text-center mb-2.5">
                <div className="flex justify-center mb-1">
                  <img
                    src="/stocksense-logo.png"
                    alt="StockSense AI"
                    className="h-10 sm:h-11 w-auto object-contain max-w-[220px]"
                  />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
                  Sign in to your <span className="text-[#059669]">store account</span>
                </h2>
                <p className="text-xs text-[#64748B] font-normal mt-0.5">
                  Access your inventory, sales, billing and business insights.
                </p>
                <div className="w-full h-[1px] bg-slate-100 my-3 sm:my-3.5" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[11px] font-bold text-[#334155] mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      id="login-email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourstore@mail.com"
                      className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-[#0F172A] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 font-medium"
                    />
                  </div>
                </div>

                {/* Password with Eye Toggle & Forgot Password Link */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="block text-[11px] font-bold text-[#334155]"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-[#059669] font-bold hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-[#0F172A] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] active:scale-[0.99] text-white font-extrabold text-xs sm:text-[13.5px] rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

              {/* Bottom Registration Link */}
              <div className="text-center text-[11.5px] text-[#64748B] font-medium mt-4 pt-3.5 border-t border-slate-100">
                New supermarket setup?{' '}
                <Link
                  to="/register"
                  className="text-[#059669] font-extrabold hover:underline"
                >
                  Create Store Account
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full py-2.5 text-center text-[11px] text-slate-400 font-medium z-10">
        © {new Date().getFullYear()} StockSense AI. All rights reserved. Enterprise Supermarket Inventory & Reordering.
      </footer>
    </div>
  );
};

export default LoginPage;

