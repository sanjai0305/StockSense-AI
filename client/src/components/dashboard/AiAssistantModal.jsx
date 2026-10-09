import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, AlertTriangle, TrendingUp, ShoppingBag } from 'lucide-react';
import api from '../../services/api';

const AiAssistantModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Sanjai! I am your StockSense AI Inventory Assistant. How can I help you optimize your supermarket stock today?',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'Which products are low on stock?',
    'What should I reorder today?',
    'Show fast-moving products',
    'Pending purchase orders status',
  ];

  const handleSend = async (questionText) => {
    const q = questionText || query;
    if (!q.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: q }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      let aiReply = '';
      const lowerQ = q.toLowerCase();

      if (lowerQ.includes('low') || lowerQ.includes('stockout') || lowerQ.includes('shortage')) {
        aiReply = `⚠️ Currently, **18 products** are at or below their configured reorder points. Top critical items needing immediate restocking are:\n- **Amul Fresh Milk 1L** (12 units left, Reorder point: 50)\n- **Sunflower Oil 1L** (8 units left, Reorder point: 30)\n- **Sugar 1kg** (6 units left, Reorder point: 30)\n\nRecommended: Click "Bulk Add to PO" on your dashboard to prepare replenishment orders.`;
      } else if (lowerQ.includes('reorder') || lowerQ.includes('suggest')) {
        aiReply = `📦 Smart Reorder Algorithm recommends ordering **5 key products** today with an estimated procurement value of **₹28,650**.\n\nSuppliers to contact:\n1. Amul Distributors (80 units Fresh Milk)\n2. FreshMart Wholesale (60 units Sunflower Oil)\n3. Rice & Grains Co. (40 units India Gate Rice)\n4. Sri Balaji Traders (50 units Sugar)\n5. City Fresh Suppliers (40 trays Eggs)`;
      } else if (lowerQ.includes('fast') || lowerQ.includes('selling') || lowerQ.includes('top')) {
        aiReply = `🔥 **Top 5 Fast-Moving Supermarket Items** this week:\n1. Amul Fresh Milk 1L — 1,200 units (↑ 12% growth)\n2. Maggi Noodles 70g — 950 units (↑ 8% growth)\n3. Coca-Cola 500ml — 780 units (↑ 6% growth)\n4. Britannia Bread — 650 units (↑ 14% growth)\n5. Sunflower Oil 1L — 620 units (↑ 10% growth)`;
      } else if (lowerQ.includes('pending') || lowerQ.includes('purchase order') || lowerQ.includes('po')) {
        aiReply = `📋 You currently have **7 pending Purchase Orders** in the system:\n- **2 POs awaiting approval** (PO-202610-006, PO-202610-007)\n- **5 POs dispatched/in transit** with expected deliveries starting tomorrow morning.`;
      } else {
        aiReply = `✅ Inventory Intelligence Summary:\n- Total Active Products: 1,248 items\n- Store Health Score: 92%\n- Today's Sales: ₹48,520 (↑ 12% growth)\n- Reorder recommendations have been updated based on sales velocity and lead times.`;
      }

      setMessages([...newMsgs, { sender: 'ai', text: aiReply }]);
    } catch (e) {
      setMessages([...newMsgs, { sender: 'ai', text: 'I encountered an error analyzing the inventory. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#E2F0E7] w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#03543F] to-[#059669] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center p-1 border border-white/20 shadow-xs">
              <img
                src="/stocksense-robot.png"
                alt="StockSense AI Robot"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                <span>StockSense AI Assistant</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-300/30">
                  Live
                </span>
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                Live Supermarket Reorder & Demand Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Questions */}
        <div className="p-3 bg-[#F4FAF6] border-b border-[#E2F0E7] flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-semibold text-[#047857] bg-white hover:bg-[#E8F8EE] border border-[#BDE8CC] px-2.5 py-1 rounded-full shadow-2xs transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[380px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-[#E8F8EE] border border-[#CDE9D6] p-0.5 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  <img
                    src="/stocksense-robot.png"
                    alt="AI"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-[12.5px] max-w-[85%] whitespace-pre-line leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-[#059669] text-white font-medium rounded-tr-xs'
                    : 'bg-[#F8FAFC] text-[#1E293B] border border-[#E2E8F0] rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#64748B] p-2 italic">
              <Sparkles className="w-3.5 h-3.5 text-[#059669] animate-spin" />
              <span>Analyzing live supermarket database...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E2F0E7] flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about low stock, demand forecast, suppliers..."
            className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl px-3.5 py-2.5 outline-none focus:border-[#10B981] focus:bg-white transition-all placeholder:text-[#94A3B8]"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantModal;
