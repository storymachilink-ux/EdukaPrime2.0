import { X } from 'lucide-react';
import { BadgeCard } from './BadgeCard';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: any[];
}

export function BadgesModal({ isOpen, onClose, badges }: BadgesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#0F2741]">🏆 Todas as Conquistas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div key={badge.id} style={{
                background: '#F5F7CD',
                border: '1px dashed #5C5037',
                borderRadius: '12px',
                padding: '4px'
              }}>
                <BadgeCard
                  badge={badge}
                  earned={badge.earned}
                  progress={badge.progress}
                  current={badge.current}
                  showProgress={!badge.earned}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
