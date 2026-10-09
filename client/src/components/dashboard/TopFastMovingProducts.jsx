import React from 'react';
import { Award, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopFastMovingProducts = ({ products = [] }) => {
  const navigate = useNavigate();

  const fallbackList = [
    {
      rank: 1,
      name: 'Amul Fresh Milk 1L',
      unitsSold: '1,200 units',
      growth: '12%',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop&q=80',
    },
    {
      rank: 2,
      name: 'Maggi Noodles 70g',
      unitsSold: '950 units',
      growth: '8%',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=100&auto=format&fit=crop&q=80',
    },
    {
      rank: 3,
      name: 'Coca-Cola 500ml',
      unitsSold: '780 units',
      growth: '6%',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    },
    {
      rank: 4,
      name: 'Britannia Bread',
      unitsSold: '650 units',
      growth: '14%',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=80',
    },
    {
      rank: 5,
      name: 'Sunflower Oil 1L',
      unitsSold: '620 units',
      growth: '10%',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const list = products && products.length > 0 ? products : fallbackList;

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            Top Fast-Moving Products
          </h3>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="text-[11.5px] font-bold text-[#059669] hover:text-[#047857] transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Product List */}
      <div className="divide-y divide-[#F8FAFC] py-1 flex-1">
        {list.map((item, idx) => (
          <div
            key={item.name || idx}
            className="flex items-center justify-between py-2 px-1 hover:bg-[#F9FCFA] rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] w-3 text-center">
                {item.rank || idx + 1}
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px]">📦</span>
                )}
              </div>
              <span className="text-[12px] font-bold text-[#0F172A] truncate">
                {item.name}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 pl-2">
              <span className="text-[11.5px] font-semibold text-[#475569]">
                {item.unitsSold}
              </span>
              <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#059669]">
                <span>↑ {item.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopFastMovingProducts;
