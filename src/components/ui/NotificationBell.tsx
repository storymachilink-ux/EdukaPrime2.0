import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadUnreadCount();

      // Atualizar contador a cada 30 segundos
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  const loadUnreadCount = async () => {
    if (!profile?.id) return;

    // Buscar broadcasts ativos que o usuário deve ver
    const { data: broadcasts, error: broadcastError } = await supabase
      .from('broadcast_notifications')
      .select('id')
      .eq('is_active', true)
      .or(`target_audience.eq.all,target_audience.eq.plan_${profile.active_plan_id}`);

    if (broadcastError || !broadcasts) {
      setUnreadCount(0);
      return;
    }

    // Buscar quais o usuário já leu
    const { data: reads, error: readsError } = await supabase
      .from('broadcast_notification_reads')
      .select('broadcast_id')
      .eq('user_id', profile.id);

    if (readsError) {
      setUnreadCount(0);
      return;
    }

    const readIds = new Set(reads?.map((r) => r.broadcast_id) || []);
    const unreadBroadcasts = broadcasts.filter((b) => !readIds.has(b.id));

    setUnreadCount(unreadBroadcasts.length);
  };

  const handleNotificationRead = () => {
    loadUnreadCount();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6 text-gray-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} onNotificationRead={handleNotificationRead} />
      )}
    </>
  );
}
