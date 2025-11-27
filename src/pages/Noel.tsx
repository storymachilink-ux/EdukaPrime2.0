import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TimerBarNoel } from '../components/sections/TimerBarNoel';
import { HeroColorirNoelV2 } from '../components/sections/HeroColorirNoelV2';
import { BeneficiosNoel } from '../components/sections/BeneficiosNoel';
import { AntesDepoisNoel } from '../components/sections/AntesDepoisNoel';
import { ProvaSocialNoel } from '../components/sections/ProvaSocialNoel';
import { IdealParaQuemNoel } from '../components/sections/IdealParaQuemNoel';
import { OQueVaiReceberNoel } from '../components/sections/OQueVaiReceberNoel';
import { BonusNoelV2 } from '../components/sections/BonusNoelV2';
import { PlanosSimplificadosNoel } from '../components/sections/PlanosSimplificadosNoel';
import { FooterColorir } from '../components/layout/FooterColorir';
import { PurchaseNotificationManager } from '../components/PurchaseNotification';

/**
 * Landing Page Noel - Versão 3 (Completa)
 * Página pública acessível em /noel
 * Copy estruturado por seções claras e focado em conversão
 */
export default function Noel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };


  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <TimerBarNoel />
      <PurchaseNotificationManager />
      <main>
        {/* 1) Hero / Promessa Principal */}
        <HeroColorirNoelV2 onLoginClick={handleLoginClick} />

        {/* 2) Benefícios em Bullet Points */}
        <BeneficiosNoel />

        {/* 3) Antes x Depois (Transformação) */}
        <AntesDepoisNoel />

        {/* 4) Prova Social / Demonstração do Produto */}
        <ProvaSocialNoel />

        {/* 5) Ideal Para Quem? */}
        <IdealParaQuemNoel />

        {/* 6) O que você vai receber */}
        <OQueVaiReceberNoel />

        {/* 7) Bônus / Conteúdos Complementares */}
        <BonusNoelV2 />

        {/* 8) Plano Básico + 9) Plano Completo + Extras */}
        <PlanosSimplificadosNoel />
      </main>
      <FooterColorir />
    </div>
  );
}
