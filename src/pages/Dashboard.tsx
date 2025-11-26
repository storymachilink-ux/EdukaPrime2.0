import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TrendingUp, Award, Crown, Download, Eye, Target, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { getUserProgressStats } from '../lib/progressTracker';
import { getBadgeProgress, Badge as BadgeType } from '../lib/badgeSystem';
import { BadgeCard } from '../components/ui/BadgeCard';
import { BadgeUnlockNotification } from '../components/ui/BadgeUnlockNotification';
import { ConfettiAnimation } from '../components/ui/ConfettiAnimation';
import { GamificationWidget } from '../components/gamification/GamificationWidget';
import { ArtRevealCard } from '../components/dashboard/ArtRevealCard';
import { BadgesModal } from '../components/ui/BadgesModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBadgeListener } from '../hooks/useBadgeListener';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [badgeProgress, setBadgeProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Animações de badges
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);

  // Listener de badges em tempo real
  const { unlockedBadge, clearUnlockedBadge } = useBadgeListener(profile?.id);
  const artRevealCardRef = useRef<{ loadBadges: () => void }>(null);

  // Quando uma badge é desbloqueada
  useEffect(() => {
    if (unlockedBadge) {
      console.log('🎉 Badge desbloqueada:', unlockedBadge.badge);
      setShowConfetti(true);

      // Recarregar dados do dashboard
      loadDashboardData();

      // Recarregar ArtRevealCard
      if (artRevealCardRef.current) {
        artRevealCardRef.current.loadBadges();
      }
    }
  }, [unlockedBadge]);

  useEffect(() => {
    // Timeout para não ficar travado em "Carregando dashboard..."
    const dashboardTimeout = setTimeout(() => {
      console.warn('⚠️ Dashboard timeout - forçando saída do loading');
      setLoading(false);
    }, 4000); // 4 segundos máximo

    if (profile?.id) {
      loadDashboardData();
    }

    return () => clearTimeout(dashboardTimeout);
  }, [profile?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Se profile não carregou ainda, sair cedo mas sem travar loading
      if (!profile?.id) {
        console.log('⏳ Profile ainda não carregou, aguardando...');
        return;
      }

      // Carregar estatísticas de progresso
      const progressStats = await getUserProgressStats(profile.id);
      setStats(progressStats);

      // Carregar progresso de badges
      const badgeData = await getBadgeProgress(profile.id);
      setBadgeProgress(badgeData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dados para gráfico de pizza
  const pieData = stats?.byType
    ? [
        { name: 'Atividades', value: stats.byType.atividades?.total || 0, color: '#F97316' },
        { name: 'Vídeos', value: stats.byType.videos?.total || 0, color: '#8B5CF6' },
        { name: 'Bônus', value: stats.byType.bonus?.total || 0, color: '#EC4899' },
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Animações de conquista */}
      {unlockedBadge && (
        <BadgeUnlockNotification
          badge={unlockedBadge.badge}
          onClose={clearUnlockedBadge}
        />
      )}
      <ConfettiAnimation show={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="p-8 bg-[#F8FBFF] min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2741]">Dashboard</h1>
          <p className="text-gray-600 mt-1">Olá, {profile?.nome || user?.email}! Acompanhe seu progresso 🚀</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-orange-500" />
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600">Total de Downloads</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {badgeProgress?.stats?.downloads || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-500" />
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">Pontos do Chat</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {badgeProgress?.stats?.chat_points || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-500" />
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Recursos Concluídos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats?.completed || 0} / {stats?.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-blue-500" />
              <Crown className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600">Badges Conquistadas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {badgeProgress?.totalEarned || 0} / {badgeProgress?.totalAvailable || 0}
            </p>
          </div>
        </div>

        {/* Gamification Widget */}
        {profile?.id && (
          <div className="mb-8">
            <GamificationWidget userId={profile.id} />
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Lembrança em Desenho */}
          {profile?.id && <ArtRevealCard ref={artRevealCardRef} userId={profile.id} />}

          {/* Estatísticas de Tempo */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#0F2741] mb-4">Estatísticas Gerais</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completionRate || 0}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Em Progresso</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.inProgress || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tempo Total Investido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((stats?.totalTimeSpent || 0) / 60)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0F2741]">🏆 Minhas Conquistas</h2>
            <span className="text-sm text-gray-600">
              {badgeProgress?.totalEarned || 0} de {badgeProgress?.totalAvailable || 0} badges
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {badgeProgress?.badges?.slice(0, 10).map((badge: any) => (
              <div key={badge.id} style={{
                background: '#F5F7CD',
                border: '1px dashed #5C5037',
                borderRadius: '12px',
                padding: '4px'
              }}>
                <BadgeCard
                  badge={badge}
                  earned={badge.earned}
                  progress={badge.progress}
                  current={badge.current}
                  showProgress={!badge.earned}
                />
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowBadgesModal(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Ver Todas as Conquistas →
            </button>
          </div>
        </div>

        {/* Modal de Conquistas */}
        <BadgesModal
          isOpen={showBadgesModal}
          onClose={() => setShowBadgesModal(false)}
          badges={badgeProgress?.badges || []}
        />
      </div>
    </DashboardLayout>
  );
}
