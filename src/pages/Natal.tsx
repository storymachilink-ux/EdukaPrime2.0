import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeaderColorir } from '../components/layout/HeaderColorir';
import { HeroColorirNatal } from '../components/sections/HeroColorirNatal';
import { PurchaseNotificationManager } from '../components/PurchaseNotification';

// Code-Splitting: Componentes carregados sob demanda (lazy loading)
const DiferenciaisColorirNatal = React.lazy(() =>
  import('../components/sections/DiferenciaisColorirNatal').then(m => ({ default: m.DiferenciaisColorirNatal }))
);
const EducadoresColorirNatal = React.lazy(() =>
  import('../components/sections/EducadoresColorirNatal').then(m => ({ default: m.EducadoresColorirNatal }))
);
const PlanosColorirNatal = React.lazy(() =>
  import('../components/sections/PlanosColorirNatal').then(m => ({ default: m.PlanosColorirNatal }))
);
const FooterColorir = React.lazy(() =>
  import('../components/layout/FooterColorir').then(m => ({ default: m.FooterColorir }))
);

/**
 * Landing Page Natal - Página pública acessível em /natal
 * Sem funil de quiz - acesso direto à landing page
 */
export default function Natal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-[#FFF7F5] overflow-hidden">
      <HeaderColorir onLoginClick={handleLoginClick} />
      <PurchaseNotificationManager />
      <main className="pt-16">
        <HeroColorirNatal onLoginClick={handleLoginClick} />
        <Suspense fallback={<div className="h-screen bg-[#FFF7F5]" />}>
          <DiferenciaisColorirNatal />
        </Suspense>
        <Suspense fallback={<div className="h-screen bg-[#FFF7F5]" />}>
          <EducadoresColorirNatal />
        </Suspense>
        <Suspense fallback={<div className="h-screen bg-[#FFF7F5]" />}>
          <PlanosColorirNatal />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-24 bg-[#FFF7F5]" />}>
        <FooterColorir />
      </Suspense>
    </div>
  );
}
