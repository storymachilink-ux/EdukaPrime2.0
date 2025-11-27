import React from 'react';
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { Diferenciais } from './components/sections/Diferenciais';
import { Educadores } from './components/sections/Educadores';
import { Planos } from './components/sections/Planos';
import { FAQ } from './components/sections/FAQ';
import { Footer } from './components/layout/Footer';

function App() {
  // Redirecionar para a aplicação principal ao clicar em Login
  const handleLoginClick = () => {
    // Aqui você vai colocar a URL da sua aplicação interna
    window.location.href = 'https://app.edukaprime.com';
    // OU se estiver rodando local: window.location.href = 'http://localhost:3000';
  };

  return (
    <div className="min-h-screen bg-[#FFF7F5]">
      <Header onLoginClick={handleLoginClick} />
      <main>
        <Hero onLoginClick={handleLoginClick} />
        <Diferenciais />
        <Educadores />
        <Planos />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;