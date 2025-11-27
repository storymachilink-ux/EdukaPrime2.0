import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeaderColorir } from '../components/layout/HeaderColorir';
import { HeroColorirPaper } from '../components/sections/HeroColorirPaper';
import { DiferenciaisColorirPaper } from '../components/sections/DiferenciaisColorirPaper';
import { EducadoresColorirPaper } from '../components/sections/EducadoresColorirPaper';
import { PlanosColorirPaper } from '../components/sections/PlanosColorirPaper';
import { FooterColorir } from '../components/layout/FooterColorir';

/**
 * Landing Page Paper - Página pública acessível em /paper
 * Sem funil de quiz - acesso direto à landing page
 */
export default function Paper() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Redirecionar para dashboard apenas se usuário estiver logado
  React.useEffect(() => {
    if (user) {
      console.log('✅ Usuário logado detectado na landing page paper, redirecionando...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FFF7F5]">
      <HeaderColorir onLoginClick={handleLoginClick} />
      <main>
        <HeroColorirPaper onLoginClick={handleLoginClick} />
        <DiferenciaisColorirPaper />
        <EducadoresColorirPaper />
        <PlanosColorirPaper />
      </main>
      <FooterColorir />
    </div>
  );
}
