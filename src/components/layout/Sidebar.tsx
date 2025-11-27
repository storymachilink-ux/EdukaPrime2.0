import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Gift,
  MessageCircle,
  Settings,
  LogOut,
  Shield,
  Crown,
  Users,
  Award
} from 'lucide-react';
import { NotificationBell } from '../ui/NotificationBell';
import { UserAvatar } from '../ui/UserAvatar';

export function Sidebar() {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Atividades', path: '/atividades' },
    { icon: Video, label: 'Vídeos', path: '/videos' },
    { icon: Gift, label: 'Bônus', path: '/bonus' },
    { icon: Users, label: 'Comunidade', path: '/ranking' },
    { icon: Award, label: 'Conquistas', path: '/conquistas' },
    { icon: Crown, label: 'Planos', path: '/planos' },
    { icon: MessageCircle, label: 'Suporte', path: '/suporte' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="hidden md:flex w-64 bg-white/70 backdrop-blur-xl border-r-2 border-yellow-200/30 min-h-screen flex-col shadow-lg">
      {/* Logo + Notificações */}
      <div className="p-6 border-b-2 border-yellow-200/20 flex items-center justify-between">
        <img src="/logohorizontal.webp" alt="EdukaPrime" className="h-8" />
        <NotificationBell />
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const isComunidade = item.path === '/ranking';

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all border-2 relative ${
                  isComunidade
                    ? isActive
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold border-green-300/50 shadow-md'
                      : 'bg-gradient-to-r from-green-50/50 to-emerald-50/50 text-green-600 font-semibold border-green-200/40 hover:border-green-300/60 hover:shadow-sm'
                    : isActive
                    ? 'bg-orange-50/80 backdrop-blur-sm text-orange-600 font-semibold border-orange-200/50 shadow-md'
                    : 'text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm border-transparent hover:border-yellow-200/30'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isComunidade && (
                <span className="ml-auto flex items-center justify-center w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </NavLink>
          );
        })}

        {/* Link Admin (apenas para admins) */}
        {profile?.is_admin && (
          <>
            <div className="my-4 border-t-2 border-yellow-200/30"></div>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all border-2 ${
                  isActive
                    ? 'bg-purple-50/80 backdrop-blur-sm text-purple-600 font-semibold border-purple-200/50 shadow-md'
                    : 'text-purple-600 border-purple-200/50 hover:bg-purple-50/50 hover:backdrop-blur-sm hover:border-purple-300/60'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              <span>Área Admin</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t-2 border-yellow-200/30">
        <div className="mb-4 p-3 rounded-xl bg-white/50 backdrop-blur-sm border-2 border-yellow-200/20 flex items-center gap-3">
          <UserAvatar
            avatarUrl={profile?.avatar_url}
            userName={profile?.nome || 'Usuário'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profile?.nome || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.active_plan_id === 0 && 'Gratuito'}
              {profile?.active_plan_id === 1 && 'Plano Essencial'}
              {profile?.active_plan_id === 2 && 'Plano Evoluir'}
              {profile?.active_plan_id === 3 && 'Plano Prime'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50/80 hover:backdrop-blur-sm rounded-xl transition-all border-2 border-transparent hover:border-red-200/50 hover:shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}