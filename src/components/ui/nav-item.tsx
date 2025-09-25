"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type NavItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;            // controla realce do item
  onClick?: () => void;        // use para setar o ativo ou abrir modal
  className?: string;          // para variantes (CTA/outline)
};

export function NavItem({ href, label, icon, active, onClick, className }: NavItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Se for login, apenas chama o onClick
    if (href === "#login" && onClick) {
      e.preventDefault();
      onClick();
      return;
    }

    // Para outros itens, faz scroll suave
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }

    // Chama onClick se fornecido
    if (onClick) {
      onClick();
    }
  };
  return (
    <a href={href} onClick={handleClick} className="relative group inline-block">
      {/* brilho suave ao passar o mouse */}
      <motion.span
        className="absolute inset-0 -z-10 rounded-2xl bg-orange-400/0 blur-xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
        transition={{ duration: 0.25 }}
      />
      {/* botão/aba */}
      <motion.span
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300",
          active
            ? "bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 font-semibold"
            : "text-ink hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100",
          className
        )}
      >
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </motion.span>
    </a>
  );
}