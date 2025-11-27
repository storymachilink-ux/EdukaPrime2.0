"use client";
import React, { useEffect, useRef, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type Props = PropsWithChildren<{ className?: string }>;

export default function AnimatedBorderCard({ className, children }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      const now = Date.now() / 1000;
      const speed = 0.5;
      const topX = Math.sin(now * speed) * 100;
      const rightY = Math.cos(now * speed) * 100;
      const bottomX = Math.sin(now * speed + Math.PI) * 100;
      const leftY = Math.cos(now * speed + Math.PI) * 100;

      if (topRef.current) topRef.current.style.transform = `translateX(${topX}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${rightY}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${bottomX}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${leftY}%)`;

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        // CARD COM FUNDO #fbe9be + SOMBRA + BORDA SUAVE
        "relative overflow-hidden rounded-2xl bg-[#fbe9be] border border-[#E6EEF7] p-6 shadow-[0_8px_24px_rgba(15,39,65,.06)] hover:shadow-[0_12px_28px_rgba(15,39,65,.09)] transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Linhas animadas (cores do tema: laranja/roxo claros) */}
      <div className="absolute top-0 left-0 w-full h-0.5 overflow-hidden">
        <div
          ref={topRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-orange-400/35 to-transparent"
        />
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-full overflow-hidden">
        <div
          ref={rightRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-violet-400/35 to-transparent"
        />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
        <div
          ref={bottomRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-orange-400/35 to-transparent"
        />
      </div>
      <div className="absolute top-0 left-0 w-0.5 h-full overflow-hidden">
        <div
          ref={leftRef}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-violet-400/35 to-transparent"
        />
      </div>

      {/* Conteúdo do card */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}