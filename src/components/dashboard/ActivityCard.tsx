import React from 'react';
import { Download, BookMarked, CheckCircle } from 'lucide-react';
import { EducationalActivity } from '../../types/papercraft';

interface ActivityCardProps {
  activity: EducationalActivity;
  onDownload?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ActivityCard({
  activity,
  onDownload,
  isAdmin = false,
  onEdit,
  onDelete,
}: ActivityCardProps) {
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
      {activity.image_url ? (
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                activity.difficulty
              )}`}
            >
              {getDifficultyLabel(activity.difficulty)}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-48 bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
          <BookMarked className="w-12 h-12 text-orange-400" />
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                activity.difficulty
              )}`}
            >
              {getDifficultyLabel(activity.difficulty)}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Subject Badge */}
        <div className="mb-2">
          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
            {activity.subject}
          </span>
          {activity.category && (
            <span className="ml-2 inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
              {activity.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 flex-grow">
          {activity.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {activity.description}
        </p>

        {/* Age Range and Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span>
            📍 {activity.min_age}-{activity.max_age} anos
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {activity.download_count || 0}
          </span>
        </div>

        {/* Answer Key Badge */}
        {activity.has_answer_key && (
          <div className="mb-3 flex items-center gap-2 text-green-600 text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Gabarito incluído
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-4 flex gap-2">
        {onDownload && (
          <button
            onClick={() => onDownload(activity.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        )}

        {isAdmin && (
          <>
            {onEdit && (
              <button
                onClick={() => onEdit(activity.id)}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(activity.id)}
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
