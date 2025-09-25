import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className 
}) => {
  const variants = {
    primary: 'bg-[#FBE7A2] text-[#1F1F1F] dark:bg-[#2A2417] dark:text-[#F5F5F5]',
    secondary: 'bg-[#F7D7D2] text-[#1F1F1F] dark:bg-[#2A1F1D] dark:text-[#F5F5F5]'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};