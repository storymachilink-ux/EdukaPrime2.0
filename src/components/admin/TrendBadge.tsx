import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendBadgeProps {
  value: number; // Percentage value (e.g., 5.2 for 5.2%)
  label?: string; // Optional label to display
  isPositive?: boolean; // If not provided, uses the sign of value
  showPercent?: boolean; // Whether to show the % symbol (default: true)
  size?: 'sm' | 'md' | 'lg'; // Size of the badge
  className?: string; // Additional CSS classes
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({
  value,
  label,
  isPositive,
  showPercent = true,
  size = 'md',
  className = '',
}) => {
  const isPositiveTrend = isPositive !== undefined ? isPositive : value >= 0;
  const displayValue = Math.abs(value);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const bgColorClass = isPositiveTrend
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap ${sizeClasses[size]} ${bgColorClass}`}
      >
        {isPositiveTrend ? (
          <TrendingUp className={iconSizeClasses[size]} />
        ) : (
          <TrendingDown className={iconSizeClasses[size]} />
        )}
        {displayValue.toFixed(1)}
        {showPercent && '%'}
      </span>
      {label && (
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      )}
    </div>
  );
};

export default TrendBadge;
