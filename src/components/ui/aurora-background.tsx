"use client";
import { cn } from "../../lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

/**
 * AuroraBackground — fundo animado "aurora", ajustado para a paleta do site.
 * - Base do HERO: bg #FFF7D6 (amarelo clarinho)
 * - Aurora usa variações laranja/roxo/azul claro (coerente com o tema)
 * - Altura flexível: min-h em vez de h-[100vh]
 */
export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] bg-[#FFF9E8] text-ink transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--orange-200)_10%,var(--amber-200)_18%,var(--rose-200)_26%,var(--violet-100)_34%,var(--sky-200)_42%,var(--orange-200)_50%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[12px] invert-0 dark:invert
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-multiply
            pointer-events-none
            absolute -inset-[14px] opacity-55 will-change-transform
          `,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_12%,var(--transparent)_72%)]`
          )}
        />
      </div>

      {/* Conteúdo do HERO permanece como estiver */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};