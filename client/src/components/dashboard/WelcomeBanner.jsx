import React from 'react';
import { Sun, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WelcomeBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.fullName ? user.fullName.split(' ')[0] : 'sanjai';

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      {/* Left Greeting */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0 select-none">
          <Sun className="w-6 h-6 stroke-[2.2] text-white animate-[spin_20s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight flex items-center gap-1.5">
            {getGreeting()}, {userName} !
          </h1>
          <p className="text-[13px] text-[#64748B] font-medium mt-0.5">
            Here's your supermarket performance today.
          </p>
        </div>
      </div>

      {/* Right: Smart Inventory, Smarter Business Promotional Banner */}
      <div
        onClick={() => navigate('/reorder-suggestions')}
        className="cursor-pointer group flex items-center gap-3.5 bg-gradient-to-r from-[#EAF8F0] to-[#DCF5E6] border border-[#BDE8CC] px-4 py-2.5 rounded-2xl shadow-2xs hover:shadow-xs hover:border-emerald-400 transition-all select-none"
      >
        <div className="flex items-center gap-1 text-2xl filter drop-shadow-xs flex-shrink-0">
          <span>🥬</span>
          <span>🍎</span>
          <span>🥕</span>
          <span>🍅</span>
        </div>
        <div>
          <h3 className="text-[13.5px] font-extrabold text-[#047857] leading-tight group-hover:text-[#007A56] transition-colors">
            Smart Inventory, Smarter Business
          </h3>
          <p className="text-[11.5px] text-[#475569] font-medium leading-tight mt-0.5">
            AI-powered insights for a better tomorrow.
          </p>
        </div>
        <div className="w-6 h-6 rounded-full bg-white/70 group-hover:bg-white text-[#047857] flex items-center justify-center shadow-2xs ml-1 flex-shrink-0">
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
