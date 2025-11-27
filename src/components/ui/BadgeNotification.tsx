import { useEffect, useState } from 'react';
import { Badge } from '../../lib/badgeSystem';
import { X } from 'lucide-react';

interface BadgeNotificationProps {
  badge: Badge | null;
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div
      className={`fixed top-24 right-8 z-[9998] transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="relative max-w-sm">
        {/* Glass Morphism Card */}
        <div className="relative p-6 rounded-2xl backdrop-blur-md bg-white/90 border-2 border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10 rounded-2xl`} />

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200/50 transition-colors z-10"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              {/* Icon with glow */}
              <div className="relative">
                <div className="text-5xl animate-bounce-slow">{badge.icon}</div>
                <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} blur-xl opacity-30 rounded-full`} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="text-yellow-500 text-lg">🏆</span>
                  <span className="font-bold text-sm text-purple-600 uppercase tracking-wide">
                    Nova Conquista!
                  </span>
                </div>
                <h3 className="font-bold text-xl text-[#0F2741] mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-700">{badge.description}</p>
              </div>
            </div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-15deg);
          }
          100% {
            transform: translateX(200%) skewX(-15deg);
          }
        }

        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
