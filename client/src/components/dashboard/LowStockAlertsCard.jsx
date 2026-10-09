import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LowStockAlertsCard = ({ lowStockItems = [], onReorderClick }) => {
  const navigate = useNavigate();

  const defaultAlerts = [
    {
      id: '1',
      name: 'Dove Soap (100g)',
      currentStock: 4,
      imageUrl: 'https://images.unsplash.com/photo-1608248597358-1e4268e3d0e2?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      name: 'Aashirvaad Atta (5kg)',
      currentStock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      name: 'Maggi Noodles (70g)',
      currentStock: 6,
      imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      name: 'Tide Detergent (1kg)',
      currentStock: 7,
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      name: 'Thums Up (1L)',
      currentStock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const items = lowStockItems.length > 0 ? lowStockItems.slice(0, 4) : defaultAlerts.slice(0, 4);
  const totalCount = lowStockItems.length || 7;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Low Stock Alerts
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              {totalCount} items need reordering
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/reorder-suggestions')}
          className="text-[12px] text-[#00966B] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Product list */}
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-slate-50/80 rounded-xl px-1.5 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-base">📦</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-[12.5px] font-bold text-slate-800 truncate leading-tight">
                  {item.name}
                </h4>
                <p className="text-[11.5px] text-rose-500 font-bold mt-0.5">
                  {item.currentStock} units left
                </p>
              </div>
            </div>

            <button
              onClick={() => onReorderClick ? onReorderClick(item) : navigate('/stock-in')}
              className="px-3.5 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] active:scale-95 text-white text-[11.5px] font-bold rounded-xl shadow-xs hover:shadow transition-all flex-shrink-0 cursor-pointer"
            >
              Reorder
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowStockAlertsCard;
