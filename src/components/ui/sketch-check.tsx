import React from 'react';
import { cn } from "../../lib/utils";
import { Check } from 'lucide-react';

interface SketchCheckProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SketchCheck: React.FC<SketchCheckProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={cn(
      "rounded-full border-2 border-green-600 bg-green-50 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-110 hover:shadow-md",
      sizeClasses[size],
      className
    )}>
      <Check className={cn("text-green-600", iconSizes[size])} strokeWidth={3} />
    </div>
  );
};
