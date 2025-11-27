import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Props {
  badge: Badge | null;
  onClose: () => void;
}

interface FallingEmoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
}

export function BadgeUnlockedNotification({ badge, onClose }: Props) {
  const [fallingEmojis, setFallingEmojis] = useState<FallingEmoji[]>([]);

  useEffect(() => {
    if (badge) {
      // Criar emojis caindo
      const emojis = ['🎉', '🌟', '✨', '🏆', '⭐', '🎊', '🔥', '💫'];
      const newFallingEmojis: FallingEmoji[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
      }));

      setFallingEmojis(newFallingEmojis);

      // Auto-close após 4 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <AnimatePresence>
      {/* Overlay escuro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Emojis caindo */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {fallingEmojis.map((emoji) => (
            <motion.div
              key={emoji.id}
              initial={{ y: -50, opacity: 1 }}
              animate={{
                y: window.innerHeight + 50,
                opacity: 0,
                rotate: 360
              }}
              transition={{
                duration: emoji.duration,
                delay: emoji.delay,
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                left: `${emoji.left}%`,
                fontSize: '2rem',
              }}
            >
              {emoji.emoji}
            </motion.div>
          ))}
        </div>

        {/* Card da Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 p-1 rounded-2xl shadow-2xl max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 rounded-xl p-8 text-center">
            {/* Ícone animado */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative text-6xl">
                  {badge.icon}
                </div>
              </div>
            </motion.div>

            {/* Título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  Badge Desbloqueada!
                </h2>
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent mb-3">
                {badge.title}
              </h3>

              <p className="text-gray-300 text-lg">
                {badge.description}
              </p>
            </motion.div>

            {/* Botão de fechar */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full hover:scale-105 transition-transform"
            >
              Continuar
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
