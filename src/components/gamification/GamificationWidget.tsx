import { useEffect, useState } from 'react';
import { Trophy, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface GamificationData {
  total_xp: number;
  current_level: number;
  current_streak: number;
  level_name?: string;
  level_icon?: string;
  level_color?: string;
  next_level_xp?: number;
}

interface GamificationWidgetProps {
  userId: string;
}

export function GamificationWidget({ userId }: GamificationWidgetProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  if (window.location.pathname.includes('/admin')) {
    return null;
  }

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    setLoading(true);

    try {
      // Buscar dados de gamificação
      const { data: gamificationData, error: gamError } = await supabase
        .from('user_gamification')
        .select(`
          *,
          levels!user_gamification_current_level_fkey(level_name, icon, color)
        `)
        .eq('user_id', userId)
        .single();

      if (gamError) {
        // Silenciosamente ignorar erro 404 (tabela não existe)
        // Silenciosamente ignorar erro 406 (RLS)
        setLoading(false);
        return;
      }

      // Buscar próximo nível
      const { data: nextLevel } = await supabase
        .from('levels')
        .select('xp_required')
        .eq('level_number', (gamificationData?.current_level || 1) + 1)
        .single();

      setData({
        total_xp: gamificationData?.total_xp || 0,
        current_level: gamificationData?.current_level || 1,
        current_streak: gamificationData?.current_streak || 0,
        level_name: gamificationData?.levels?.level_name,
        level_icon: gamificationData?.levels?.icon,
        level_color: gamificationData?.levels?.color,
        next_level_xp: nextLevel?.xp_required,
      });
    } catch (error) {
      console.warn('Erro ao carregar gamificação:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const progressPercentage = data.next_level_xp
    ? ((data.total_xp / data.next_level_xp) * 100)
    : 100;

  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Gamificação
        </h3>
        <button
          onClick={() => navigate('/ranking')}
          className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors backdrop-blur-sm"
        >
          Ver Ranking
        </button>
      </div>

      {/* Nível Atual */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{data.level_icon || '🏆'}</span>
            <div>
              <p className="text-sm opacity-90">Nível {data.current_level}</p>
              <p className="font-bold text-lg">{data.level_name || 'Iniciante'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{data.total_xp}</p>
            <p className="text-xs opacity-90">XP Total</p>
          </div>
        </div>

        {/* Barra de Progresso para Próximo Nível */}
        {data.next_level_xp && (
          <div>
            <div className="flex justify-between text-xs opacity-90 mb-1">
              <span>Próximo nível</span>
              <span>{data.next_level_xp} XP</span>
            </div>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {/* Streak */}
        <button
          onClick={() => navigate('/ranking')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-all text-center"
        >
          <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
          <p className="text-2xl font-bold">{data.current_streak}</p>
          <p className="text-xs opacity-90">Dias Streak</p>
        </button>

        {/* Conquistas */}
        <button
          onClick={() => navigate('/conquistas')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-all text-center"
        >
          <Award className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
          <p className="text-2xl font-bold">
            <Star className="w-6 h-6 mx-auto" />
          </p>
          <p className="text-xs opacity-90">Conquistas</p>
        </button>

        {/* Ranking */}
        <button
          onClick={() => navigate('/ranking')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 transition-all text-center"
        >
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
          <p className="text-2xl font-bold">
            <Trophy className="w-6 h-6 mx-auto" />
          </p>
          <p className="text-xs opacity-90">Ver Rank</p>
        </button>
      </div>

      {/* Dica de XP */}
      <div className="mt-4 bg-yellow-400/20 backdrop-blur-sm rounded-lg p-3 text-sm">
        <p className="font-semibold mb-1">💡 Ganhe XP:</p>
        <div className="flex justify-between opacity-90">
          <span>Atividade: +20 XP</span>
          <span>Vídeo: +15 XP</span>
          <span>Bônus: +10 XP</span>
        </div>
      </div>
    </div>
  );
}
