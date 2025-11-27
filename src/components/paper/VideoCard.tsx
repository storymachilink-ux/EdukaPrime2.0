import React from 'react';

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

interface VideoCardProps {
  video: Video;
  onClick?: () => void;
  userPlan?: string;
  onUpsellClick?: () => void;
}

// Função helper para gerar URL da thumbnail do YouTube
const getYouTubeThumbnail = (youtubeId: string) => {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
};

export default function VideoCard({ video, onClick, userPlan = 'completo', onUpsellClick }: VideoCardProps) {
  const isBasicPlan = userPlan === 'basico';

  const difficultyColor = {
    fácil: 'bg-green-100 text-green-700 border-green-300',
    médio: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    difícil: 'bg-red-100 text-red-700 border-red-300'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
    >
      {/* Thumbnail com botão play */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-purple-200 to-pink-200">
        <img
          src={getYouTubeThumbnail(video.youtubeId)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* Overlay Play Button */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-4 group-hover:bg-white transition-all duration-300 transform group-hover:scale-110">
            <svg className="w-8 h-8 text-pink-500 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duração */}
        <div className="absolute bottom-3 right-3 bg-black text-white text-xs font-bold px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 md:p-5">
        {/* Tópico e Dificuldade */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs md:text-sm px-3 py-1 bg-pink-100 text-pink-700 border border-pink-300 rounded-full font-semibold">
            {video.topic}
          </span>
          <span className={`text-xs md:text-sm px-3 py-1 border rounded-full font-semibold capitalize ${difficultyColor[video.difficulty]}`}>
            {video.difficulty}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {video.description}
        </p>

        {/* Faixa Etária */}
        <div className="text-sm text-gray-700 font-medium mb-4 flex items-center gap-2">
          <span>👶</span>
          {video.ageRange}
        </div>

        {/* Botão */}
        {isBasicPlan ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpsellClick?.();
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
          >
            Quero Acesso Total
          </button>
        ) : (
          <button onClick={onClick} className="w-full bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold py-2 px-4 rounded-xl hover:from-pink-700 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Assistir Vídeo
          </button>
        )}
      </div>
    </div>
  );
}
