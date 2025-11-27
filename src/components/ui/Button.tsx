import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantClasses = {
      default: "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-lg hover:shadow-xl",
      primary: "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-lg hover:shadow-xl",
      outline: "border border-[#FFE3A0] bg-white text-[#033258] hover:bg-[#FFF3D6]",
      secondary: "bg-white text-[#033258] border border-[#FFE3A0] hover:bg-[#FFF3D6]",
      ghost: "text-[#033258] hover:bg-[#FFF3D6] hover:text-[#033258]",
    };

    const sizeClasses = {
      default: "h-11 px-5",
      sm: "h-9 px-3",
      lg: "h-12 px-6",
    };

    return (
      <button
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };