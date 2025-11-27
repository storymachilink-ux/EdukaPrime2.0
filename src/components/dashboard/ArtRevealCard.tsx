import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Sparkles, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ArtRevealCardProps {
  userId: string;
}

export interface ArtRevealCardRef {
  loadBadges: () => void;
}

export const ArtRevealCard = forwardRef<ArtRevealCardRef, ArtRevealCardProps>(({ userId }, ref) => {
  const [badgesEarned, setBadgesEarned] = useState(0);
  const [revealPercentage, setRevealPercentage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showLockedPopup, setShowLockedPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBadges();
  }, [userId]);

  // Expor método loadBadges via ref
  useImperativeHandle(ref, () => ({
    loadBadges,
  }));

  const loadBadges = async () => {
    try {
      // Buscar apenas badges do sistema de conquistas (downloads + conclusões + chat)
      const { data, error } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId)
        .or('badge_id.like.material_download_%,badge_id.like.material_completed_%,badge_id.like.chat_%');

      if (error) {
        console.error('❌ Erro ao carregar badges:', error);
        return;
      }

      const totalBadges = data?.length || 0;
      setBadgesEarned(totalBadges);

      // Calcular porcentagem de revelação (12 badges = 100%)
      const percentage = Math.min((totalBadges / 12) * 100, 100);
      setRevealPercentage(percentage);

    } catch (error) {
      console.error('❌ Erro ao carregar badges:', error);
    }
  };

  const isUnlocked = revealPercentage >= 100;

  const handleButtonClick = () => {
    if (isUnlocked) {
      setShowPopup(true);
    } else {
      setShowLockedPopup(true);
    }
  };

  const handleGoToSupport = () => {
    setShowPopup(false);
    navigate('/suporte');
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0F2741]">Lembrança em Desenho</h2>
          {isUnlocked && <Sparkles className="w-6 h-6 text-yellow-500" />}
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Uma arte exclusiva que transforma seu momento em sala ou em casa em desenho animado.
        </p>

      <div className="relative w-full flex justify-center mb-4">
        <div className="relative inline-block rounded-lg overflow-hidden">
          {/* Imagem em preto e branco (camada de fundo) */}
          <img
            src="/eduka-arte.webp"
            alt="Lembrança em Desenho"
            className="w-full h-auto"
            style={{ filter: 'grayscale(100%)' }}
          />

          {/* Imagem colorida que vai sendo revelada */}
          <div
            className="absolute inset-0 transition-all duration-1000"
            style={{
              clipPath: `inset(${100 - revealPercentage}% 0 0 0)`
            }}
          >
            <img
              src="/eduka-arte.webp"
              alt="Lembrança em Desenho Colorida"
              className="w-full h-auto"
            />
          </div>

          {/* Efeito de água animado */}
          <div
            className="absolute inset-x-0 bottom-0 transition-all duration-1000 pointer-events-none"
            style={{
              height: `${revealPercentage}%`,
              background: 'linear-gradient(to top, rgba(70, 130, 180, 0.2) 0%, rgba(135, 206, 235, 0.1) 100%)',
              backdropFilter: 'blur(1px)'
            }}
          >
            {/* Ondas de água */}
            <div
              className="absolute inset-x-0 top-0 h-8"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
                animation: 'wave 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Mensagem de desbloqueio */}
          {isUnlocked && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Desbloqueado!
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes scale-out {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-out {
          animation: fade-out 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-scale-out {
          animation: scale-out 0.3s ease-out;
        }
      `}</style>

      <button
        onClick={handleButtonClick}
        className="w-full relative rounded-2xl transition-all duration-300"
        style={{
          backgroundColor: isUnlocked ? '#E8F5E9' : '#D4D3D2',
          border: `2px solid ${isUnlocked ? '#A5D6A7' : '#BDBDBD'}`,
          padding: '24px 20px',
          cursor: 'pointer',
          transform: isUnlocked ? 'translateY(0)' : 'none'
        }}
        onMouseEnter={(e) => {
          if (isUnlocked) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(46, 125, 50, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (isUnlocked) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {/* Círculos nos cantos (marcadores de fixação) */}
        <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full" style={{ backgroundColor: isUnlocked ? '#A5D6A7' : '#BDBDBD' }} />
        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full" style={{ backgroundColor: isUnlocked ? '#A5D6A7' : '#BDBDBD' }} />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full" style={{ backgroundColor: isUnlocked ? '#A5D6A7' : '#BDBDBD' }} />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full" style={{ backgroundColor: isUnlocked ? '#A5D6A7' : '#BDBDBD' }} />

        {/* Conteúdo com ícone à esquerda centralizado */}
        <div className="flex items-center justify-center gap-4">
          <Image
            className="w-12 h-12 flex-shrink-0"
            style={{ color: isUnlocked ? '#81C784' : '#9C9C9C' }}
          />
          <div className="flex flex-col text-left">
            <h3
              className="font-bold text-lg mb-1"
              style={{ color: isUnlocked ? '#2E7D32' : '#4A4A4A' }}
            >
              Liberar minha arte exclusiva
            </h3>
            <p
              className="text-sm"
              style={{ color: isUnlocked ? '#2E7D32' : '#4A4A4A', opacity: 0.7 }}
            >
              Desenho personalizado com sua foto
            </p>
          </div>
        </div>
      </button>
    </div>

    {/* Popup de desbloqueio */}
    {showPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F2741] mb-2">Parabéns!</h2>
            <p className="text-gray-600">
              Você desbloqueou seu desenho personalizado, vá na área contribuição e envie sua imagem que quer em desenho
            </p>
          </div>
          <button
            onClick={handleGoToSupport}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Ir para Suporte
          </button>
          <button
            onClick={() => setShowPopup(false)}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    )}

    {/* Popup de bloqueio */}
    {showLockedPopup && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setShowLockedPopup(false)}
        style={{ animation: 'fade-in 0.3s ease-out' }}
      >
        <div
          className="rounded-2xl shadow-lg p-6 max-w-sm mx-auto cursor-pointer"
          style={{
            backgroundColor: '#E8F5E9',
            border: '3px dashed #2E7D32',
            animation: 'scale-in 0.3s ease-out'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowLockedPopup(false);
          }}
        >
          <p className="text-center text-base" style={{ color: '#2E7D32' }}>
            Conclua doze conquistas e libere seu desenho personalizado 🎨
          </p>
        </div>
      </div>
    )}
    </>
  );
});

ArtRevealCard.displayName = 'ArtRevealCard';
