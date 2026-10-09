import React, { useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
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
      <div className="bg-[#0F172A] text-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 text-center">
        <p className="text-[12px] font-bold text-emerald-400">
          ₹{salesVal.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-300">
          {label === 'Oct 08' ? 'Oct 08, 2026' : label}
        </p>
      </div>
    );
  }
  return null;
};

const SalesStockTrendChart = ({ data }) => {
  const [range, setRange] = useState('Last 7 Days');

  const defaultData = [
    { date: 'Oct 03', sales: 18000, stockOut: 14000 },
    { date: 'Oct 04', sales: 28500, stockOut: 21000 },
    { date: 'Oct 05', sales: 22000, stockOut: 19000 },
    { date: 'Oct 06', sales: 38400, stockOut: 26000 },
    { date: 'Oct 07', sales: 34200, stockOut: 29000 },
    { date: 'Oct 08', sales: 48520, stockOut: 24000 },
    { date: 'Oct 09', sales: 52000, stockOut: 27000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header with Title, Legends, and Range Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            Sales & Stock Trend
          </h3>
        </div>

        {/* Legend + Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span>Sales (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-[#94A3B8]" />
              <span>Stock Out</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[11px] font-bold text-[#475569] cursor-pointer hover:bg-slate-100">
            <span>{range}</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[150px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
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
              domain={[0, 80000]}
              ticks={[0, 20000, 40000, 60000, 80000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#059669"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 5, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="stockOut"
              stroke="#94A3B8"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesStockTrendChart;
