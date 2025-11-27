import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { cn } from '../../lib/utils';
import { usePixelTracking } from '../../hooks/usePixelTracking';
import { trackInitiateCheckout } from '../../lib/tiktokTracker';

export const PlanosColorirNatal: React.FC = () => {
  const { trackProductClick } = usePixelTracking();
  const [isMobile, setIsMobile] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCheckoutClick = (productName: string, price: number, checkoutUrl: string) => {
    // Rastrear em ambos os pixels: Utmify e TikTok
    trackProductClick(productName, price);

    trackInitiateCheckout([
      {
        content_id: productName.replace(/\s+/g, '_').toLowerCase(),
        content_type: 'product',
        content_name: productName
      }
    ], price, 'BRL');

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'papercrafts';
    const utm_campaign = params.get('utm_campaign') || productName.toLowerCase();
    const utm_content = params.get('utm_content') || 'papercraft-kit';
    const utm_term = params.get('utm_term') || '';

    const urlWithUtm = `${checkoutUrl}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;

    // Aguardar 150ms para garantir que eventos foram disparados antes de redirecionar
    setTimeout(() => {
      window.location.href = urlWithUtm;
    }, 150);
  };

  const handleBasicoClick = () => {
    setShowUpgradeModal(true);
  };

  const handleUpgradeYes = () => {
    handleCheckoutClick('EdukaPapers – Kit Completo de Papercrafts Natalinos', 19.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCGRI');
    setShowUpgradeModal(false);
  };

  const handleUpgradeNo = () => {
    handleCheckoutClick('EdukaPapers Papercrafts - Kit Básico Natalino', 12.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCFXV');
    setShowUpgradeModal(false);
  };

  // Counter Component para preço animado
  const Counter = ({ from, to }: { from: number; to: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      const controls = animate(from, to, {
        duration: 1,
        onUpdate(value) {
          node.textContent = value.toFixed(2);
        },
      });
      return () => controls.stop();
    }, [from, to]);
    return <span ref={nodeRef} />;
  };

  // Componente de Card Animado para Kit Completo
  const AnimatedPricingCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    // Mobile: desabilita efeito 3D para melhor performance
    const rotateX = useSpring(useTransform(mouseY, isMobile ? [-0.5, 0.5] : [-0.5, 0.5], isMobile ? [0, 0] : [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, isMobile ? [-0.5, 0.5] : [-0.5, 0.5], isMobile ? [0, 0] : [-7, 7]), springConfig);

    const plan = {
      name: "EdukaPapers – Kit Completo de Papercrafts Natalinos",
      price: 19.99,
      oldPrice: 97.90,
      features: [
        "Mais de 60 personagens e decorações temáticas natalinas para montar, decorar e brincar",
        "Bônus 1: Kit de papercraft inspirado no nascimento de Jesus",
        "Bônus 2: Trem do Noel + Jogos Educativos",
        "Bônus 3: Caixinha de Presente Bichinhos para presentear e decorar",
        "Modelos com histórias divertidas e guias passo a passo ilustrados",
        "Atividade lúdica e educativa, perfeita para escolas e famílias",
        "Acesso imediato em PDF — é só imprimir, recortar e montar",
        "Material ÚNICO, EXCLUSIVO e COLECIONÁVEL"
      ],
      accent: "bg-[#009944]"
    };

    return (
      <motion.button
        onClick={() => {
          handleCheckoutClick('EdukaPapers – Kit Completo de Papercrafts Natalinos', 29.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCFXS');
        }}
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          rotateX: isMobile ? 0 : rotateX, // Desabilita rotação em mobile
          rotateY: isMobile ? 0 : rotateY, // Desabilita rotação em mobile
          perspective: 1000,
        }}
        onMouseMove={(e) => {
          if (isMobile || !cardRef.current) return; // Desabilita em mobile
          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          mouseX.set((e.clientX - centerX) / rect.width);
          mouseY.set((e.clientY - centerY) / rect.height);
        }}
        onMouseLeave={() => {
          if (isMobile) return; // Desabilita em mobile
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="block max-w-md mx-auto relative w-full bg-white rounded-xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200 cursor-pointer"
      >
        {/* Price Badge */}
        <motion.div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] bg-[#009944]"
          animate={isMobile ? {} : {
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
            y: [0, -5, 5, -3, 0]
          }}
          transition={isMobile ? {} : {
            duration: 5,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
        >
          <div className="text-center text-[#FFD700]">
            <div className="text-lg font-black text-white">R$29,99</div>
          </div>
        </motion.div>

        {/* Plan Name and Popular Badge */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-black mb-1">
            EdukaPapers Papercrafts<br />Temáticos de Natal
          </h3>
          <p className="text-sm font-bold text-[#009944] mb-1">Edição Limitada — 80% OFF</p>
          <p className="text-lg font-bold text-black mb-3">EdukaPapers – Kit Completo de Papercrafts Natalinos</p>
          <motion.span
            className={cn(
              "inline-block px-3 py-1 text-white font-bold rounded-md text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
              plan.accent
            )}
            animate={isMobile ? {} : {
              y: [0, -3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={isMobile ? {} : {
              duration: 2,
              repeat: Infinity
            }}
          >
            80% OFF
          </motion.span>

          {/* Imagem do produto */}
          <div className="mt-4 flex justify-center">
            <img
              src="/Natal/Produto-Imagem.webp"
              alt="EdukaPapers Papercrafts"
              className="w-4/5 h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2 mb-4">
          {plan.features.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                x: 5,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            >
              <motion.span
                whileHover={{ scale: 1.2, rotate: 360 }}
                className={cn(
                  "w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-xs border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]",
                  plan.accent
                )}
              >
                ✓
              </motion.span>
              <span className="text-black font-bold text-sm">
                {feature.startsWith('Bônus') ? (
                  <>
                    <span className="text-[#009944]">{feature.split(':')[0]}:</span>
                    {feature.split(':')[1]}
                  </>
                ) : feature.includes('COLECIONÁVEL') ? (
                  <>
                    Material <span className="text-[#009944]">ÚNICO, EXCLUSIVO e COLECIONÁVEL</span>
                  </>
                ) : (
                  feature
                )}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="w-full py-3 rounded-lg text-white font-black text-base text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200 bg-green-600 hover:bg-green-700"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.95,
            rotate: [-1, 1, 0],
          }}
        >
          QUERO MATERIAL COMPLETO →
        </motion.div>
      </motion.button>
    );
  };

  // Componente de Card Animado para Kit Básico
  const BasicPricingCard = () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 15, stiffness: 150 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

    const plan = {
      name: "EdukaPapers – Kit Básico de Papercrafts Natalinos",
      features: [
        "20 personagens natalinos para imprimir, recortar e montar",
        "Modelos como Papai Noel, Rena, Boneco de Neve e Enfeites Divertidos",
        "Guia passo a passo simplificado — fácil até para as crianças montarem sozinhas",
        "Atividade criativa e educativa, perfeita para escolas e momentos em família",
        "Material em PDF de alta qualidade — pronto para imprimir e se divertir"
      ],
      excluded: "Não inclui bônus especiais",
      accent: "bg-gray-700"
    };

    return (
      <motion.button
        onClick={() => {
          handleBasicoClick();
        }}
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          rotateX: isMobile ? 0 : rotateX, // Desabilita rotação em mobile
          rotateY: isMobile ? 0 : rotateY, // Desabilita rotação em mobile
          perspective: 1000,
        }}
        onMouseMove={(e) => {
          if (isMobile || !cardRef.current) return; // Desabilita em mobile
          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          mouseX.set((e.clientX - centerX) / rect.width);
          mouseY.set((e.clientY - centerY) / rect.height);
        }}
        onMouseLeave={() => {
          if (isMobile) return; // Desabilita em mobile
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="block max-w-md mx-auto relative w-full bg-gray-50 rounded-xl p-6 border-4 border-gray-800 shadow-[6px_6px_0px_0px_rgba(55,65,81,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(55,65,81,0.9)] transition-all duration-200 cursor-pointer"
      >
        {/* Price Badge */}
        <motion.div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] bg-[#C1440E]"
          animate={isMobile ? {} : {
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
            y: [0, -5, 5, -3, 0]
          }}
          transition={isMobile ? {} : {
            duration: 5,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
        >
          <div className="text-center text-[#FFD700]">
            <div className="text-lg font-black">R$12,99</div>
          </div>
        </motion.div>

        {/* Plan Name */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-gray-800 mb-3">
            EdukaPapers Papercrafts<br />Kit Básico Natalino
          </h3>
          <p className="text-lg font-bold text-gray-700 mb-3">EdukaPapers – Kit Básico de Papercrafts Natalinos</p>
        </div>

        {/* Features List */}
        <div className="space-y-2 mb-4">
          {plan.features.map((feature, i) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{
                x: 5,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded-md border-2 border-gray-700 shadow-[2px_2px_0px_0px_rgba(55,65,81,0.9)]"
            >
              <motion.span
                whileHover={{ scale: 1.2, rotate: 360 }}
                className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-xs border border-gray-700 shadow-[1px_1px_0px_0px_rgba(55,65,81,0.9)] bg-gray-700"
              >
                ✓
              </motion.span>
              <span className="text-gray-800 font-bold text-sm">
                {feature}
              </span>
            </motion.div>
          ))}

          {/* Excluded Item - Em vermelho */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: plan.features.length * 0.1 }}
            className="flex items-center gap-2 p-2 bg-red-50 rounded-md border-2 border-red-500 shadow-[2px_2px_0px_0px_rgba(239,68,68,0.9)]"
          >
            <span className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-xs border border-red-500 shadow-[1px_1px_0px_0px_rgba(239,68,68,0.9)] bg-red-500">
              ✕
            </span>
            <span className="text-red-600 font-bold text-sm">
              {plan.excluded}
            </span>
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.div
          className="w-full py-3 rounded-lg text-white font-black text-base text-center border-2 border-gray-800 shadow-[4px_4px_0px_0px_rgba(55,65,81,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(55,65,81,0.9)] active:shadow-[2px_2px_0px_0px_rgba(55,65,81,0.9)] transition-all duration-200 bg-gray-700 hover:bg-gray-800"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{
            scale: 0.95,
            rotate: [-1, 1, 0],
          }}
        >
          QUERO MATERIAL BÁSICO →
        </motion.div>
      </motion.button>
    );
  };

  // Carrossel de Crianças
  function CriancasCarousel() {
    const images = [
      '/Natal/kid01.webp',
      '/Natal/kid02.webp',
      '/Natal/kid03.webp',
      '/Natal/kid04.webp',
      '/Natal/kid05.webp',
      '/Natal/kid06.webp'
    ];
    const [currentIndex, setCurrentIndex] = useState(0);

    const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return (
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <div className="relative bg-white rounded-2xl shadow-xl p-4 border-2 border-[#FFE3A0]">
            <img
              src={images[currentIndex]}
              alt={`Criança pintando ${currentIndex + 1}`}
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Botões de navegação */}
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-[#FF6B2C] text-white rounded-full p-3 shadow-lg transition-all ${!isMobile ? 'hover:bg-[#FF8C4A] hover:scale-110' : 'active:scale-95'}`}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF6B2C] text-white rounded-full p-3 shadow-lg transition-all ${!isMobile ? 'hover:bg-[#FF8C4A] hover:scale-110' : 'active:scale-95'}`}
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores de página */}
          <div className="flex justify-center gap-2 mt-6">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-3 rounded-full transition-all ${
                  idx === currentIndex ? 'w-10 bg-[#FF6B2C]' : 'w-3 bg-gray-300'
                }`}
                aria-label={`Ir para imagem ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="planos" className="py-16 md:py-24 bg-gray-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - PERSONALIZADO */}
        <div className="text-center mb-16">
          {/* Faixa Post-it */}
          <div className="relative inline-block mb-8">
            <div className="relative bg-[#FFF3D6] border-2 border-[#8B5CF6] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
              {/* Detalhes dos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              {/* Texto destacado - PERSONALIZADO */}
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#9A6A00] relative z-10">
                <div>O que você receberá no EdukaPapers</div>
                <div className="text-[#db143c]">Papercrafts Temáticos de Natal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Tipos de Obras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Personagens Clássicos do Natal */}
          <div className="relative group transition-all duration-300 rotate-[-1deg]">
            <div className="absolute inset-0 bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#9A6A00] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
            <div className="relative p-6">
              {/* Bolinhas nos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              <img src="/Natal/recebe01.webp" alt="Personagens Natal" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#009944] mb-2">🎅 Personagens Clássicos do Natal</h3>
              <p className="text-sm text-[#033258]">Monte figuras icônicas como Papai Noel, Rena, Boneco de Neve e Enfeites Divertidos, cada um com sua própria mini-história e guia passo a passo.</p>
            </div>
          </div>

          {/* Card 2 - Decorações Interativas e Molduras 3D */}
          <div className="relative group transition-all duration-300 rotate-[1deg]">
            <div className="absolute inset-0 bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#9A6A00] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
            <div className="relative p-6">
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              <img src="/Natal/recebe02.webp" alt="Decorações 3D" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#009944] mb-2">🎄 Decorações Interativas e Molduras 3D</h3>
              <p className="text-sm text-[#033258]">Crie painéis tridimensionais, mini cenários e molduras com profundidade para transformar sua sala de aula ou casa em um verdadeiro estúdio temático de Natal.</p>
            </div>
          </div>

          {/* Card 3 - Histórias e Lendas Recontadas */}
          <div className="relative group transition-all duration-300 rotate-[-0.5deg]">
            <div className="absolute inset-0 bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#9A6A00] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
            <div className="relative p-6">
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              <img src="/Natal/recebe03.webp" alt="Histórias Natal" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#009944] mb-2">🎅 Gorro do Papai Noel em Papel</h3>
              <p className="text-sm text-[#033258]">Monte um gorro de Natal tamanho real usando apenas papel! As crianças adoram vestir e entrar no clima natalino com essa atividade criativa e super divertida.</p>
            </div>
          </div>

          {/* Card 4 - Atividades de Coordenação e Montagem */}
          <div className="relative group transition-all duration-300 rotate-[0.5deg]">
            <div className="absolute inset-0 bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#9A6A00] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
            <div className="relative p-6">
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              <img src="/Natal/recebe04.webp" alt="Atividades Montagem" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#009944] mb-2">🐣 Kit Infantil com Montagem Fácil</h3>
              <p className="text-sm text-[#033258]">Papers para montar com passos simples, criados para as crianças mais novas terem a primeira experiência criativa com papel. Uma forma divertida de estimular atenção, motricidade e independência.</p>
            </div>
          </div>

        </div>

        {/* Seção de Pinturas das Crianças */}
        <div className="mb-12">
          {/* Texto acima do título - REMOVIDO */}

          {/* Título com fundo rosa */}
          <div className="bg-[#f43f5e] rounded-2xl px-8 py-6 mb-8 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              Confira as criações feitas com o EdukaPapers!
            </h2>
          </div>

          {/* Carrossel de Imagens */}
          <CriancasCarousel />

          {/* Mini descrição */}
          <p className="text-center text-lg md:text-xl text-white mt-6 italic">
            Arraste e veja como esse material transforma papel em personagens incríveis e momentos inesquecíveis.
          </p>
        </div>

        {/* Card Branco com Bônus e Como Funciona */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Seção de Bônus */}
          <div id="bonus-section" className="mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink text-center mb-12">
              {(() => {
                const now = new Date();
                const day = now.getDate();
                const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                const month = monthNames[now.getMonth()];
                return (
                  <>
                    Ao adquirir hoje dia <span className="font-extrabold text-[#8B5CF6]">{day} de {month}</span>, você ganha 03 bônus exclusivos
                  </>
                );
              })()}
            </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bônus 01 */}
            <div className="relative group transition-all duration-300 rotate-[-1deg]">
              <div className="absolute inset-0 bg-white border-2 border-[#FF6B2C] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#CC5522] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                {/* Bolinhas nos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 translate-y-1"></div>

                <img src="/Natal/bonus01.webp" alt="Bônus 01" className="w-full h-auto object-contain rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 25,00</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Kit de papercraft inspirado no nascimento de Jesus</h3>
                <p className="text-sm text-[#033258]">Ideal para atividades bíblicas e pedagógicas. Inclui personagens como Jesus Bebê, Maria, José e o Arcanjo Miguel, além de um cenário completo para montar.</p>
              </div>
            </div>

            {/* Bônus 02 */}
            <div className="relative group transition-all duration-300 rotate-[1deg]">
              <div className="absolute inset-0 bg-white border-2 border-[#FF6B2C] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#CC5522] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                {/* Bolinhas nos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 translate-y-1"></div>

                <img src="/Natal/bonus02.webp" alt="Bônus 02" className="w-full h-auto object-contain rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 39,99</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Trem do Noel + Jogos Educativos</h3>
                <p className="text-sm text-[#033258]">Dê vida ao trem do Papai Noel com montagem passo a passo e peças incríveis. Acompanha atividades lúdicas, caça-palavras e explorações visuais para aprender brincando.</p>
              </div>
            </div>

            {/* Bônus 03 */}
            <div className="relative group transition-all duration-300 rotate-[-0.5deg]">
              <div className="absolute inset-0 bg-white border-2 border-[#FF6B2C] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#CC5522] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
              <div className="relative p-6">
                {/* Bolinhas nos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#CC5522] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#CC5522] rounded-full transform translate-x-1 translate-y-1"></div>

                <img src="/Natal/bonus03.webp" alt="Bônus 03" className="w-full h-auto object-contain rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 10,99</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Caixinha de Presente Bichinhos</h3>
                <p className="text-sm text-[#033258]">Transforme bichinhos fofos em caixinhas de presente encantadoras! São mini papercrafts para montar, com versão para colorir e também já coloridos perfeitos para presentear, decorar e brincar com criatividade.</p>
              </div>
            </div>
          </div>
        </div>
        </div>
        {/* Fim do Card Branco */}

        {/* Seção Banner Final */}
        <div className="mb-16 max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8">
            Momentos assim vocês vão <span className="font-extrabold text-[#FFD700]">lembrar pra sempre</span>.
          </h2>
          <img
            src="/Natal/produto-plat.webp"
            alt="Caixa Produto Natal"
            className="w-full h-auto rounded-2xl shadow-lg"
          />

          {/* Imagem Preço Ajuste */}
          <div id="preco-ajuste" className="mt-12 mb-8 flex justify-center scroll-mt-20">
            <img
              src="/img/precoajuste.webp"
              alt="Preço Ajuste"
              className="w-full max-w-2xl h-auto"
            />
          </div>

          {/* Cards Animados - Estilo PricingContainer */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <AnimatedPricingCard />
              </div>
              <div>
                <BasicPricingCard />
              </div>
            </div>
          </div>
        </div>

        {/* Seção Como Funciona */}
        <div id="como-funciona-natal" className="mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-12">
            Como funciona:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Item 1 - Chega no seu e-mail */}
            <div className="text-center">
              <img src="/email.webp" alt="Chega no seu e-mail" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Chega no seu e-mail</h3>
              <p className="text-sm text-white">O material são todas 100% em PDF, após o pagamento você recebe imediatamente o link de acesso no seu e-mail e tem acesso a todos os guias de montagem e modelos.</p>
            </div>

            {/* Item 2 - Você Imprime */}
            <div className="text-center">
              <img src="/imprimir.webp" alt="Você Imprime" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Você Imprime</h3>
              <p className="text-sm text-white">O material é todo dividido em módulos temáticas. Assim você pode imprimir quantas vezes quiser e como desejar na sua casa.</p>
            </div>

            {/* Item 3 - Hora de Montar */}
            <div className="text-center">
              <img src="/corte.webp" alt="Hora de Montar" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Hora de Montar</h3>
              <p className="text-sm text-white">É hora de recortar e aprender sobre o universo da arte de forma leve e divertida!</p>
            </div>
          </div>
        </div>

        {/* Seção Aprovado BNCC */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="/boo/aprovado.webp"
              alt="Aprovado"
              className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-lg mb-6"
            />
            <p className="text-lg md:text-xl text-white mb-8">
              O Kit EdukaPapers é recomendado por <span className="font-bold text-green-600">educadores e pais, que acreditam no verdadeiro desempenho das crianças e reforçam seu desenvolvimento</span>, o melhor em atividades lúdicas e interativas.
            </p>
          </div>
        </div>

        {/* Guarantee Section */}
        <div className="bg-[#F1F6FF] rounded-[24px] p-8">
          {/* Post-it Title - PERSONALIZADO */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="relative bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-2xl px-6 py-3 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                {/* Detalhes dos cantos */}
                <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

                {/* Texto destacado */}
                <span className="text-2xl md:text-3xl font-bold text-[#9A6A00] relative z-10">
                  Risco ZERO para você! ✅
                </span>
              </div>
            </div>
          </div>

          {/* Guarantee Image */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <img
                src="/Natal/garantianatal.webp"
                alt="30 dias de garantia - Ou seu dinheiro de volta"
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>
          </div>

          {/* Guarantee Text - PERSONALIZADO */}
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C3E87] text-center mb-6">
              🎨 Garantia de Satisfação — 30 Dias de Tranquilidade
            </h3>
            <p className="text-lg text-[#4A5568] leading-relaxed text-center">
              Confiamos tanto na magia do <strong>EdukaPapers que você pode testar sem nenhum risco por 30 dias!</strong><br /><br />
              Se nesse período você sentir que o material não encantou seu pequeno, não despertou a imaginação ou não trouxe a diversão criativa que prometemos, <strong>devolvemos 100% do seu investimento, sem perguntas e sem burocracia.</strong><br /><br />
              ✨ Experimente, monte e se surpreenda — o EdukaPapers vai provar que aprender e criar pode ser incrivelmente mágico durante o Natal!
            </p>

            {/* WhatsApp Button */}
            <div className="text-center mt-8">
              <a
                href="https://wa.me/+556793091209?text=Oiee%20tenho%20d%C3%BAvidas%20sobre%20a%20plataforma%20Eduka%20Prime%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-50/60 text-[#1B5E20] border-2 border-dashed border-[#2E7D32] px-8 py-4 rounded-full font-semibold text-lg shadow-md hover:bg-green-100/70 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Ainda tenho dúvidas 👉🏼
                <img src="/whats.webp" alt="WhatsApp" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal de Upgrade */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg aspect-square p-8 space-y-4 flex flex-col">
              {/* Fechar */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Título */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#145C44] mb-1">
                  Espere!
                </h2>
                <p className="text-lg font-bold text-[#db143c]">
                  Oferta Exclusiva!
                </p>
              </div>

              {/* Mensagem */}
              <div className="text-center space-y-3 flex-1">
                <p className="text-base font-semibold text-[#2E2E2E]">
                  Upgrade para Coleção Completa com DESCONTO EXTRA
                </p>

                {/* Preços */}
                <div className="bg-[#FFF3D6] rounded-lg p-4 space-y-2">
                  <p className="text-sm text-[#6B7280] line-through">
                    De R$29,99
                  </p>
                  <p className="text-3xl font-black text-[#16A34A]">
                    Por apenas R$19,99
                  </p>
                  <p className="text-sm font-bold text-[#db143c]">
                    Economize R$10 agora!
                  </p>
                </div>

                {/* Benefícios */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Todos os 3 bônus inclusos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Atualizações mensais
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Suporte prioritário
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={handleUpgradeYes}
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 rounded-lg transition-colors"
                >
                  SIM, QUERO O DESCONTO!
                </button>
                <button
                  onClick={handleUpgradeNo}
                  className="w-full bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#2E2E2E] font-bold py-3 rounded-lg transition-colors"
                >
                  Não, quero o básico
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
