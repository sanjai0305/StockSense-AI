import React, { useState } from 'react';
import { User, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordInput from '../components/auth/PasswordInput';

const RegisterPage = () => {
  const { initiatePhoneRegistration } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
  });

  const [phoneTouched, setPhoneTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle phone input changes with strict numeric filter
  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    let digitsOnly = rawVal.replace(/\D/g, '');

    if (digitsOnly.startsWith('91') && digitsOnly.length > 10) {
      digitsOnly = digitsOnly.substring(2);
    } else if (digitsOnly.startsWith('0') && digitsOnly.length > 10) {
      digitsOnly = digitsOnly.substring(1);
    }

    if (digitsOnly.length <= 10) {
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
    }
  };

  // Handle pasted phone numbers
  const handlePhonePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    let digitsOnly = pasted.replace(/\D/g, '');

    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      digitsOnly = digitsOnly.substring(2);
    } else if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
      digitsOnly = digitsOnly.substring(1);
    }

    digitsOnly = digitsOnly.slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digitsOnly }));
  };

  // Validate phone format (Indian 10-digit mobile starting with 6, 7, 8, or 9)
  const isPhoneValid = /^[6-9]\d{9}$/.test(formData.phone);
  const isPhoneStartingValid = !formData.phone || /^[6-9]/.test(formData.phone);

  const getPhoneErrorMessage = () => {
    if (!formData.phone) return 'Mobile number is required.';
    if (!isPhoneStartingValid) return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    if (formData.phone.length < 10) return `Enter all 10 digits (${10 - formData.phone.length} digits remaining).`;
    if (!isPhoneValid) return 'Invalid 10-digit mobile number format.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneTouched(true);

    // Field 1: Full Name validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    // Field 2: Mobile Number validation
    if (!formData.phone || !isPhoneValid) {
      setError(getPhoneErrorMessage() || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Field 3: Email Address validation
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Field 4: Password validation
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `+91${formData.phone}`;
      const res = await initiatePhoneRegistration({
        fullName: formData.fullName.trim(),
        phone: fullPhone,
        email: formData.email.trim(),
        password: formData.password,
      });

      if (res.success) {
        navigate('/verify-otp', {
          state: {
            phone: fullPhone,
            email: formData.email.trim(),
            fullName: formData.fullName.trim(),
          },
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP code. Please check your phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container" />

      {/* Official StockSense AI Brand Logo */}
      <div className="text-center">
        <div className="flex justify-center mb-1.5">
          <img
            src="/stocksense-logo.png"
            alt="StockSense AI"
            className="h-10 sm:h-11 w-auto object-contain max-w-[220px]"
          />
        </div>
        <div className="w-full h-[1px] bg-slate-100 my-2 sm:my-2.5" />
      </div>

      {/* Registration Heading */}
      <div className="text-center mb-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Create your <span className="text-[#059669]">store account</span>
        </h2>
        <p className="text-[11.5px] text-slate-500 font-normal mt-0.5">
          Set up your store and make smarter inventory decisions.
        </p>
      </div>

      {/* Form with exactly 4 fields */}
      <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
        {error && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Field 1: Full Name */}
        <div>
          <label
            htmlFor="register-fullname"
            className="block text-[11px] font-bold text-slate-700 mb-0.5"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="register-fullname"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="e.g. Karthik Kumar"
              className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-[12.5px] outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Field 2: Mobile Number (🇮🇳 +91 | Enter 10-digit mobile number) */}
        <div>
          <label
            htmlFor="register-phone"
            className="block text-[11px] font-bold text-slate-700 mb-0.5"
          >
            Mobile Number
          </label>
          <div
            className={`flex items-center bg-[#F8FAF9] border rounded-xl overflow-hidden transition-all ${
              phoneTouched && formData.phone && !isPhoneValid
                ? 'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
                : phoneTouched && isPhoneValid
                ? 'border-[#059669] bg-white ring-1 ring-emerald-100'
                : 'border-[#D5E5D8] focus-within:border-[#059669] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100'
            }`}
          >
            {/* Indian Country Selector Pill */}
            <div className="flex items-center gap-1.5 pl-3 pr-2 py-2 bg-emerald-50/60 border-r border-emerald-100 select-none flex-shrink-0">
              <span className="text-sm leading-none" role="img" aria-label="India Flag">
                🇮🇳
              </span>
              <span className="text-xs font-extrabold text-[#065F46] tracking-tight">
                +91
              </span>
            </div>

            {/* Separator */}
            <div className="w-[1px] h-4 bg-slate-200 mx-1 flex-shrink-0" />

            {/* 10-digit Number Input */}
            <div className="relative flex-1">
              <input
                type="tel"
                id="register-phone"
                required
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={handlePhoneChange}
                onPaste={handlePhonePaste}
                onBlur={() => setPhoneTouched(true)}
                placeholder="Enter 10-digit mobile number"
                className="w-full bg-transparent text-slate-900 px-2.5 py-2 text-xs sm:text-[12.5px] font-medium outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
            </div>

            {/* Valid status icon */}
            {isPhoneValid && (
              <div className="pr-3 text-[#059669] flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Inline Mobile Validation Helper / Error Text */}
          {phoneTouched && formData.phone && !isPhoneValid && (
            <p className="text-[10.5px] text-red-600 font-semibold mt-0.5 pl-1 flex items-center gap-1">
              <span>⚠️</span>
              <span>{getPhoneErrorMessage()}</span>
            </p>
          )}
        </div>

        {/* Field 3: Email Address */}
        <div>
          <label
            htmlFor="register-email"
            className="block text-[11px] font-bold text-slate-700 mb-0.5"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              id="register-email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-[12.5px] outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Field 4: Password */}
        <PasswordInput
          label="Password"
          id="register-password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          placeholder="Create a secure password"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (formData.phone && !isPhoneValid)}
          className="w-full mt-2 py-3 bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold text-xs sm:text-[13px] rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span>{loading ? 'Sending OTP via Firebase...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      {/* Bottom Sign In Link */}
      <div className="text-center text-[11.5px] text-slate-500 font-medium mt-3.5 pt-2.5 border-t border-slate-100">
        Already have an account?{' '}
        <Link to="/login" className="text-[#059669] font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
