import React from 'react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  duration: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  ageRange: string;
  topic: string;
}

interface VideoDetailProps {
  video: Video;
  onClose: () => void;
}

export default function VideoDetail({ video, onClose }: VideoDetailProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header com botão voltar */}
      <div className="bg-gradient-to-r from-pink-600 to-red-500 px-6 py-6 md:py-8 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-white hover:opacity-80 transition-opacity duration-200 font-semibold text-lg flex items-center gap-2"
        >
          ← Voltar
        </button>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex-1">
          {video.title}
        </h2>
        <div className="w-6"></div>
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10">
        {/* Coluna Principal - Vídeo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Player YouTube */}
          <div className="rounded-2xl overflow-hidden shadow-xl bg-black aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Descrição */}
          <div className="bg-gray-50 rounded-2xl p-6 border-2 border-purple-200">
            <h3 className="font-bold text-gray-900 mb-3 text-lg">📖 Descrição do Vídeo</h3>
            <p className="text-gray-700 leading-relaxed">
              {video.description}
            </p>
            <p className="text-gray-600 text-sm mt-4">
              ⏱️ Duração: <span className="font-semibold">{video.duration}</span>
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Botão Full Screen */}
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              <span>🔗</span>
              Abrir no YouTube
            </a>

            {/* Botão Compartilhar */}
            <button
              onClick={() => {
                const url = `https://www.youtube.com/watch?v=${video.youtubeId}`;
                navigator.clipboard.writeText(url);
                alert('Link copiado para a área de transferência!');
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              <span>📤</span>
              Copiar Link
            </button>
          </div>
        </div>

        {/* Coluna Lateral - Informações */}
        <div className="space-y-4">
          {/* Info Cards */}
          {/* Tópico */}
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 border-2 border-pink-300">
            <p className="text-xs text-gray-700 mb-1 font-semibold">Tópico</p>
            <p className="text-lg font-bold text-pink-700">
              {video.topic}
            </p>
          </div>

          {/* Dificuldade */}
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-4 border-2 border-orange-300">
            <p className="text-xs text-gray-700 mb-1 font-semibold">Dificuldade</p>
            <p className="text-lg font-bold text-orange-700 capitalize">
              {video.difficulty}
            </p>
          </div>

          {/* Faixa Etária */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 border-2 border-blue-300">
            <p className="text-xs text-gray-700 mb-1 font-semibold">Faixa Etária</p>
            <p className="text-lg font-bold text-blue-700">
              {video.ageRange}
            </p>
          </div>

          {/* Duração */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 border-2 border-purple-300">
            <p className="text-xs text-gray-700 mb-1 font-semibold">Duração</p>
            <p className="text-lg font-bold text-purple-700">
              {video.duration}
            </p>
          </div>

          {/* Dica */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 mt-6">
            <p className="text-sm text-yellow-800 font-semibold flex items-start gap-2">
              <span>💡</span>
              <span>
                Recomenda-se assistir em tela cheia para melhor visualização dos detalhes!
              </span>
            </p>
          </div>

          {/* Atalhos */}
          <div className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-4">
            <p className="text-sm text-gray-700 font-semibold mb-3">⌨️ Atalhos:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <span className="font-mono">Espaço</span> = Play/Pause</li>
              <li>• <span className="font-mono">F</span> = Tela Cheia</li>
              <li>• <span className="font-mono">↑↓</span> = Volume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
