import React, { useState, useRef } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { cn } from '../../lib/utils';
import { usePixelTracking } from '../../hooks/usePixelTracking';
import { trackInitiateCheckout } from '../../lib/tiktokTracker';

export const PlanosColorirPaper: React.FC = () => {
  const { trackProductClick } = usePixelTracking();

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
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

    const plan = {
      name: "EdukaBoo – Kit Completo de Papercrafts",
      price: 19.99,
      oldPrice: 97.90,
      features: [
        "Mais de 60 personagens clássicos para montar, decorar e brincar",
        "Bônus 1: Coleção Stranger Things em versão paper craft",
        "Bônus 2: Jogos Temáticos de Montagem com desafios e mini atividades",
        "Bônus 3: Decorações Interativas 3D para salas de aula e festas",
        "Modelos com histórias divertidas e guias ilustrados",
        "Atividade lúdica e educativa, perfeita para escolas e famílias",
        "Acesso imediato em PDF — é só imprimir, recortar e montar",
        "Material ÚNICO, EXCLUSIVO e COLECIONÁVEL"
      ],
      accent: "bg-[#8B5CF6]"
    };

    return (
      <motion.button
        onClick={() => {
          handleCheckoutClick('EdukaBoo – Kit Completo de Papercrafts', 29.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCDW3');
        }}
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
        }}
        onMouseMove={(e) => {
          if (!cardRef.current) return;
          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          mouseX.set((e.clientX - centerX) / rect.width);
          mouseY.set((e.clientY - centerY) / rect.height);
        }}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="block max-w-md mx-auto relative w-full bg-white rounded-xl p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-200 cursor-pointer"
      >
        {/* Price Badge */}
        <motion.div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] bg-[#FF9D2A]"
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
            y: [0, -5, 5, -3, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
        >
          <div className="text-center text-gray-800">
            <div className="text-lg font-black">R$29,99</div>
          </div>
        </motion.div>

        {/* Plan Name and Popular Badge */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-black mb-1">
            EdukaBoo Papercrafts<br />Temáticos de Halloween
          </h3>
          <p className="text-sm font-bold text-[#8B5CF6] mb-1">Edição Limitada — 80% OFF</p>
          <p className="text-lg font-bold text-black mb-3">EdukaBoo – Kit Completo de Papercrafts</p>
          <motion.span
            className={cn(
              "inline-block px-3 py-1 text-white font-bold rounded-md text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]",
              plan.accent
            )}
            animate={{
              y: [0, -3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            80% OFF
          </motion.span>

          {/* Imagem do produto */}
          <div className="mt-4 flex justify-center">
            <img
              src="/boo/edukaboo-produto.webp"
              alt="EdukaBoo Papercrafts"
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
                    <span className="text-[#8B5CF6]">{feature.split(':')[0]}:</span>
                    {feature.split(':')[1]}
                  </>
                ) : feature.includes('COLECIONÁVEL') ? (
                  <>
                    Material <span className="text-[#8B5CF6]">ÚNICO, EXCLUSIVO e COLECIONÁVEL</span>
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
      name: "EdukaBoo – Kit Básico de Papercrafts",
      features: [
        "20 personagens clássicos do Halloween para imprimir, recortar e montar",
        "Modelos como Drácula, Cavaleiro Sem Cabeça, Bruxinhas e Fantasmas Divertidos",
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
          handleCheckoutClick('EdukaBoo Papercrafts - Kit Básico', 17.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCDW5');
        }}
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          rotateX,
          rotateY,
          perspective: 1000,
        }}
        onMouseMove={(e) => {
          if (!cardRef.current) return;
          const rect = cardRef.current.getBoundingClientRect();
          const centerX = rect.x + rect.width / 2;
          const centerY = rect.y + rect.height / 2;
          mouseX.set((e.clientX - centerX) / rect.width);
          mouseY.set((e.clientY - centerY) / rect.height);
        }}
        onMouseLeave={() => {
          mouseX.set(0);
          mouseY.set(0);
        }}
        className="block max-w-md mx-auto relative w-full bg-gray-50 rounded-xl p-6 border-4 border-gray-800 shadow-[6px_6px_0px_0px_rgba(55,65,81,0.9)] hover:shadow-[8px_8px_0px_0px_rgba(55,65,81,0.9)] transition-all duration-200 cursor-pointer"
      >
        {/* Price Badge */}
        <motion.div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] bg-[#8B5CF6]"
          animate={{
            rotate: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 0.9, 1.1, 1],
            y: [0, -5, 5, -3, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: [0.76, 0, 0.24, 1]
          }}
        >
          <div className="text-center text-white">
            <div className="text-lg font-black">R$15,99</div>
          </div>
        </motion.div>

        {/* Plan Name */}
        <div className="mb-4">
          <h3 className="text-2xl font-black text-gray-800 mb-3">
            EdukaBoo Papercrafts<br />Kit Básico
          </h3>
          <p className="text-lg font-bold text-gray-700 mb-3">EdukaBoo – Kit Básico de Papercrafts</p>
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
      '/boo/kid01.webp',
      '/boo/kid02.webp',
      '/boo/kid03.webp',
      '/boo/kid04.webp',
      '/boo/kid05.webp',
      '/boo/kid06.webp'
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
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#FF6B2C] hover:bg-[#FF8C4A] text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF6B2C] hover:bg-[#FF8C4A] text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
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
    <section id="planos" className="py-16 md:py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - PERSONALIZE AQUI */}
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
                <div>O que você receberá no EdukaBoo</div>
                <div className="text-[#8B5CF6]">Papercrafts Temáticos de Halloween</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Tipos de Obras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1 - Personagens Clássicos do Halloween */}
          <div className="relative group transition-all duration-300 rotate-[-1deg]">
            <div className="absolute inset-0 bg-[#FFF3D6] border-2 border-[#FFE3A0] rounded-lg shadow-[4px_4px_0px_0px] shadow-[#9A6A00] transition-all duration-300 group-hover:shadow-[8px_8px_0px_0px] group-hover:translate-x-[-4px] group-hover:translate-y-[-4px]" />
            <div className="relative p-6">
              {/* Bolinhas nos cantos */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#9A6A00] rounded-full transform -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#9A6A00] rounded-full transform translate-x-1 translate-y-1"></div>

              <img src="/boo/Recebe01.webp" alt="Personagens Halloween" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-2">🧛‍♂️ Personagens Clássicos do Halloween</h3>
              <p className="text-sm text-[#033258]">Monte figuras icônicas como Drácula, Bruxinhas, Cavaleiro Sem Cabeça e Fantasmas Divertidos, cada um com sua própria mini-história e guia passo a passo.</p>
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

              <img src="/boo/Recebe02.webp" alt="Decorações 3D" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-2">🎃 Decorações Interativas e Molduras 3D</h3>
              <p className="text-sm text-[#033258]">Crie painéis tridimensionais, mini cenários e molduras com profundidade para transformar sua sala de aula ou casa em um verdadeiro estúdio temático de Halloween.</p>
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

              <img src="/boo/Recebe03.webp" alt="Histórias Halloween" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-2">👻 Histórias e Lendas Recontadas</h3>
              <p className="text-sm text-[#033258]">Cada personagem vem com curiosidades e mitos adaptados para o universo infantil, despertando imaginação e interesse cultural.</p>
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

              <img src="/boo/Recebe04.webp" alt="Atividades Montagem" className="w-full h-auto object-contain rounded-lg mb-4" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-2">🪄 Atividades de Coordenação e Montagem</h3>
              <p className="text-sm text-[#033258]">Passo a passo simples, pensado para estimular coordenação motora fina, foco e criatividade de forma divertida e segura.</p>
            </div>
          </div>

        </div>

        {/* Seção de Pinturas das Crianças */}
        <div className="mb-12">
          {/* Texto acima do título - REMOVIDO */}

          {/* Título com fundo rosa */}
          <div className="bg-[#f43f5e] rounded-2xl px-8 py-6 mb-8 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              Confira as criações feitas com o EdukaBoo!
            </h2>
          </div>

          {/* Carrossel de Imagens */}
          <CriancasCarousel />

          {/* Mini descrição */}
          <p className="text-center text-lg md:text-xl text-white mt-6 italic">
            Arraste e veja como esse material transforma papel em personagens incríveis e momentos inesquecíveis.
          </p>

          {/* Título */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mt-12 mb-8">
            <span className="text-[#FF9D2A] font-extrabold">Papercrafts Temáticos</span> ajudam seu pequeno a:
          </h2>
        </div>

        {/* Mockup Sem e Com */}
        <div className="mb-12 max-w-5xl mx-auto">
          <img
            src="/MOCKUP-SEM-E-COM01.webp"
            alt="Mockup - Sem e Com Pequenos Artistas"
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>

        {/* Card Branco com Bônus e Como Funciona */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Seção de Bônus */}
          <div className="mb-16">
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

                <img src="/boo/bonus01.webp" alt="Bônus 01" className="w-full h-auto object-contain rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 25,00</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Decoração de Halloween Interativa</h3>
                <p className="text-sm text-[#033258]">Itens que se movem, dobram e criam efeitos 3D para deixar o ambiente mágico e envolvente.</p>
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

                <img src="/boo/bonus02.webp" alt="Bônus 02" className="w-full h-48 object-cover rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 39,99</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Papers Stranger Things — Turma Completa</h3>
                <p className="text-sm text-[#033258]">Monte os personagens mais amados da série em estilo cartoon assustadoramente fofo.</p>
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

                <img src="/boo/bonus03.webp" alt="Bônus 03" className="w-full h-48 object-cover rounded-lg mb-4" />
                <div className="text-sm font-bold mb-2 text-left">
                  <span className="bg-[#f3ce74] px-2 py-1 rounded text-[#f44260]">De R$ 10,99</span> <span className="text-green-600">Por R$ 00,00</span>
                </div>
                <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Jogos Temáticos de Montagem</h3>
                <p className="text-sm text-[#033258]">Atividades extras com desafios, como colagem e mini brinquedos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Como Funciona */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-ink text-center mb-12">
            Como funciona:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Item 1 - Chega no seu e-mail */}
            <div className="text-center">
              <img src="/email.webp" alt="Chega no seu e-mail" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Chega no seu e-mail</h3>
              <p className="text-sm text-[#033258]">O material são todas 100% em PDF, após o pagamento você recebe imediatamente o link de acesso no seu e-mail e tem acesso a todos os guias de montagem e modelos.</p>
            </div>

            {/* Item 2 - Você Imprime */}
            <div className="text-center">
              <img src="/imprimir.webp" alt="Você Imprime" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Você Imprime</h3>
              <p className="text-sm text-[#033258]">O material é todo dividido em módulos temáticas. Assim você pode imprimir quantas vezes quiser e como desejar na sua casa.</p>
            </div>

            {/* Item 3 - Hora de Montar */}
            <div className="text-center">
              <img src="/corte.webp" alt="Hora de Montar" className="w-32 h-32 mx-auto mb-4 object-contain" />
              <h3 className="text-xl font-bold text-[#FF6B2C] mb-3">Hora de Montar</h3>
              <p className="text-sm text-[#033258]">É hora de recortar e aprender sobre o universo da arte de forma leve e divertida!</p>
            </div>
          </div>
        </div>
        </div>
        {/* Fim do Card Branco */}

        {/* Seção Aprovado BNCC */}
        <div className="mb-16 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <img
              src="/boo/aprovado.webp"
              alt="Aprovado"
              className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-lg mb-6"
            />
            <p className="text-lg md:text-xl text-white mb-8">
              O Kit Paper EdukaBoo é recomendado por <span className="font-bold text-green-600">educadores e pais, que acreditam no verdadeiro desempenho das crianças e reforçam seu desenvolvimento</span>, o melhor em atividades lúdicas e interativas.
            </p>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                Veja como <span className="text-green-600 font-extrabold">você recebe!</span>
              </h3>
            </div>
            <div className="flex justify-center">
              {/* Mockup de Smartphone */}
              <div className="w-full md:w-4/5 lg:w-3/5">
                {/* Frame do Smartphone */}
                <div className="bg-black rounded-[40px] p-3 shadow-2xl border-8 border-gray-800">
                  {/* Notch */}
                  <div className="bg-black rounded-t-3xl h-7 mx-auto mb-2 w-40 shadow-inner"></div>

                  {/* Tela do Smartphone */}
                  <div className="bg-white rounded-3xl overflow-hidden shadow-inner">
                    <img
                      src="/boo/internopaper.gif"
                      alt="EdukaBoo Interior"
                      className="w-full h-auto object-contain"
                    />
                  </div>

                  {/* Home Button */}
                  <div className="bg-black rounded-b-3xl h-8 mt-2 mx-auto w-32 flex items-center justify-center">
                    <div className="w-20 h-1 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Banner Final */}
        <div className="mb-16 max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-8">
            Criatividade, imaginação e confiança <span className="font-extrabold text-green-600">VALEM MAIS</span> do que qualquer tela!
          </h2>
          <img
            src="/boo/Caixa-Produto.webp"
            alt="Caixa Produto"
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
              <div>
                <AnimatedPricingCard />
              </div>
              <div>
                <BasicPricingCard />
              </div>
            </div>
          </div>
        </div>

        {/* Guarantee Section */}
        <div className="bg-[#F1F6FF] rounded-[24px] p-8">
          {/* Post-it Title - PERSONALIZE AQUI */}
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
                src="/boo/Garantia-edukaboo.webp"
                alt="30 dias de garantia - Ou seu dinheiro de volta"
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </div>
          </div>

          {/* Guarantee Text - PERSONALIZE AQUI */}
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C3E87] text-center mb-6">
              🎨 Garantia de Satisfação — 30 Dias de Tranquilidade
            </h3>
            <p className="text-lg text-[#4A5568] leading-relaxed text-center">
              Confiamos tanto na magia do <strong>EdukaBoo que você pode testar sem nenhum risco por 30 dias!</strong><br /><br />
              Se nesse período você sentir que o material não encantou seu pequeno, não despertou a imaginação ou não trouxe a diversão criativa que prometemos, <strong>devolvemos 100% do seu investimento, sem perguntas e sem burocracia.</strong><br /><br />
              ✨ Experimente, monte e se surpreenda — o EdukaBoo vai provar que aprender e criar pode ser assustadoramente divertido!
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
      </div>
    </section>
  );
};
