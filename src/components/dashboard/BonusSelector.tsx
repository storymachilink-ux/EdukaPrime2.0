import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface BonusSelectorProps {
  activeTab: 'activities' | 'papercrafts';
  onTabChange: (tab: 'activities' | 'papercrafts') => void;
  activityCount?: number;
  papercraftCount?: number;
}

export function BonusSelector({
  activeTab,
  onTabChange,
  activityCount = 0,
  papercraftCount = 0,
}: BonusSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Coleções Especiais</h2>

      <div className="flex gap-3 flex-wrap">
        {/* Activities Tab */}
        <button
          onClick={() => onTabChange('activities')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'activities'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Atividades BNCC</span>
          {activityCount > 0 && (
            <span className="ml-2 bg-white text-orange-600 rounded-full px-2 py-0.5 text-sm font-bold">
              {activityCount}
            </span>
          )}
        </button>

        {/* PaperCrafts Tab */}
        <button
          onClick={() => onTabChange('papercrafts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === 'papercrafts'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Coleções PaperCrafts</span>
          {papercraftCount > 0 && (
            <span className="ml-2 bg-white text-blue-600 rounded-full px-2 py-0.5 text-sm font-bold">
              {papercraftCount}
            </span>
          )}
        </button>
      </div>

      {/* Description */}
      <p className="mt-4 text-gray-600 text-sm">
        {activeTab === 'activities'
          ? 'Explore nossas atividades educacionais alinhadas com a BNCC. Materiais prontos para usar em sala de aula.'
          : 'Descubra nossas coleções de papercrafts criativos. Perfeitos para aprendizado lúdico e divertido.'}
      </p>
    </div>
  );
}
