import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  label = 'Password',
  value,
  onChange,
  placeholder = 'Enter password',
  required = true,
  name = 'password',
  id = 'password',
  disabled = false,
  rightAction = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={id}
          className="block text-[11.5px] font-bold text-slate-700"
        >
          {label}
        </label>
        {rightAction}
      </div>

      <div className="relative">
        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-[#F8FAF9] border border-[#D5E5D8] focus:border-[#059669] focus:bg-white text-slate-900 rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-[13px] outline-none transition-all placeholder:text-slate-400 focus:ring-3 focus:ring-emerald-100 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 stroke-[2]" />
          ) : (
            <Eye className="w-4 h-4 stroke-[2]" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
