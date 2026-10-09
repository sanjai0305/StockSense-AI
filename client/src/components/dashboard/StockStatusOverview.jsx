import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StockStatusOverview = ({ stockStatus }) => {
  const navigate = useNavigate();

  const data = [
    { name: 'In Stock', value: stockStatus?.inStock || 1020, percentage: stockStatus?.inStockPct || 82, color: '#10B981' },
    { name: 'Low Stock', value: stockStatus?.lowStock || 120, percentage: stockStatus?.lowStockPct || 10, color: '#F59E0B' },
    { name: 'Out of Stock', value: stockStatus?.outOfStock || 108, percentage: stockStatus?.outOfStockPct || 8, color: '#EF4444' },
  ];

  const totalProducts = stockStatus?.totalProducts || 1248;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            Stock Status Overview
          </h3>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="text-[11.5px] font-bold text-[#059669] hover:text-[#047857] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Donut Chart and Legend */}
      <div className="grid grid-cols-12 items-center py-2 flex-1 gap-2">
        {/* Donut chart with center text */}
        <div className="col-span-6 relative flex items-center justify-center h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={44}
                outerRadius={62}
                paddingAngle={3}
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
                  borderRadius: '8px',
                  fontSize: '11px',
                  border: 'none',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Count */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[17px] font-extrabold text-[#0F172A] leading-none">
              {totalProducts.toLocaleString()}
            </span>
            <span className="text-[9.5px] text-[#64748B] font-semibold mt-0.5">
              Products
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="col-span-6 space-y-2.5 pl-2">
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
                {item.value.toLocaleString()} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockStatusOverview;
