import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export function useBadgeNotifications() {
  const { profile } = useAuth();
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      return;
    }

    if (!profile?.id) {
      return;
    }

    const loadLatestBadge = async () => {
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('badge_id, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (userBadgesError) {
        console.error('Erro ao buscar badges:', userBadgesError);
        return;
      }

      const newestBadgeId = userBadges?.[0]?.badge_id;
      if (!newestBadgeId) return;

      const { data: badgeData, error: badgeError } = await supabase
        .from('badges')
        .select('id, title, description, icon')
        .eq('id', newestBadgeId)
        .single();

      if (badgeError) {
        console.error('Erro ao buscar dados da badge:', badgeError);
        return;
      }

      if (badgeData) {
        setUnlockedBadge(badgeData as Badge);
      }
    };

    loadLatestBadge();
  }, [profile?.id]);

  useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      return;
    }

    if (!profile?.id) {
      return;
    }

    const channel = supabase
      .channel('badge-unlocks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${profile.id}`,
        },
        async (payload) => {
          const { data: badgeData, error } = await supabase
            .from('badges')
            .select('*')
            .eq('id', payload.new.badge_id)
            .single();

          if (error) {
            console.error('Erro ao buscar dados da badge:', error);
            return;
          }

          if (badgeData) {
            setUnlockedBadge(badgeData as Badge);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const closeNotification = () => {
    setUnlockedBadge(null);
  };

  return {
    unlockedBadge,
    closeNotification,
  };
}
