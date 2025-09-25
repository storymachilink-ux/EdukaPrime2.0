import * as React from "react";
import { KeyRound } from "lucide-react";
import { motion } from "framer-motion";

export function SubscribeButton() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetElement = document.getElementById('planos');

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <a href="#planos" onClick={handleClick} className="relative group inline-block">
      {/* brilho suave ao passar o mouse */}
      <motion.span
        className="absolute inset-0 -z-10 rounded-2xl bg-orange-400/0 blur-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
        transition={{ duration: 0.25 }}
      />
      {/* botão */}
      <motion.span
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="inline-flex items-center gap-2 rounded-xl px-6 py-3 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-500 text-white hover:bg-orange-600 shadow-lg font-semibold"
      >
        <span className="shrink-0">
          <KeyRound className="w-4 h-4 text-white" />
        </span>
        <span>Assine Agora e Acesse Tudo</span>
      </motion.span>
    </a>
  );
}