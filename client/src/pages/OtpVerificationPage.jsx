import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Package,
  FileText,
  TrendingUp,
  Truck,
  Bell,
  Store,
  Star,
  AlertTriangle,
  Box,
  ShoppingCart,
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OtpVerificationPage = () => {
  const { verifyPhoneRegistration, resendPhoneOtp, pendingRegistrationData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dynamic user phone & email from location state, context, or sessionStorage
  const sessionData = JSON.parse(sessionStorage.getItem('stocksense_pending_reg') || '{}');
  const phone =
    location.state?.phone ||
    pendingRegistrationData?.phone ||
    sessionData.phone ||
    sessionStorage.getItem('stocksense_pending_phone') ||
    '+91 98765 43210';

  const email =
    location.state?.email ||
    pendingRegistrationData?.email ||
    sessionData.email ||
    '';

  // 6 digit state explicitly initialized to empty strings
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(30);

  const inputRefs = useRef([]);

  // Auto-focus first input box on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length <= 1) {
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-advance to next input
      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const cleanDigits = pastedData.replace(/\D/g, '');

    if (cleanDigits.length === 6) {
      const digits = cleanDigits.split('');
      setOtp(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify with Firebase ConfirmationResult and 2. Commit to PostgreSQL
      await verifyPhoneRegistration(otpCode);
      setSuccessMsg('Phone verified successfully! Initializing your store dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      await resendPhoneOtp(phone);
      setSuccessMsg(`A fresh verification code has been dispatched to ${phone}.`);
      setCooldown(30);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.message || 'Failed to resend verification code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  const isOtpComplete = otp.every((d) => d.length === 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FAF4] via-[#F8FCF9] to-[#EDF7F0] text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Hidden reCAPTCHA container for Resend operations */}
      <div id="recaptcha-container" />

      {/* Soft Ambient Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-green-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between z-20 flex-shrink-0">
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/stocksense-logo.png"
            alt="StockSense AI"
            className="h-8 sm:h-9 w-auto object-contain max-w-[200px] group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Top Right Security Badges */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-700 bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-[#059669]" />
            <span>Firebase Authentication</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Secure OTP</span>
          </div>
        </div>
      </header>

      {/* Main Content Split-Screen */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-2 sm:py-4 lg:py-5 flex items-center justify-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* ========================================================================= */}
          {/* LEFT PROMOTIONAL SECTION (~58%) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 hidden lg:flex justify-center">
            <div className="flex flex-col justify-between space-y-4 select-none max-w-2xl w-full">
              {/* Headline */}
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-100/90 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200/80 shadow-xs">
                  <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                  <span>AI Powered Inventory</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1]">
                  One Step Closer to a <span className="text-[#059669]">Smarter Store</span>
                </h1>

                <p className="text-slate-600 text-xs sm:text-[12.5px] font-normal max-w-lg leading-relaxed">
                  Verify your mobile number to unlock real-time inventory tracking, smart alerts and powerful insights for your supermarket.
                </p>
              </div>

              {/* Supermarket Visual Hero & Live Floating Widgets */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-100/50 border border-emerald-200/60 p-3 sm:p-3.5 shadow-md">
                <div className="relative h-44 sm:h-48 lg:h-52 w-full rounded-xl overflow-hidden border border-white shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80"
                    alt="Supermarket Grocery Cart"
                    className="w-full h-full object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-black/20" />

                  {/* Hanging Chalkboard Sign */}
                  <div className="absolute top-2.5 right-3 bg-[#064E3B] text-white p-2 sm:p-2.5 rounded-xl shadow-lg border border-emerald-400/40 text-center transform rotate-1">
                    <div className="flex justify-center mb-0.5">
                      <span className="text-xs">🌿</span>
                    </div>
                    <p className="text-[11.5px] font-black tracking-tight leading-tight">Fresh Stock</p>
                    <p className="text-[11.5px] font-black tracking-tight text-emerald-300 leading-tight">Better Business</p>
                  </div>

                  {/* Floating Metric 1 */}
                  <div className="absolute top-2.5 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Today's Sales</p>
                      <p className="text-xs font-black text-slate-900 leading-tight">₹48,520</p>
                    </div>
                  </div>

                  {/* Floating Metric 2 */}
                  <div className="absolute bottom-2.5 left-3 bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <div>
                      <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Low Stock</p>
                      <p className="text-xs font-black text-rose-600 leading-tight">18 items</p>
                    </div>
                  </div>

                  {/* Floating Metric 3 */}
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

              {/* 6 Feature Badges */}
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
          </div>

          {/* ========================================================================= */}
          {/* RIGHT OTP VERIFICATION CARD (~42%) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(5,150,105,0.12)] border border-emerald-100/90 p-5 sm:p-6 md:p-7 text-slate-800 animate-in fade-in zoom-in-95 duration-300">
              {/* Back to Register Navigation */}
              <div className="flex items-center justify-between mb-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#059669] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Register</span>
                </Link>
              </div>

              {/* Shield Icon */}
              <div className="text-center mb-3">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#059669] flex items-center justify-center mx-auto shadow-xs">
                  <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                </div>
              </div>

              {/* Heading & Target Phone Number */}
              <div className="text-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-snug">
                  Verify Your Phone
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                  Enter the 6-digit Firebase verification code sent to
                </p>
                <p className="text-xs sm:text-[13px] font-extrabold text-[#059669] mt-0.5 break-all flex items-center justify-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phone}</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Feedback Alerts */}
                {error && (
                  <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* 6 OTP Input Boxes in One Horizontal Row */}
                <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-10 h-12 sm:w-11 sm:h-13 bg-[#F8FAF9] border rounded-xl text-lg sm:text-xl font-black text-slate-900 text-center outline-none transition-all ${
                        digit
                          ? 'border-[#059669] bg-white ring-2 ring-emerald-100'
                          : 'border-slate-200 focus:border-[#059669] focus:bg-white focus:ring-2 focus:ring-emerald-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Resend Countdown */}
                <div className="text-center text-xs text-slate-600 font-medium pt-1">
                  Didn't receive the code?{' '}
                  {cooldown > 0 ? (
                    <span className="text-[#059669] font-bold">
                      Resend in 00:{cooldown.toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-[#059669] font-bold hover:underline cursor-pointer disabled:opacity-60"
                    >
                      {resending ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={loading || !isOtpComplete}
                  className="w-full py-3 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Verifying with Firebase...' : 'Verify & Continue'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

              {/* Bottom Information Callout Box */}
              <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-100/90 text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-[11.5px] font-bold text-slate-900 leading-tight">
                    Testing with Firebase Phone Auth?
                  </h4>
                  <p className="text-[10.5px] text-slate-500 font-medium mt-0.5 leading-snug">
                    Use your Firebase Console configured test phone number (e.g. <span className="font-bold text-[#047857]">+91 9876543210</span>) and test OTP code (<span className="font-bold text-[#047857]">123456</span>) to verify instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-2.5 text-center text-[11px] text-slate-400 font-medium flex-shrink-0">
        © {new Date().getFullYear()} StockSense AI. All rights reserved. Enterprise Supermarket Inventory & Reordering.
      </footer>
    </div>
  );
};

export default OtpVerificationPage;
