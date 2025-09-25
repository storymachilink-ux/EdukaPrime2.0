import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Dashboard as DashboardSection } from '../components/dashboard/sections/Dashboard';
import { Atividades } from '../components/dashboard/sections/Atividades';
import { Videos } from '../components/dashboard/sections/Videos';
import { BonusSection } from '../components/dashboard/sections/Bonus';
import { Suporte } from '../components/dashboard/sections/Suporte';
import { Perfil } from '../components/dashboard/sections/Perfil';
import { Config } from '../components/dashboard/sections/Config';

export const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'atividades':
        return <Atividades />;
      case 'videos':
        return <Videos />;
      case 'bonus':
        return <BonusSection />;
      case 'suporte':
        return <Suporte />;
      case 'perfil':
        return <Perfil />;
      case 'config':
        return <Config />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F5] dark:bg-[#0F0F0F] flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col md:ml-0">
        <DashboardHeader />
        
        <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};