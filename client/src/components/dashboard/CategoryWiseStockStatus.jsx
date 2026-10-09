import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoryWiseStockStatus = ({ categories = [] }) => {
  const navigate = useNavigate();

  const fallbackCategories = [
    {
      id: '1',
      name: 'Dairy Products',
      itemCount: 180,
      lowCount: 12,
      icon: '🥛',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Cooking Oil',
      itemCount: 95,
      lowCount: 6,
      icon: '🌻',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Rice & Grains',
      itemCount: 120,
      lowCount: 6,
      icon: '🌾',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Beverages',
      itemCount: 150,
      lowCount: 4,
      icon: '🥤',
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      name: 'Snacks',
      itemCount: 130,
      lowCount: 6,
      icon: '🍟',
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '6',
      name: 'Personal Care',
      itemCount: 90,
      lowCount: 3,
      icon: '🧴',
      imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const list = categories && categories.length > 0 ? categories : fallbackCategories;

  const handleCategoryClick = (catName) => {
    navigate(`/products?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            Category Wise Stock Status
          </h3>
        </div>
        <button
          onClick={() => navigate('/categories')}
          className="text-[11.5px] font-bold text-[#059669] hover:text-[#047857] transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* 6 Category Mini Cards in a Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {list.map((cat) => (
          <div
            key={cat.id || cat.name}
            onClick={() => handleCategoryClick(cat.name)}
            className="p-2.5 rounded-xl border border-[#E2F0E7] bg-[#FAFCFA] hover:bg-white hover:border-[#10B981] hover:shadow-xs transition-all cursor-pointer flex flex-col items-center text-center group"
          >
            {/* Category Image / Avatar */}
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E2F0E7] flex items-center justify-center text-xl overflow-hidden mb-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{cat.icon || '📦'}</span>
              )}
            </div>

            {/* Name */}
            <h4 className="text-[11.5px] font-bold text-[#0F172A] leading-tight line-clamp-1">
              {cat.name}
            </h4>

            {/* Total items */}
            <p className="text-[10px] text-[#64748B] font-medium mt-0.5">
              {cat.itemCount} items
            </p>

            {/* Low stock badge */}
            <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#EF4444] bg-red-50/80 px-1.5 py-0.5 rounded-full border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{cat.lowCount} low</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryWiseStockStatus;
