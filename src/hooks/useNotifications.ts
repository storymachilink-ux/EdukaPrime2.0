import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'badge' | 'new_content' | 'plan_expiring' | 'plan_expired' | 'system' | 'achievement' | 'download' | 'video' | 'bonus';
  icon?: string;
  metadata?: Record<string, any>;
  action_url?: string;
  action_label?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setNotifications([]);
        return;
      }

      // Buscar notificações individuais do usuário
      const { data: notificationData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notifError) throw notifError;

      setNotifications(notificationData || []);
      setUnreadCount((notificationData || []).filter(n => !n.read).length);
    } catch (err: any) {
      console.error('Erro ao buscar notificações:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );

      // Atualizar contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);

      if (unreadNotifications.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadNotifications.map(n => n.id));

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  };

  // Para uso admin - criar notificação em broadcast (para múltiplos usuários)
  const createNotification = async (notification: {
    title: string;
    message: string;
    type: 'badge' | 'new_content' | 'plan_expiring' | 'plan_expired' | 'system' | 'achievement' | 'download' | 'video' | 'bonus';
    icon?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          user_id: user?.id,
          read: false
        }])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (err: any) {
      console.error('Erro ao criar notificação:', err);
      return { data: null, error: err.message };
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
  };
}