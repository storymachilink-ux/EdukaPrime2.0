import React, { useEffect, useRef } from 'react';

interface AuroraHeroProps {
  text: string;
  subtitle?: string;
  className?: string;
}

export const AuroraHero: React.FC<AuroraHeroProps> = ({ text, subtitle, className = '' }) => {
    const heroRef = useRef<HTMLDivElement>(null);
    const starsRef = useRef<HTMLDivElement>(null);
    const auroraTextRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const hero = heroRef.current;
        const stars = starsRef.current;
        const auroraText = auroraTextRef.current;

        if (!hero || !stars || !auroraText) return;

        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const rect = hero.getBoundingClientRect();
            const { width, height } = rect;

            const x = (clientX - rect.left) / width - 0.5; // -0.5 to 0.5
            const y = (clientY - rect.top) / height - 0.5; // -0.5 to 0.5

            // Parallax for the stars
            stars.style.transform = `translateX(${x * -20}px) translateY(${y * -20}px)`;

            // Shift the aurora gradient based on mouse position
            const bgPosX = 50 + x * 40;
            const bgPosY = 50 + y * 40;
            auroraText.style.backgroundPosition = `${bgPosX}% ${bgPosY}%`;
        };

        hero.addEventListener('mousemove', handleMouseMove);

        return () => {
            hero.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div ref={heroRef} className={`hero-container ${className}`}>
            <div ref={starsRef} className="stars"></div>
            <main className="relative z-10 text-center">
                <h1 ref={auroraTextRef} className="aurora-text text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                    {text}
                </h1>
                {subtitle && (
                    <p className="mt-4 text-base md:text-lg text-white/70 max-w-lg mx-auto">
                        {subtitle}
                    </p>
                )}
            </main>
        </div>
    );
};
