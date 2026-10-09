import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, BarChart2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-800">
        <p className="font-bold text-slate-300 mb-1">{label}</p>
        <p className="text-blue-400 font-semibold">
          Stock In: {formatCurrency(payload[0]?.value)}
        </p>
        <p className="text-cyan-400 font-semibold">
          Stock Out: {formatCurrency(payload[1]?.value)}
        </p>
      </div>
    );
  }
  return null;
};

const StockInOutChart = ({ data }) => {
  const [timeRange, setTimeRange] = useState('This Year');

  const defaultData = [
    { name: 'Jan', stockIn: 50000, stockOut: 40000 },
    { name: 'Feb', stockIn: 62000, stockOut: 43000 },
    { name: 'Mar', stockIn: 51000, stockOut: 39000 },
    { name: 'Apr', stockIn: 72000, stockOut: 48000 },
    { name: 'May', stockIn: 48000, stockOut: 32000 },
    { name: 'Jun', stockIn: 65000, stockOut: 52000 },
    { name: 'Jul', stockIn: 95000, stockOut: 58000 },
    { name: 'Aug', stockIn: 135000, stockOut: 85000 },
    { name: 'Sep', stockIn: 145000, stockOut: 88000 },
    { name: 'Oct', stockIn: 165000, stockOut: 82000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  const formatYAxis = (tick) => {
    if (tick === 0) return '0';
    return `${tick / 1000}K`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0969FF] flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Stock In vs Stock Out
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Monthly stock movement overview
            </p>
          </div>
        </div>

        {/* Legend & Filter */}
        <div className="flex items-center gap-3.5 text-[11.5px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
            <span className="text-slate-600">Stock In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
            <span className="text-slate-600">Stock Out</span>
          </div>

          {/* Time Filter Pill */}
          <div className="relative inline-block">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-slate-700 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="This Year">This Year</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Month">This Month</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={formatYAxis}
              domain={[0, 200000]}
              ticks={[0, 50000, 100000, 150000, 200000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="stockIn"
              name="Stock In"
              fill="#2563EB"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
            <Bar
              dataKey="stockOut"
              name="Stock Out"
              fill="#06B6D4"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockInOutChart;
