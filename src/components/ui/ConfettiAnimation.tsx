import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
  rotation: number;
}

interface ConfettiAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const EMOJIS = ['🎁', '⭐', '✨', '🎉', '💫', '🌟', '🎊'];

export function ConfettiAnimation({ show, onComplete }: ConfettiAnimationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (show) {
      // Gerar peças de confete
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 30; i++) {
        newPieces.push({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          size: 20 + Math.random() * 20,
          rotation: Math.random() * 360,
        });
      }
      setPieces(newPieces);

      // Limpar após animação
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.left}%`,
            top: '-50px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            fontSize: `${piece.size}px`,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        >
          {piece.emoji}
        </div>
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}
