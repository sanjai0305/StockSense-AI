import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AiAssistantModal from '../dashboard/AiAssistantModal';
import FloatingAIAssistant from './FloatingAIAssistant';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4FAF6] flex flex-col antialiased text-[#1E293B] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area (Fluid width, expanding dynamically with sidebar state) */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[240px]'
        }`}
      >
        {/* Top Header */}
        <Header onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Dynamic Page Workspace - Fills Full Available Width */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 w-full min-w-0">
          <Outlet context={{ onOpenAiAssistant: () => setAiModalOpen(true) }} />
        </main>
      </div>

      {/* Floating 3D AI Robot Assistant */}
      <FloatingAIAssistant onOpenAssistant={() => setAiModalOpen(true)} />

      {/* AI Assistant Modal */}
      <AiAssistantModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
};

export default Layout;


