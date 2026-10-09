import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const forecastData = [
  { day: 'Day 1', actual: 4200, forecast: 4200 },
  { day: 'Day 5', actual: 4600, forecast: 4550 },
  { day: 'Day 10', actual: 5100, forecast: 5050 },
  { day: 'Day 15', actual: null, forecast: 5600 },
  { day: 'Day 20', actual: null, forecast: 6200 },
  { day: 'Day 25', actual: null, forecast: 6700 },
  { day: 'Day 30', actual: null, forecast: 7100 },
];

const DemandForecastCard = () => {
  const [horizon, setHorizon] = useState('30d');
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00966B] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-[14px] sm:text-[15px] leading-tight">
                AI Demand Forecast & Smart Insights
              </h3>
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#00966B] to-[#10B981] text-white rounded text-[8.5px] font-black uppercase tracking-wider">
                AI Model
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Predictive replenishment & depletion curves
            </p>
          </div>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setHorizon('7d')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${horizon === '7d' ? 'bg-white text-[#00966B] shadow-xs' : 'text-slate-500'}`}
          >
            7 Days
          </button>
          <button
            onClick={() => setHorizon('14d')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${horizon === '14d' ? 'bg-white text-[#00966B] shadow-xs' : 'text-slate-500'}`}
          >
            14 Days
          </button>
          <button
            onClick={() => setHorizon('30d')}
            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${horizon === '30d' ? 'bg-white text-[#00966B] shadow-xs' : 'text-slate-500'}`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Forecast Area Chart */}
      <div className="w-full h-36 my-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00966B" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00966B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 9 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-[11px] p-2 rounded-xl shadow-lg border border-slate-800">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="text-emerald-400 font-bold">
                        Projected Demand: ₹{payload[0]?.value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#00966B"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#forecastGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Depletion Risk Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00966B] flex-shrink-0" />
            <div>
              <p className="text-[11.5px] font-bold text-slate-900 leading-tight">
                Atta & Staples Surge
              </p>
              <p className="text-[10px] text-emerald-700 font-medium">
                +18% festival demand expected
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
            Order +25 Qty
          </span>
        </div>

        <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-[11.5px] font-bold text-slate-900 leading-tight">
                Dove Soap Stockout
              </p>
              <p className="text-[10px] text-amber-700 font-medium">
                Depletes in approx 2 days
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reorder-suggestions')}
            className="text-[10.5px] font-bold text-amber-600 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandForecastCard;
