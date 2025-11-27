import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InitioSection from '../components/paper/InitioSection';
import PaperSection from '../components/paper/PaperSection';
import BonusSection from '../components/paper/BonusSection';
import VideosSection from '../components/paper/VideosSection';
import UpsellPopup from '../components/paper/UpsellPopup';
import FeedbackPopup from '../components/paper/FeedbackPopup';

type SectionType = 'inicio' | 'papers' | 'vip' | 'videos';

/**
 * Dashboard Principal para EdukaBoo Paper
 * Com sidebar inferior e 4 seções principais: Início, Papers, Bônus e Vídeos
 */
export default function PaperDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('inicio');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const loggedIn = localStorage.getItem('paperLoggedIn');
    const email = localStorage.getItem('paperEmail');
    const plan = localStorage.getItem('paperPlan');

    if (loggedIn && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserPlan(plan || '');
    } else {
      // Redirecionar para login se não estiver autenticado
      navigate('/loginpaper');
    }
  }, [navigate]);

  // Mostrar popup de feedback após 30 segundos
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        setShowFeedbackPopup(true);
      }, 30000); // 30 segundos

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Scroll para o topo quando mudar de seção
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  const handleLogout = () => {
    localStorage.removeItem('paperLoggedIn');
    localStorage.removeItem('paperEmail');
    localStorage.removeItem('paperPlan');
    navigate('/loginpaper');
  };


  if (!isAuthenticated) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="min-h-screen bg-[#FFF7F5] pb-24">
      {/* Header */}
      <header className="bg-white border-b-2 border-purple-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logohorizontal.webp" alt="EdukaPrime" className="h-10" />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Seção Ativa */}
        {activeSection === 'inicio' && (
          <InitioSection
            userPlan={userPlan}
            onNavigateToPapers={() => setActiveSection('papers')}
            onNavigateToBonus={() => setActiveSection('vip')}
            onNavigateToVideos={() => setActiveSection('videos')}
          />
        )}
        {activeSection === 'papers' && <PaperSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
        {activeSection === 'vip' && <BonusSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
        {activeSection === 'videos' && <VideosSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 z-50">
        <div className="w-full px-2 py-2 sm:px-4 sm:py-4">
          <div className="flex gap-1 sm:gap-4 justify-center sm:justify-start flex-wrap">
            {/* Início */}
            <button
              onClick={() => setActiveSection('inicio')}
              className={`relative inline-block px-3 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeSection === 'inicio'
                  ? 'bg-blue-100 border-2 border-blue-600 text-blue-900'
                  : 'bg-blue-50 border-2 border-blue-400 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 animate-shimmer"></div>
              <span className="text-xs sm:text-base relative z-10">Início</span>
            </button>

            {/* Papers */}
            <button
              onClick={() => setActiveSection('papers')}
              className={`relative inline-block px-3 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeSection === 'papers'
                  ? 'bg-purple-100 border-2 border-purple-600 text-purple-900'
                  : 'bg-purple-50 border-2 border-purple-400 text-purple-700 hover:bg-purple-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 animate-shimmer"></div>
              <span className="text-xs sm:text-base relative z-10">Papers</span>
            </button>

            {/* VIP */}
            <button
              onClick={() => setActiveSection('vip')}
              className={`relative inline-block px-3 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeSection === 'vip'
                  ? 'bg-yellow-100 border-2 border-yellow-600 text-yellow-900'
                  : 'bg-yellow-50 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 animate-shimmer"></div>
              <span className="text-xs sm:text-base relative z-10">VIP</span>
            </button>

            {/* Vídeos */}
            <button
              onClick={() => setActiveSection('videos')}
              className={`relative inline-block px-3 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap overflow-hidden ${
                activeSection === 'videos'
                  ? 'bg-pink-100 border-2 border-pink-600 text-pink-900'
                  : 'bg-pink-50 border-2 border-pink-400 text-pink-700 hover:bg-pink-100'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 animate-shimmer"></div>
              <span className="text-xs sm:text-base relative z-10">Vídeos</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Upsell Popup */}
      <UpsellPopup isOpen={showUpsellPopup} onClose={() => setShowUpsellPopup(false)} />

      {/* Feedback Popup */}
      <FeedbackPopup isOpen={showFeedbackPopup} onClose={() => setShowFeedbackPopup(false)} />
    </div>
  );
}
