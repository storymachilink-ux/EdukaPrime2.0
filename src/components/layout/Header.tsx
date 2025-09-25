"use client";

import { useState } from "react";
import { NavItem } from "../ui/nav-item";
import {
  Gift,         // Benefícios
  Users,        // Educadores
  Layers,       // Planos
  HelpCircle,   // Dúvidas Frequentes
  KeyRound,     // Ver Planos (CTA)
  LogIn         // Login (outline)
} from "lucide-react";
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  // controle visual do ativo (não altera a rota)
  const [active, setActive] = useState<string>("Benefícios");
  const { user, logout } = useAuth();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setActive("Login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/logohorizontal.png"
              alt="EdukaPrime"
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavItem
              href="#beneficios"
              label="Benefícios"
              icon={<Gift className="w-4 h-4 text-orange-500" />}
              active={active === "Benefícios"}
              onClick={() => setActive("Benefícios")}
            />
            <NavItem
              href="#educadores"
              label="Educadores"
              icon={<Users className="w-4 h-4 text-green-600" />}
              active={active === "Educadores"}
              onClick={() => setActive("Educadores")}
            />
            <NavItem
              href="#planos"
              label="Planos"
              icon={<Layers className="w-4 h-4 text-blue-600" />}
              active={active === "Planos"}
              onClick={() => setActive("Planos")}
            />
            <NavItem
              href="#faq"
              label="Dúvidas Frequentes"
              icon={<HelpCircle className="w-4 h-4 text-purple-600" />}
              active={active === "Dúvidas Frequentes"}
              onClick={() => setActive("Dúvidas Frequentes")}
            />

            {/* CTA Ver Planos */}
            <NavItem
              href="#planos"
              label="Ver Planos"
              icon={<KeyRound className="w-4 h-4 text-white" />}
              active={active === "Ver Planos"}
              onClick={() => setActive("Ver Planos")}
              className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
            />

            {/* Login/User */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <img 
                    src={user.avatar || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm text-ink">{user.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  Sair
                </button>
              </div>
            ) : (
              <NavItem
                href="#login"
                label="Login"
                icon={<LogIn className="w-4 h-4 text-gray-500 hover:text-gray-700" />}
                active={active === "Login"}
                onClick={handleLoginClick}
                className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
              />
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-body hover:text-ink p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};