import React, { useState } from 'react';
import VideoCard from './VideoCard';
import VideoDetail from './VideoDetail';

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  topic: string;
}

// Função helper para gerar URL da thumbnail do YouTube
const getYouTubeThumbnail = (youtubeId: string) => {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

interface VideosSectionProps {
  userPlan?: string;
  onUpsellClick?: () => void;
}

/**
 * Seção de Vídeos do EdukaBoo
 * Exibe vídeos tutoriais e educativos
 */
export default function VideosSection({ userPlan = 'completo', onUpsellClick = () => {} }: VideosSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Dados de exemplo dos vídeos
  const videos: Video[] = [
    {
      id: 'video-1',
      title: 'Fazendo Estrela da Sorte',
      description: 'Tutorial para criar uma estrela da sorte decorativa e divertida',
      youtubeId: 'aCa861SPWxA',
      duration: '12:34',
      difficulty: 'fácil',
      ageRange: '4-8 anos',
      topic: 'Estrela'
    },
    {
      id: 'video-2',
      title: 'Como fazer um Dragão',
      description: 'Tutorial completo para montar um dragão incrível em papel',
      youtubeId: 'YqHG9Zfs1pg',
      duration: '15:20',
      difficulty: 'médio',
      ageRange: '6-10 anos',
      topic: 'Dragão'
    },
    {
      id: 'video-3',
      title: 'Morcego com Asas Móveis',
      description: 'Tutorial avançado para criar um morcego com asas que se movem',
      youtubeId: 'kBJGchWe6uU',
      duration: '18:45',
      difficulty: 'difícil',
      ageRange: '7-12 anos',
      topic: 'Morcego'
    },
    {
      id: 'video-4',
      title: 'Mini Garras de Papel',
      description: 'Aprenda a criar mini garras assustadoras e divertidas em papel',
      youtubeId: '7DgeeWsf_dQ',
      duration: '10:30',
      difficulty: 'fácil',
      ageRange: '5-10 anos',
      topic: 'Garras'
    },
    {
      id: 'video-5',
      title: 'Gato Pulante de Origami',
      description: 'Aprenda a criar um gato pulante divertido usando técnicas de origami',
      youtubeId: 'JvmXVeem2lI',
      duration: '12:15',
      difficulty: 'médio',
      ageRange: '6-12 anos',
      topic: 'Origami'
    },
    {
      id: 'video-6',
      title: 'Criando Decorações Extras',
      description: 'Ideias criativas para complementar seus papercrafts com decorações únicas',
      youtubeId: 'DYbiE1OdCfE',
      duration: '14:15',
      difficulty: 'médio',
      ageRange: '6-12 anos',
      topic: 'Criatividade'
    }
  ];

  return (
    <div>
      {selectedVideo ? (
        <VideoDetail video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      ) : (
        <>
          {/* Título e Descrição */}
          <div className="mb-12">
            <div className="relative inline-block mb-6">
              <div className="relative bg-pink-100 border-2 border-pink-600 rounded-2xl px-6 py-3 shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-3 h-3 bg-pink-600 rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-pink-600 rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-pink-600 rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-pink-600 rounded-full transform translate-x-1 translate-y-1"></div>

                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-pink-900">
                  🎥 Vídeos Tutoriais parceiros <span className="text-pink-700 font-extrabold">EdukaPapers!</span>
                </span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
              Assista a nossos <span className="font-semibold text-pink-600">vídeos educativos e tutoriais</span> passo a passo que mostram como criar cada papercraft de forma divertida e segura. Aprenda dicas e técnicas com nossos <span className="font-semibold text-pink-600">educadores experientes!</span>
            </p>

            {/* Bloco de boas-vindas */}
            <section aria-label="Aviso sobre vídeos parceiros" className="mx-auto w-full max-w-3xl px-4 mt-6">
              <div role="note" className="relative rounded-2xl border border-pink-300 bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all duration-200 px-5 py-4 md:px-6 md:py-5">

                {/* "pinos" nos cantos */}
                <span className="absolute -top-2 -left-2 h-3 w-3 rounded-full bg-pink-500"></span>
                <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-pink-500"></span>
                <span className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-pink-500"></span>
                <span className="absolute -bottom-2 -right-2 h-3 w-3 rounded-full bg-pink-500"></span>

                {/* "fitas" levemente inclinadas */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-pink-400/50" style={{ transform: 'rotate(-0.35deg)' }}></div>

                <div className="flex items-start gap-3 md:gap-4 relative z-10">
                  {/* badge de ícone */}
                  <div className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-pink-100 text-xl">📚</div>

                  <div className="flex-1">
                    <p className="text-slate-700">
                      Assista aos vídeos dos <span className="font-semibold text-pink-600">parceiros que ajudaram a criar esse acervo incrível</span> de papercrafts especialmente para você
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Grid de Vídeos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                userPlan={userPlan}
                onClick={() => setSelectedVideo(video)}
                onUpsellClick={onUpsellClick}
              />
            ))}
          </div>

          {/* Banner com link */}
          <div className="mt-12">
            <a href="https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm"
               target="_blank"
               rel="noopener noreferrer"
               className="block rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <img src="/2Banners-Area-Inicio.webp" alt="Banner EdukaBoo" className="w-full h-auto" />
            </a>
          </div>
        </>
      )}
    </div>
  );
}
