import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfettiEffect from '../components/paper/ConfettiEffect';
import BackgroundPlus from '../components/ui/background-plus';

/**
 * Página de login para a área EdukaBoo Paper
 * Credenciais pré-configuradas:
 * - edukaboo-completo@login.com / edukaboo001
 * - edukaboo-basico@login.com / edukaboo123
 * - user03natal@login.com / eduka1234 (Kit Básico Natalino)
 * - user76natal@login.com / eduka12345 (Kit Básico, Completo e Bônus)
 */

// Componente Glitter
const GlitterEffect = () => {
  useEffect(() => {
    // Tocar som ao entrar
    const audio = new Audio('/win.mp3');
    audio.play().catch(() => console.log('Áudio não disponível'));

    // Criar efeito glitter
    const glitterContainer = document.getElementById('glitter-container');
    if (!glitterContainer) return;

    for (let i = 0; i < 50; i++) {
      const glitter = document.createElement('div');
      glitter.style.position = 'fixed';
      glitter.style.pointerEvents = 'none';
      glitter.style.left = Math.random() * 100 + '%';
      glitter.style.top = Math.random() * 100 + '%';
      glitter.style.width = Math.random() * 10 + 5 + 'px';
      glitter.style.height = glitter.style.width;
      glitter.style.backgroundColor = ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB'][Math.floor(Math.random() * 4)];
      glitter.style.borderRadius = '50%';
      glitter.style.opacity = '1';
      glitter.style.animation = `glitterFall ${Math.random() * 3 + 2}s linear forwards`;
      glitterContainer.appendChild(glitter);
    }
  }, []);

  return (
    <>
      <style>{`
        @keyframes glitterFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div id="glitter-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}></div>
    </>
  );
};

export default function LoginPaper() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGlitter, setShowGlitter] = useState(() => {
    // Verificar se é a primeira vez que o usuário entra no site
    const hasVisited = localStorage.getItem('paperlooginFirstVisit');
    if (!hasVisited) {
      localStorage.setItem('paperlooginFirstVisit', 'true');
      return true;
    }
    return false;
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  // Credenciais válidas
  const validCredentials = [
    {
      email: 'edukaboo-completo@login.com',
      password: 'edukaboo001',
      plan: 'completo'
    },
    {
      email: 'edukaboo-basico@login.com',
      password: 'edukaboo123',
      plan: 'basico'
    },
    {
      email: 'user03natal@login.com',
      password: 'eduka1234',
      plan: 'natal-basico'
    },
    {
      email: 'user76natal@login.com',
      password: 'eduka12345',
      plan: 'natal-completo'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular delay de autenticação
    setTimeout(() => {
      const credential = validCredentials.find(
        c => c.email === email && c.password === password
      );

      if (credential) {
        // Mostrar confetti e som
        setShowConfetti(true);

        // Salvar sessão no localStorage
        localStorage.setItem('paperLoggedIn', 'true');
        localStorage.setItem('paperEmail', email);
        localStorage.setItem('paperPlan', credential.plan);

        // Redirecionar para dashboard após o efeito
        setTimeout(() => {
          navigate('/paper-dashboard');
        }, 1500);
      } else {
        setError('Email ou senha incorretos. Verifique suas credenciais.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-white flex items-center justify-center p-4">
      <BackgroundPlus
        backgroundColor="transparent"
        plusColor="#fb3a5d"
        plusSize={60}
        fade={true}
      />
      {showGlitter && <GlitterEffect />}
      {showConfetti && <ConfettiEffect />}
      <div className="relative z-10 w-full max-w-sm md:max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-2 md:border-0" style={{ borderColor: '#ffb3d9' }}>
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <img src="/logohorizontal.webp" alt="EdukaPrime" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Área EdukaPapers
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Entre na sua área exclusiva de Papercrafts
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                disabled={loading}
                required
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors duration-200"
                disabled={loading}
                required
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Imagem Caixa Produto */}
          <div className="my-6 rounded-2xl overflow-hidden border-2 border-gray-200">
            <img src="/EdukaPapers.png" alt="EdukaPapers" className="w-full h-auto" />
          </div>

        </div>
      </div>
    </div>
  );
}
