import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface BadgeUnlocked {
  badge: Badge;
  timestamp: string;
}

export function useBadgeListener(userId: string | undefined) {
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeUnlocked | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Escutar por novas badges desbloqueadas
    const channel = supabase
      .channel('badge-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('🎉 Nova badge desbloqueada!', payload);

          // Buscar informações da badge
          const { data: badgeData, error } = await supabase
            .from('badges')
            .select('*')
            .eq('id', payload.new.badge_id)
            .single();

          if (error) {
            console.error('Erro ao buscar badge:', error);
            return;
          }

          if (badgeData) {
            setUnlockedBadge({
              badge: {
                id: badgeData.id,
                title: badgeData.title,
                description: badgeData.description,
                icon: badgeData.icon,
              },
              timestamp: new Date().toISOString(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const clearUnlockedBadge = () => {
    setUnlockedBadge(null);
  };

  return { unlockedBadge, clearUnlockedBadge };
}
