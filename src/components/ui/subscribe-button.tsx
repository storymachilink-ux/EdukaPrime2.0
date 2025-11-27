import * as React from "react";
import { Gift } from "lucide-react";
import { motion } from "framer-motion";

export function SubscribeButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Primeiro tentar encontrar a imagem preco-ajuste
    const precoAjuste = document.getElementById('preco-ajuste');

    if (precoAjuste) {
      precoAjuste.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    } else {
      // Tentar encontrar o CTA da página /colorir
      const ctaColorir = document.getElementById('cta-button-colorir');

      if (ctaColorir) {
        ctaColorir.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      } else {
        // Fallback para o plano-prime da página principal
        const targetElement = document.getElementById('plano-prime');
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes border-spin {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
      <a href="#planos" onClick={handleClick} className="relative group inline-block" style={{ animation: 'float-gentle 3s ease-in-out infinite' }}>
        {/* Animação de borda tracejada - otimizada */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="12"
            fill="none"
            stroke="#FFD700"
            strokeWidth="3"
            strokeDasharray="10 5"
            strokeDashoffset="0"
            style={{
              animation: 'border-spin 5s linear infinite'
            }}
          />
        </svg>

        {/* brilho suave ao passar o mouse - sem blur */}
        <span className="absolute inset-0 -z-10 rounded-2xl bg-green-400/0 group-hover:bg-green-400/10 transition-all duration-300 shadow-green-200 group-hover:shadow-xl" />

        {/* botão */}
        <motion.span
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="relative inline-flex items-center gap-2 rounded-xl px-6 py-4 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-500 text-white hover:bg-green-600 shadow-lg font-bold text-lg"
          style={{ zIndex: 2 }}
        >
          <span className="shrink-0">
            <Gift className="w-5 h-5 text-white" />
          </span>
          <span>Garantir Acesso com Desconto</span>
        </motion.span>
      </a>
    </>
  );
}