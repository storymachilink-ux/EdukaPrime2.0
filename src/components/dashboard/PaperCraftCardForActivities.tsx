import React from 'react';
import { Sparkles } from 'lucide-react';

interface PaperCraft {
  id: string;
  title: string;
  category: string;
  theme?: 'Natal' | 'Halloween';
  difficulty: 'fácil' | 'médio' | 'difícil';
  description: string;
  model_count: string;
  min_age: number;
  max_age: number;
  image_url?: string;
  gif_url?: string;
  drive_folder_url?: string;
  is_active: boolean;
}

interface PaperCraftCardForActivitiesProps {
  papercraft: PaperCraft;
  onDetailsClick?: (papercraft: PaperCraft) => void;
}

export function PaperCraftCardForActivities({
  papercraft,
  onDetailsClick,
}: PaperCraftCardForActivitiesProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'bg-green-100 text-green-700';
      case 'médio':
        return 'bg-yellow-100 text-yellow-700';
      case 'difícil':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div
      className="relative group transition-all duration-300 animate-fade-in"
      style={{ transform: 'rotate(-1deg)' }}
    >
      {/* Moldura sketch com sombra offset */}
      <div className="absolute inset-0 bg-white border-2 border-blue-600 rounded-lg shadow-[4px_4px_0px_0px] shadow-blue-600 transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />

      <div className="relative overflow-hidden rounded-lg">
        {/* Imagem - sem corte, apenas redimensiona mantendo aspecto */}
        <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          {papercraft.image_url ? (
            <img
              src={papercraft.image_url}
              alt={papercraft.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          )}
        </div>

        <div className="p-3 bg-white">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${getDifficultyColor(papercraft.difficulty)}`}>
              {getDifficultyLabel(papercraft.difficulty)}
            </span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold">
              {papercraft.category}
            </span>
          </div>

          {/* Título */}
          <h3 className="font-bold text-base mb-1 text-gray-900 line-clamp-2">
            {papercraft.title}
          </h3>

          {/* Descrição */}
          <p className="text-gray-600 text-xs mb-2 line-clamp-2">
            {papercraft.description}
          </p>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>📍 {papercraft.min_age}-{papercraft.max_age}</span>
            <span>📦 {papercraft.model_count}</span>
          </div>

          {/* Botão Ver Material */}
          <button
            onClick={() => onDetailsClick?.(papercraft)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ver Material
          </button>
        </div>
      </div>
    </div>
  );
}
