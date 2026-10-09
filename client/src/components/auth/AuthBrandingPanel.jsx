import React from 'react';
import { Package, Bell, BarChart2 } from 'lucide-react';
import InventoryDashboardPreview from './InventoryDashboardPreview';

const AuthBrandingPanel = () => {
  return (
    <div className="flex flex-col justify-center space-y-6 lg:pl-2 xl:pl-4 select-none">
      {/* Main Showcase Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-tight">
          Manage Inventory <br />
          <span className="bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#60A5FA] bg-clip-text text-transparent">
            Smarter, Not Harder
          </span>
        </h1>
        <p className="text-slate-300/85 text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
          Real-time stock tracking, smart reorder alerts and powerful insights for your supermarket.
        </p>
      </div>

      {/* Interactive SaaS Dashboard Mockup Frame */}
      <InventoryDashboardPreview />

      {/* Three Feature Highlights Underneath Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Feature 1 */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-cyan-400/50 bg-cyan-950/40 text-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <Package className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">
              Real-time stock visibility
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Track your inventory across all categories in real time.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-center gap-3 md:border-l md:border-slate-800/80 md:pl-4">
          <div className="w-11 h-11 rounded-full border border-cyan-400/50 bg-cyan-950/40 text-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <Bell className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">
              Smart reorder alerts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Get notified before items run out.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-center gap-3 md:border-l md:border-slate-800/80 md:pl-4">
          <div className="w-11 h-11 rounded-full border border-cyan-400/50 bg-cyan-950/40 text-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <BarChart2 className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xs sm:text-[13px] font-bold text-white leading-tight">
              Sales forecasting
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Predict demand and optimize stock levels with AI insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthBrandingPanel;
