import React, { useState } from 'react';
import { LineChart as ChartIcon, ChevronDown } from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const salesVal = payload.find((p) => p.dataKey === 'sales')?.value || 0;
    return (
      <div className="bg-[#0F172A] text-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-700 text-center">
        <p className="text-[12.5px] font-extrabold text-[#10B981]">
          ₹{salesVal.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-300 font-medium">
          {label}, 2026
        </p>
      </div>
    );
  }
  return null;
};

const SalesStockTrendChart = ({ data }) => {
  const [range, setRange] = useState('Last 7 Days');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const defaultData = [
    { date: 'Oct 03', sales: 22000, stockOut: 14 },
    { date: 'Oct 04', sales: 31000, stockOut: 20 },
    { date: 'Oct 05', sales: 26000, stockOut: 16 },
    { date: 'Oct 06', sales: 42000, stockOut: 24 },
    { date: 'Oct 07', sales: 38000, stockOut: 22 },
    { date: 'Oct 08', sales: 56000, stockOut: 28 },
    { date: 'Oct 09', sales: 48520, stockOut: 18 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const summaryStats = [
    {
      label: 'Total Sales',
      value: '₹2,41,320',
      change: '+28%',
      isPositive: true,
    },
    {
      label: 'Avg. Daily Sales',
      value: '₹34,474',
      change: '+16%',
      isPositive: true,
    },
    {
      label: 'Stock Out (Items)',
      value: '108',
      change: '-12%',
      isPositive: false,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full select-none">
      {/* Header with Title, Legends, and Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#00966B] flex items-center justify-center">
            <ChartIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            Sales & Stock Trend
          </h3>
        </div>

        {/* Legend + Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-[11px] font-semibold text-[#64748B]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00966B]" />
              <span>Sales (₹)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
              <span>Stock Out</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#475569] cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <span>{range}</span>
              <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#E2F0E7] py-1 z-30 animate-in fade-in">
                {['Last 7 Days', 'Last 30 Days', 'This Month'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRange(opt);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                      range === opt ? 'bg-[#E8F8EE] text-[#00966B]' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[145px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 10, left: -22, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSalesArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00966B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00966B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => (val >= 1000 ? `${val / 1000}K` : val)}
              domain={[0, 100000]}
              ticks={[0, 20000, 40000, 60000, 80000, 100000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="stockOut"
              fill="#A7F3D0"
              barSize={8}
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#00966B"
              strokeWidth={2.4}
              fillOpacity={1}
              fill="url(#colorSalesArea)"
              dot={{ r: 3.5, fill: '#00966B', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              activeDot={{ r: 5.5, fill: '#00966B', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom 3 Summary Metric Cards */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0F7F2]">
        {summaryStats.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 text-center flex flex-col justify-between hover:bg-[#F0FDF4] hover:border-[#BDE8CC] transition-all"
          >
            <span className="text-[10px] font-semibold text-[#64748B] leading-tight truncate">
              {item.label}
            </span>
            <span className="text-[14px] font-extrabold text-[#0F172A] leading-tight my-0.5">
              {item.value}
            </span>
            <span
              className={`text-[10px] font-bold leading-none ${
                item.isPositive ? 'text-[#00966B]' : 'text-red-500'
              }`}
            >
              {item.isPositive ? `↑ ${item.change}` : `↓ ${item.change}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesStockTrendChart;
