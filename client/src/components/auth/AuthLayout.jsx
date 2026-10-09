import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthPromotionalPanel from './AuthPromotionalPanel';

const AuthLayout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FAF4] via-[#F8FCF9] to-[#EDF7F0] text-slate-800 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Soft Ambient Green Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-green-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar with balanced compact vertical padding */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between z-20 flex-shrink-0">
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/stocksense-logo.png"
            alt="StockSense AI"
            className="h-8 sm:h-9 w-auto object-contain max-w-[200px] group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Top Right Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-[12.5px]">
          {isLoginPage ? (
            <>
              <span className="text-slate-500 font-medium hidden sm:inline">
                New to StockSense AI?
              </span>
              <Link
                to="/register"
                className="px-3.5 py-1.5 sm:py-2 bg-white hover:bg-emerald-50 text-[#059669] font-bold rounded-xl border border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Create Store Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <span className="text-slate-500 font-medium hidden sm:inline">
                Already have an account?
              </span>
              <Link
                to="/login"
                className="px-3.5 py-1.5 sm:py-2 bg-white hover:bg-emerald-50 text-[#059669] font-bold rounded-xl border border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area - Balanced two-column grid without excessive vertical margins */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-2 sm:py-4 lg:py-5 flex items-center justify-center z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Left Promotional Section (55-58%) */}
          <div className="lg:col-span-7 hidden lg:flex justify-center">
            <AuthPromotionalPanel />
          </div>

          {/* Right Authentication Card (42-45%) */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[460px] bg-white rounded-3xl shadow-[0_15px_40px_-15px_rgba(5,150,105,0.12)] border border-emerald-100/90 p-5 sm:p-6 md:p-7 text-slate-800 animate-in fade-in zoom-in-95 duration-300">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Credits */}
      <footer className="w-full py-2.5 text-center text-[11px] text-slate-400 font-medium flex-shrink-0">
        © {new Date().getFullYear()} StockSense AI. All rights reserved. Enterprise Supermarket Inventory & Reordering.
      </footer>
    </div>
  );
};

export default AuthLayout;
