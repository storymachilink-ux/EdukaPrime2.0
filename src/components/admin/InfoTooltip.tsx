import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  title: string; // Title of the tooltip
  description: string; // Detailed description
  children?: React.ReactNode; // Optional content below description
  position?: 'top' | 'bottom' | 'left' | 'right'; // Tooltip position (default: top)
  size?: 'sm' | 'md'; // Icon size
  className?: string; // Additional CSS classes
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  children,
  position = 'top',
  size = 'sm',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowPositions = {
    top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900',
    bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900',
    left: 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900',
    right: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900',
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="relative inline-flex items-center justify-center focus:outline-none"
        title={title}
      >
        <Info className={`${iconSizeClasses[size]} text-blue-500 hover:text-blue-700 transition-colors cursor-help`} />
      </button>

      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} bg-gray-900 text-white rounded-lg shadow-xl z-50 pointer-events-none animate-in fade-in duration-200`}
          style={{ width: 'max-content', maxWidth: '280px' }}
        >
          <div className="px-3 py-2">
            <p className="font-bold text-sm text-white mb-1">{title}</p>
            <p className="text-xs text-gray-200 leading-relaxed">{description}</p>
            {children && (
              <div className="mt-2 text-xs text-gray-300 border-t border-gray-700 pt-2">
                {children}
              </div>
            )}
          </div>
          <div className={`absolute w-0 h-0 ${arrowPositions[position]}`} />
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
