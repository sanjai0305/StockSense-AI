import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Box,
  FileText,
  BarChart3,
  Truck,
  Bell,
  Store,
  Star,
  KeyRound,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step state: 1 = Email, 2 = Verify OTP, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);

  // Step 1: Email Form State
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Step 2: OTP Verification State
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetToken, setResetToken] = useState('');

  // Step 3: New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input on step 2 transition
  useEffect(() => {
    if (step === 2 && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setEmailError('');

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Please enter a valid registered email address.');
      return;
    }

    setEmailLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/request-otp', { email: trimmed });
      if (res.success) {
        setMaskedEmail(res.maskedEmail || trimmed);
        setResendCooldown(res.cooldownSeconds || 60);
        setOtpSuccessMsg(res.message || 'Verification code sent to your email.');
        setOtpValues(['', '', '', '', '', '']);
        setStep(2);
      } else {
        setEmailError(res.message || 'Failed to send verification code.');
      }
    } catch (err) {
      setEmailError(err.message || 'Unable to connect to the server. Please check your connection.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || otpLoading) return;
    setOtpError('');
    setOtpSuccessMsg('');
    setOtpLoading(true);

    try {
      const res = await api.post('/auth/forgot-password/request-otp', { email: email.trim() });
      if (res.success) {
        setResendCooldown(res.cooldownSeconds || 60);
        setOtpSuccessMsg('A fresh verification code has been sent to your email.');
        setOtpValues(['', '', '', '', '', '']);
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      } else {
        setOtpError(res.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle OTP Input typing
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, ''); // Digits only

    if (!cleanValue) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    // Handle single digit input
    const singleDigit = cleanValue.slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = singleDigit;
    setOtpValues(newOtp);

    // Auto-advance focus to next input
    if (index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0 && otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle Paste 6-digit OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const sixDigits = pastedData.slice(0, 6).split('');
      setOtpValues(sixDigits);
      if (otpInputRefs.current[5]) {
        otpInputRefs.current[5].focus();
      }
    }
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    setOtpSuccessMsg('');

    const fullCode = otpValues.join('');
    if (fullCode.length !== 6) {
      setOtpError('Please enter all 6 digits of your verification code.');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', {
        email: email.trim(),
        otp: fullCode,
      });

      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep(3);
      } else {
        setOtpError(res.message || 'Invalid or expired verification code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Password Strength Calculator
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score === 2 || score === 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-emerald-500', width: 'w-3/4' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strength = calculateStrength(newPassword);

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify your entries.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset-password', {
        resetToken,
        newPassword,
      });

      if (res.success) {
        setStep(4);
      } else {
        setPasswordError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Password reset failed. Please restart the recovery process.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAF6] text-[#0F172A] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background Soft Mint Gradient & Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EBF7F0]/90 via-[#F4FAF6]/95 to-[#E5F5EC]/85 pointer-events-none" />

      {/* Decorative Radial Lights */}
      <div className="absolute -top-28 -left-28 w-[420px] h-[420px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[480px] h-[480px] bg-teal-200/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-1/4 w-[420px] h-[420px] bg-green-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP BRAND HEADER */}
      <header className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 py-4 sm:py-5 flex items-center justify-between z-20 relative">
        {/* Brand Logo & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/stocksense-logo.png"
            alt="StockSense AI — Smarter Supermarket Management"
            className="h-10 sm:h-11 w-auto object-contain max-w-[240px] group-hover:scale-102 transition-transform drop-shadow-xs"
          />
        </Link>

        {/* Top-Right Header Security Badges */}
        <div className="flex items-center gap-4 text-xs font-semibold text-[#334155]">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-[#059669]" />
            <span>Secure Reset Process</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>Your data is safe</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN SPLIT-SCREEN WORKSPACE */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-2 sm:py-4 flex items-center justify-between z-10 relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE: HERO HEADLINE, 3D SCENE & WIDGETS, 6 FEATURES, STATS (~62%) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
            
            {/* AI Powered Badge & Top Headline */}
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8EE] border border-[#CDE9D6] text-[#059669] text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Powered Inventory</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold text-[#0F172A] tracking-tight leading-[1.08]">
                Reset Your <br />
                Password <br />
                <span className="text-[#059669]">Get Back to a Smarter Store</span>
              </h1>

              <p className="text-[#475569] text-xs sm:text-[13.5px] font-medium max-w-xl leading-relaxed pt-0.5">
                No worries! Enter your registered email address and we'll send you a verification code to reset your password.
              </p>
            </div>

            {/* 6 Feature Blocks (2 Columns x 3 Rows) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-w-lg text-left">
              {/* Feature 1 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Real-time Stock Tracking
                </span>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Purchase Order Management
                </span>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Sales & Profit Insights
                </span>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Supplier Management
                </span>
              </div>

              {/* Feature 5 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Smart Reorder Alerts
                </span>
              </div>

              {/* Feature 6 */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 backdrop-blur-xs border border-[#E2F0E7] shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center flex-shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#334155] leading-tight">
                  Multi-Store Support
                </span>
              </div>
            </div>

            {/* 3D Supermarket Scene with Produce Shelf, Sign & 3 Analytics Widgets */}
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-green-100/50 border border-[#CDE9D6] p-3 sm:p-4 shadow-xl">
              <div className="relative h-56 sm:h-64 lg:h-72 w-full rounded-2xl overflow-hidden border-2 border-white shadow-inner flex items-center justify-center">
                {/* Real High Quality Supermarket Interior Scene */}
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80"
                  alt="Supermarket Grocery Store"
                  className="w-full h-full object-cover brightness-95 transform scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-emerald-950/25 to-black/20" />

                {/* Hanging Green Chalkboard Supermarket Sign */}
                <div className="absolute top-3 left-10 bg-[#064E3B]/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg border border-emerald-400/40 text-left flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-300">
                    🌿
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">Fresh Stock</p>
                    <p className="text-xs font-black text-white leading-none">Better Business</p>
                  </div>
                </div>

                {/* Supermarket Shopping Cart with Fresh Vegetables */}
                <div className="absolute bottom-2 right-6 select-none filter drop-shadow-2xl">
                  <span className="text-6xl sm:text-7xl">🛒</span>
                </div>

                {/* 3 Floating White Analytics Widgets on the Left Side of Image */}
                <div className="absolute top-3 right-8 flex flex-col gap-2 w-48 animate-in fade-in duration-500">
                  {/* Floating Widget 1: Total Products */}
                  <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#059669] flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-500 font-semibold uppercase">Total Products</p>
                        <p className="text-xs font-extrabold text-[#0F172A] leading-none">1,248</p>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ↑ 12%
                    </span>
                  </div>

                  {/* Floating Widget 2: Low Stock Items */}
                  <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-red-50 text-red-500 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-500 font-semibold uppercase">Low Stock Items</p>
                        <p className="text-xs font-extrabold text-[#0F172A] leading-none">18</p>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      ↑ 6%
                    </span>
                  </div>

                  {/* Floating Widget 3: Today's Sales */}
                  <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-[#00966B] flex items-center justify-center">
                        <Box className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-500 font-semibold uppercase">Today's Sales</p>
                        <p className="text-xs font-extrabold text-[#0F172A] leading-none">₹48,520</p>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ↑ 15%
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Curved Layered Green Statistics Section */}
            <div className="bg-gradient-to-r from-[#03543F] via-[#046C4E] to-[#059669] text-white p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-around divide-x divide-emerald-600/60 max-w-2xl">
              <div className="flex items-center gap-2 px-3">
                <Store className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">5,000+</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Stores Trust Us</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3">
                <ShieldCheck className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">99.9%</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Uptime & Secure</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3">
                <Star className="w-4 h-4 text-emerald-300 flex-shrink-0 fill-emerald-300" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black leading-none">4.8/5</p>
                  <p className="text-[9.5px] text-emerald-200 font-medium mt-0.5">Customer Rating</p>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDE: FORGOT PASSWORD INTERACTIVE CARD (~38%) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[460px] bg-white/95 backdrop-blur-md rounded-[32px] shadow-[0_20px_60px_-15px_rgba(5,150,105,0.15)] border border-white/80 p-6 sm:p-8 text-[#0F172A] transition-all">
              
              {/* Back to Sign In button */}
              <div className="flex items-center justify-between mb-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#059669] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
                {step > 1 && step < 4 && (
                  <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-emerald-200">
                    Step {step} of 3
                  </span>
                )}
              </div>

              {/* =================================================================== */}
              {/* STEP 1: ENTER REGISTERED EMAIL */}
              {/* =================================================================== */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Recovery Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] text-[#059669] flex items-center justify-center shadow-inner border border-[#CDE9D6]">
                      <KeyRound className="w-8 h-8 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="text-center">
                    <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">
                      Forgot Your Password?
                    </h2>
                    <p className="text-xs text-[#64748B] font-normal mt-1 leading-relaxed">
                      Enter your registered email address and we'll send you a verification code.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {emailError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{emailError}</span>
                      </div>
                    )}

                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="recovery-email"
                        className="block text-[11px] font-bold text-[#334155] mb-1"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#00966B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          id="recovery-email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. sanjai1999@gmail.com"
                          className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-[#0F172A] rounded-xl pl-10 pr-3.5 py-3 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 font-medium"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] active:scale-[0.99] text-white font-extrabold text-xs sm:text-[13.5px] rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span>{emailLoading ? 'Sending Verification Code...' : 'Send Verification Code'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </form>

                  {/* Supporting Information Box */}
                  <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start gap-3 mt-4">
                    <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#14532D]">Check your inbox (and spam folder)</h4>
                      <p className="text-[11px] text-[#166534] mt-0.5 leading-relaxed">
                        We'll send you a 6-digit verification code. The code will expire in 10 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 2: VERIFY 6-DIGIT EMAIL OTP */}
              {/* =================================================================== */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Security Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] text-[#059669] flex items-center justify-center shadow-inner border border-[#CDE9D6]">
                      <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="text-center">
                    <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">
                      Verify Your Email
                    </h2>
                    <p className="text-xs text-[#64748B] font-normal mt-1 leading-relaxed">
                      Enter the 6-digit verification code sent to <br />
                      <span className="font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block mt-0.5">
                        {maskedEmail}
                      </span>
                    </p>
                  </div>

                  {/* Feedback Banners */}
                  {otpError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {otpSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      <span>{otpSuccessMsg}</span>
                    </div>
                  )}

                  {/* 6-Digit OTP Inputs */}
                  <div className="py-2">
                    <label className="block text-[11px] font-bold text-[#334155] mb-2 text-center">
                      6-Digit Security Code
                    </label>
                    <div
                      className="flex items-center justify-center gap-2 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otpValues.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl border-2 transition-all outline-none ${
                            digit
                              ? 'border-[#059669] bg-emerald-50/50 text-[#065F46] ring-2 ring-emerald-100'
                              : 'border-[#D5E5D8] bg-[#F8FAF9] text-[#0F172A] focus:border-[#059669] focus:bg-white focus:ring-2 focus:ring-emerald-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otpValues.join('').length !== 6}
                    className="w-full py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] active:scale-[0.99] text-white font-extrabold text-xs sm:text-[13.5px] rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span>{otpLoading ? 'Verifying...' : 'Verify OTP'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Resend OTP Controls */}
                  <div className="flex flex-col items-center gap-2 pt-2 text-center text-xs">
                    <div className="text-slate-500 font-medium">
                      Didn't receive the code?{' '}
                      {resendCooldown > 0 ? (
                        <span className="font-bold text-[#059669]">
                          Resend in {resendCooldown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpLoading}
                          className="font-bold text-[#059669] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Wrong email address? Change email
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 3: CREATE NEW PASSWORD */}
              {/* =================================================================== */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Security Icon */}
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#E8F8EE] text-[#059669] flex items-center justify-center shadow-inner border border-[#CDE9D6]">
                      <Lock className="w-8 h-8 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="text-center">
                    <h2 className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-tight">
                      Create New Password
                    </h2>
                    <p className="text-xs text-[#64748B] font-normal mt-1 leading-relaxed">
                      Choose a strong password to secure your StockSense AI account.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    {passwordError && (
                      <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-[11px] font-bold text-[#334155] mb-1"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="new-password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter your new password"
                          className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-[#0F172A] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {newPassword && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">Strength:</span>
                            <span className="font-bold text-[#059669]">{strength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-[11px] font-bold text-[#334155] mb-1"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirm-password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-[#0F172A] rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={passwordLoading || !newPassword || !confirmPassword}
                      className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] active:scale-[0.99] text-white font-extrabold text-xs sm:text-[13.5px] rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span>{passwordLoading ? 'Resetting Password...' : 'Reset Password'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </form>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 4: SUCCESS STATE */}
              {/* =================================================================== */}
              {step === 4 && (
                <div className="space-y-4 py-3 text-center animate-in fade-in zoom-in-95 duration-400">
                  {/* Big Green Success Checkmark */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce">
                      <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                      Password Reset Successful!
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#64748B] font-medium mt-1.5 leading-relaxed max-w-xs mx-auto">
                      Your password has been updated securely. You can now sign in using your new credentials.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full py-3.5 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065F46] active:scale-[0.99] text-white font-extrabold text-xs sm:text-[13.5px] rounded-xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Back to Sign In</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="w-full py-3 text-center text-[11px] text-slate-400 font-medium z-10">
        © {new Date().getFullYear()} StockSense AI. All rights reserved. Enterprise Supermarket Inventory & Reordering.
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
