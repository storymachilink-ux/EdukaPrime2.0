"use client";
import React, { useEffect, useRef, PropsWithChildren } from "react";
import { cn } from "../../lib/utils";

type Props = PropsWithChildren<{ className?: string }>;

export default function AnimatedBorderCardLight({ className, children }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const animate = () => {
      const t = Date.now() / 1000;
      const s = 0.5;
      if (topRef.current) topRef.current.style.transform = `translateX(${Math.sin(t * s) * 100}%)`;
      if (rightRef.current) rightRef.current.style.transform = `translateY(${Math.cos(t * s) * 100}%)`;
      if (bottomRef.current) bottomRef.current.style.transform = `translateX(${Math.sin(t * s + Math.PI) * 100}%)`;
      if (leftRef.current) leftRef.current.style.transform = `translateY(${Math.cos(t * s + Math.PI) * 100}%)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        // CORES DA SEÇÃO:
        // bg card: #fbe9be | texto: #033258 | borda: #ffe3a0
        "relative overflow-hidden rounded-2xl bg-[#fbe9be] text-[#033258] border border-[#ffe3a0] p-6",
        "shadow-[0_8px_24px_rgba(3,50,88,.06)] hover:shadow-[0_12px_28px_rgba(3,50,88,.10)]",
        "transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Linhas animadas (laranja/roxo claros) */}
      <div className="absolute top-0 left-0 w-full h-0.5 overflow-hidden">
        <div ref={topRef} className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-0.5 h-full overflow-hidden">
        <div ref={rightRef} className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-violet-400/40 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 overflow-hidden">
        <div ref={bottomRef} className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
      </div>
      <div className="absolute top-0 left-0 w-0.5 h-full overflow-hidden">
        <div ref={leftRef} className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-violet-400/40 to-transparent" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}