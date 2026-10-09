import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const FloatingAIAssistant = ({ onOpenAssistant }) => {
  const [showBubble, setShowBubble] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-5 z-40 flex flex-col items-center select-none pointer-events-none"
      aria-label="StockSense AI Assistant"
    >
      {/* Compact Speech Bubble Above Robot's Head */}
      {(showBubble || isHovered) && (
        <div
          onClick={onOpenAssistant}
          className="pointer-events-auto mb-1 relative cursor-pointer group animate-in fade-in zoom-in-95 duration-150"
          title="Click to Ask AI"
        >
          {/* Bubble Container */}
          <div className="bg-white/95 backdrop-blur-md border border-[#A7F3D0] text-[#0F172A] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-[0_4px_16px_rgba(5,150,105,0.18)] flex items-center gap-1.5 transition-all duration-150 group-hover:scale-105 group-hover:border-[#00966B] group-hover:shadow-[0_6px_20px_rgba(5,150,105,0.28)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping flex-shrink-0" />
            <span className="text-[11px] sm:text-[11.5px] font-extrabold text-[#0F172A] tracking-tight whitespace-nowrap">
              How can I help you?
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="ml-0.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
              title="Dismiss greeting"
              aria-label="Dismiss greeting"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Speech Bubble Tail pointing downward */}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-[#A7F3D0] rotate-45 group-hover:border-[#00966B] transition-colors" />
        </div>
      )}

      {/* Tiny Compact Floating 3D Robot Mascot (48px on mobile, 60-65px on desktop) */}
      <div
        className="pointer-events-auto animate-float-robot relative cursor-pointer group flex items-center justify-center"
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
        {/* Subtle Ambient Green Glow on Hover */}
        <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-md scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* 3D Robot Image Asset (55-65px height on desktop, 45-50px on mobile) */}
        <img
          src="/stocksense-robot.png"
          alt="StockSense AI Assistant Mascot"
          className="h-[48px] sm:h-[60px] w-auto max-w-[65px] object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:drop-shadow-[0_6px_16px_rgba(16,185,129,0.35)] transition-all duration-200"
          loading="eager"
        />

        {/* Mini Sparkle Indicator */}
        <div className="absolute top-1 right-0 sm:top-1.5 sm:right-0 w-3.5 h-3.5 rounded-full bg-[#00966B] text-white flex items-center justify-center shadow-2xs scale-90 group-hover:scale-110 transition-transform">
          <Sparkles className="w-2 h-2" />
        </div>
      </div>
    </div>
  );
};

export default FloatingAIAssistant;
