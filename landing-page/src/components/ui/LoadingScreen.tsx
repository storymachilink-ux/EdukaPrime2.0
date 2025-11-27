import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  maxDuration?: number; // Maximum loading time in milliseconds
  onTimeout?: () => void; // Callback when timeout is reached
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  maxDuration = 10000,
  onTimeout
}) => {
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      if (elapsed >= maxDuration) {
        setTimeoutReached(true);
        clearInterval(timer);
        onTimeout?.();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [maxDuration, onTimeout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] to-[#FFE3A0] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logohorizontal.png"
            alt="EdukaPrime"
            className="h-12 w-auto mx-auto mb-4"
          />
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto"></div>

            {/* Progress ring */}
            <div className="absolute inset-0 w-16 h-16 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#FFE3A0"
                  strokeWidth="2"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - elapsedTime / maxDuration)}`}
                  className="transition-all duration-100 ease-out"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-4">
          <p className="text-[#033258] text-lg font-medium">
            {timeoutReached ? 'Verificando conexão...' : 'Carregando...'}
          </p>
          <div className="w-32 h-1 bg-[#FFE3A0] rounded-full mx-auto mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full transition-all duration-100 ease-out"
              style={{ width: `${Math.min((elapsedTime / maxDuration) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-sm text-[#624044]">
          {timeoutReached ? (
            <div className="space-y-2">
              <p>A conexão está demorando mais que o esperado.</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          ) : (
            <p>Verificando suas credenciais...</p>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-500 border-t pt-4">
            <p>Tempo decorrido: {Math.round(elapsedTime / 1000)}s</p>
            <p>Máximo: {Math.round(maxDuration / 1000)}s</p>
          </div>
        )}
      </div>
    </div>
  );
};