import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InitioSection from '../components/paper/InitioSection';
import PaperSection from '../components/paper/PaperSection';
import BonusSection from '../components/paper/BonusSection';
import VideosSection from '../components/paper/VideosSection';
import UpsellPopup from '../components/paper/UpsellPopup';
import FeedbackPopup from '../components/paper/FeedbackPopup';

type SectionType = 'inicio' | 'papers' | 'bonus' | 'videos';

/**
 * Dashboard Principal para EdukaBoo Natal
 * Com sidebar inferior e 4 seções principais: Início, Papers, Bônus e Vídeos
 */
export default function NatalDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('inicio');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('');
  const [showUpsellPopup, setShowUpsellPopup] = useState(false);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    const loggedIn = localStorage.getItem('natalLoggedIn');
    const email = localStorage.getItem('natalEmail');
    const plan = localStorage.getItem('natalPlan');

    if (loggedIn && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserPlan(plan || '');
    } else {
      // Redirecionar para login se não estiver autenticado
      navigate('/loginnatal');
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

  const handleLogout = () => {
    localStorage.removeItem('natalLoggedIn');
    localStorage.removeItem('natalEmail');
    localStorage.removeItem('natalPlan');
    navigate('/loginnatal');
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
        {activeSection === 'inicio' && <InitioSection userPlan={userPlan} />}
        {activeSection === 'papers' && <PaperSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
        {activeSection === 'bonus' && <BonusSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
        {activeSection === 'videos' && <VideosSection userPlan={userPlan} onUpsellClick={() => setShowUpsellPopup(true)} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 z-50">
        <div className="w-full px-2 py-2 sm:px-4 sm:py-4">
          <div className="flex gap-1 sm:gap-4 justify-center sm:justify-start">
            {/* Início */}
            <button
              onClick={() => setActiveSection('inicio')}
              className={`flex-1 sm:flex-initial px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeSection === 'inicio'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="sm:hidden">🏠</span>
              <span className="hidden sm:inline">🏠 Início</span>
            </button>

            {/* Papers */}
            <button
              onClick={() => setActiveSection('papers')}
              className={`flex-1 sm:flex-initial px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeSection === 'papers'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="sm:hidden">📄</span>
              <span className="hidden sm:inline">📄 Papers</span>
            </button>

            {/* Bônus */}
            <button
              onClick={() => setActiveSection('bonus')}
              className={`flex-1 sm:flex-initial px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeSection === 'bonus'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="sm:hidden">🎁</span>
              <span className="hidden sm:inline">🎁 Bônus</span>
            </button>

            {/* Vídeos */}
            <button
              onClick={() => setActiveSection('videos')}
              className={`flex-1 sm:flex-initial px-2 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-semibold transition-all duration-200 whitespace-nowrap ${
                activeSection === 'videos'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="sm:hidden">🎥</span>
              <span className="hidden sm:inline">🎥 Vídeos</span>
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
