import React from 'react';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WelcomeBanner = () => {
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'Sanjai';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left greeting */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
          <Leaf className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-1.5">
            Good Morning, {userName} !
          </h1>
          <p className="text-[13px] text-[#64748B] font-medium mt-0.5">
            Here's your supermarket performance today.
          </p>
        </div>
      </div>

      {/* Right green supermarket slogan banner */}
      <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-[#E8F8EE] to-[#DCF5E6] border border-[#BDE8CC] px-4 py-2 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥦 🍎 🥑</span>
          <div className="text-right">
            <span className="text-[14px] font-extrabold text-[#047857] block leading-tight">
              Smart Inventory, Smarter Business
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
