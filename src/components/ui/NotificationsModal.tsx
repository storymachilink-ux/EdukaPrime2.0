import React from 'react';
import { X, Bell, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  is_read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      style={{
        zIndex: '999999 !important',
        position: 'fixed !important',
        top: '0 !important',
        left: '0 !important',
        right: '0 !important',
        bottom: '0 !important'
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{zIndex: 999998}}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 my-auto border-2 border-gray-100" style={{zIndex: 999999}}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#FFF9E8] to-[#FFF3D6]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Bell className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#033258]">Avisos</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-[#476178]">
                  {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-200 bg-white shadow-md border border-gray-200 group"
            aria-label="Fechar avisos"
          >
            <X className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" />
          </button>
        </div>

        {/* Actions Bar */}
        {unreadCount > 0 && (
          <div className="p-4 bg-[#FFF9E8] border-b border-[#FFE3A0]">
            <button
              onClick={onMarkAllAsRead}
              className="w-full py-2 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-[#FFF3D6] rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-semibold text-[#033258] mb-2">
                Nenhum aviso
              </h3>
              <p className="text-[#476178]">
                Você está em dia com tudo!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    !notification.is_read ? 'bg-[#FFF9E8]' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {/* Type Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold leading-snug ${
                          !notification.is_read
                            ? 'text-[#033258]'
                            : 'text-[#476178]'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-[#F59E0B] rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <p className={`text-sm mt-1 leading-relaxed ${
                        !notification.is_read
                          ? 'text-[#476178]'
                          : 'text-[#7C8B9B]'
                      }`}>
                        {notification.message}
                      </p>

                      <p className="text-xs text-[#7C8B9B] mt-2 font-medium">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Mobile friendly */}
        <div className="p-4 bg-white border-t border-gray-200 sm:hidden">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#476178] hover:bg-[#033258] text-white rounded-xl font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};