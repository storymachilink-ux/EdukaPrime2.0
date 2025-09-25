import React from 'react';
import { SubscribeButton } from '../ui/subscribe-button';
import { LoginButton } from '../ui/login-button';
import { AuroraBackground } from '../ui/aurora-background';
import { SparklesText } from '../ui/sparkles-text';

interface HeroProps {
  onLoginClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onLoginClick }) => {
  return (
    <section id="inicio">
      <AuroraBackground className="px-4">
        <div className="max-w-6xl mx-auto py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6 text-center lg:text-left">
            <SparklesText
              text="DIGA ADEUS AO BLOQUEIO CRIATIVO E"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-2"
              colors={{
                first: "#FF6B2C",
                second: "#7A6AF5"
              }}
              sparklesCount={15}
            />
            
            {/* Faixa Post-it */}
            <div className="relative inline-block my-2">
              <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>
                
                {/* Texto destacado */}
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#9A6A00] relative z-10">
                  PARE DE PERDER HORAS PRECIOSAS
                </span>
              </div>
            </div>
            
            <SparklesText
              text="EM BUSCA DE ATIVIDADES!"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight mt-2"
              colors={{
                first: "#FF6B2C",
                second: "#7A6AF5"
              }}
              sparklesCount={10}
            />
            
            <p className="text-lg text-body leading-relaxed max-w-xl mx-auto lg:mx-0">
              Com a plataforma EdukaPrime, você tem acesso imediato a um acervo gigantesco de atividades prontas para imprimir e usar — desde a fase inicial da leitura e matemática até conteúdos mais avançados de interpretação de texto, gramática, literatura e ortografia.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] bg-surface border border-border shadow-card rounded-2xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Atividades educacionais prontas para usar"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3 justify-center lg:justify-start">
              <SubscribeButton />
              <LoginButton onClick={onLoginClick} />
            </div>
          </div>
        </div>
        </div>
      </AuroraBackground>
    </section>
  );
};