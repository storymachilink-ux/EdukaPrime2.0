import React, { useState } from 'react';
import { BookOpen, Play, Gift, HelpCircle, Crown, User, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePermissions } from '../../hooks/usePermissions';
import { useAdminPlan } from '../../hooks/useAdminPlan';
import { AttractiveUpgradeModal } from '../ui/AttractiveUpgradeModal';

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeSection,
  onSectionChange
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const { permissions } = usePermissions();
  const { isAdmin } = useAdminPlan();

  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'atividades', label: 'Atividades', icon: BookOpen },
    { id: 'videos', label: 'Vídeos', icon: Play },
    { id: 'bonus', label: 'Bônus', icon: Gift },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'suporte-vip', label: 'VIP', icon: Crown },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'config', label: 'Config', icon: Settings }
  ];

  const adminMenuItem = { id: 'admin', label: 'Admin', icon: ShieldCheck };

  const menuItems = isAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems;

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
    } else {
      setModalFeature(feature);
      setModalTitle(title);
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      {/* Bottom Navigation with Glass Effect */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-bottom-nav">
        <div className="relative">
          {/* Glass overlay for enhanced blur effect */}
          <div className="absolute inset-0 glass-overlay" />

          {/* Navigation content */}
          <div className="relative px-2 py-3 safe-area-bottom">
            <div className={`grid gap-1 max-w-7xl mx-auto ${
              isAdmin
                ? 'grid-cols-4 md:grid-cols-9' // 9 items when admin
                : 'grid-cols-4 md:grid-cols-8' // 8 items normally
            }`}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 md:p-3 rounded-xl transition-all duration-300 min-w-0 touch-manipulation group relative overflow-hidden',
                    // Admin Styling
                    item.id === 'admin'
                      ? activeSection === item.id
                        ? 'text-white bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-lg shadow-red-500/30 scale-105'
                        : 'text-red-600 hover:text-red-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:shadow-md'
                    // VIP Styling
                    : item.id === 'suporte-vip'
                      ? activeSection === item.id
                        ? 'text-white bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 scale-105'
                        : 'text-yellow-600 hover:text-yellow-700 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-yellow-100 hover:shadow-md'
                      // Regular Styling
                      : activeSection === item.id
                        ? 'text-[#033258] bg-gradient-to-br from-[#FFE3A0] via-[#FFF3D6] to-[#FFEBAA] shadow-lg shadow-[#FFE3A0]/30 scale-105 border border-[#FFE3A0]'
                        : 'text-[#476178] hover:text-[#033258] hover:bg-gradient-to-br hover:from-white/60 hover:to-[#FFF3D6]/60 hover:shadow-md hover:scale-102'
                  )}
                >
                  {/* Background glow effect for active items */}
                  {activeSection === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent rounded-xl opacity-60" />
                  )}

                  {/* Icon */}
                  <item.icon
                    className={cn(
                      'w-5 h-5 md:w-6 md:h-6 mb-1 flex-shrink-0 transition-transform duration-200',
                      activeSection === item.id && 'drop-shadow-sm'
                    )}
                    strokeWidth={activeSection === item.id ? 2.5 : 2}
                  />

                  {/* Label */}
                  <span className={cn(
                    'text-xs md:text-sm font-medium truncate leading-tight transition-all duration-200',
                    activeSection === item.id && 'font-semibold drop-shadow-sm'
                  )}>
                    {item.label}
                  </span>

                  {/* Special badges */}
                  {item.id === 'suporte-vip' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-sm animate-pulse" />
                  )}
                  {item.id === 'admin' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-sm animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
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