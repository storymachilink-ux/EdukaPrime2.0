import React from 'react';
import { Download, Star, BookOpen } from 'lucide-react';
import { PaperCraft } from '../../types/papercraft';

interface PaperCraftCardProps {
  papercraft: PaperCraft;
  onDownload?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PaperCraftCard({
  papercraft,
  onDownload,
  isAdmin = false,
  onEdit,
  onDelete,
}: PaperCraftCardProps) {
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Image */}
      {papercraft.image_url ? (
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={papercraft.image_url}
            alt={papercraft.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                papercraft.difficulty
              )}`}
            >
              {getDifficultyLabel(papercraft.difficulty)}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-purple-400" />
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                papercraft.difficulty
              )}`}
            >
              {getDifficultyLabel(papercraft.difficulty)}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
            {papercraft.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 flex-grow">
          {papercraft.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {papercraft.description}
        </p>

        {/* Age Range */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Star className="w-4 h-4" />
          <span>
            {papercraft.min_age}-{papercraft.max_age} anos
          </span>
        </div>

        {/* Model Count */}
        <div className="text-sm font-semibold text-gray-700 mb-4">
          📦 {papercraft.model_count}
        </div>

        {/* Price (if applicable) */}
        {papercraft.price && (
          <div className="text-lg font-bold text-green-600 mb-4">
            R$ {papercraft.price.toFixed(2)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 flex gap-2">
        {onDownload && (
          <button
            onClick={() => onDownload(papercraft.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        )}

        {isAdmin && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(papercraft.id)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(papercraft.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Deletar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
