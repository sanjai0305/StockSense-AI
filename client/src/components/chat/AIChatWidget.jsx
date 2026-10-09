import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCcw,
  Bot,
  Database,
  BookOpen,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'welcome-msg',
  sender: 'ai',
  text: "Hi! I'm your **StockSense AI Assistant**. Ask me anything about your supermarket's live inventory, current stock, low-stock items, today's sales, suppliers, purchase orders, or reorder recommendations.",
  timestamp: new Date().toISOString(),
};

const SUGGESTED_PROMPTS = [
  { text: 'Which products are running low on stock?', icon: Package },
  { text: 'Which products should I reorder today?', icon: ShoppingCart },
  { text: "What are today's total sales?", icon: TrendingUp },
  { text: 'Which products are selling the fastest?', icon: Receipt },
  { text: 'Which purchase orders are pending?', icon: Truck },
  { text: 'How do I calculate safety stock?', icon: HelpCircle },
];

const AIChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessageObj];
    setMessages(newHistory);
    setInputQuery('');
    setLoading(true);
    setErrorBanner(null);

    try {
      // Build conversation payload with user history
      const res = await api.post('/ai/chat', {
        message: textToSend,
        history: newHistory.map((m) => ({
          sender: m.sender,
          text: m.text,
        })),
      });

      if (res.success && res.data) {
        const aiMessageObj = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          toolsUsed: res.data.toolsUsed || [],
          sources: res.data.sources || [],
          timestamp: res.data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessageObj]);
      } else {
        throw new Error(res.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setErrorBanner(err.message || 'Could not connect to AI service. Please check your internet or retry.');
      const fallbackAiObj = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ I encountered an error while querying your supermarket database. Please click the Retry button below or ask your question again.',
        isError: true,
        retryText: textToSend,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAiObj]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetConversation = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setErrorBanner(null);
  };

  // Helper to get actionable link based on tools used
  const getActionLinks = (toolsUsed = [], messageText = '') => {
    const text = messageText.toLowerCase();
    const links = [];

    if (toolsUsed.includes('getLowStockProducts') || toolsUsed.includes('getReorderRecommendations') || text.includes('reorder')) {
      links.push({ label: '🛒 View Smart Reorders', path: '/reorder-suggestions' });
    }
    if (toolsUsed.includes('getProductStock') || text.includes('product') || text.includes('stock')) {
      links.push({ label: '📦 Open Products List', path: '/products' });
    }
    if (toolsUsed.includes('getSalesSummary') || text.includes('sales') || text.includes('bill')) {
      links.push({ label: '🧾 Open POS Billing', path: '/billing' });
    }
    if (toolsUsed.includes('getSuppliersAndOrders') || text.includes('supplier') || text.includes('vendor')) {
      links.push({ label: '🚚 Open Suppliers', path: '/suppliers' });
    }

    return links;
  };

  return (
    <div
      className={`fixed z-50 flex flex-col bg-white shadow-2xl border border-[#CDE9D6] transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'inset-2 sm:inset-6 md:inset-10 rounded-3xl'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[460px] md:w-[500px] h-[86vh] sm:h-[680px] max-h-[92vh] rounded-3xl'
      } overflow-hidden font-sans`}
      role="dialog"
      aria-label="StockSense AI Inventory Assistant"
    >
      {/* ===================================================================== */}
      {/* 1. CHAT HEADER */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-[#034D35] via-[#007A56] to-[#00966B] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md relative z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Robot Avatar */}
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-1 border border-white/20 shadow-inner flex-shrink-0">
            <img
              src="/stocksense-robot.png"
              alt="StockSense AI"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-[15px] sm:text-base leading-tight tracking-tight truncate">
                StockSense AI Assistant
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                Live DB
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium truncate mt-0.5">
              Supermarket Inventory & Sales Intelligence
            </p>
          </div>
        </div>

        {/* Window Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleResetConversation}
            className="p-1.5 rounded-xl hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            title="New Conversation"
            aria-label="New Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 rounded-xl hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer hidden sm:flex"
            title={isExpanded ? 'Restore window size' : 'Expand window'}
            aria-label={isExpanded ? 'Restore window size' : 'Expand window'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer ml-0.5"
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Notice Bar */}
      {errorBanner && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="truncate">{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-400 hover:text-rose-600 font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CHAT MESSAGES STREAM */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FAF9] scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const actionLinks = !isUser ? getActionLinks(msg.toolsUsed, msg.text) : [];

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-50 duration-200`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-[#E8F8EE] border border-[#BDE8CC] flex items-center justify-center text-[#00966B] flex-shrink-0 p-1 shadow-2xs mt-1">
                  <img
                    src="/stocksense-robot.png"
                    alt="Bot"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#00966B] text-white rounded-tr-xs shadow-[0_4px_14px_rgba(0,150,107,0.25)]'
                    : 'bg-white text-[#1E293B] border border-[#E2F0E7] rounded-tl-xs'
                }`}
              >
                {/* Message Body with Markdown */}
                <div className="prose prose-xs max-w-none text-inherit prose-headings:font-bold prose-headings:text-[#0F172A] prose-strong:text-[#0F172A] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[#047857]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Sources / Verified Live Data Badges */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3 h-3 text-[#00966B]" />
                      Verified Source:
                    </span>
                    {msg.sources.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-[#E8F8EE] text-[#007A56] text-[10.5px] font-semibold border border-[#CDE9D6]"
                      >
                        {src.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Shortcuts */}
                {actionLinks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {actionLinks.map((link, lIdx) => (
                      <button
                        key={lIdx}
                        onClick={() => {
                          onClose();
                          navigate(link.path);
                        }}
                        className="text-[11px] font-bold text-[#00966B] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BDE8CC] px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Retry action if message failed */}
                {msg.isError && msg.retryText && (
                  <div className="mt-2.5 pt-2 border-t border-rose-100">
                    <button
                      onClick={() => handleSend(msg.retryText)}
                      className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry Request</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start animate-in fade-in duration-150">
            <div className="w-7 h-7 rounded-xl bg-[#E8F8EE] border border-[#BDE8CC] flex items-center justify-center text-[#00966B] flex-shrink-0 p-1 mt-1">
              <img
                src="/stocksense-robot.png"
                alt="Bot"
                className="w-full h-full object-contain animate-bounce"
              />
            </div>
            <div className="bg-white border border-[#CDE9D6] rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2.5 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00966B] animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-[#00966B] animate-pulse delay-75" />
                <span className="w-2 h-2 rounded-full bg-[#00966B] animate-pulse delay-150" />
              </div>
              <span>Querying live supermarket database & RAG intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===================================================================== */}
      {/* 3. SUGGESTED QUICK PROMPT CHIPS */}
      {/* ===================================================================== */}
      <div className="p-2.5 bg-white border-t border-[#E8F3EC] flex-shrink-0">
        <p className="text-[10.5px] font-bold text-slate-400 mb-1.5 px-1 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#00966B]" />
          Suggested Questions
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt, pIdx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={pIdx}
                onClick={() => handleSend(prompt.text)}
                disabled={loading}
                className="whitespace-nowrap flex items-center gap-1.5 text-[11.5px] font-semibold text-[#007A56] bg-[#F0FDF4] hover:bg-[#E8F8EE] border border-[#CDE9D6] px-3 py-1.5 rounded-full transition-all cursor-pointer hover:border-[#00966B] hover:shadow-2xs disabled:opacity-50 flex-shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-[#00966B]" />
                <span>{prompt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. CHAT INPUT BAR */}
      {/* ===================================================================== */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E2F0E7] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#F8FAF9] border border-[#CDE9D6] rounded-2xl px-3 py-1.5 focus-within:border-[#00966B] focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about inventory, low stock, sales, suppliers..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden py-1.5"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2 rounded-xl bg-[#00966B] hover:bg-[#007A56] disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all cursor-pointer shadow-xs disabled:shadow-none flex-shrink-0"
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
          Grounded with Google Gemini & Live Supermarket Database. Enter to send.
        </p>
      </div>
    </div>
  );
};

export default AIChatWidget;
