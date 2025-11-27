import { Badge } from '../../lib/badgeSystem';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  progress?: number;
  current?: number;
  showProgress?: boolean;
}

export function BadgeCard({ badge, earned = false, progress = 0, current = 0, showProgress = false }: BadgeCardProps) {
  return (
    <div className="relative group">
      {/* Glass Morphism Card */}
      <div
        className={`relative p-6 rounded-2xl backdrop-blur-md border-2 transition-all duration-300 ${
          earned
            ? 'bg-white/40 border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
            : 'bg-gray-100/40 border-gray-300/60 grayscale opacity-60'
        } hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]`}
      >
        {/* Gradient Overlay */}
        {earned && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10 rounded-2xl`}
          />
        )}

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon with glow effect */}
          <div className="relative inline-block mb-3">
            <div
              className={`text-6xl transition-all duration-300 ${
                earned ? 'animate-bounce-slow' : ''
              }`}
            >
              {badge.icon}
            </div>
            {earned && (
              <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} blur-xl opacity-30 rounded-full`} />
            )}
          </div>

          {/* Name */}
          <h3 className={`font-bold text-lg mb-1 ${earned ? 'text-[#0F2741]' : 'text-gray-500'}`}>
            {badge.title}
          </h3>

          {/* Description */}
          <p className={`text-sm mb-3 ${earned ? 'text-gray-700' : 'text-gray-400'}`}>
            {badge.description}
          </p>

          {/* Progress Bar (se showProgress) */}
          {showProgress && !earned && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{current} / {badge.requirement_value}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Badge */}
          {earned && (
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs font-semibold text-[#0F2741] border border-white/80">
              <span>✓</span>
              <span>Conquistado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
