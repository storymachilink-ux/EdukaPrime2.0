import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import '../styles/funil-pequenos-artistas.css';
import { usePixelTracking } from '../hooks/usePixelTracking';

interface ToastMessage {
  id: number;
  message: string;
  emoji: string;
}

export default function FunilPequenosArtistas() {
  const navigate = useNavigate();
  const { trackProductClick } = usePixelTracking();
  const [currentStep, setCurrentStep] = useState(1);
  const [points, setPoints] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Marcar que o funil foi visto quando o componente montar
  useEffect(() => {
    sessionStorage.setItem('funil_colorir_visto', 'true');
  }, []);

  // Etapa 1 - Checklist
  const [checkedItems1, setCheckedItems1] = useState<boolean[]>([false, false, false]);

  // Etapa 2 - Cartas
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false, false]);

  // Etapa 4 - Respostas (radio behavior - apenas 1 seleção)
  const [selectedAnswer4, setSelectedAnswer4] = useState<number | null>(null);

  // Etapa 5 - Raspadinha
  const [scratched, setScratched] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [showRevealed, setShowRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScratching = useRef(false);

  // Etapa 7 - Respostas (pode selecionar múltiplas)
  const [selectedAnswers7, setSelectedAnswers7] = useState<boolean[]>([false, false]);

  // Etapa 8 - Roleta
  const [spinning, setSpinning] = useState(false);

  // Etapa 10 - Cartas Bônus
  const [flippedBonusCards, setFlippedBonusCards] = useState<boolean[]>([false, false, false]);

  // Etapa 10 - Timer
  const totalSeconds = 16 * 60; // 16 minutos
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  const sfxRef = useRef<Record<string, HTMLAudioElement>>({});
  const toastIdRef = useRef(0);

  // Debug: Checkpoint click counter for testing
  const checkpointClicksRef = useRef<number[]>([0, 0, 0]);
  const checkpointSteps = [3, 6, 9]; // Steps corresponding to checkpoints

  // Play sound
  const playSound = (name: string) => {
    if (!sfxRef.current[name]) {
      const audio = new Audio(`/sounds/${name}.mp3`);
      audio.volume = 0.7;
      sfxRef.current[name] = audio;
    }
    sfxRef.current[name].currentTime = 0;
    sfxRef.current[name].play().catch(() => {});
  };

  // Confetti
  const fireConfetti = (intensity: 'light' | 'heavy' = 'light') => {
    const count = intensity === 'light' ? 40 : 80;
    confetti({
      particleCount: count,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#FFB347', '#FFCC33', '#FFD166', '#FF6B6B']
    });
  };

  // Show toast
  const showToast = (message: string, emoji: string) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, emoji }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Add points with animation
  const addPoints = (pts: number) => {
    setPoints(p => p + pts);
  };

  // On step change
  useEffect(() => {
    playSound('stage');
    setCanAdvance(false);
    const timer = setTimeout(() => setCanAdvance(true), 2000);

    // Reset scratch state when leaving step 5
    if (currentStep !== 5) {
      setScratched(false);
      setScratchProgress(0);
      setShowRevealed(false);
    }

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Next step
  const nextStep = () => {
    if (canAdvance && currentStep < 10) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Complete funnel
  const completeFunnel = () => {
    playSound('win');
    fireConfetti('heavy');
    localStorage.setItem('funil_colorir_completo', 'true');
    sessionStorage.setItem('funil_colorir_visto', 'true');

    // Rastrear no pixel Utmify
    trackProductClick('Pequenos Artistas - Kit Colorir', 47);

    // Redirecionar para checkout com UTM parameters
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const utm_source = params.get('utm_source') || 'organic';
      const utm_medium = params.get('utm_medium') || 'funil';
      const utm_campaign = params.get('utm_campaign') || 'pequenos-artistas';
      const utm_content = params.get('utm_content') || 'colorir-kit';
      const utm_term = params.get('utm_term') || '';

      const checkoutUrl = `https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;
      window.location.href = checkoutUrl;
    }, 1000);
  };

  // Debug: Handle checkpoint click for testing
  const handleCheckpointClick = (index: number) => {
    checkpointClicksRef.current[index]++;
    if (checkpointClicksRef.current[index] === 5) {
      setCurrentStep(checkpointSteps[index]);
      setCanAdvance(true);
      checkpointClicksRef.current[index] = 0; // Reset counter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Progress calculation
  const progress = (currentStep / 10) * 100;
  const checkpointPositions = [30, 60, 90]; // 3, 6, 9

  // Etapa 1 - Handle checkbox
  const handleCheck1 = (index: number) => {
    playSound('click');
    const newChecked = [...checkedItems1];
    newChecked[index] = !newChecked[index];
    setCheckedItems1(newChecked);

    if (!newChecked[index]) {
      setPoints(p => Math.max(0, p - 10));
    } else {
      addPoints(10);
      fireConfetti('light');
    }
  };

  // Etapa 2 - Flip card
  const handleFlipCard = (index: number) => {
    if (flippedCards[index]) return;
    playSound('click');
    const newFlipped = [...flippedCards];
    newFlipped[index] = true;
    setFlippedCards(newFlipped);

    // Check if all flipped
    if (newFlipped.every(f => f)) {
      setTimeout(() => {
        playSound('win');
        fireConfetti('heavy');
        addPoints(15);
        showToast('30 Obras Nacionais para Colorir!', '🏆');
      }, 600);
    }
  };

  // Etapa 4 - Answer (radio behavior)
  const handleAnswer4 = (index: number) => {
    if (selectedAnswer4 === index) return; // Já selecionado

    playSound('click');

    // Se já tinha uma seleção anterior, remove os pontos
    if (selectedAnswer4 !== null) {
      setPoints(p => Math.max(0, p - 10));
    }

    setSelectedAnswer4(index);
    addPoints(10);
    fireConfetti('light');
  };

  // Etapa 5 - Initialize canvas
  useEffect(() => {
    if (currentStep === 5 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 320;
      canvas.height = 200;

      // Load and draw cover image (rasp01.webp que será raspada)
      const img = new Image();
      img.src = '/img/rasp01.webp';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.onerror = () => {
        // Fallback to gradient if image fails
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#D4AF37');
        gradient.addColorStop(0.5, '#F4E5C2');
        gradient.addColorStop(1, '#D4AF37');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
    }
  }, [currentStep]);

  // Etapa 5 - Scratch functions
  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const brushSize = 30;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(
      (x - rect.left) * scaleX,
      (y - rect.top) * scaleY,
      brushSize,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Calculate scratch progress
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const progress = (transparent / (pixels.length / 4)) * 100;
    setScratchProgress(progress);

    // Auto-complete at 85%
    if (progress > 85 && !scratched) {
      playSound('scratch');
      setScratched(true);
      setShowRevealed(true);
      setTimeout(() => {
        playSound('win');
        fireConfetti('heavy');
        addPoints(20);
        showToast('Cartões Visuais: Conheça os Artistas!', '🏆');
      }, 500);
    }
  };

  const handleScratchStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (scratched) return;
    isScratching.current = true;

    if ('touches' in e) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleScratchMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching.current || scratched) return;

    if ('touches' in e) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      scratch(e.clientX, e.clientY);
    }
  };

  const handleScratchEnd = () => {
    isScratching.current = false;
  };

  // Etapa 7 - Handle answer (pode selecionar múltiplas)
  const handleAnswer7 = (index: number) => {
    playSound('click');
    const newSelected = [...selectedAnswers7];
    newSelected[index] = !newSelected[index];
    setSelectedAnswers7(newSelected);

    if (!newSelected[index]) {
      setPoints(p => Math.max(0, p - 10));
    } else {
      addPoints(10);
      fireConfetti('light');
    }
  };

  // Etapa 8 - Spin roulette
  const handleSpin = () => {
    if (spinning) return;
    playSound('spin');
    setSpinning(true);
    setTimeout(() => {
      playSound('win');
      fireConfetti('heavy');
      addPoints(15);
      showToast('Bônus 20 Desenhos Movimento, Corpos e Emoção - Obras com foco em dança, corpo humano, formas geométricas ou expressão visual.', '🏆');
      setSpinning(false);
    }, 2400);
  };

  // Etapa 10 - Flip bonus card
  const handleFlipBonusCard = (index: number) => {
    if (flippedBonusCards[index]) return;
    playSound('click');
    const newFlipped = [...flippedBonusCards];
    newFlipped[index] = true;
    setFlippedBonusCards(newFlipped);
    fireConfetti('light');
  };

  // Etapa 10 - Timer countdown
  useEffect(() => {
    if (currentStep === 10 && secondsLeft > 0) {
      const timer = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, secondsLeft]);

  return (
    <div className="funil-wrapper">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast">
            <span className="toast-emoji">{toast.emoji}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Fixed Header */}
      <div className="funil-header">
        <div className="points-badge">
          <span className="points-icon">⭐</span>
          <span className="points-value">{points} pts</span>
        </div>

        <div className="progress-container">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            {checkpointPositions.map((pos, i) => (
              <div
                key={i}
                className={`checkpoint ${progress >= pos ? 'active' : ''}`}
                style={{ left: `${pos}%`, cursor: 'pointer' }}
                onClick={() => handleCheckpointClick(i)}
              >
                <div className="checkpoint-circle" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="funil-content">
        <div className="funil-card">

          {/* ETAPA 01 */}
          {currentStep === 1 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/etapa01gif.gif" alt="Etapa 1" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.75rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '12px',
                lineHeight: '1.3'
              }}>
                <span style={{ color: '#fbbf24' }}>🖍️</span> E se o tempo de tela virasse tempo de arte?
              </h2>

              <p style={{
                color: '#374151',
                fontSize: '1.1rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '16px',
                padding: '0 1rem'
              }}>
                Seu filho pode aprender de verdade enquanto se diverte!<br />
                <span style={{ color: '#f43f5e', fontWeight: '600' }}>Sem telas, sem excesso de estímulos</span> — apenas momentos leves e criativos que <span style={{ backgroundColor: '#f43f5e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>despertam o melhor dele</span>.
              </p>

              <div style={{
                backgroundColor: '#fff7ed',
                border: '2px solid #fbbf24',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '10px',
                marginBottom: '20px',
                maxWidth: '550px',
                margin: '10px auto 20px',
                textAlign: 'left',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)'
              }}>
                <p style={{
                  color: '#374151',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  margin: '0'
                }}>
                  <span style={{ color: '#f59e0b' }}>📘</span> <strong style={{ color: '#f43f5e' }}>Aprender arte é também aprender sobre ter paciência, foco e imaginação.</strong><br />
                  Sua criança se expressa, relaxa e se conecta com o mundo de um jeito leve e bonito.
                </p>
              </div>

              <p style={{
                fontSize: '1rem',
                fontWeight: '600',
                textAlign: 'center',
                color: '#374151',
                marginBottom: '16px'
              }}>
                <span style={{ color: '#16a34a' }}>✅</span> Marque as opções que mais combinam com sua criança:
              </p>

              <div className="checklist">
                {[
                  'Ele adora desenhar e pintar 🎨',
                  'É curioso e gosta de descobrir coisas novas 🌿',
                  'Ama histórias e personagens diferentes 📚',
                  'Se encanta por animais e natureza 🐼'
                ].map((text, i) => (
                  <label key={i} className="checkbox-card" style={{
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={checkedItems1[i]}
                      onChange={() => handleCheck1(i)}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">{text}</span>
                  </label>
                ))}
              </div>

              <button
                style={{
                  backgroundColor: '#2C3E87',
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: canAdvance && checkedItems1.filter(Boolean).length >= 1 ? 'pointer' : 'not-allowed',
                  opacity: canAdvance && checkedItems1.filter(Boolean).length >= 1 ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  marginTop: '8px'
                }}
                onClick={nextStep}
                disabled={!canAdvance || checkedItems1.filter(Boolean).length < 1}
                onMouseEnter={(e) => {
                  if (canAdvance && checkedItems1.filter(Boolean).length >= 1) {
                    e.currentTarget.style.backgroundColor = '#f43f5e';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2C3E87';
                }}
              >
                {canAdvance && checkedItems1.filter(Boolean).length >= 1 ? 'Avançar →' : 'Aguarde...'}
              </button>

              <p style={{
                fontSize: '0.9rem',
                color: '#888',
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: '12px'
              }}>
                <span style={{ color: '#f59e0b' }}>🌟</span> Vamos descobrir juntos o talento que existe aí dentro. <span style={{ color: '#f59e0b' }}>💛</span>
              </p>
            </div>
          )}

          {/* ETAPA 02 - Cartas */}
          {currentStep === 2 && (
            <div className="step-wrapper fade-in">
              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.7rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                Vire as cartas e sinta a magia dos <span style={{ color: '#f43f5e' }}>pequenos momentos que ficam pra sempre.</span>
              </h2>

              <div style={{
                backgroundColor: '#FFF8E6',
                border: '1px solid #FFE1A3',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '10px',
                marginBottom: '24px',
                maxWidth: '520px',
                margin: '10px auto 24px',
                textAlign: 'center',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)'
              }}>
                <p style={{
                  color: '#2C3E87',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  💞 A arte aproxima, acalma e cria laços que nenhuma tela ensina. 💞
                </p>
              </div>

              <div className="cards-grid">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`flip-card ${flippedCards[i] ? 'flipped' : ''}`}
                    onClick={() => handleFlipCard(i)}
                  >
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <img src="/img/cartabase.webp?v=20250118" alt="Carta virada" className="card-img" />
                      </div>
                      <div className="flip-card-back">
                        <img src={`/img/carta0${i + 1}.webp?v=20250118`} alt={`Carta ${i + 1}`} className="card-img" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* GIF */}
              <div style={{
                maxWidth: '400px',
                margin: '24px auto 16px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  backgroundColor: 'white',
                  border: '2px solid #FFE3A0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <img
                    src="/img/paginasgif.gif"
                    alt="Páginas do Material"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              <p style={{
                fontSize: '0.9rem',
                color: '#888',
                fontStyle: 'italic',
                textAlign: 'center',
                marginTop: '16px',
                marginBottom: '12px'
              }}>
                ✨ Vire todas as cartas para ganhar um Bônus e avançar
              </p>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance || !flippedCards.every(f => f)}
              >
                {canAdvance && flippedCards.every(f => f) ? 'Próxima →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 03 - Copy Emocional */}
          {currentStep === 3 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/img/etapa03.webp" alt="Etapa 3" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '8px',
                lineHeight: '1.3'
              }}>
                👩‍🎨 Inspirar-se em grandes artistas é mais que aprender.
              </h2>

              <p style={{
                color: '#444444',
                fontSize: '1.1rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.5',
                marginBottom: '14px'
              }}>
                É despertar <strong style={{ color: '#FFA45B' }}>curiosidade, imaginação e sensibilidade</strong> — virtudes que crescem junto com o seu pequeno. <span style={{ color: '#2C3E87' }}>✨</span>
              </p>

              <p style={{
                color: '#444444',
                fontSize: '1.1rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.5',
                marginBottom: '14px'
              }}>
                <span style={{ color: '#2C3E87' }}>🖌️</span> <strong style={{ color: '#FFA45B' }}>Van Gogh, Da Vinci e Monet</strong> agora podem fazer parte da infância dele,<br />
                de um jeito <strong style={{ color: '#FFA45B' }}>leve, divertido e cheio de significado.</strong> <span style={{ color: '#2C3E87' }}>🎨</span>
              </p>

              <div style={{
                background: '#FFF8E6',
                border: '2px solid #FFE1A3',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '14px',
                textAlign: 'center',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                maxWidth: '500px',
                margin: '14px auto 1.5rem'
              }}>
                <p style={{
                  color: '#2C3E87',
                  fontSize: '1rem',
                  fontWeight: '500',
                  margin: '0',
                  fontStyle: 'italic'
                }}>
                  💡 A arte não ensina apenas a colorir. Ensina a ver o mundo com outros olhos.
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
              >
                {canAdvance ? 'Continuar →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 04 - Pergunta de Sonho */}
          {currentStep === 4 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/img/etapa04.webp" alt="Etapa 4" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'fade-in-up 0.6s ease'
              }}>
                🌈 Imagine essa cena…
              </h2>

              <p style={{
                color: '#444444',
                fontSize: '1.15rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '16px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                Seu filho <strong style={{ color: '#FFA45B' }}>pintando uma obra-prima</strong> e te contando quem foi o artista! <span style={{ color: '#2C3E87' }}>🥰✨</span><br />
                Um momento simples, mas cheio de <strong style={{ color: '#FFA45B' }}>conexão, aprendizado e amor.</strong> <span style={{ color: '#2C3E87' }}>💛</span>
              </p>

              <div className="checklist" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {[
                  'Sim, quero viver isso! 🎨',
                  'É exatamente o que procuro! 🌈'
                ].map((text, i) => (
                  <label key={i} className="checkbox-card" style={{
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      checked={selectedAnswer4 === i}
                      onChange={() => handleAnswer4(i)}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">{text}</span>
                  </label>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance || selectedAnswer4 === null}
                style={{ marginTop: '20px' }}
              >
                {canAdvance && selectedAnswer4 !== null ? 'Avançar →' : 'Aguarde...'}
              </button>

              <div style={{
                backgroundColor: '#FFF8E6',
                border: '1px solid #FFE1A3',
                borderRadius: '12px',
                padding: '14px',
                marginTop: '16px',
                maxWidth: '520px',
                margin: '16px auto 0',
                textAlign: 'center',
                boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
                animation: 'fade-in-delay 1.2s ease'
              }}>
                <p style={{
                  color: '#2C3E87',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  margin: '0',
                  fontWeight: '500',
                  fontStyle: 'italic'
                }}>
                  💡 Pequenos momentos assim se tornam memórias que duram pra sempre.
                </p>
              </div>
            </div>
          )}

          {/* ETAPA 05 - Raspadinha */}
          {currentStep === 5 && (
            <div className="step-wrapper fade-in">
              <h2 style={{
                color: '#f43f5e',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'bounce-in 0.6s ease'
              }}>
                🎨 <strong>Raspadinha Artistica</strong>
              </h2>

              <p style={{
                color: '#374151',
                fontSize: '1.15rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '20px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                Uma atividade pensada para desenvolver <span style={{ color: '#f59e0b', fontWeight: '600' }}>coordenação, paciência e curiosidade</span> que formam mentes criativas e seguras
              </p>

              <div className="scratch-wrapper">
                <img
                  src="/img/rasp-cartoes.webp"
                  alt="Cartões revelados"
                  className={`scratch-background ${showRevealed ? 'revealed' : ''}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`scratch-canvas ${scratched ? 'hidden' : ''}`}
                  onMouseDown={handleScratchStart}
                  onMouseMove={handleScratchMove}
                  onMouseUp={handleScratchEnd}
                  onMouseLeave={handleScratchEnd}
                  onTouchStart={handleScratchStart}
                  onTouchMove={handleScratchMove}
                  onTouchEnd={handleScratchEnd}
                />
              </div>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
              >
                {canAdvance ? 'Avançar →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 06 - Copy Pré-Oferta */}
          {currentStep === 6 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/img/etapa05.webp" alt="Etapa 6" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'fade-in-up 0.6s ease'
              }}>
                💖 O que era passatempo virou aprendizado e imaginação.
              </h2>

              <p style={{
                color: '#374151',
                fontSize: '1.15rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '20px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                <span style={{ color: '#f59e0b' }}>🎨</span> <strong style={{ color: '#f43f5e' }}>Criatividade e cultura valem mais do que qualquer tela</strong>
              </p>

              <p style={{
                color: '#374151',
                fontSize: '1.1rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '24px',
                padding: '0 1rem'
              }}>
                Cada desenho é um convite para <strong style={{ color: '#f43f5e' }}>imaginar, aprender e se conectar</strong> de verdade.
              </p>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
              >
                {canAdvance ? 'Continuar →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 07 - Pergunta Afinidade */}
          {currentStep === 7 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/MOCKUP-SEM-E-COM01.webp" alt="Mockup - Pequenos Artistas" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'fade-in-up 0.6s ease'
              }}>
                💫 Agora me conta...
              </h2>

              <p style={{
                color: '#374151',
                fontSize: '1.2rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '20px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                Você gostaria que seu pequeno se <strong style={{ color: '#16a34a' }}>interessasse mais por arte</strong><br />
                e passasse <strong style={{ color: '#f43f5e' }}>menos tempo nas telas</strong>? <span style={{ color: '#f59e0b' }}>🎨💛</span>
              </p>

              <div className="checklist" style={{ maxWidth: '550px', margin: '0 auto' }}>
                {[
                  'Sim, quero incentivar isso! 🖍️',
                  'Sim, acredito muito nesse tipo de aprendizado! 🌈'
                ].map((text, i) => (
                  <label key={i} className="checkbox-card" style={{
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedAnswers7[i]}
                      onChange={() => handleAnswer7(i)}
                    />
                    <span className="checkbox-custom" />
                    <span className="checkbox-text">{text}</span>
                  </label>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
                style={{ marginTop: '20px' }}
              >
                {canAdvance ? 'Avançar →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 08 - Roleta */}
          {currentStep === 8 && (
            <div className="step-wrapper fade-in">
              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'bounce-in 0.6s ease'
              }}>
                🎡 Roleta das Cores
              </h2>

              <p style={{
                color: '#444444',
                fontSize: '1.15rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '24px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                Gire a roleta e veja o <strong style={{ color: '#FFA45B' }}>bônus incrível</strong> que seu pequeno vai ganhar hoje! <span style={{ color: '#2C3E87' }}>🌟</span>
              </p>

              <div className="roulette-container">
                <div className={`roulette ${spinning ? 'spinning' : ''}`}>
                  <img
                    src="/img/roleta-new.webp"
                    alt="Roleta"
                    className="roulette-image"
                  />
                  <div className="roulette-center">🎨</div>
                </div>
              </div>

              <button
                className="btn-game"
                onClick={handleSpin}
                disabled={spinning}
              >
                {spinning ? 'Girando...' : '🎨 Girar Agora'}
              </button>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
              >
                {canAdvance ? 'Próxima →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 09 - Copy Transição */}
          {currentStep === 9 && (
            <div className="step-wrapper fade-in">
              <div className="step-image">
                <img src="/img/etapa07.webp" alt="Etapa 9" className="step-img" />
              </div>

              <h2 style={{
                color: '#2C3E87',
                fontSize: '1.6rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '10px',
                lineHeight: '1.3',
                animation: 'fade-in-up 0.6s ease'
              }}>
                🎨 Criado por educadores e artistas, o Pequenos Gênios da Arte une, cultura e desenvolvimento infantil.
              </h2>

              <p style={{
                color: '#374151',
                fontSize: '1.15rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '16px',
                padding: '0 1rem',
                animation: 'fade-in 1s ease'
              }}>
                São <strong style={{ color: '#16a34a' }}>versões exclusivas de obras clássicas</strong> transformadas em atividades que ensinam história, expressão e foco — tudo com o cuidado e a didática que só a Eduka Prime oferece.
              </p>

              <p style={{
                color: '#374151',
                fontSize: '1.1rem',
                fontWeight: '400',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '24px',
                padding: '0 1rem'
              }}>
                <span style={{ color: '#f59e0b' }}>💫</span> <strong style={{ color: '#f43f5e' }}>Um material premium, pensado para formar mentes criativas</strong>
              </p>

              <button
                className="btn-primary"
                onClick={nextStep}
                disabled={!canAdvance}
              >
                {canAdvance ? 'Ver Oferta →' : 'Aguarde...'}
              </button>
            </div>
          )}

          {/* ETAPA 10 - Oferta Final */}
          {currentStep === 10 && (
            <div className="step-wrapper fade-in">
              <h2 className="step-title offer-title" style={{ fontWeight: '900' }}>A Jornada Criativa do Seu Pequeno Começa Agora!</h2>
              <p className="step-description">
                🎁 Acesso completo ao <span style={{ backgroundColor: '#f43f5e', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Pequenos Gênios da Arte</span> + Bônus Especiais<br />
                Crie memórias, desenvolva talentos e estimule a imaginação!
              </p>
              <div className="step-image">
                <img src="/img/etapa08.webp?v=20250115" alt="Oferta Final" className="step-img" />
              </div>

              <p style={{ fontSize: '1.1rem', fontWeight: '700', textAlign: 'center', margin: '2rem 0 1rem' }}>🎁 Revele seus bônus</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', margin: '0 auto 2rem', maxWidth: '450px' }}>
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    onClick={() => handleFlipBonusCard(num - 1)}
                    style={{
                      width: '130px',
                      height: '180px',
                      cursor: 'pointer',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: flippedBonusCards[num - 1] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <img src="/img/cartabase.webp" alt={`Carta ${num}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}>
                      <img src={`/img/cartbonus${num}.webp`} alt={`Bônus ${num}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Timer Countdown */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem auto', maxWidth: '200px' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                  {/* Background circle */}
                  <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#EDE3C7"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#F6C23E"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - secondsLeft / totalSeconds)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  {/* Timer text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: '#4A3B1B', lineHeight: '1' }}>
                      {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:{(secondsLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9A8B6A', marginTop: '0.25rem' }}>minutos</div>
                  </div>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#4A3B1B', textAlign: 'center', marginTop: '1rem', marginBottom: '0.25rem' }}>
                  ⏳ Desconto de <span style={{ color: '#f43f5e' }}>80% especial para você SÓ HOJE</span>
                </p>
                <p style={{ fontSize: '0.85rem', color: '#9A8B6A', textAlign: 'center', margin: '0' }}>
                  (Últimos minutos para garantir o acesso)
                </p>
              </div>

              {/* Card Promocional */}
              <div
                style={{
                  maxWidth: '400px',
                  margin: '2rem auto',
                  position: 'relative',
                  width: '100%',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '4px solid black',
                  boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.9)'
                }}
              >
                {/* Price Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  right: '-16px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid black',
                  boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.9)',
                  backgroundColor: '#f44260'
                }}>
                  <div style={{ textAlign: 'center', color: 'white', fontSize: '18px', fontWeight: '900' }}>
                    R$29,99
                  </div>
                </div>

                {/* Plan Name */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'black', marginBottom: '8px', lineHeight: '1.2' }}>
                    Pequenos Gênios<br />da Arte
                  </h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    color: 'white',
                    fontWeight: '700',
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: '2px solid black',
                    boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.9)',
                    backgroundColor: '#f44260'
                  }}>
                    80% OFF
                  </span>
                </div>

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {[
                    '60 obras clássicas para colorir',
                    'Bônus 1: 30 Obras Nacionais para Colorir',
                    'Bônus 2: Cartões Visuais - Conheça o Artista!',
                    'Bônus 3: Mundo Colorido',
                    'Combo com mais de 200 atividades',
                    'Acesso imediato',
                    'Material ÚNICO E EXCLUSIVO'
                  ].map((feature, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '2px solid black',
                      boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.9)'
                    }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '12px',
                        border: '1px solid black',
                        boxShadow: '1px 1px 0px 0px rgba(0,0,0,0.9)',
                        backgroundColor: '#f44260',
                        flexShrink: 0
                      }}>
                        ✓
                      </span>
                      <span style={{ color: 'black', fontWeight: '700', fontSize: '14px' }}>
                        {feature.startsWith('Bônus') ? (
                          <>
                            <span style={{ color: '#f44260' }}>{feature.split(':')[0]}:</span>
                            {feature.split(':')[1]}
                          </>
                        ) : feature.includes('ÚNICO E EXCLUSIVO') ? (
                          <>
                            Material <span style={{ color: '#f44260' }}>ÚNICO E EXCLUSIVO</span>
                          </>
                        ) : (
                          feature
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button - Comprar Agora */}
                <button
                  onClick={() => {
                    trackProductClick('Pequenos Artistas - Kit Colorir', 47);

                    // Build checkout URL with UTM parameters
                    const params = new URLSearchParams(window.location.search);
                    const utm_source = params.get('utm_source') || 'organic';
                    const utm_medium = params.get('utm_medium') || 'funil';
                    const utm_campaign = params.get('utm_campaign') || 'pequenos-artistas';
                    const utm_content = params.get('utm_content') || 'colorir-kit';
                    const utm_term = params.get('utm_term') || '';

                    const checkoutUrl = `https://www.ggcheckout.com/checkout/v2/hBUh7oMIyxUmWHEBM9Cm?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;
                    window.location.href = checkoutUrl;
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '900',
                    fontSize: '18px',
                    textAlign: 'center',
                    border: '3px solid black',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.9)',
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.9)';
                  }}
                >
                  COMPRAR AGORA →
                </button>
              </div>

              {/* Botão Ver Tudo - Fora do Card */}
              <button
                onClick={() => {
                  localStorage.setItem('funil_colorir_completo', 'true');
                  sessionStorage.setItem('funil_colorir_visto', 'true');
                  window.location.href = '/#preco-ajuste';
                }}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  margin: '1rem auto 0',
                  padding: '14px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '16px',
                  textAlign: 'center',
                  border: '3px solid black',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.9)',
                  background: '#f44260',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '6px 6px 0px 0px rgba(0,0,0,0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '4px 4px 0px 0px rgba(0,0,0,0.9)';
                }}
              >
                VER TUDO QUE VAI RECEBER →
              </button>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', maxWidth: '450px', margin: '1.5rem auto 0' }}>
                <img
                  src="/img/garantia.webp"
                  alt="Garantia 30 dias"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
