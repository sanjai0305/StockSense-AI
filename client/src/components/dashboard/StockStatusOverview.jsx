import React from 'react';
import {
  BarChart2,
  ArrowRight,
  Package,
  Zap,
  Hourglass,
  Grid,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StockStatusOverview = ({ stockStatus }) => {
  const navigate = useNavigate();

  const data = [
    { name: 'In Stock', value: stockStatus?.inStock || 1020, percentage: stockStatus?.inStockPct || 82, color: '#00966B' },
    { name: 'Low Stock', value: stockStatus?.lowStock || 120, percentage: stockStatus?.lowStockPct || 10, color: '#F59E0B' },
    { name: 'Out of Stock', value: stockStatus?.outOfStock || 108, percentage: stockStatus?.outOfStockPct || 8, color: '#EF4444' },
  ];

  const totalProducts = stockStatus?.totalProducts || 1248;

  const subStats = [
    {
      label: 'New Products',
      value: '24',
      change: '+12%',
      isPositive: true,
      icon: Package,
      iconColor: 'text-[#00966B]',
      iconBg: 'bg-[#E8F8EE]',
    },
    {
      label: 'Fast Moving',
      value: '312',
      change: '+18%',
      isPositive: true,
      icon: Zap,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Slow Moving',
      value: '86',
      change: '-6%',
      isPositive: false,
      icon: Hourglass,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
    },
    {
      label: 'Total Categories',
      value: '28',
      change: '+4%',
      isPositive: true,
      icon: Grid,
      iconColor: 'text-[#00966B]',
      iconBg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#00966B] flex items-center justify-center">
            <BarChart2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Stock Status Overview
          </h3>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="text-[12px] font-bold text-[#00966B] hover:text-[#007A56] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Donut Chart and Legend */}
      <div className="grid grid-cols-12 items-center py-2 flex-1 gap-2">
        {/* Donut chart with center text */}
        <div className="col-span-6 relative flex items-center justify-center h-[145px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={46}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} items`, name]}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontSize: '11px',
                  border: 'none',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[20px] font-extrabold text-[#0F172A] leading-none">
              {totalProducts.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#64748B] font-semibold mt-0.5">
              Products
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="col-span-6 space-y-2.5 pl-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[12px] font-medium text-[#475569]">
                  {item.name}
                </span>
              </div>
              <span className="text-[12px] font-bold text-[#0F172A]">
                {item.value.toLocaleString()} <span className="text-[#64748B] font-medium">({item.percentage}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#F0F7F2]">
        {subStats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 text-center flex flex-col items-center justify-between hover:bg-[#F0FDF4] hover:border-[#BDE8CC] transition-all"
          >
            <div className={`w-5 h-5 rounded-md ${stat.iconBg} ${stat.iconColor} flex items-center justify-center mb-1 shadow-2xs`}>
              <stat.icon className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="text-[9.5px] font-semibold text-[#64748B] leading-tight truncate w-full block">
              {stat.label}
            </span>
            <span className="text-[14px] font-extrabold text-[#0F172A] leading-tight my-0.5">
              {stat.value}
            </span>
            <span
              className={`text-[9.5px] font-bold leading-none ${
                stat.isPositive ? 'text-[#00966B]' : 'text-red-500'
              }`}
            >
              {stat.isPositive ? `↑ ${stat.change}` : `↓ ${stat.change}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockStatusOverview;
