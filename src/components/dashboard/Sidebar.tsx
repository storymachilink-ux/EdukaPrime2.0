import React from 'react';
import { BookOpen, Play, Gift, HelpCircle, User, Settings, Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileToggle
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'atividades', label: 'Atividades', icon: BookOpen },
    { id: 'videos', label: 'Vídeos', icon: Play },
    { id: 'bonus', label: 'Bônus', icon: Gift },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'config', label: 'Configurações', icon: Settings }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
          EdukaPrime
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onSectionChange(item.id);
              if (window.innerWidth < 768) onMobileToggle();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-full',
              activeSection === item.id
                ? 'bg-[#F7D7D2] dark:bg-[#2A1F1D] text-[#1F1F1F] dark:text-[#F5F5F5]'
                : 'text-[#5C5C5C] dark:text-[#A3A3A3] hover:bg-[#F2E9E6] dark:hover:bg-[#252119] hover:text-[#1F1F1F] dark:hover:text-[#F5F5F5]'
            )}
          >
            <item.icon className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onMobileToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-[#1A1A1A] rounded-[12px] shadow-md"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-[#1F1F1F] dark:text-[#F5F5F5]" />
        ) : (
          <Menu className="w-6 h-6 text-[#1F1F1F] dark:text-[#F5F5F5]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1A1A1A] border-r border-[#E9DCD7] dark:border-[#2A2A2A] transition-transform duration-300',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <SidebarContent />
      </aside>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1A1A1A] border-t border-[#E9DCD7] dark:border-[#2A2A2A] px-4 py-2">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center p-2 rounded-[12px] transition-colors',
                activeSection === item.id
                  ? 'text-[#1F1F1F] dark:text-[#F5F5F5]'
                  : 'text-[#5C5C5C] dark:text-[#A3A3A3]'
              )}
            >
              <item.icon className="w-5 h-5 mb-1" strokeWidth={2} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};