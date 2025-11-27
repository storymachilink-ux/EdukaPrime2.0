"use client";
import { cn } from "../../lib/utils";
import React, { ReactNode, useEffect, useState, useRef } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

/**
 * AuroraBackground — fundo animado "aurora", ajustado para a paleta do site.
 * - Base do HERO: bg #FFF7D6 (amarelo clarinho)
 * - Aurora usa variações laranja/roxo/azul claro (coerente com o tema)
 * - Altura flexível: min-h em vez de h-[100vh]
 * - OTIMIZADO: Desabilita animações em mobile para melhor performance
 * - OTIMIZADO: Pausa animações quando fora da viewport
 */
export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detectar se é mobile (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intersection Observer para pausar animações fora da viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Ativar quando 10% estiver visível
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] bg-[#FFF9E8] text-ink transition-bg",
        className
      )}
      {...props}
    >
      {/* Renderizar animações apenas em desktop e quando visível */}
      {!isMobile && isVisible && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--orange-200)_10%,var(--amber-200)_30%,var(--violet-100)_50%,var(--orange-200)_70%)]
              [background-image:var(--white-gradient),var(--aurora)]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[6px] invert-0 dark:invert
              after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:animate-aurora after:[background-attachment:fixed] after:mix-blend-multiply
              pointer-events-none
              absolute -inset-[14px] opacity-35 will-change-transform
              transform translate-z-0
            `,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_12%,var(--transparent)_72%)]`
            )}
          />
        </div>
      )}

      {/* Conteúdo do HERO permanece como estiver */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};