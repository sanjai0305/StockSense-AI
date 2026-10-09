import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Menu,
  Store as StoreIcon,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { store } = useAuth();
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');
  const storeRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (storeRef.current && !storeRef.current.contains(event.target)) {
        setStoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-[64px] bg-[#FAFDFB] border-b border-[#E2F0E7] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Toggle & Store Active Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Store Active Status Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F8EE] border border-[#CDE9D6] text-[#059669] text-xs font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>Live Supermarket Cloud POS</span>
        </div>
      </div>

      {/* Right: Store Selector + Date Range Filter */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Store Selector Dropdown */}
        <div className="relative" ref={storeRef}>
          <button
            onClick={() => setStoreDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] text-[#1E293B] font-semibold hover:border-emerald-300 hover:bg-[#F0FDF4] transition-colors shadow-2xs cursor-pointer"
          >
            <div className="w-4 h-4 text-[#059669] flex items-center justify-center">
              <StoreIcon className="w-4 h-4" />
            </div>
            <span>{store?.name || 'Sri Lakshmi Supermarket'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2F0E7] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-1.5 text-[10.5px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Authorized Stores
              </div>
              <button
                onClick={() => setStoreDropdownOpen(false)}
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-[#E8F8EE] flex items-center justify-between cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="font-bold truncate">{store?.name || 'Sri Lakshmi Supermarket'}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Primary Store — Salem, TN</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* Date Selector Filter */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-xl text-[12.5px] text-[#1E293B] font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
          <Calendar className="w-4 h-4 text-[#059669]" />
          <span>{dateFilter}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
        </div>
      </div>
    </header>
  );
};

export default Header;

