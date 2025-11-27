import React, { useState, useEffect } from 'react';

export const TimerBarNoel: React.FC = () => {
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#db143c] text-white py-2 px-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 text-sm md:text-base font-bold">
        <span className="text-lg">⏳</span>
        <span>DESCONTO SÓ HOJE NESSA PÁGINA</span>
        <span className="animate-pulse">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};
