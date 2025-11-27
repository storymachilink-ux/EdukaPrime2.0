import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvatarConfig {
  avatar_image_url: string;
  message_text: string;
  link_url: string;
  is_active: boolean;
  show_on_first_visit: boolean;
  has_border: boolean;
  border_color: string;
}

export function FloatingAvatar() {
  const [config, setConfig] = useState<AvatarConfig | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig();
    checkFirstVisit();
    checkSilencedState();
  }, []);

  // Fechar mensagem ao clicar fora (com delay para evitar conflito)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (showMessage) {
          setShowMessage(false);
          setClickCount(0);
        }
      }
    };

    if (showMessage) {
      // Adicionar listener apenas após 300ms para garantir que o clique que abre seja processado
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMessage]);

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from('avatar_popup')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000002')
      .eq('is_active', true)
      .single();

    if (!error && data && data.avatar_image_url) {
      setConfig(data);
      setIsLoaded(true);
    }
  };

  const checkFirstVisit = () => {
    const hasVisited = localStorage.getItem('avatar_popup_visited');
    if (!hasVisited) {
      localStorage.setItem('avatar_popup_visited', 'true');
      // Se config.show_on_first_visit = true, abrirá automaticamente
      setTimeout(() => {
        if (config?.show_on_first_visit) {
          setShowMessage(true);
        }
      }, 1000);
    }
  };

  const checkSilencedState = () => {
    const silenced = localStorage.getItem('avatar_popup_silenced');
    if (silenced === 'true') {
      setIsSilenced(true);
    }
  };

  const handleAvatarClick = () => {
    if (isSilenced) {
      // Precisa de duplo clique para reativar
      setClickCount((prev) => prev + 1);
      if (clickCount >= 1) {
        setIsSilenced(false);
        localStorage.removeItem('avatar_popup_silenced');
        setShowMessage(true);
        setClickCount(0);
      }
      return;
    }

    // Comportamento normal: APENAS ABRE a mensagem (não fecha)
    if (!showMessage) {
      setShowMessage(true);
      setClickCount((prev) => prev + 1);

      // Se clicar 3x sem interagir, silenciar
      if (clickCount >= 2) {
        setIsSilenced(true);
        localStorage.setItem('avatar_popup_silenced', 'true');
        setShowMessage(false);
        setClickCount(0);
      }
    }
    // Removido o else que fechava ao clicar novamente
  };

  const handleMessageClick = () => {
    if (config?.link_url) {
      window.open(config.link_url, '_blank');
      setClickCount(0); // Reset click count quando interage
    }
  };

  const handleCloseMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMessage(false);
    setClickCount(0); // Reset quando fecha normalmente
  };

  // Quebrar texto a cada 15 caracteres
  const formatMessageText = (text: string) => {
    const maxCharsPerLine = 15;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      // Se adicionar a palavra ultrapassar 15 caracteres, criar nova linha
      if ((currentLine + word).length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    // Adicionar última linha
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  if (!config || !isLoaded) return null;

  return (
    <>
      {/* Avatar Flutuante */}
      <div
        ref={containerRef}
        className={`fixed z-[100] ${
          // Mobile: bem acima do menu inferior (bottom-24 = 6rem)
          // Desktop: canto inferior direito
          'bottom-24 right-4 md:bottom-8 md:right-8'
        }`}
      >
        <div className="relative">
          {/* Mensagem Pop-up */}
          {showMessage && (
            <div
              className={`absolute animate-fade-in ${
                // Mobile: acima do avatar
                // Desktop: à esquerda do avatar
                'bottom-full mb-2 right-0 md:right-full md:mr-3 md:bottom-0'
              }`}
            >
              <div
                className={`bg-white rounded-lg shadow-xl px-4 py-2 relative whitespace-nowrap ${
                  config.link_url ? 'cursor-pointer hover:shadow-2xl transition-all' : ''
                }`}
                onClick={config.link_url ? handleMessageClick : undefined}
              >
                {/* Botão Fechar */}
                <button
                  onClick={handleCloseMessage}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full transition-colors z-10 shadow-md"
                >
                  <X className="w-3 h-3 text-white" />
                </button>

                {/* Texto com quebras de linha a cada 15 caracteres */}
                <div className="text-xs text-gray-800 font-medium leading-tight pr-6">
                  {formatMessageText(config.message_text).map((line, index) => (
                    <div key={index} className="whitespace-nowrap">
                      {line}
                    </div>
                  ))}
                </div>

                {config.link_url && (
                  <div className="mt-1 pt-1 border-t border-gray-200">
                    <span className="text-[10px] text-blue-600 font-bold whitespace-nowrap">
                      Clique para saber mais →
                    </span>
                  </div>
                )}
              </div>

              {/* Seta da mensagem */}
              <div
                className={`absolute ${
                  // Mobile: seta para baixo (aponta pro avatar)
                  // Desktop: seta para direita
                  'top-full right-4 -mt-1 md:left-full md:top-1/2 md:-translate-y-1/2 md:-ml-1 md:mt-0'
                }`}
              >
                <div
                  className={`w-0 h-0 ${
                    // Mobile: triângulo apontando pra baixo
                    // Desktop: triângulo apontando pra direita
                    'border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white md:border-l-[8px] md:border-l-white md:border-t-[8px] md:border-t-transparent md:border-b-[8px] md:border-b-transparent md:border-r-0'
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Avatar */}
          <div
            onClick={handleAvatarClick}
            className="relative w-12 h-12 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            <img
              src={config.avatar_image_url}
              alt="Avatar"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            {/* Badge de notificação - ícone de conversa */}
            {!showMessage && !isSilenced && (
              <div className="absolute -bottom-1 -left-1">
                <MessageCircle className="w-4 h-4 text-green-500 fill-green-500" />
              </div>
            )}

            {/* Indicador de estado silenciado */}
            {isSilenced && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">2x</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
