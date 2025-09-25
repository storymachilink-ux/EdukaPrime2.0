import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-lg hover:shadow-xl",
        primary: "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-lg hover:shadow-xl",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
        outline: "border-2 border-[#FFE3A0] bg-[#FFF3D6] text-[#033258] hover:bg-[#FBE9BE] hover:border-[#F59E0B]",
        secondary: "bg-[#FBE9BE] text-[#033258] hover:bg-[#FFE3A0] border border-[#FFE3A0]",
        ghost: "text-[#033258] hover:bg-[#FBE9BE] hover:text-[#033258]",
        link: "text-[#F59E0B] underline-offset-4 hover:underline hover:text-[#D97706]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-[12px] px-3",
        lg: "h-12 rounded-[16px] px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };