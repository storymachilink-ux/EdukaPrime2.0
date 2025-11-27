import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  Gift,
  Bell,
  Shield,
  LogOut,
  ArrowLeft,
  Ticket,
  MessageCircle,
  Bot,
  Image,
  Layers
} from 'lucide-react';

export function AdminSidebar() {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin' },
    { icon: Layers, label: 'Gerenciar Planos', path: '/admin/planos' },
    { icon: Users, label: 'Usuários', path: '/admin/usuarios' },
    { icon: BookOpen, label: 'Atividades', path: '/admin/atividades' },
    { icon: Video, label: 'Vídeos', path: '/admin/videos' },
    { icon: Gift, label: 'Bônus', path: '/admin/bonus' },
    { icon: Bell, label: 'Notificações', path: '/admin/notificacoes' },
    { icon: MessageCircle, label: 'Chat', path: '/admin/chat' },
    { icon: Bot, label: 'Avatar Pop-up', path: '/admin/avatar-popup' },
    { icon: Image, label: 'Área Banners', path: '/admin/area-banners' },
    { icon: Ticket, label: 'Tickets', path: '/admin/tickets' },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white min-h-screen flex flex-col">
      {/* Logo + Badge Admin */}
      <div className="p-6 border-b border-purple-700">
        <img src="/logohorizontal.webp" alt="EdukaPrime" className="h-8 mb-3 brightness-0 invert" />
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-semibold text-purple-200">Painel Admin</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-purple-700 text-white font-semibold'
                  : 'text-purple-200 hover:bg-purple-700/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Voltar para Dashboard */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg mt-4 text-purple-200 hover:bg-purple-700/50 transition-all border border-purple-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar ao Site</span>
        </NavLink>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-purple-700">
        <div className="mb-4">
          <p className="text-sm font-semibold">
            {profile?.nome || 'Admin'}
          </p>
          <p className="text-xs text-purple-300">
            Administrador
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sair</span>
        </button>
      </div>
    </aside>
  );
}
