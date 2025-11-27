import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { trackPageView } from './lib/tiktokTracker';
import { Hero } from './components/sections/Hero';
import { Diferenciais } from './components/sections/Diferenciais';
import { Educadores } from './components/sections/Educadores';
import { Planos } from './components/sections/Planos';
import { FAQ } from './components/sections/FAQ';
import { Footer } from './components/layout/Footer';
import { AdminRoute } from './components/layout/AdminRoute';
import Login from './pages/Login';
import LoginPaper from './pages/LoginPaper';
import PaperDashboard from './pages/PaperDashboard';
import Natal from './pages/Natal';
import Noel from './pages/Noel';
import LoginNatal from './pages/LoginNatal';
import NatalDashboard from './pages/NatalDashboard';
import Upuniverso from './pages/Upuniverso';
import Dashboard from './pages/Dashboard';
import Atividades from './pages/Atividades';
import Videos from './pages/Videos';
import Bonus from './pages/Bonus';
import Suporte from './pages/Suporte';
import Configuracoes from './pages/Configuracoes';
import PlanosPage from './pages/Planos';
import NotificationCenter from './pages/NotificationCenter';
import AdminDashboard from './pages/admin/AdminDashboard';
import GestaoUsuarios from './pages/admin/GestaoUsuarios';
import GestaoAtividades from './pages/admin/GestaoAtividades';
import GestaoVideos from './pages/admin/GestaoVideos';
import GestaoBonus from './pages/admin/GestaoBonus';
import GestaoNotificacoes from './pages/admin/GestaoNotificacoes';
import GestaoTickets from './pages/admin/GestaoTickets';
import ChatModeracao from './pages/admin/ChatModeracao';
import AvatarPopup from './pages/admin/AvatarPopup';
import AreaBanners from './pages/admin/AreaBanners';
import AdminPlanosManager from './pages/admin/AdminPlanosManager';
import DebugPlanos from './pages/admin/DebugPlanos';
import AdminConsole from './pages/admin/AdminConsole';
import MeusTickets from './pages/MeusTickets';
import Ranking from './pages/Ranking';
import Conquistas from './pages/Conquistas';
import FunilGamificado from './pages/FunilGamificado';
import FunilPequenosArtistas from './pages/FunilPequenosArtistas';
import LandingPageColorir from './pages/LandingPageColorir';
import Paper from './pages/Paper';
import Inicio from './pages/Inicio';
import { BadgeUnlockedNotification } from './components/BadgeUnlockedNotification';
import { useBadgeNotifications } from './hooks/useBadgeNotifications';

// Landing Page Component
function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Redirecionar para dashboard se usuário já estiver logado
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FFF7F5] overflow-hidden">
      <Header onLoginClick={handleLoginClick} />
      <main>
        <Hero onLoginClick={handleLoginClick} />
        <Diferenciais />
        <Educadores />
        <Planos />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { unlockedBadge, closeNotification } = useBadgeNotifications();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      <BadgeUnlockedNotification
        badge={unlockedBadge}
        onClose={closeNotification}
      />
    </>
  );
}

function App() {
  const location = useLocation();

  // Rastrear mudanças de página no TikTok (exceto em /admin)
  React.useEffect(() => {
    if (!window.location.pathname.includes('/admin')) {
      trackPageView(window.location.pathname + window.location.search);
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LandingPageColorir />} />
      <Route path="/principal" element={<LandingPage />} />
      <Route path="/paper" element={<Paper />} />
      <Route path="/loginpaper" element={<LoginPaper />} />
      <Route path="/paper-dashboard" element={<PaperDashboard />} />
      <Route path="/natal" element={<Natal />} />
      <Route path="/noel" element={<Noel />} />
      <Route path="/loginnatal" element={<LoginNatal />} />
      <Route path="/natal-dashboard" element={<NatalDashboard />} />
      <Route path="/upuniverso" element={<Upuniverso />} />
      <Route path="/funil" element={<FunilGamificado />} />
      <Route path="/funil-colorir" element={<FunilPequenosArtistas />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inicio" element={<Inicio />} />

      {/* Rotas Usuário */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/atividades"
        element={
          <ProtectedRoute>
            <Atividades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bonus"
        element={
          <ProtectedRoute>
            <Bonus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suporte"
        element={
          <ProtectedRoute>
            <Suporte />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/planos"
        element={
          <ProtectedRoute>
            <PlanosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notificacoes"
        element={
          <ProtectedRoute>
            <NotificationCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meus-tickets"
        element={
          <ProtectedRoute>
            <MeusTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ranking"
        element={
          <ProtectedRoute>
            <Ranking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conquistas"
        element={
          <ProtectedRoute>
            <Conquistas />
          </ProtectedRoute>
        }
      />

      {/* Rotas Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <AdminRoute>
            <GestaoUsuarios />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/atividades"
        element={
          <AdminRoute>
            <GestaoAtividades />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/videos"
        element={
          <AdminRoute>
            <GestaoVideos />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/bonus"
        element={
          <AdminRoute>
            <GestaoBonus />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/notificacoes"
        element={
          <AdminRoute>
            <GestaoNotificacoes />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <AdminRoute>
            <GestaoTickets />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/chat"
        element={
          <AdminRoute>
            <ChatModeracao />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/avatar-popup"
        element={
          <AdminRoute>
            <AvatarPopup />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/area-banners"
        element={
          <AdminRoute>
            <AreaBanners />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/planos"
        element={
          <AdminRoute>
            <AdminPlanosManager />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/debug-planos"
        element={
          <AdminRoute>
            <DebugPlanos />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/console"
        element={
          <AdminRoute>
            <AdminConsole />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;