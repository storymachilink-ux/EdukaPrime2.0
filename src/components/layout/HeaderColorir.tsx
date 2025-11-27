import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const HeaderColorir: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutos em segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          return 30 * 60; // Reinicia quando chegar a zero
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 md:backdrop-blur-lg border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <img
              src="/logohorizontal.webp"
              alt="EdukaPrime"
              className="h-6 sm:h-8 w-auto"
            />
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 flex-shrink-0">
            <span className="text-red-600 font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
              Promoção Acaba em
            </span>
            <div className="bg-[#FF6B2C] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-lg flex items-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex items-center gap-1">
                <span className="font-bold text-base sm:text-lg tabular-nums">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
