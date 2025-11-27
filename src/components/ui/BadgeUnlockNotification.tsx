import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface BadgeUnlockNotificationProps {
  badge: {
    title: string;
    icon: string;
    description: string;
  };
  onClose: () => void;
}

export function BadgeUnlockNotification({ badge, onClose }: BadgeUnlockNotificationProps) {
  const [emojis, setEmojis] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Gerar emojis aleatórios
    const emojiArray = [];
    for (let i = 0; i < 20; i++) {
      emojiArray.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
      });
    }
    setEmojis(emojiArray);

    // Auto fechar após 4 segundos
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {/* Overlay com fundo escurecido */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in pointer-events-none">
        {/* Card de notificação */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 animate-scale-bounce pointer-events-auto">
          {/* Brilho no topo */}
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <Sparkles className="w-20 h-20 text-yellow-400 animate-spin-slow" />
          </div>

          {/* Conteúdo */}
          <div className="text-center mt-6">
            <div className="text-8xl mb-4 animate-bounce-slow">{badge.icon}</div>

            <h2 className="text-3xl font-bold text-[#0F2741] mb-2">
              Nova Conquista!
            </h2>

            <div className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 rounded-2xl p-4 mb-3">
              <p className="text-2xl font-bold text-yellow-700">{badge.title}</p>
            </div>

            <p className="text-gray-600 text-lg">{badge.description}</p>

            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-full hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              Continuar 🎉
            </button>
          </div>
        </div>
      </div>

      {/* Emojis caindo */}
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fixed z-[10000] text-4xl pointer-events-none animate-fall"
          style={{
            left: `${emoji.left}%`,
            top: '-50px',
            animationDelay: `${emoji.delay}s`,
            animationDuration: `${emoji.duration}s`,
          }}
        >
          {badge.icon}
        </div>
      ))}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-bounce {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(-100px);
          }
          60% {
            opacity: 1;
            transform: scale(1.1) translateY(0);
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-bounce {
          animation: scale-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-fall {
          animation: fall linear forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </>
  );
}
