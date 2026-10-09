import React from 'react';
import {
  Bot,
  AlertTriangle,
  TrendingUp,
  Snowflake,
  ChevronRight,
  ShoppingCart,
  RotateCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiReorderInsights = ({ insights, onGenerateList, loading }) => {
  const navigate = useNavigate();

  const defaultInsights = [
    {
      id: '1',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50/70',
      borderColor: 'border-red-100',
      highlight: '6 items',
      headlineSuffix: ' may stockout within 7 days',
      description: 'Take immediate action to avoid lost sales.',
      path: '/reorder-suggestions',
    },
    {
      id: '2',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
      highlight: 'Demand for cooking oil is 35% higher',
      headlineSuffix: ' this month.',
      description: 'Consider increasing order quantity.',
      path: '/reorder-suggestions',
    },
    {
      id: '3',
      icon: Snowflake,
      iconColor: 'text-sky-500',
      bgColor: 'bg-sky-50/70',
      borderColor: 'border-sky-100',
      highlight: 'Winter season demand increase',
      headlineSuffix: ' predicted for dairy products.',
      description: 'Plan 20% higher stock for next month.',
      path: '/reorder-suggestions',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full select-none">
      {/* Header with Title and Live Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#00966B] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <h3 className="text-[14px] font-bold text-[#0F172A]">
            AI Reorder Insights
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8F8EE] border border-[#CDE9D6] text-[#00966B] text-[10.5px] font-extrabold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* 3 Insight Cards */}
      <div className="space-y-2 py-2 flex-1">
        {defaultInsights.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`p-2.5 rounded-xl border ${item.borderColor} ${item.bgColor} flex items-center justify-between gap-2.5 transition-all hover:translate-x-0.5 cursor-pointer group`}
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className={`mt-0.5 flex-shrink-0 ${item.iconColor}`}>
                <item.icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] text-[#0F172A] leading-tight font-medium truncate">
                  <span className="font-bold text-[#0F172A]">{item.highlight}</span>
                  {item.headlineSuffix}
                </p>
                <p className="text-[10.5px] text-[#64748B] mt-0.5 leading-tight truncate">
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00966B] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <button
          onClick={onGenerateList}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#00966B] hover:bg-[#007A56] text-white text-[12.5px] font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
          <span>{loading ? 'Generating Recommendations...' : 'Generate Reorder List →'}</span>
        </button>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#F0F7F2] text-[10px] text-[#64748B] font-medium">
        <div className="flex items-center gap-1">
          <RotateCw className="w-3 h-3 text-slate-400" />
          <span>Last updated: Oct 09, 2026, 12:23 PM</span>
        </div>
        <div className="flex items-center gap-1 text-[#00966B] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Live data</span>
        </div>
      </div>
    </div>
  );
};

export default AiReorderInsights;
