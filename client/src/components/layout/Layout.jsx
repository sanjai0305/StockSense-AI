import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import AIChatWidget from '../chat/AIChatWidget';
import FloatingAIAssistant from './FloatingAIAssistant';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex flex-col antialiased text-[#1E293B] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenAiAssistant={() => setAiChatOpen(true)}
      />

      {/* Main Content Area (Fluid width, expanding dynamically with sidebar state) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}
      >
        {/* Mobile Navigation Toggle (Visible only on mobile/tablet) */}
        <div className="lg:hidden p-3 pb-0 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#CDE9D6] text-[#00966B] shadow-2xs hover:bg-[#E8F8EE] flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4 stroke-[2.2]" />
            <span>Menu</span>
          </button>
        </div>

        {/* Dynamic Page Workspace - Fills Full Available Width */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 w-full min-w-0">
          <Outlet context={{ onOpenAiAssistant: () => setAiChatOpen(true) }} />
        </main>
      </div>

      {/* Floating 3D AI Robot Assistant Mascot */}
      {!aiChatOpen && <FloatingAIAssistant onOpenAssistant={() => setAiChatOpen(true)} />}

      {/* Global Production AI Chatbot Widget */}
      <AIChatWidget isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </div>
  );
};

export default Layout;


