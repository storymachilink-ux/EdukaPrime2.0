interface UserAvatarProps {
  avatarUrl?: string | null;
  userName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UserAvatar({ avatarUrl, userName = 'U', size = 'md', className = '' }: UserAvatarProps) {
  // Pegar primeira letra do nome (garantir que tem um nome válido)
  const validUserName = (userName && userName.trim().length > 0) ? userName.trim() : 'U';
  const initial = validUserName.charAt(0).toUpperCase();

  // Gerar cor baseada no nome (hash simples)
  const getColorFromName = (name: string): string => {
    const colors = [
      'from-orange-500 to-red-500',
      'from-blue-500 to-indigo-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-pink-500 to-rose-500',
      'from-yellow-500 to-orange-500',
      'from-cyan-500 to-blue-500',
      'from-violet-500 to-purple-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Tamanhos
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  // Se tem avatar_url, mostrar imagem
  if (avatarUrl) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden border-2 border-white shadow-md ${className}`}>
        <img
          src={avatarUrl}
          alt={userName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Se a imagem falhar, esconder e mostrar fallback
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Fallback: círculo colorido com inicial
  const gradientColor = getColorFromName(validUserName);

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center font-bold text-white shadow-md ${className}`}
    >
      {initial}
    </div>
  );
}
