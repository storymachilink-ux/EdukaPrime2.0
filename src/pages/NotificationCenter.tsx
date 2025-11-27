import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  Bell,
  CheckCircle,
  Trash2,
  Eye,
  ExternalLink,
  Filter,
  Archive,
} from 'lucide-react';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  Notification,
  NotificationType,
} from '../lib/notificationSystem';

export default function NotificationCenter() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  useEffect(() => {
    loadNotifications();
  }, [profile?.id, filter]);

  const loadNotifications = async () => {
    if (!profile?.id) return;

    setLoading(true);
    const { data } = await getUserNotifications(profile.id, {
      unreadOnly: filter === 'unread',
    });

    let filtered = data;
    if (filter === 'read') {
      filtered = data.filter((n) => n.read);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    setNotifications(filtered);
    setLoading(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    await markAsRead(notification.id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!profile?.id) return;
    await markAllAsRead(profile.id);
    loadNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    loadNotifications();
  };

  const handleDeleteAllRead = async () => {
    if (!profile?.id) return;
    const confirmed = window.confirm('Deseja realmente deletar todas as notificações lidas?');
    if (confirmed) {
      await deleteAllRead(profile.id);
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
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
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  return (
    <DashboardLayout>
      <div className="p-8 bg-[#F8FBFF] min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F2741] flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Central de Notificações
          </h1>
          <p className="text-gray-600 mt-1">Gerencie todas as suas notificações em um só lugar</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lidas</p>
                <p className="text-2xl font-bold text-gray-900">{readCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filtros e Ações */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="unread">Não Lidas</option>
                <option value="read">Lidas</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  loadNotifications();
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Todos os Tipos</option>
                <option value="badge">🏆 Badges</option>
                <option value="new_content">📚 Novos Conteúdos</option>
                <option value="plan_expiring">⚠️ Plano Expirando</option>
                <option value="plan_expired">🔒 Plano Expirado</option>
                <option value="system">📢 Sistema</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Marcar Todas como Lidas
                </button>
              )}

              {readCount > 0 && (
                <button
                  onClick={handleDeleteAllRead}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Limpar Lidas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando notificações...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Nenhuma notificação</p>
              <p className="text-sm">
                {filter === 'unread'
                  ? 'Você está em dia! 🎉'
                  : 'Suas notificações aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Indicador de não lida */}
                  {!notification.read && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full" />
                  )}

                  <div className="flex items-start gap-4 ml-6">
                    {/* Ícone */}
                    <div className="text-3xl mt-1">{notification.icon || '📢'}</div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg text-[#0F2741] mb-2">
                        {notification.title}
                      </p>
                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>

                        {notification.action_label && (
                          <span className="text-sm text-blue-600 flex items-center gap-1 font-semibold">
                            {notification.action_label}
                            <ExternalLink className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Marcar como lida"
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
