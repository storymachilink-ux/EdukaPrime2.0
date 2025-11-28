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
    <div className="relative group w-full">
      {/* Glass Morphism Card */}
      <div
        className={`relative p-3 rounded-xl backdrop-blur-md border-2 transition-all duration-300 w-full h-full flex flex-col items-center justify-center ${
          earned
            ? 'bg-white/40 border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
            : 'bg-gray-100/40 border-gray-300/60 grayscale opacity-60'
        } hover:scale-105 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)]`}
      >
        {/* Gradient Overlay */}
        {earned && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-10 rounded-xl`}
          />
        )}

        {/* Content */}
        <div className="relative z-10 text-center w-full flex flex-col items-center">
          {/* Icon with glow effect */}
          <div className="relative inline-block mb-2">
            <div
              className={`text-4xl transition-all duration-300 flex-shrink-0 ${
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
          <h3 className={`font-bold text-xs mb-1 line-clamp-2 ${earned ? 'text-[#0F2741]' : 'text-gray-500'}`}>
            {badge.title}
          </h3>

          {/* Description */}
          <p className={`text-[10px] mb-2 line-clamp-2 ${earned ? 'text-gray-700' : 'text-gray-400'}`}>
            {badge.description}
          </p>

          {/* Progress Bar (se showProgress) */}
          {showProgress && !earned && (
            <div className="mt-2 w-full px-1">
              <div className="flex justify-between text-[9px] text-gray-600 mb-1">
                <span>{current} / {badge.requirement_value}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Earned Badge */}
          {earned && (
            <div className="mt-2 inline-flex items-center gap-0.5 px-2 py-0.5 bg-white/60 backdrop-blur-sm rounded-full text-[9px] font-semibold text-[#0F2741] border border-white/80 whitespace-nowrap">
              <span>✓</span>
              <span>Conquistado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
