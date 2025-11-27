import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AreaBannerData {
  id: string;
  area: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  button_url: string | null;
  banner_url: string | null;
  active: boolean;
}

interface AreaBannerProps {
  area: string;
}

export function AreaBanner({ area }: AreaBannerProps) {
  const [banner, setBanner] = useState<AreaBannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanner();
  }, [area]);

  const loadBanner = async () => {
    try {
      const { data, error } = await supabase
        .from('area_banners')
        .select('*')
        .eq('area', area)
        .eq('active', true)
        .single();

      if (!error && data && data.image_url) {
        setBanner(data);
      } else {
        setBanner(null);
      }
    } catch (error) {
      console.error('Erro ao carregar banner:', error);
      setBanner(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner) {
    return null;
  }

  // Lógica de cliques:
  // 1. Se banner_url existe → banner inteiro clicável
  // 2. Se banner_url vazio E button_url existe → só botão clicável
  // 3. Se ambos vazios → não clicável

  const handleBannerClick = () => {
    if (banner.banner_url) {
      window.open(banner.banner_url, '_blank');
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (banner.banner_url) {
      // Se banner_url existe, o click já é tratado pelo banner inteiro
      return;
    }

    if (banner.button_url) {
      e.stopPropagation();
      window.open(banner.button_url, '_blank');
    }
  };

  const isBannerClickable = !!banner.banner_url;
  const isButtonClickable = !!banner.button_url && !banner.banner_url;

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4">
      <div
        onClick={isBannerClickable ? handleBannerClick : undefined}
        className={`bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50 transition-all ${
          isBannerClickable ? 'cursor-pointer hover:shadow-3xl hover:scale-[1.02]' : ''
        }`}
      >
        {/* Imagem - Responsiva: 200px mobile, 280px desktop */}
        <div className="w-full h-[200px] md:h-[280px]">
          <img
            src={banner.image_url!}
            alt={banner.title || 'Banner'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/1200x280?text=Imagem+Indisponível';
            }}
          />
        </div>

        {/* Conteúdo */}
        {(banner.title || banner.description || banner.button_url) && (
          <div className="p-4 md:p-6">
            {banner.title && (
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {banner.title}
              </h3>
            )}

            {banner.description && (
              <p className="text-sm md:text-base text-gray-700 mb-4 leading-relaxed">
                {banner.description}
              </p>
            )}

            {isButtonClickable && (
              <button
                onClick={handleButtonClick}
                className="px-5 py-2.5 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
              >
                Ver Mais →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
