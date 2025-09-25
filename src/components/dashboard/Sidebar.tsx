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
        <img
          src="/logohorizontal.png"
          alt="EdukaPrime"
          className="h-8 w-auto"
        />
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
              'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-xl',
              activeSection === item.id
                ? 'bg-[#FFF3D6] text-[#033258] shadow-md'
                : 'text-[#033258] hover:bg-[#FFF3D6] hover:text-[#033258] focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus:outline-none'
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-lg border border-[#FFE3A0] rounded-xl shadow-lg"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-[#033258]" />
        ) : (
          <Menu className="w-6 h-6 text-[#033258]" />
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
        'fixed md:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-[#FFF9E8] to-[#FFF3D6] border-r border-[#FFE3A0] shadow-lg transition-transform duration-300',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <SidebarContent />
      </aside>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#FFF9E8] to-[#FFF3D6] border-t border-[#FFE3A0] px-4 py-2 shadow-lg">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl transition-all duration-200',
                activeSection === item.id
                  ? 'text-[#033258] bg-[#FFE3A0]'
                  : 'text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6]'
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