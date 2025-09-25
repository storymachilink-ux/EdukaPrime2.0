import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

export const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <header className="bg-white dark:bg-[#1A1A1A] border-b border-[#E9DCD7] dark:border-[#2A2A2A] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 md:hidden">
          <h1 className="text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
            EdukaPrime
          </h1>
        </div>
        
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={toggle}
            className="p-2 text-[#5C5C5C] dark:text-[#A3A3A3] hover:text-[#1F1F1F] dark:hover:text-[#F5F5F5] transition-colors"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <button className="p-2 text-[#5C5C5C] dark:text-[#A3A3A3] hover:text-[#1F1F1F] dark:hover:text-[#F5F5F5] transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">
                {user?.name}
              </p>
              <p className="text-xs text-[#5C5C5C] dark:text-[#A3A3A3] capitalize">
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