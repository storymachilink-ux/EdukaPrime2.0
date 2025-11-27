import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Gift,
  Menu,
  X,
  MessageCircle,
  Settings,
  LogOut,
  Shield,
  Crown,
  Users,
  Award
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileBottomNav() {
  const { signOut, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Verificar se é a primeira visita
  useEffect(() => {
    const hasSeenMoreMenu = localStorage.getItem('hasSeenMoreMenu');
    if (!hasSeenMoreMenu) {
      setShowAlert(true);
    }
  }, []);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
    if (showAlert) {
      setShowAlert(false);
      localStorage.setItem('hasSeenMoreMenu', 'true');
    }
  };

  const mainItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard', color: 'text-orange-500', bgActive: 'bg-orange-50', borderActive: 'border-orange-200' },
    { icon: BookOpen, label: 'Atividades', path: '/atividades', color: 'text-green-600', bgActive: 'bg-green-50', borderActive: 'border-green-200' },
    { icon: Video, label: 'Vídeos', path: '/videos', color: 'text-blue-600', bgActive: 'bg-blue-50', borderActive: 'border-blue-200' },
    { icon: Gift, label: 'Bônus', path: '/bonus', color: 'text-purple-600', bgActive: 'bg-purple-50', borderActive: 'border-purple-200' },
  ];

  const moreItems = [
    { icon: Users, label: 'Comunidade', path: '/ranking' },
    { icon: Award, label: 'Conquistas', path: '/conquistas' },
    { icon: Crown, label: 'Planos', path: '/planos' },
    { icon: MessageCircle, label: 'Suporte', path: '/suporte' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    await signOut();
    setMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop quando menu está aberto */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu "Mais" */}
      {menuOpen && (
        <div className="fixed bottom-20 right-4 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 md:hidden min-w-[220px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <span className="font-bold text-gray-900">Menu</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Link Admin (apenas para admins) */}
            {profile?.is_admin && (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-md transition-all text-purple-600 bg-purple-50 border-2 border-purple-200 font-medium"
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Área Admin</span>
                </NavLink>
                <div className="border-t border-gray-200 my-3"></div>
              </>
            )}

            {moreItems.map((item) => {
              const isComunidade = item.path === '/ranking';

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border-2 relative ${
                    isComunidade
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-semibold border-green-300/50 hover:shadow-md'
                      : 'border-transparent hover:bg-gray-50 hover:shadow-sm hover:border-gray-200'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isComunidade ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${isComunidade ? 'text-green-700' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                  {isComunidade && (
                    <span className="ml-auto flex items-center justify-center w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </NavLink>
              );
            })}

            <div className="border-t border-gray-200 my-3"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-md transition-all text-red-600 bg-red-50 border-2 border-red-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Navegação Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t-2 border-yellow-200/40 shadow-lg z-30 md:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all border-2 ${
                  isActive
                    ? `${item.bgActive} ${item.color} font-semibold ${item.borderActive} shadow-sm`
                    : `${item.color} border-transparent hover:bg-gray-50`
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* Botão Menu */}
          <button
            onClick={handleMenuToggle}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all border-2 ${
              menuOpen
                ? 'bg-gray-100 text-gray-900 font-semibold border-gray-300 shadow-sm'
                : 'text-gray-600 border-transparent hover:bg-gray-50'
            }`}
          >
            {showAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
            )}
            <Menu className="w-5 h-5" />
            <span className="text-xs font-medium">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
