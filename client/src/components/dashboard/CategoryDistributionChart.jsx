import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

const CategoryDistributionChart = ({ distributionData, totalProducts = 1248 }) => {
  const defaultCategories = [
    { name: 'Grocery', count: 250, percentage: 20, color: '#00966B' },
    { name: 'Beverages', count: 250, percentage: 20, color: '#10B981' },
    { name: 'Snacks', count: 250, percentage: 20, color: '#F59E0B' },
    { name: 'Personal Care', count: 250, percentage: 20, color: '#06B6D4' },
    { name: 'Household', count: 248, percentage: 20, color: '#6366F1' },
  ];

  const data = distributionData && distributionData.length > 0 ? distributionData : defaultCategories;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00966B] flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
            Product Category Distribution
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            Total {formatNumber(totalProducts)} products across categories
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 h-full">
        {/* Donut Chart with Center Text */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex-shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val, name, item) => [
                  `${val} (${item.payload.percentage}%)`,
                  item.payload.name,
                ]}
              />
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              {formatNumber(totalProducts)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              Products
            </span>
          </div>
        </div>

        {/* Legend List on Right */}
        <div className="flex-1 w-full max-w-xs space-y-2 pl-0 sm:pl-2">
          {data.slice(0, 5).map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between text-[12px] hover:bg-slate-50 px-2 py-1 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-700 font-medium truncate text-[12px]">
                  {cat.name}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-[12px] flex-shrink-0">
                {cat.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDistributionChart;
