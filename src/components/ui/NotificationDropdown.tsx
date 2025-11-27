import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, ExternalLink, Bell, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AllNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  button_color?: string;
  action_url?: string;
  action_label?: string;
  is_pinned?: boolean;
  is_active?: boolean;
  created_at: string;
  expires_at?: string;
  target_audience?: string;
  is_read?: boolean;
  read?: boolean;
  source: 'broadcast' | 'individual';
}

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationRead: () => void;
}

export function NotificationDropdown({ onClose, onNotificationRead }: NotificationDropdownProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AllNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [profile?.id]);

  const loadNotifications = async () => {
    if (!profile?.id) return;

    setLoading(true);

    try {
      // 1. Buscar notificações individuais (diretas do usuário)
      const { data: individualNotifs, error: individualError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (individualError) {
        console.error('Erro ao carregar notificações individuais:', individualError);
      }

      // Mapear notificações individuais
      const mappedIndividual: AllNotification[] = (individualNotifs || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        icon: n.icon,
        created_at: n.created_at,
        action_url: n.action_url,
        action_label: n.action_label,
        is_read: n.read,
        source: 'individual' as const
      }));

      // 2. Buscar broadcasts ativos (notificações em massa)
      const { data: broadcasts, error: broadcastError } = await supabase
        .from('broadcast_notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (broadcastError) {
        console.error('Erro ao carregar broadcasts:', broadcastError);
      }

      // Mapear broadcasts ativos
      const mappedBroadcasts: AllNotification[] = (broadcasts || []).map((broadcast) => ({
        ...broadcast,
        is_read: false, // Broadcasts são geralmente novos
        source: 'broadcast' as const
      }));

      // Combinar notificações individuais e broadcasts
      // Ordenar por data mais recente
      const allNotifications = [...mappedIndividual, ...mappedBroadcasts].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, source: 'broadcast' | 'individual' = 'broadcast') => {
    if (!profile?.id) return;

    try {
      if (source === 'broadcast') {
        await supabase.from('broadcast_notification_reads').insert({
          broadcast_id: notificationId,
          user_id: profile.id,
        });
      } else {
        // Marcar notificação individual como lida
        await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId);
      }

      onNotificationRead();
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile?.id) return;

    const unreadNotifications = notifications.filter((n) => !n.is_read && !n.read);

    const broadcastInserts = unreadNotifications
      .filter(n => n.source === 'broadcast')
      .map((n) => ({
        broadcast_id: n.id,
        user_id: profile.id,
      }));

    const individualIds = unreadNotifications
      .filter(n => n.source === 'individual')
      .map(n => n.id);

    try {
      if (broadcastInserts.length > 0) {
        await supabase.from('broadcast_notification_reads').insert(broadcastInserts);
      }

      if (individualIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .in('id', individualIds);
      }

      onNotificationRead();
      loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar tudo como lido:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, source: 'broadcast' | 'individual' = 'broadcast') => {
    try {
      if (source === 'broadcast') {
        // Para broadcasts, deletar da tabela broadcast_notification_reads
        await supabase
          .from('broadcast_notification_reads')
          .delete()
          .eq('broadcast_id', notificationId)
          .eq('user_id', profile?.id);
      } else {
        // Para notificações individuais, deletar da tabela notifications
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId);
      }
      loadNotifications();
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const handleNotificationClick = async (notification: AllNotification) => {
    // Marcar como lida
    if (!notification.is_read && !notification.read) {
      await handleMarkAsRead(notification.id, notification.source);
    }

    // Se não estiver fixa, deletar ao clicar (exceto se for broadcast que não tem is_pinned)
    if (notification.source === 'individual') {
      // Notificações individuais: deletar se não estiver fixa
      if (!notification.is_pinned) {
        await handleDeleteNotification(notification.id, notification.source);
      }
    }

    // Navegar se tiver URL
    if (notification.action_url) {
      onClose();

      // Se for URL externa (começa com http:// ou https://), usar window.location
      if (notification.action_url.startsWith('http://') || notification.action_url.startsWith('https://')) {
        window.location.href = notification.action_url;
      } else {
        // Se for URL interna (começa com /), usar navigate
        navigate(notification.action_url);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getButtonColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      red: 'bg-red-600 hover:bg-red-700',
      pink: 'bg-pink-600 hover:bg-pink-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
    };
    return colorMap[color] || 'bg-blue-600 hover:bg-blue-700';
  };

  const modalContent = (
    <>
      {/* Overlay escuro com blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] animate-fade-in"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Modal centralizado */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-gray-200 max-h-[90vh] flex flex-col pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-[#0F2741]">Notificações</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/notificacoes');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Ver Todas
                </button>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {/* Lista de notificações */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="font-semibold">Nenhuma notificação</p>
            <p className="text-sm">Você está em dia! 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                  !notification.is_read ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Indicador de não lida */}
                {!notification.is_read && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                )}

                <div className="flex items-start gap-3 ml-3">
                  {/* Ícone */}
                  <div className="text-2xl mt-1">{notification.icon || '📢'}</div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#0F2741] mb-1">{notification.title}</p>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-500">{formatDate(notification.created_at)}</span>

                      {notification.action_label && notification.action_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                          className={`text-xs px-3 py-1 rounded-md text-white font-semibold transition-all ${getButtonColorClass(
                            notification.button_color
                          )}`}
                        >
                          {notification.action_label}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200"
                        title="Marcar como lida"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
