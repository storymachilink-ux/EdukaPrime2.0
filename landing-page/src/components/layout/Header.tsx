import { useState } from "react";
import { NavItem } from "../ui/nav-item";
import {
  Gift,         // Benefícios
  Users,        // Educadores
  Layers,       // Planos
  HelpCircle,   // Dúvidas Frequentes
  LogIn         // Login (outline)
} from "lucide-react";

interface HeaderProps {
  onLoginClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const [active, setActive] = useState<string>("Benefícios");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setActive("Login");
    setMobileMenuOpen(false);
  };

  const handlePlansClick = () => {
    const plansSection = document.getElementById('planos');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth' });
    }
    setActive("Ver Planos");
    setMobileMenuOpen(false);
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
              icon={<Gift className="w-4 h-4 text-white" />}
              active={active === "Ver Planos"}
              onClick={handlePlansClick}
              className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg"
            />

            {/* Login Button */}
            <NavItem
              href="#login"
              label="Login"
              icon={<LogIn className="w-4 h-4 text-gray-500 hover:text-gray-700" />}
              active={active === "Login"}
              onClick={handleLoginClick}
              className="border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
            />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="text-body hover:text-ink p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5 text-gray-500" />
                <span className="font-medium">Login</span>
              </button>

              <button
                onClick={handlePlansClick}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors shadow-lg"
              >
                <Gift className="w-5 h-5 text-white" />
                <span className="font-medium">Ver Planos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};