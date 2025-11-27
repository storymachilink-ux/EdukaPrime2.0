import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Download, Lock, Star, Trophy, Zap, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'material_download' | 'material_completed' | 'chat_points';
  requirement_value: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  current?: number;
}

export default function Conquistas() {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadBadges();
  }, [profile?.id]);

  const loadBadges = async () => {
    if (!profile?.id) return;

    setLoading(true);

    // Buscar todas as badges
    const { data: allBadges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('type, requirement_value', { ascending: true });

    if (badgesError) {
      console.error('Erro ao carregar badges:', badgesError);
      setLoading(false);
      return;
    }

    // Buscar badges desbloqueadas do usuário
    const { data: userBadges, error: userError } = await supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', profile.id);

    if (userError) {
      console.error('Erro ao carregar badges do usuário:', userError);
    }

    // Buscar progresso do usuário
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', profile.id)
      .in('resource_type', ['atividade', 'bonus']);

    // Buscar pontos do chat (com fallback se falhar)
    let totalChatPoints = 0;
    try {
      const { data: chatPoints, error: chatError } = await supabase
        .from('chat_user_stats')
        .select('total_points')
        .eq('user_id', profile.id)
        .single();

      if (!chatError && chatPoints) {
        totalChatPoints = chatPoints.total_points || 0;
      }
    } catch (error) {
      console.warn('Chat points não disponível:', error);
      totalChatPoints = 0;
    }

    const totalDownloads = progressData?.filter(p => p.status === 'started' || p.status === 'completed').length || 0;
    const totalCompleted = progressData?.filter(p => p.status === 'completed').length || 0;

    // Combinar dados
    const unlockedIds = new Set(userBadges?.map((ub) => ub.badge_id) || []);
    const unlockedMap = new Map(userBadges?.map((ub) => [ub.badge_id, ub.earned_at]) || []);

    const combined = allBadges.map((badge) => {
      let current = 0;

      // Calcular progresso atual baseado no tipo
      if (badge.type === 'material_download') {
        current = totalDownloads;
      } else if (badge.type === 'material_completed') {
        current = totalCompleted;
      } else if (badge.type === 'chat_points') {
        current = totalChatPoints;
      }

      const progress = Math.min(100, (current / badge.requirement_value) * 100);

      return {
        ...badge,
        unlocked: unlockedIds.has(badge.id),
        unlocked_at: unlockedMap.get(badge.id),
        progress,
        current
      };
    });

    setBadges(combined);
    setLoading(false);
  };

  const getBadgeTypeLabel = (type: string) => {
    switch (type) {
      case 'material_download':
        return { label: '📥 Downloads', color: 'from-blue-500 to-cyan-500' };
      case 'material_completed':
        return { label: '✅ Conclusões', color: 'from-green-500 to-emerald-500' };
      case 'chat_points':
        return { label: '💬 Comunidade', color: 'from-purple-500 to-pink-500' };
      default:
        return { label: 'Badge', color: 'from-gray-500 to-gray-600' };
    }
  };

  const getProgressText = (badge: Badge): string => {
    if (badge.type === 'chat_points') {
      const messages = Math.floor(badge.current! / 10);
      const requiredMessages = badge.requirement_value / 10;
      return `${messages} / ${requiredMessages} mensagens`;
    }
    return `${badge.current} / ${badge.requirement_value}`;
  };

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  const totalUnlocked = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length;
  const completionPercentage = totalBadges > 0 ? (totalUnlocked / totalBadges) * 100 : 0;

  // Agrupar por tipo
  const badgesByType = {
    material_download: filteredBadges.filter(b => b.type === 'material_download'),
    material_completed: filteredBadges.filter(b => b.type === 'material_completed'),
    chat_points: filteredBadges.filter(b => b.type === 'chat_points')
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h1 className="text-5xl font-bold text-gray-900">Minhas Conquistas</h1>
            </div>
            <p className="text-lg text-gray-600">Desbloqueie badges e revele sua arte exclusiva!</p>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Seu Progresso</h2>
                <p className="text-lg opacity-90">
                  {totalUnlocked} de {totalBadges} badges desbloqueadas
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold">{Math.round(completionPercentage)}%</div>
                <p className="text-sm opacity-90">Completo</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏆 Todas ({totalBadges})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'unlocked'
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✅ Desbloqueadas ({totalUnlocked})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'locked'
                  ? 'bg-yellow-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔒 Bloqueadas ({totalBadges - totalUnlocked})
            </button>
          </div>

          {/* Lista de Badges */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando badges...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Badges de Download */}
              {badgesByType.material_download.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Download className="w-6 h-6 text-blue-500" />
                    Badges de Download
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {badgesByType.material_download.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              )}

              {/* Badges de Conclusão */}
              {badgesByType.material_completed.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    Badges de Conclusão
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {badgesByType.material_completed.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              )}

              {/* Badges de Chat */}
              {badgesByType.chat_points.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-purple-500" />
                    Badges da Comunidade
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {badgesByType.chat_points.map((badge) => (
                      <BadgeCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card de motivação */}
          {totalUnlocked < totalBadges && (
            <div className="mt-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-8 text-center shadow-2xl">
              <Zap className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Continue Conquistando!</h2>
              <p className="text-lg opacity-90">
                Você ainda tem {totalBadges - totalUnlocked} badges para desbloquear
              </p>
            </div>
          )}

          {totalUnlocked === totalBadges && totalBadges > 0 && (
            <div className="mt-12 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-8 text-center shadow-2xl">
              <Trophy className="w-20 h-20 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-bold mb-2">🎉 Parabéns! 🎉</h2>
              <p className="text-xl">Você desbloqueou TODAS as badges!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Componente de Badge Card
function BadgeCard({ badge }: { badge: Badge }) {
  const isUnlocked = badge.unlocked;

  const getProgressText = (): string => {
    if (badge.type === 'chat_points') {
      const messages = Math.floor(badge.current! / 10);
      const requiredMessages = badge.requirement_value / 10;
      return `${messages} / ${requiredMessages} mensagens`;
    }
    return `${badge.current} / ${badge.requirement_value}`;
  };

  return (
    <div
      className={`relative rounded-2xl p-6 border-2 transition-all ${
        isUnlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-lg hover:shadow-xl'
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-md'
      }`}
    >
      {/* Badge de conquista desbloqueada */}
      {isUnlocked && (
        <div className="absolute -top-3 -right-3">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-2 shadow-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Ícone */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
            isUnlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
              : 'bg-gray-200'
          }`}
        >
          {isUnlocked ? badge.icon : <Lock className="w-8 h-8 text-gray-400" />}
        </div>

        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
            {badge.title}
          </h3>
          <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>
            {badge.description}
          </p>

          {/* Data de desbloqueio */}
          {isUnlocked && badge.unlocked_at && (
            <span className="text-xs text-gray-500 block mb-3">
              Conquistado em {new Date(badge.unlocked_at).toLocaleDateString('pt-BR')}
            </span>
          )}

          {/* Progresso */}
          {!isUnlocked && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Progresso</span>
                <span className="text-xs font-semibold text-gray-700">{getProgressText()}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
                  style={{ width: `${badge.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{Math.round(badge.progress!)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
