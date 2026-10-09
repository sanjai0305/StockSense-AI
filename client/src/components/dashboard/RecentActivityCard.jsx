import React from 'react';
import { Clock, ArrowDownLeft, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';

const RecentActivityCard = ({ activities = [] }) => {
  const defaultActivities = [
    {
      id: '1',
      type: 'STOCK_IN',
      title: 'Received 50 units of Sunflower Oil 1L',
      timestamp: new Date(Date.now() - 1000 * 60 * 35),
      user: 'Sanjai R',
      badgeColor: 'emerald',
    },
    {
      id: '2',
      type: 'SALE',
      title: 'Bill #BILL-202610-1001 processed (₹1,200)',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: 'Murugan K',
      badgeColor: 'rose',
    },
    {
      id: '3',
      type: 'STOCK_IN',
      title: 'Received 100 units of Coca-Cola & Thums Up',
      timestamp: new Date(Date.now() - 1000 * 60 * 300),
      user: 'Sanjai R',
      badgeColor: 'emerald',
    },
    {
      id: '4',
      type: 'ALERT',
      title: 'Low stock triggered for Maggi Noodles (6 left)',
      timestamp: new Date(Date.now() - 1000 * 60 * 480),
      user: 'System Bot',
      badgeColor: 'amber',
    },
  ];

  const items = activities && activities.length > 0 ? activities : defaultActivities;

  const getIcon = (type) => {
    if (type === 'STOCK_IN') return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />;
    if (type === 'SALE') return <ShoppingCart className="w-3.5 h-3.5 text-rose-600" />;
    return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
  };

  const getBg = (type) => {
    if (type === 'STOCK_IN') return 'bg-emerald-50 border-emerald-200';
    if (type === 'SALE') return 'bg-rose-50 border-rose-200';
    return 'bg-amber-50 border-amber-200';
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0969FF] flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
              Recent Inventory Activity
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Real-time supermarket event feed
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          Live
        </span>
      </div>

      {/* Activity Timeline */}
      <div className="divide-y divide-slate-100">
        {items.map((act) => (
          <div key={act.id} className="py-2.5 flex items-start gap-3 hover:bg-slate-50/70 px-1 rounded-xl transition-colors">
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 ${getBg(act.type)}`}>
              {getIcon(act.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-slate-800 leading-snug">
                {act.title}
              </p>
              <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-medium mt-0.5">
                <span>{act.user}</span>
                <span>•</span>
                <span>
                  {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;
