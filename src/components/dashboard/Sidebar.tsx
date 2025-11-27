import React, { useState } from 'react';
import { BookOpen, Play, Gift, HelpCircle, Crown, User, Settings, Menu, X, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePermissions } from '../../hooks/usePermissions';
import { AttractiveUpgradeModal } from '../ui/AttractiveUpgradeModal';

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const { permissions } = usePermissions();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'atividades', label: 'Atividades', icon: BookOpen },
    { id: 'videos', label: 'Vídeos', icon: Play },
    { id: 'bonus', label: 'Bônus', icon: Gift },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'suporte-vip', label: 'Suporte VIP', icon: Crown },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'config', label: 'Configurações', icon: Settings }
  ];

  const handleMenuClick = (itemId: string) => {
    // Check permissions before allowing navigation
    let hasAccess = true;
    let feature = '';
    let title = '';

    switch (itemId) {
      case 'videos':
        hasAccess = permissions.canAccessVideos;
        feature = 'videos';
        title = 'Upgrade para acessar Vídeos';
        break;
      case 'bonus':
        hasAccess = permissions.canAccessBonus;
        feature = 'bonus';
        title = 'Upgrade para acessar Bônus';
        break;
      case 'suporte-vip':
        hasAccess = permissions.canAccessVipSupport;
        feature = 'vipSupport';
        title = 'Upgrade para acessar Suporte VIP';
        break;
      default:
        hasAccess = true; // Dashboard, Atividades, Suporte, Perfil, Config are always accessible
    }

    if (hasAccess) {
      onSectionChange(itemId);
      if (window.innerWidth < 768) onMobileToggle();
    } else {
      setModalFeature(feature);
      setModalTitle(title);
      setShowUpgradeModal(true);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 md:p-6">
        <img
          src="/logohorizontal.webp"
          alt="EdukaPrime"
          className="h-8 w-auto"
        />
      </div>

      <nav className="flex-1 px-3 md:px-4 space-y-1 md:space-y-2 pb-4 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 md:py-3 text-left transition-all duration-200 rounded-xl text-sm md:text-base touch-manipulation',
              item.id === 'suporte-vip'
                ? activeSection === item.id
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-md border border-yellow-300'
                  : 'text-yellow-600 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 hover:text-yellow-700 focus-visible:ring-2 focus-visible:ring-yellow-400 focus:outline-none border border-yellow-200'
                : activeSection === item.id
                  ? 'bg-[#FFF3D6] text-[#033258] shadow-md'
                  : 'text-[#033258] hover:bg-[#FFF3D6] hover:text-[#033258] focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus:outline-none'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            <span className="font-medium truncate">{item.label}</span>
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
        className="md:hidden fixed top-20 left-4 z-[55] p-3 bg-white/90 backdrop-blur-lg border border-[#FFE3A0] rounded-xl shadow-lg hover:bg-white/95 transition-all duration-200 touch-manipulation"
        aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-[#033258]" strokeWidth={2} />
        ) : (
          <Menu className="w-6 h-6 text-[#033258]" strokeWidth={2} />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm"
          onClick={onMobileToggle}
          aria-label="Fechar menu"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed md:static top-16 md:top-0 bottom-16 md:bottom-0 left-0 z-[40] w-72 md:w-64 bg-gradient-to-b from-[#FFF9E8] to-[#FFF3D6] border-r border-[#FFE3A0] shadow-lg transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <SidebarContent />
      </aside>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#FFF9E8] to-[#FFF3D6] border-t border-[#FFE3A0] px-2 py-3 shadow-lg safe-area-bottom">
        <div className="flex justify-around items-center">
          {menuItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                'flex flex-col items-center p-2 rounded-xl transition-all duration-200 min-w-0 touch-manipulation',
                item.id === 'suporte-vip'
                  ? activeSection === item.id
                    ? 'text-yellow-800 bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300'
                    : 'text-yellow-600 hover:text-yellow-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100'
                  : activeSection === item.id
                    ? 'text-[#033258] bg-[#FFE3A0]'
                    : 'text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6]'
              )}
            >
              <item.icon className="w-5 h-5 mb-1 flex-shrink-0" strokeWidth={2} />
              <span className="text-xs font-medium truncate leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      <AttractiveUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
};