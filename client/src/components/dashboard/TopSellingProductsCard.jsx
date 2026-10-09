import React, { useState } from 'react';
import { TrendingUp, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const TopSellingProductsCard = ({ topProducts = [] }) => {
  const [timeRange, setTimeRange] = useState('This Month');
  const navigate = useNavigate();

  const defaultTop = [
    {
      id: '1',
      name: 'Aashirvaad Atta (5kg)',
      category: 'Grocery',
      unitsSold: 142,
      revenue: 35500,
      currentStock: 5,
      performancePct: 100,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Sunflower Oil (1L)',
      category: 'Grocery',
      unitsSold: 128,
      revenue: 17920,
      currentStock: 45,
      performancePct: 90,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Thums Up (1L)',
      category: 'Beverages',
      unitsSold: 98,
      revenue: 5880,
      currentStock: 8,
      performancePct: 69,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Amul Milk (1L)',
      category: 'Dairy',
      unitsSold: 94,
      revenue: 5452,
      currentStock: 32,
      performancePct: 66,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      name: 'Maggi Noodles (70g)',
      category: 'Snacks',
      unitsSold: 88,
      revenue: 1232,
      currentStock: 6,
      performancePct: 62,
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const items = topProducts && topProducts.length > 0 ? topProducts : defaultTop;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Top-Selling Products
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Ranked by revenue & sales velocity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[#F8FAFC] border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-slate-700 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="This Month">This Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => navigate('/bills')}
            className="text-[11.5px] text-[#00966B] font-bold hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
          >
            <span>Sales Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product List with Progress Bars */}
      <div className="divide-y divide-slate-100">
        {items.map((prod, idx) => (
          <div key={prod.id || idx} className="py-2.5 space-y-1.5 hover:bg-slate-50/70 rounded-xl px-1.5 transition-colors">
            <div className="flex items-center justify-between gap-3">
              {/* Left Product Image & Title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">📦</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12.5px] font-bold text-slate-800 truncate leading-tight">
                    {prod.name}
                  </h4>
                  <span className="text-[10.5px] text-slate-400 font-medium">
                    {prod.category} • {prod.currentStock} in stock
                  </span>
                </div>
              </div>

              {/* Right Sales Revenue & Units */}
              <div className="text-right flex-shrink-0">
                <p className="text-[13px] font-black text-slate-900 leading-tight">
                  {formatCurrency(prod.revenue)}
                </p>
                <p className="text-[11px] font-bold text-emerald-600">
                  {formatNumber(prod.unitsSold)} units sold
                </p>
              </div>
            </div>

            {/* Visual Performance Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00966B] to-[#10B981] h-full rounded-full transition-all duration-500"
                style={{ width: `${prod.performancePct || 75}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingProductsCard;
