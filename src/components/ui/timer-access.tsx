"use client";

import * as React from "react";
import { Timer } from "@ark-ui/react/timer";
import { Coffee, Play } from "lucide-react";

export default function TimerAccessGate() {
  const [started, setStarted] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const fallbackRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    if (!started) setStarted(true);
    if (!fallbackRef.current) {
      fallbackRef.current = setTimeout(() => setDone(true), 40_000);
    }

    // Scroll suave para o vídeo
    setTimeout(() => {
      const videoContainer = document.getElementById('video-container');
      if (videoContainer) {
        videoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  React.useEffect(() => {
    return () => {
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, []);

  return (
    <div className="w-full px-4 py-8 flex flex-col items-center">
      <Timer.Root
        countdown
        startMs={40 * 1000}
        className="w-full max-w-sm"
        onComplete={() => setDone(true)}
      >
        <div className="rounded-2xl p-8 flex flex-col items-center gap-6" style={{ backgroundColor: '#a1e9b0', borderColor: '#18812d', borderWidth: '4px' }}>
          {/* Header com imagem e título */}
          <div className="flex items-center justify-center gap-3">
            <img
              src="/Natal/origami.png"
              alt="Origami"
              className="w-8 h-8 object-contain"
            />
            <h3 className="font-semibold text-lg" style={{ color: '#1a4f24' }}>
              Acessar Área Exclusiva
            </h3>
          </div>

          {/* Timer */}
          <Timer.Area className="text-center">
            <div className="inline-flex text-5xl font-bold font-mono" style={{ color: '#1a4f24' }}>
              <Timer.Item type="minutes" className="min-w-[2ch] text-center" />
              <Timer.Separator>:</Timer.Separator>
              <Timer.Item type="seconds" className="min-w-[2ch] text-center" />
            </div>
          </Timer.Area>


          {/* Botão Start */}
          {!started && (
            <Timer.Control className="flex justify-center">
              <Timer.ActionTrigger
                action="start"
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-white transition-colors text-sm font-medium bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4" />
                Start
              </Timer.ActionTrigger>
            </Timer.Control>
          )}

          {/* Botão Acesso Liberado */}
          {started && (
            <div className="flex justify-center">
              {done ? (
                <a
                  href="https://edukaprime.com.br/loginpaper"
                  className="px-6 py-2 rounded-lg text-white text-sm font-medium transition-colors bg-green-600 hover:bg-green-700"
                >
                  Acesso liberado
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-400 text-gray-600 cursor-not-allowed"
                >
                  Acesso liberado
                </button>
              )}
            </div>
          )}
        </div>
      </Timer.Root>

      {/* Texto fora do card */}
      <div className="text-xs text-gray-600 text-center mt-4 px-3 py-2 rounded" style={{ backgroundColor: '#ecdbc0' }}>
        Enquanto isso, assista ao vídeo abaixo 👇
      </div>
    </div>
  );
}
