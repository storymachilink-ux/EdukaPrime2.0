import React from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/sections/Hero';
import { Diferenciais } from '../components/sections/Diferenciais';
import { Educadores } from '../components/sections/Educadores';
import { Planos } from '../components/sections/Planos';
import { FAQ } from '../components/sections/FAQ';
import { Footer } from '../components/layout/Footer';

interface LandingProps {
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-[#FFF7F5] dark:bg-[#0F0F0F]">
      <Header onLoginClick={onLoginClick} />
      <main>
        <Hero onLoginClick={onLoginClick} />
        <Diferenciais />
        <Educadores />
        <Planos />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};