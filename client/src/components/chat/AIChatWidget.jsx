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
  FileText,
  Download,
  CheckCircle2,
  History,
  CornerDownLeft,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { downloadPdfReport } from '../../services/reportDownloader';

// Suggested 6 core question cards for the welcome screen
const SUGGESTED_CARDS = [
  {
    title: 'Check My Inventory',
    subtitle: 'Get total SKUs, valuation & stock health',
    prompt: 'Give me a live inventory summary and stock health overview.',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Find Low-Stock Products',
    subtitle: 'Detect critical shortages & reorder needs',
    prompt: 'Which products are running low on stock?',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    title: "Analyze Today's Sales",
    subtitle: 'View daily revenue, bill count & payments',
    prompt: "What are today's total sales and completed bills?",
    icon: TrendingUp,
    color: 'text-[#00966B] bg-emerald-50 border-emerald-200',
  },
  {
    title: 'Generate Reorder Recommendations',
    subtitle: 'Smart supplier procurement packages',
    prompt: 'Which products should I reorder today?',
    icon: ShoppingCart,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    title: 'Explore Fast-Moving Products',
    subtitle: 'Top 5 high velocity items in last 30 days',
    prompt: 'Which products are selling the fastest?',
    icon: Receipt,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    title: 'Generate Inventory PDF Report',
    subtitle: 'Official StockSense branded PDF report',
    prompt: 'Analyze my inventory and generate a downloadable PDF report.',
    icon: FileText,
    color: 'text-[#00966B] bg-[#E8F8EE] border-[#BDE8CC]',
  },
];

// Contextual dynamic follow-up prompts shown below assistant responses
const DYNAMIC_FOLLOW_UPS = [
  { text: 'Which of these are critical?', icon: AlertCircle },
  { text: 'How much should I reorder?', icon: ShoppingCart },
  { text: 'Which supplier handles these?', icon: Truck },
  { text: 'Download this as PDF', icon: Download },
  { text: "Compare with yesterday's sales", icon: TrendingUp },
];

const AIChatWidget = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedQueries, setSavedQueries] = useState([
    "Which products are running low on stock?",
    "What are today's total sales?",
    "Which products should I reorder today?",
    "Analyze my inventory and generate a PDF report",
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [messages, isOpen, loading]);

  if (!isOpen) return null;

  const handleSend = async (customText = null) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || loading) return;

    // Add to saved history queries if unique
    if (!savedQueries.includes(textToSend)) {
      setSavedQueries((prev) => [textToSend, ...prev.slice(0, 9)]);
    }

    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessageObj];
    setMessages(newHistory);
    setInputQuery('');
    setLoading(true);
    setErrorBanner(null);
    setDownloadSuccessMessage(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Send message to AI endpoint
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
          reportData: res.data.reportData || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessageObj]);
      } else {
        throw new Error(res.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setErrorBanner(err.message || 'Could not connect to AI service. Please check your network or retry.');
      const fallbackAiObj = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ I encountered an error while querying your supermarket database. Please click the Retry button below or ask your question again.',
        isError: true,
        retryText: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleTextareaInput = (e) => {
    setInputQuery(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleResetConversation = () => {
    setMessages([]);
    setErrorBanner(null);
    setDownloadSuccessMessage(null);
  };

  // Direct Authenticated PDF Report Downloader
  const handleDownloadPdf = async (reportType = 'inventory') => {
    if (downloadingPdf) return;
    try {
      setDownloadingPdf(true);
      setErrorBanner(null);
      setDownloadSuccessMessage(null);

      const result = await downloadPdfReport(reportType);
      if (result.success) {
        setDownloadSuccessMessage(`PDF Downloaded: ${result.filename}`);
        setTimeout(() => setDownloadSuccessMessage(null), 6000);
      }
    } catch (error) {
      console.error('PDF download failed:', error);
      setErrorBanner(error.message || 'Failed to download PDF report. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Actionable links helper
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
          ? 'inset-2 sm:inset-6 md:inset-8 rounded-3xl'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[480px] md:w-[530px] h-[86vh] sm:h-[690px] max-h-[92vh] rounded-3xl'
      } overflow-hidden font-sans`}
      role="dialog"
      aria-label="StockSense AI Assistant"
    >
      {/* ===================================================================== */}
      {/* 1. HEADER (Section 1.A) */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-[#034D35] via-[#007A56] to-[#00966B] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md relative z-10 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* StockSense AI Assistant Icon */}
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-1 border border-white/20 shadow-inner flex-shrink-0">
            <img
              src="/stocksense-robot.png"
              alt="StockSense AI"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-[15px] sm:text-base leading-tight tracking-tight truncate text-white">
                StockSense AI Assistant
              </h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-300 animate-ping' : 'bg-emerald-300 animate-pulse'}`} />
                {loading ? 'Querying DB...' : 'Live DB'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 font-medium truncate mt-0.5">
              Your intelligent supermarket copilot
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleResetConversation}
            className="p-1.5 rounded-xl hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            title="New Chat"
            aria-label="New Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistoryModal((prev) => !prev)}
            className="p-1.5 rounded-xl hover:bg-white/15 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            title="Conversation History / Queries"
            aria-label="Conversation History"
          >
            <History className="w-4 h-4" />
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

      {/* History Dropdown Drawer */}
      {showHistoryModal && (
        <div className="bg-[#EBF7F0] border-b border-[#CDE9D6] p-3 text-xs text-slate-700 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#007A56] flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Recent Queries
            </span>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
            {savedQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setShowHistoryModal(false);
                  handleSend(sq);
                }}
                className="text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-slate-800 text-[11.5px] border border-[#D5EFE0] transition-colors truncate cursor-pointer flex items-center justify-between"
              >
                <span className="truncate">{sq}</span>
                <CornerDownLeft className="w-3 h-3 text-slate-400 flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Notice Bar */}
      {errorBanner && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="truncate">{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-400 hover:text-rose-600 font-bold ml-2 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Download Success Notice Bar */}
      {downloadSuccessMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 animate-in slide-in-from-top duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate font-semibold">{downloadSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. CHAT CONTENT AREA (Welcome Screen or Conversation Thread) */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FAF9] scrollbar-thin">
        {/* =================================================================== */}
        {/* WELCOME SCREEN & SUGGESTION CARDS (Section 1.B & 1.C) */}
        {/* Shown when no messages have been sent yet */}
        {/* =================================================================== */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-2 pb-4 animate-in fade-in-50 duration-300">
            {/* Robot Mascot Illustration */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#E8F8EE] to-[#CDE9D6] border-2 border-[#A7F3D0] p-2 flex items-center justify-center shadow-md mb-3">
              <img
                src="/stocksense-robot.png"
                alt="StockSense AI Mascot"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              Hi! Welcome to StockSense AI
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed font-normal">
              Ask me anything about your store inventory, sales, suppliers, and smart reorder recommendations.
            </p>

            {/* Responsive Grid of 6 Suggested Question Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
              {SUGGESTED_CARDS.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(card.prompt)}
                    disabled={loading}
                    className="p-3 rounded-2xl bg-white border border-[#E2F0E7] hover:border-[#00966B] hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-start gap-3 text-left group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${card.color} shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#00966B] transition-colors leading-tight">
                        {card.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* CONVERSATION THREAD (Section 1.D) */
          /* =================================================================== */
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const actionLinks = !isUser ? getActionLinks(msg.toolsUsed, msg.text) : [];
            const hasReport = !isUser && (msg.reportData || msg.text.toLowerCase().includes('pdf') || msg.text.toLowerCase().includes('report ready'));
            const isLatestAi = !isUser && index === messages.length - 1;

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
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#00966B] text-white rounded-tr-xs shadow-[0_4px_14px_rgba(0,150,107,0.25)]'
                      : 'bg-white text-[#1E293B] border border-[#E2F0E7] rounded-tl-xs'
                  }`}
                >
                  {/* Message Body with Markdown */}
                  <div className="prose prose-xs max-w-none text-inherit prose-headings:font-bold prose-headings:text-[#0F172A] prose-strong:text-[#0F172A] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[#047857] prose-table:border-collapse prose-th:border prose-th:border-slate-200 prose-th:p-1.5 prose-th:bg-slate-50 prose-td:border prose-td:border-slate-200 prose-td:p-1.5">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* PDF Download Card (Section 8) */}
                  {hasReport && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#F0FDF4] to-[#E8F8EE] border border-[#A7F3D0] rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#00966B] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-[#065F46] truncate">
                            {msg.reportData?.reportTitle || 'Supermarket Inventory Report (PDF)'}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            Official StockSense Report • ReportLab Python Engine
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadPdf(msg.reportData?.reportType || 'inventory')}
                        disabled={downloadingPdf}
                        className="px-3 py-1.5 bg-[#00966B] hover:bg-[#007A56] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{downloadingPdf ? 'Exporting...' : 'Download PDF'}</span>
                      </button>
                    </div>
                  )}

                  {/* Sources / Verified Live Data Badges */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-3 h-3 text-[#00966B]" />
                        Source:
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

                  {/* Timestamp & Retry */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{msg.timestamp}</span>
                    {msg.isError && msg.retryText && (
                      <button
                        onClick={() => handleSend(msg.retryText)}
                        className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  {/* Dynamic Follow-Up Prompt Chips for latest assistant message (Section 7) */}
                  {isLatestAi && !loading && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#00966B]" />
                        Suggested Follow-Ups:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {DYNAMIC_FOLLOW_UPS.map((df, dfIdx) => {
                          const DfIcon = df.icon;
                          return (
                            <button
                              key={dfIdx}
                              onClick={() => handleSend(df.text)}
                              className="text-[11px] font-semibold text-[#007A56] bg-[#F0FDF4] hover:bg-[#E8F8EE] border border-[#CDE9D6] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <DfIcon className="w-3 h-3 text-[#00966B]" />
                              <span>{df.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator (Section 9) */}
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
              <span>Analyzing live database with Python math & Gemini RAG...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===================================================================== */}
      {/* 3. MESSAGE COMPOSER (Section 1.E) */}
      {/* ===================================================================== */}
      <div className="p-3 sm:p-4 bg-white border-t border-[#E2F0E7] flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2 bg-[#F8FAF9] border border-[#CDE9D6] rounded-2xl p-1.5 focus-within:border-[#00966B] focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputQuery}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock, sales, suppliers, or reorder recommendations..."
            disabled={loading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden py-1.5 px-2 resize-none max-h-28 overflow-y-auto leading-normal"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-[#00966B] to-[#007A56] hover:opacity-90 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all cursor-pointer shadow-xs disabled:shadow-none flex-shrink-0 mb-0.5"
            title="Send Message (Enter)"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-2 font-medium px-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00966B]" />
            Grounded PostgreSQL & Python Analytics Engine
          </span>
          <button
            onClick={() => handleDownloadPdf('inventory')}
            className="text-[#00966B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            Export PDF Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
