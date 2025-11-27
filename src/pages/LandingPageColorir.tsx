import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeaderColorir } from '../components/layout/HeaderColorir';
import { HeroColorir } from '../components/sections/HeroColorir';
import { DiferenciaisColorir } from '../components/sections/DiferenciaisColorir';
import { EducadoresColorir } from '../components/sections/EducadoresColorir';
import { PlanosColorir } from '../components/sections/PlanosColorir';
import { FooterColorir } from '../components/layout/FooterColorir';

/**
 * Landing Page Colorir - Versão duplicada para oferta específica
 *
 * INSTRUÇÕES PARA PERSONALIZAÇÃO:
 * 1. Edite os textos nos componentes:
 *    - HeroColorir.tsx (linha 84+)
 *    - DiferenciaisColorir.tsx (linha 11+)
 *    - EducadoresColorir.tsx (linha 15+, linha 168+)
 *    - PlanosColorir.tsx (linha 9+)
 *
 * 2. Para criar links de checkout específicos, adicione-os em:
 *    src/constants/checkout.ts
 */
export default function LandingPageColorir() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirecionar para dashboard se usuário já estiver logado
  React.useEffect(() => {
    if (user) {
      console.log('✅ Usuário logado detectado na landing page colorir, redirecionando...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FFF7F5]">
      <HeaderColorir />
      <main>
        <HeroColorir />
        <DiferenciaisColorir />
        <EducadoresColorir />
        <PlanosColorir />
      </main>
      <FooterColorir />
    </div>
  );
}
