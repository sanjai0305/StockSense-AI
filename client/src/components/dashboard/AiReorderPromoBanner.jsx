import React from 'react';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';

const AiReorderPromoBanner = ({ onGenerateList, loading }) => {
  return (
    <div className="bg-gradient-to-r from-[#03543F] via-[#046C4E] to-[#047857] text-white rounded-2xl p-4 shadow-sm relative overflow-hidden flex items-center justify-between h-full">
      {/* Decorative background circle */}
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />

      {/* Left 3D Robot Mascot */}
      <div className="relative z-10 flex items-center gap-3.5 max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
          🤖
        </div>

        <div>
          <h3 className="text-[15px] font-extrabold text-white tracking-tight leading-tight">
            Let AI handle your reorders
          </h3>
          <p className="text-[11px] text-emerald-100/90 font-medium mt-1 leading-snug">
            Automatically detect low stock, predict demand and create purchase orders.
          </p>
          <div className="mt-2.5">
            <button
              onClick={onGenerateList}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-[#047857] text-[11.5px] font-extrabold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-75"
            >
              <span>{loading ? 'Analyzing...' : 'Generate Reorder List'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Grocery Basket Illustration */}
      <div className="hidden sm:flex relative z-10 pl-2">
        <div className="text-4xl filter drop-shadow-md select-none">
          🧺
        </div>
      </div>
    </div>
  );
};

export default AiReorderPromoBanner;
