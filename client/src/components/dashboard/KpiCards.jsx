import React from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KpiCards = ({ summary }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Total Products',
      value: summary?.totalProducts?.displayValue || '1,248',
      trendText: '↑ +3% from last week',
      trendColor: 'text-[#00966B]',
      icon: Package,
      iconBg: 'bg-[#00966B] text-white',
      waveColor: '#00966B',
      link: '/products',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          📦
        </div>
      ),
    },
    {
      title: 'Low Stock Items',
      value: summary?.lowStockItems?.displayValue || '18',
      trendText: '↑ 6% from last week',
      trendColor: 'text-[#EF4444]',
      icon: AlertTriangle,
      iconBg: 'bg-[#FEE2E2] text-[#EF4444]',
      waveColor: '#EF4444',
      link: '/reorder-suggestions',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          🧃
        </div>
      ),
    },
    {
      title: "Today's Sales",
      value: summary?.todaySales?.displayValue || '₹48,520',
      trendText: '↑ +98% from yesterday',
      trendColor: 'text-[#00966B]',
      icon: TrendingUp,
      iconBg: 'bg-[#00966B] text-white',
      waveColor: '#00966B',
      link: '/bills',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          🧾
        </div>
      ),
    },
    {
      title: 'Pending Purchase Orders',
      value: summary?.pendingPurchaseOrders?.displayValue || '7',
      statusText: '2 awaiting approval',
      trendColor: 'text-[#D97706]',
      icon: FileText,
      iconBg: 'bg-[#FEF3C7] text-[#D97706]',
      waveColor: '#F59E0B',
      link: '/stock-in',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          🛒
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          onClick={() => card.link && navigate(card.link)}
          className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden flex items-center justify-between cursor-pointer group select-none"
        >
          {/* Left info column */}
          <div className="space-y-1.5 z-10">
            {/* Icon + Title */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shadow-xs flex-shrink-0`}
              >
                <card.icon className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[12.5px] font-semibold text-[#64748B]">
                {card.title}
              </span>
            </div>

            {/* Metric Value */}
            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-none pt-0.5">
              {card.value}
            </div>

            {/* Trend Indicator */}
            {card.trendText && (
              <div className={`text-[11px] font-bold ${card.trendColor} flex items-center gap-1`}>
                <span>{card.trendText}</span>
              </div>
            )}

            {/* Pending Orders Subtext with Clock icon */}
            {card.statusText && (
              <div className={`text-[11px] font-bold ${card.trendColor} flex items-center gap-1`}>
                <Clock className="w-3 h-3 stroke-[2.5]" />
                <span>{card.statusText}</span>
              </div>
            )}
          </div>

          {/* Right: 3D Illustration Container with Wave Sparkline */}
          <div className="relative z-10 flex flex-col items-end justify-between h-full pl-2">
            <div className="w-14 h-14 rounded-2xl bg-[#F4FAF6] border border-[#E2F0E7] group-hover:scale-105 group-hover:bg-[#E8F8EE] transition-all flex items-center justify-center shadow-inner">
              {card.illustration}
            </div>

            {/* Decorative SVG Wave Line below illustration */}
            <svg
              className="w-16 h-4 mt-1 opacity-80"
              viewBox="0 0 64 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 14C12 14 14 4 25 6C36 8 42 12 52 4C58 -0.5 61 2 63 3"
                stroke={card.waveColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
