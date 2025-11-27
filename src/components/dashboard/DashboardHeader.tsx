import React, { useState, useEffect } from 'react';
import { Bell, LogOut, ChevronDown, Crown, X, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useAdminPlan } from '../../hooks/useAdminPlan';
import { useNotifications } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';
import { useNavigation } from '../../contexts/NavigationContext';
import { Button } from '../ui/button';
import { NotificationsModal } from '../ui/NotificationsModal';

export const DashboardHeader: React.FC = () => {
  const { user, signOut, profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleLogout = () => {
    signOut()
  }

  // Listen for avatar updates
  useEffect(() => {
    // Load saved avatar on mount
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }

    // Listen for avatar update events
    const handleAvatarUpdate = (event: CustomEvent) => {
      setAvatarUrl(event.detail.avatarUrl);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);
  const { isDark, toggle } = useTheme();
  const { isAdmin, effectivePlan, setSimulatedPlan, isSimulating } = useAdminPlan();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { currentPlan } = usePermissions();
  const { navigateToConfig } = useNavigation();
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const planOptions = [
    { key: 'demo', name: 'Demo/Gratuito (Bloqueado)' },
    { key: 'essencial', name: 'Plano Essencial' },
    { key: 'evoluir', name: 'Plano Evoluir' },
    { key: 'prime', name: 'Plano Prime' },
    { key: 'admin', name: 'Admin (Todas as funcoes)' }
  ];

  const handlePlanChange = (planKey: string) => {
    setSimulatedPlan(planKey);
    setShowPlanDropdown(false);
  };

  const getCurrentPlanName = () => {
    const plan = planOptions.find(p => p.key === effectivePlan);
    return plan?.name || 'Demo/Gratuito (Bloqueado)';
  };

  // Show upgrade button for users who are not on Prime plan (except admins when not simulating)
  const showUpgradeButton = !isAdmin && currentPlan !== 'prime';

  const handleUpgradeClick = () => {
    navigateToConfig();
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#FFE3A0] px-3 sm:px-4 py-3 sm:py-4 shadow-lg fixed top-0 left-0 right-0 z-50 md:relative md:z-auto">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 md:hidden min-w-0">
          <img
            src="/logohorizontal.webp"
            alt="EdukaPrime"
            className="h-5 sm:h-6 w-auto flex-shrink-0"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 ml-auto min-w-0">
          <button
            onClick={toggle}
            className="p-1.5 sm:p-2 text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6] rounded-lg sm:rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] touch-manipulation"
          >
            <span className="text-base sm:text-lg">{isDark ? '☀️' : '🌙'}</span>
          </button>

          <button
            onClick={() => setShowNotificationsModal(true)}
            className="relative p-1.5 sm:p-2 text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6] rounded-lg sm:rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] touch-manipulation"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Upgrade Button */}
          {showUpgradeButton && (
            <button
              onClick={handleUpgradeClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-sm font-medium touch-manipulation"
              title="Fazer upgrade do plano"
            >
              <Zap className="w-4 h-4" />
              <span>Upgrade</span>
            </button>
          )}

          {/* Admin Plan Simulation Dropdown */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowPlanDropdown(!showPlanDropdown)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300 text-yellow-800 rounded-lg sm:rounded-xl hover:from-yellow-200 hover:to-yellow-300 transition-all duration-200 text-xs sm:text-sm font-medium touch-manipulation"
              >
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Simular Plano</span>
                <span className="sm:hidden">Plano</span>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              </button>

              {showPlanDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowPlanDropdown(false)}
                  />

                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 sm:w-56 bg-white border border-[#FFE3A0] rounded-xl shadow-xl z-20 py-2 max-w-[calc(100vw-2rem)] mr-4 sm:mr-0">
                    <div className="px-3 py-2 border-b border-[#FFE3A0]">
                      <p className="text-xs font-medium text-[#624044] uppercase tracking-wide">
                        Simular Plano
                      </p>
                      <p className="text-sm text-[#476178]">
                        Atual: {getCurrentPlanName()}
                        {isSimulating && <span className="text-yellow-600"> (Simulado)</span>}
                      </p>
                    </div>

                    {planOptions.map((plan) => (
                      <button
                        key={plan.key}
                        onClick={() => handlePlanChange(plan.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#FFF9E8] transition-colors ${
                          effectivePlan === plan.key ? 'bg-[#FFF3D6] text-[#033258]' : 'text-[#624044]'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          plan.key === 'demo' ? 'bg-red-400' :
                          plan.key === 'essencial' ? 'bg-gray-400' :
                          plan.key === 'evoluir' ? 'bg-blue-400' :
                          plan.key === 'prime' ? 'bg-yellow-400' :
                          'bg-purple-400'
                        }`} />
                        <span className="text-sm">{plan.name}</span>
                        {effectivePlan === plan.key && (
                          <Crown className="w-3 h-3 text-yellow-600 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src={avatarUrl || profile?.avatar_url || '/icon.webp'}
              alt={profile?.nome || user?.email}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="text-sm font-medium text-[#033258] truncate">
                {profile?.nome || user?.email?.split('@')[0]}
              </p>
              <p className={`text-xs capitalize flex items-center gap-1 truncate ${isSimulating ? 'text-yellow-600' : 'text-[#476178]'}`}>
                {isSimulating && <Crown className="w-3 h-3 flex-shrink-0" />}
                <span className="truncate">{getCurrentPlanName()}</span>
                {isSimulating && <span className="text-xs flex-shrink-0">(Sim.)</span>}
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="p-1.5 sm:p-2 touch-manipulation">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </header>
  );
};