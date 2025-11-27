import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../ui/NotificationBell';
import { UserAvatar } from '../ui/UserAvatar';

export function MobileHeader() {
  const { profile } = useAuth();

  return (
    <header className="md:hidden bg-white/70 backdrop-blur-xl border-b-2 border-yellow-200/40 sticky top-0 z-20 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logohorizontal.webp"
            alt="EdukaPrime"
            className="h-8 w-auto"
          />
        </div>

        {/* Notificações + Perfil */}
        <div className="flex items-center gap-3">
          {/* Sino de Notificações */}
          <NotificationBell />

          {/* Info do usuário */}
          <div className="flex items-center gap-2">
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              userName={profile?.nome || 'Usuário'}
              size="sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
