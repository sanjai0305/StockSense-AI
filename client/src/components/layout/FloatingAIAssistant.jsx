import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const FloatingAIAssistant = ({ onOpenAssistant }) => {
  const [showBubble, setShowBubble] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-center select-none pointer-events-none"
      aria-label="StockSense AI Assistant"
    >
      {/* Speech Bubble Above Robot's Head */}
      {(showBubble || isHovered) && (
        <div
          onClick={onOpenAssistant}
          className="pointer-events-auto mb-1.5 sm:mb-2 relative cursor-pointer group animate-in fade-in zoom-in-95 duration-200"
          title="Click to Ask AI"
        >
          {/* Bubble Container */}
          <div className="bg-white/95 backdrop-blur-md border border-[#A7F3D0] text-[#0F172A] px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-[0_8px_25px_-4px_rgba(5,150,105,0.22)] flex items-center gap-2 transition-all duration-200 group-hover:scale-105 group-hover:border-[#059669] group-hover:shadow-[0_10px_30px_-4px_rgba(5,150,105,0.35)]">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping flex-shrink-0" />
            <span className="text-[12px] sm:text-[13px] font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
              How can I help you?
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="ml-0.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
              title="Dismiss greeting"
              aria-label="Dismiss greeting"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Speech Bubble Tail / Pointer pointing to Robot's head */}
          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#A7F3D0] rotate-45 group-hover:border-[#059669] transition-colors" />
        </div>
      )}

      {/* Floating 3D Robot Character */}
      <div
        className="pointer-events-auto animate-float-robot relative cursor-pointer group"
        onClick={onOpenAssistant}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenAssistant();
          }
        }}
        title="StockSense AI Assistant — Click to open"
        aria-label="Open AI Assistant"
      >
        {/* Ambient Green Glow on Hover */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl scale-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* 3D Robot Image Asset */}
        <img
          src="/stocksense-robot.png"
          alt="StockSense AI Assistant Robot"
          className="w-28 sm:w-36 md:w-44 h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] group-hover:scale-105 group-hover:drop-shadow-[0_16px_32px_rgba(16,185,129,0.35)] transition-all duration-300"
          loading="eager"
        />

        {/* Mini Floating Sparkle Badge */}
        <div className="absolute top-8 right-1 sm:top-10 sm:right-2 w-6 h-6 rounded-full bg-[#059669] text-white flex items-center justify-center shadow-md scale-90 group-hover:scale-110 transition-transform">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default FloatingAIAssistant;
