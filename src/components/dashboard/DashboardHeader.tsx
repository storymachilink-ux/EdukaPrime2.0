import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

export const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#FFE3A0] p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 md:hidden">
          <img
            src="/logohorizontal.png"
            alt="EdukaPrime"
            className="h-6 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={toggle}
            className="p-2 text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6] rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24]"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button className="p-2 text-[#476178] hover:text-[#033258] hover:bg-[#FFF3D6] rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24]">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#033258]">
                {user?.name}
              </p>
              <p className="text-xs text-[#476178] capitalize">
                Plano {user?.plan?.replace('-', ' ')}
              </p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};