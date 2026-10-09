import React from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const KpiCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Products',
      value: summary?.totalProducts?.displayValue || '1,248',
      trend: summary?.totalProducts?.trend || '↑ +3% from last week',
      isPositive: true,
      icon: ShoppingCart,
      iconBg: 'bg-[#059669] text-white',
      trendColor: 'text-[#059669]',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          📦
        </div>
      ),
    },
    {
      title: 'Low Stock Items',
      value: summary?.lowStockItems?.displayValue || '18',
      trend: summary?.lowStockItems?.trend || '↑ 6% from last week',
      isPositive: false,
      icon: AlertTriangle,
      iconBg: 'bg-[#FEE2E2] text-[#EF4444]',
      trendColor: 'text-[#EF4444]',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          🧃
        </div>
      ),
    },
    {
      title: "Today's Sales",
      value: summary?.todaySales?.displayValue || '₹48,520',
      trend: summary?.todaySales?.trend || '↑ 12% from yesterday',
      isPositive: true,
      icon: TrendingUp,
      iconBg: 'bg-[#059669] text-white',
      trendColor: 'text-[#059669]',
      illustration: (
        <div className="text-3xl filter drop-shadow-sm select-none">
          🧾
        </div>
      ),
    },
    {
      title: 'Pending Purchase Orders',
      value: summary?.pendingPurchaseOrders?.displayValue || '7',
      subtext: summary?.pendingPurchaseOrders?.subtext || '2 awaiting approval',
      icon: FileText,
      iconBg: 'bg-[#FEF3C7] text-[#D97706]',
      subtextColor: 'text-[#D97706]',
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
          className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden flex items-center justify-between"
        >
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shadow-xs`}
              >
                <card.icon className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[12px] font-semibold text-[#64748B]">
                {card.title}
              </span>
            </div>

            <div className="text-[26px] font-extrabold text-[#0F172A] tracking-tight leading-tight">
              {card.value}
            </div>

            {card.trend && (
              <div className={`text-[11px] font-bold ${card.trendColor} flex items-center gap-1`}>
                <span>{card.trend}</span>
              </div>
            )}

            {card.subtext && (
              <div className={`text-[11px] font-bold ${card.subtextColor}`}>
                {card.subtext}
              </div>
            )}
          </div>

          {/* 3D Illustration Graphic on the right */}
          <div className="relative z-10 pl-2">
            <div className="w-14 h-14 rounded-2xl bg-[#F4FAF6] border border-[#E2F0E7] flex items-center justify-center shadow-inner">
              {card.illustration}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;
