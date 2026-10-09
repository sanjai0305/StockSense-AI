import React from 'react';
import {
  Bot,
  AlertTriangle,
  TrendingUp,
  Snowflake,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const AiReorderInsights = ({ insights, onGenerateList, loading }) => {
  const defaultInsights = [
    {
      id: '1',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50/70',
      borderColor: 'border-red-100',
      headlinePrefix: '',
      highlight: '6 items',
      headlineSuffix: ' may stockout within 7 days',
      description: 'Take immediate action to avoid lost sales.',
    },
    {
      id: '2',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
      headlinePrefix: 'Demand for cooking oil is ',
      highlight: '35% higher',
      headlineSuffix: ' this month.',
      description: 'Consider increasing order quantity.',
    },
    {
      id: '3',
      icon: Snowflake,
      iconColor: 'text-sky-500',
      bgColor: 'bg-sky-50/70',
      borderColor: 'border-sky-100',
      headlinePrefix: '',
      highlight: 'Winter season demand increase',
      headlineSuffix: ' predicted for dairy products.',
      description: 'Plan 20% higher stock for next month.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E2F0E7] shadow-2xs flex flex-col justify-between h-full">
      {/* Header with Title and Robot Icon */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0F7F2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8F8EE] text-[#059669] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[13.5px] font-bold text-[#0F172A]">
            AI Reorder Insights
          </h3>
        </div>
        <div className="text-xl">
          🤖
        </div>
      </div>

      {/* 3 Insight Cards */}
      <div className="space-y-2 py-2 flex-1">
        {defaultInsights.map((item) => (
          <div
            key={item.id}
            className={`p-2.5 rounded-xl border ${item.borderColor} ${item.bgColor} flex items-start gap-2.5 transition-all hover:translate-x-0.5`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${item.iconColor}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] text-[#0F172A] font-medium leading-tight">
                {item.headlinePrefix}
                <span className="font-bold text-[#0F172A]">{item.highlight}</span>
                {item.headlineSuffix}
              </p>
              <p className="text-[10.5px] text-[#64748B] mt-0.5 leading-tight">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <button
          onClick={onGenerateList}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-[12px] font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
        >
          <span>{loading ? 'Analyzing Inventory...' : 'Generate Reorder List'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AiReorderInsights;
