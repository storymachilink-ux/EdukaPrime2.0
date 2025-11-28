import React, { useRef, useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './CustomVideoPlayer.css';

interface CustomVideoPlayerProps {
  videoUrl?: string;
  title?: string;
}

export function CustomVideoPlayer({ videoUrl = 'https://i.imgur.com/V9Rec3Q.mp4', title = 'Vídeo de Motivação' }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [showAudioPrompt, setShowAudioPrompt] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [visibleProgress, setVisibleProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [savedTime, setSavedTime] = useState(0);

  // Configurações da barra de progresso
  const leadFactor = 1.15;
  const plateauPauses = useRef<{ time: number; duration: number }[]>([]);
  const lastProgressUpdateRef = useRef(0);

  // Hook para Intersection Observer (detectar se o player está visível)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Player voltou à tela
          if (isPaused && videoRef.current) {
            videoRef.current.play();
            setIsPaused(false);
          }
          setIsVisible(true);
        } else {
          // Player saiu da tela
          if (videoRef.current && !videoRef.current.paused) {
            setSavedTime(videoRef.current.currentTime);
            videoRef.current.pause();
            setIsPaused(true);
          }
          setIsVisible(false);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isPaused]);

  // Inicializar pausas aleatórias na barra de progresso
  useEffect(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      if (duration && plateauPauses.current.length === 0) {
        // Gerar 1-3 pausas aleatórias
        const numPauses = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numPauses; i++) {
          const randomTime = Math.random() * (duration * 0.7); // Até 70% da duração
          const pauseDuration = Math.random() * 600 + 200; // 200-800ms
          plateauPauses.current.push({ time: randomTime, duration: pauseDuration });
        }
      }
    }
  }, []);

  // Função para calcular progresso visual com lead factor
  const calculateVisualProgress = (currentTime: number, duration: number): number => {
    if (!duration) return 0;

    const ninetyPercentMark = duration * 0.9;
    let targetProgress = (currentTime * leadFactor) / duration;

    // Nunca permitir atingir 95% muito cedo
    targetProgress = Math.min(targetProgress, 0.95);

    // Quando atingir últimos 10%, fazer catch-up suave
    if (currentTime >= ninetyPercentMark) {
      const remainingPercent = (currentTime - ninetyPercentMark) / (duration - ninetyPercentMark);
      targetProgress = 0.95 + remainingPercent * 0.05;
    }

    // Clampear entre 0 e 1
    return Math.max(0, Math.min(1, targetProgress));
  };

  // Atualizar progresso da barra
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const now = Date.now();
      const currentTime = video.currentTime;
      const duration = video.duration;

      // Aplicar easing suave com cubic-bezier
      const baseProgress = calculateVisualProgress(currentTime, duration);

      // Verificar se está em uma plateau
      let finalProgress = baseProgress;
      for (const pause of plateauPauses.current) {
        if (currentTime >= pause.time && currentTime < pause.time + 1) {
          // Congelar progresso por um tempo
          finalProgress = (pause.time * leadFactor) / duration;
          break;
        }
      }

      setVisibleProgress(finalProgress);
      lastProgressUpdateRef.current = now;
    };

    const interval = setInterval(updateProgress, 100);

    return () => clearInterval(interval);
  }, []);

  // Manipular clique no botão de áudio
  const handleAudioToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsAudioEnabled(true);
      setShowAudioPrompt(false);

      if (videoRef.current.paused) {
        videoRef.current.play();
      }
    }
  };

  // Bloquear interações de pausa, avanço e seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = (e: Event) => {
      // Permitir play apenas quando visível
      if (!isVisible) {
        video.pause();
      }
    };

    const handlePause = (e: Event) => {
      // Bloquear pausa manual
      if (!isPaused && isVisible) {
        e.preventDefault();
        // Nota: preventDefault não funciona em pause, então retomamos
        if (!showAudioPrompt) {
          video.play();
        }
      }
    };

    const handleSeeking = (e: Event) => {
      e.preventDefault();
      video.currentTime = video.currentTime;
    };

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    // Bloquear controles de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if ([' ', 'ArrowRight', 'ArrowLeft', 'k'].includes(e.key)) {
        e.preventDefault();
      }
    };

    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('contextmenu', handleContextMenu);
    video.addEventListener('play', handlePlay);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('contextmenu', handleContextMenu);
      video.removeEventListener('play', handlePlay);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, isPaused, showAudioPrompt]);

  return (
    <div
      ref={containerRef}
      className="custom-video-player"
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        aspectRatio: '16 / 9',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted={true}
        autoPlay={true}
        playsInline
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#000',
        }}
      />

      {/* Overlay de Áudio - Botão "Clique para ouvir" */}
      {showAudioPrompt && (
        <div className="audio-prompt-overlay">
          <button
            onClick={handleAudioToggle}
            className="audio-prompt-button"
            title="Ativar áudio"
          >
            <VolumeX className="w-6 h-6" />
            <span>Clique para ouvir</span>
          </button>
        </div>
      )}

      {/* Barra de Progresso Minimalista */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{
            width: `${visibleProgress * 100}%`,
          }}
        />
      </div>

      {/* CSS-in-JS para controles desabilitados */}
      <style>{`
        video::-webkit-media-controls {
          display: none !important;
        }
        video::-moz-media-controls {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
