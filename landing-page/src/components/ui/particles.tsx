"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type Dot = {
  x: number; y: number; translateX: number; translateY: number;
  size: number; alpha: number; targetAlpha: number; dx: number; dy: number;
  magnetism: number; color: string;
};

interface ParticlesProps {
  className?: string;
  quantity?: number;        // desktop
  mobileQuantity?: number;  // mobile
  staticity?: number;
  ease?: number;
  size?: number;            // raio base em px
  refresh?: boolean;
  colors?: string[];        // lista de cores para variar brilho
  vx?: number;
  vy?: number;
}

function hexToRgba(hex: string, alpha = 1) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Particles({
  className = "",
  quantity = 90,
  mobileQuantity = 40,
  staticity = 60,
  ease = 70,
  size = 1.6,
  refresh = false,
  // Amarelos clarinhos com leve variação de brilho (NÃO sobrecarregar)
  colors = ["#FFF2B8", "#FFECA0", "#FFE38A", "#FFD972"],
  vx = 0, vy = 0,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const dots = useRef<Dot[]>([]);
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches);
  }, []);

  useEffect(() => {
    if (canvasRef.current) ctx.current = canvasRef.current.getContext("2d");
    init(); animate();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const init = () => { resize(); seed(); };

  const resize = () => {
    if (!containerRef.current || !canvasRef.current || !ctx.current) return;
    dots.current.length = 0;
    sizeRef.current.w = containerRef.current.offsetWidth;
    sizeRef.current.h = containerRef.current.offsetHeight;
    canvasRef.current.width = sizeRef.current.w * dpr;
    canvasRef.current.height = sizeRef.current.h * dpr;
    canvasRef.current.style.width = `${sizeRef.current.w}px`;
    canvasRef.current.style.height = `${sizeRef.current.h}px`;
    ctx.current.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const dotParams = (): Dot => {
    const x = Math.floor(Math.random() * sizeRef.current.w);
    const y = Math.floor(Math.random() * sizeRef.current.h);
    const translateX = 0, translateY = 0;
    const pSize = Math.random() * 1.2 + size;             // 1.6px ~ 2.8px
    const alpha = 0;
    const targetAlpha = +(Math.random() * 0.4 + 0.15).toFixed(2); // brilho sutil
    const dx = (Math.random() - 0.5) * 0.2;
    const dy = (Math.random() - 0.5) * 0.2;
    const magnetism = 0.2 + Math.random() * 3.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism, color };
  };

  const seed = () => {
    clear();
    const count = isMobile ? mobileQuantity : quantity;
    for (let i = 0; i < count; i++) dots.current.push(dotParams());
    render();
  };

  const clear = () => ctx.current?.clearRect(0, 0, sizeRef.current.w, sizeRef.current.h);

  const render = () => {
    if (!ctx.current) return;
    clear();
    dots.current.forEach((d) => {
      const { x, y, translateX, translateY, size: s, alpha, color } = d;
      ctx.current!.save();
      ctx.current!.translate(translateX, translateY);
      ctx.current!.beginPath();
      ctx.current!.arc(x, y, s, 0, 2 * Math.PI);
      ctx.current!.fillStyle = hexToRgba(color, alpha);
      ctx.current!.fill();
      ctx.current!.restore();
    });
  };

  const animate = () => {
    dots.current.forEach((d, i) => {
      const edge = [
        d.x + d.translateX - d.size,
        sizeRef.current.w - d.x - d.translateX - d.size,
        d.y + d.translateY - d.size,
        sizeRef.current.h - d.y - d.translateY - d.size,
      ];
      const closest = edge.reduce((a, b) => Math.min(a, b));
      const t = Math.max(0, Math.min(1, closest / 28));
      d.alpha += (d.targetAlpha * t - d.alpha) * 0.08;

      d.x += d.dx + vx; d.y += d.dy + vy;
      d.translateX += (mouse.current.x / (staticity / d.magnetism) - d.translateX) / ease;
      d.translateY += (mouse.current.y / (staticity / d.magnetism) - d.translateY) / ease;

      if (d.x < -d.size || d.x > sizeRef.current.w + d.size ||
          d.y < -d.size || d.y > sizeRef.current.h + d.size)
        dots.current[i] = dotParams();
    });
    render();
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      mouse.current.x = e.clientX - rect.left - rect.width / 2;
      mouse.current.y = e.clientY - rect.top - rect.height / 2;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className={cn("pointer-events-none", className)} ref={containerRef} aria-hidden="true">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}