// FunilEdukaPrime — Versão Final com TypeScript
// Melhorias: design final, imagens por etapa, mini‑points, minigames SEM DELAY (avança imediato),
// roleta girando e SEMPRE 75%, raspadinha funcional (mouse/touch) retirando a camada ao concluir,
// cartas com FLIP 3D e avanço somente após virar as 2 cartas, botões coloridos por opção,
// barra de progresso com estrela móvel.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

// Paleta final
const COLORS = {
  bg: "#FFF4E6",
  card: "#FFFFFF",
  title: "#0F1C45",
  text: "#2B3140",
  accent: "#FF6B00",
  gold: "#FFE1B0",
  badge: "#FFE6C6",
  soft: "#FFF1E0",
  border: "#CFAF84",
  green: "#22C55E",
  blue: "#2C7BE5",
  orange: "#FF6B00",
  purple: "#8B5CF6",
  teal: "#14B8A6",
  red: "#EF4444",
};

// 🎧 Som
const sounds: Record<string, HTMLAudioElement | null> = {
  click: typeof Audio !== "undefined" ? new Audio("/sounds/click.mp3") : null,
  reward: typeof Audio !== "undefined" ? new Audio("/sounds/reward.mp3") : null,
  spin: typeof Audio !== "undefined" ? new Audio("/sounds/spin.mp3") : null,
  win: typeof Audio !== "undefined" ? new Audio("/sounds/win.mp3") : null,
  stage: typeof Audio !== "undefined" ? new Audio("/sounds/stage.mp3") : null,
  scratch: typeof Audio !== "undefined" ? new Audio("/sounds/scratch.mp3") : null,
};

function playSound(name: string) {
  const s = sounds[name];
  if (!s) return;
  try {
    s.currentTime = 0;
    s.play().catch(() => {});
  } catch (_) {}
}

function showConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: [COLORS.accent, "#2C3E87", COLORS.gold, "#00C2FF", "#7C4DFF"],
  });
}

// 🔢 Etapas (com imagens)
interface Etapa {
  id: number;
  tipo: "intro" | "pergunta" | "jogo" | "final";
  subtipo?: "raspadinha" | "cartas" | "roleta";
  pontos: number;
  img?: string;
  titulo?: string;
  texto?: string;
  cta?: string;
  opcoes?: string[];
  bonus?: string;
  descricaoExtra?: string;
}

const ETAPAS: Etapa[] = [
  {
    id: 1,
    tipo: "intro",
    pontos: 10,
    img: "/img/f01.webp",
    titulo: "Toda pedagoga tem um dom diferente — e o seu está prestes a ser revelado. ✨",
    texto: "Descubra seu estilo de educadora em poucos segundos e desbloqueie um presente que vai te poupar horas de preparo e deixar suas aulas prontas com muito mais facilidade.",
  },
  {
    id: 2,
    tipo: "pergunta",
    pontos: 20,
    img: "/img/f02.webp",
    texto: "Quando começa a planejar suas aulas, o que vem primeiro à cabeça?",
    opcoes: ["A empolgação de criar algo novo 😄", "A ansiedade por não saber por onde começar 😰", "Ou o cansaço só de pensar no tanto de coisa pra preparar 😴"],
  },
  {
    id: 3,
    tipo: "pergunta",
    pontos: 15,
    img: "/img/f03.webp",
    texto: "Quantas horas por semana você perde só montando atividades?",
    opcoes: ["Menos de 3 ⏱️", "De 4 a 8 horas ⌛", "Mais de 10 😩"],
  },
  {
    id: 4,
    tipo: "pergunta",
    pontos: 20,
    img: "/img/f04.webp",
    texto: "Quando você busca atividades na internet, o que mais te irrita de verdade?",
    opcoes: ["Tudo parece igual, nada novo 😤", "São feios e desorganizados 😕", "Levo horas pra achar algo que realmente valha a pena 😩"],
  },
  {
    id: 5,
    tipo: "pergunta",
    pontos: 25,
    img: "/img/f05.webp",
    texto: "Falando a verdade... quando o assunto é BNCC, você se sente:",
    opcoes: ["Segura — já entendo bem 💪", "Um pouco perdida — ainda fico em dúvida 😅", "Quase expert — mas sempre dá pra aprender mais 🤓"],
  },
  {
    id: 6,
    tipo: "jogo",
    subtipo: "raspadinha",
    pontos: 40,
    texto: "Raspe com o dedo/mouse e revele seu bônus Canva!",
    bonus: "Modelo editável no Canva desbloqueado 🎁",
  },
  {
    id: 7,
    tipo: "pergunta",
    pontos: 25,
    img: "/img/f07.webp",
    texto: "Na hora de planejar suas aulas, qual parte mais suga seu tempo (e a sua paciência)? 😅",
    opcoes: ["Criar o design e deixar tudo bonito 🎨", "Pesquisar e alinhar com a BNCC 📚", "Corrigir e revisar o material antes de aplicar ✏️"],
  },
  {
    id: 8,
    tipo: "jogo",
    subtipo: "cartas",
    pontos: 50,
    texto: "Gire as cartas e descubra suas recompensas!",
    bonus: "Você desbloqueou 2 atividades gratuitas 🎁",
  },
  {
    id: 9,
    tipo: "jogo",
    subtipo: "roleta",
    pontos: 80,
    texto: "Chegou a hora mais divertida! 🎁",
    descricaoExtra: "Gire a roleta e descubra o presente que preparamos pra você, um desconto especial pra ter acesso completo à plataforma Eduka Prime e transformar suas aulas com atividades prontas todos os dias.",
    bonus: "Desconto especial de 75% no Plano Prime 🌟",
  },
  {
    id: 10,
    tipo: "final",
    pontos: 0,
    img: "/img/f10.webp",
    titulo: "✨ Parabéns, Educadora Inspiradora!",
    texto: "Você concluiu o desafio e desbloqueou seu presente exclusivo! 🎁 Agora é o momento de garantir acesso a mais de 8.000 atividades prontas, com bônus incríveis e o super desconto de 75%, disponível por apenas 16 minutos. ⏰ 💡 Aproveite agora e veja como suas aulas podem ficar muito mais leves e inspiradoras!",
    cta: "Quero ter acesso a plataforma",
  },
];

export default function FunilGamificado() {
  const navigate = useNavigate();
  const total = ETAPAS.length;
  const [idx, setIdx] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [somAtivo, setSomAtivo] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [answerLocked, setAnswerLocked] = useState(false);

  // Detectar de onde veio o usuário
  const origem = sessionStorage.getItem('funil_origem') || 'principal';

  const etapa = ETAPAS[idx];

  useEffect(() => {
    playSoundSafe("stage", somAtivo);
    setAnswerLocked(false);
    setCountdown(0);
  }, [idx, somAtivo]);

  function playSoundSafe(name: string, active = true) {
    if (!active) return;
    playSound(name);
  }

  function addPontos(qtd: number) {
    setPontos((p) => p + qtd);
  }

  function completarFunil() {
    playSoundSafe("win", somAtivo);
    showConfetti();

    // Salvar no localStorage e redirecionar conforme a origem
    if (origem === 'colorir') {
      localStorage.setItem("funil_colorir_completo", "true");
      sessionStorage.removeItem('funil_origem'); // Limpar sessão
      setTimeout(() => navigate("/colorir"), 2000);
    } else {
      localStorage.setItem("funil_completo", "true");
      sessionStorage.removeItem('funil_origem'); // Limpar sessão
      setTimeout(() => navigate("/principal"), 2000);
    }
  }

  function next() {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
    } else {
      completarFunil();
    }
  }

  // Contagem 03>02>01 (somente para perguntas e intro)
  function startCountdownThenNext() {
    setAnswerLocked(true);
    setCountdown(3);
    let n = 3;
    const it = setInterval(() => {
      n -= 1;
      setCountdown(n);
      if (n <= 0) {
        clearInterval(it);
        next();
      }
    }, 1000);
  }

  // Responder etapas de pergunta/intro (tem delay de 3s)
  function responderEtapa() {
    if (answerLocked || countdown > 0) return;
    playSoundSafe("click", somAtivo);
    addPontos(etapa.pontos);
    showConfetti();
    startCountdownThenNext();
  }

  // Avança imediatamente (usado nos minigames)
  function advanceNow(points = 0) {
    setAnswerLocked(true);
    if (points) addPontos(points);
    setTimeout(() => next(), 600);
  }

  // Progresso e mini‑points
  const progresso = useMemo(() => Math.round((idx / (total - 1)) * 100), [idx, total]);

  const ticks = useMemo(() => {
    const arr = [0];
    for (let i = 3; i < total; i += 3) arr.push(i);
    if (arr[arr.length - 1] !== total - 1) arr.push(total - 1);
    return arr;
  }, [total]);

  // Helpers — cores dos botões por texto
  const hexToRGBA = (hex: string, a = 0.12) => {
    const h = hex.replace("#", "");
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255,
      g = (bigint >> 8) & 255,
      b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  function colorByOption(label: string) {
    const t = label.toLowerCase();
    if (/segura|empolg|menos|criar design|bonito/.test(t)) return COLORS.orange;
    if (/perdida|ansiedad|pesquisar|organ|4 a 8|bncc/.test(t)) return COLORS.blue;
    if (/expert|cansa|corrigir|mais de 10|resultado|tempo/.test(t)) return COLORS.green;
    // fallback por emojis
    if (/😄|💪/.test(t)) return COLORS.orange;
    if (/😰|🗂️/.test(t)) return COLORS.blue;
    if (/😴|🤓/.test(t)) return COLORS.green;
    return COLORS.orange;
  }

  // UI helpers
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      className="w-full max-w-3xl mx-auto rounded-2xl shadow-md"
      style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
    >
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );

  interface CTAProps {
    children: React.ReactNode;
    onClick: () => void;
    icon?: string;
    disabled?: boolean;
  }

  const CTA = ({ children, onClick, icon = "🎁", disabled = false }: CTAProps) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-md transition ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01]"
      }`}
      style={{ background: COLORS.accent }}
      onMouseEnter={() => playSoundSafe("stage", somAtivo)}
    >
      <span className="text-base sm:text-lg">{children}</span>
      <span aria-hidden>{icon}</span>
    </button>
  );

  function ProgressBar() {
    const starLeft = (idx / (total - 1)) * 100;
    return (
      <div className="mb-4">
        <div className="relative">
          {/* trilha */}
          <div className="h-2 rounded-full" style={{ background: COLORS.gold }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${progresso}%`, background: COLORS.accent }}
            />
          </div>
          {/* mini points */}
          {ticks.map((step) => {
            const left = (step / (total - 1)) * 100;
            const isCurrentTick = step === idx;
            const isPassed = step < idx;
            return (
              <div key={step} className="absolute -top-1" style={{ left: `calc(${left}% - 6px)` }}>
                <div
                  className="h-3 w-3 rounded-full border"
                  style={{
                    background: isCurrentTick ? COLORS.accent : isPassed ? COLORS.soft : COLORS.card,
                    borderColor: COLORS.border,
                  }}
                />
              </div>
            );
          })}
          {/* estrela móvel */}
          <div className="absolute -top-4" style={{ left: `calc(${starLeft}% - 10px)` }}>
            <div className="text-xl">⭐</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
          <span>
            Etapa {idx + 1}/{total}
          </span>
          <span>{progresso}%</span>
        </div>
      </div>
    );
  }

  // 🧽 Raspadinha funcional — ao atingir 75% mostra rasp02 e botão continuar
  function JogoRaspadinha() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
      setRevealed(false);
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cover = new Image();
      cover.src = "/img/rasp01.webp";

      const resize = () => {
        const rect = wrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
        cover.onload = () => ctx.drawImage(cover, 0, 0, rect.width, rect.height);
        if (cover.complete) ctx.drawImage(cover, 0, 0, rect.width, rect.height);
      };

      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }, [idx]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let drawing = false;

      const getPos = (e: PointerEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = "clientX" in e ? e.clientX : e.touches?.[0]?.clientX || 0;
        const clientY = "clientY" in e ? e.clientY : e.touches?.[0]?.clientY || 0;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        return { x, y };
      };

      const erase = (x: number, y: number) => {
        ctx.globalCompositeOperation = "destination-out";
        const r = 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      };

      const onDown = (e: PointerEvent | TouchEvent) => {
        drawing = true;
        playSoundSafe("scratch", somAtivo);
        const { x, y } = getPos(e);
        erase(x, y);
      };

      const onMove = (e: PointerEvent | TouchEvent) => {
        if (!drawing) return;
        const { x, y } = getPos(e);
        erase(x, y);
      };

      const onUp = () => {
        drawing = false;
        checkReveal();
      };

      const checkReveal = () => {
        try {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          const w = Math.floor(rect.width * dpr);
          const h = Math.floor(rect.height * dpr);
          const data = ctx.getImageData(0, 0, w, h).data;
          let transparent = 0;
          let total = 0;
          const step = 8 * 4;
          for (let i = 3; i < data.length; i += step) {
            total++;
            if (data[i] === 0) transparent++;
          }
          const pct = (transparent / total) * 100;
          if (pct >= 75) {
            setRevealed(true);
            canvas.style.display = "none";
          }
        } catch (_) {}
      };

      canvas.addEventListener("pointerdown", onDown as EventListener);
      canvas.addEventListener("pointermove", onMove as EventListener);
      window.addEventListener("pointerup", onUp);
      canvas.addEventListener("touchstart", onDown as EventListener, { passive: true });
      canvas.addEventListener("touchmove", onMove as EventListener, { passive: true });
      window.addEventListener("touchend", onUp);

      return () => {
        canvas.removeEventListener("pointerdown", onDown as EventListener);
        canvas.removeEventListener("pointermove", onMove as EventListener);
        window.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("touchstart", onDown as EventListener);
        canvas.removeEventListener("touchmove", onMove as EventListener);
        window.removeEventListener("touchend", onUp);
      };
    }, [idx, somAtivo]);

    useEffect(() => {
      if (revealed) {
        playSoundSafe("reward", somAtivo);
        showConfetti();
      }
    }, [revealed]);

    return (
      <div className="space-y-4">
        <div className="text-[15px] text-gray-700">{etapa.texto}</div>
        <div
          ref={wrapRef}
          className="relative w-full overflow-hidden rounded-xl border aspect-[16/9]"
          style={{ borderColor: COLORS.border }}
        >
          <img
            src="/img/rasp02.webp"
            alt="revelado"
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
          />
          <canvas ref={canvasRef} className="absolute inset-0 touch-none" style={{ touchAction: "none" }} />
        </div>
        {revealed && (
          <CTA onClick={() => advanceNow(etapa.pontos)} icon="🎁">
            Continuar
          </CTA>
        )}
      </div>
    );
  }

  // 🃏 Cartas — FLIP 3D; botão aparece após virar as 2
  function JogoCartas() {
    const [abertas, setAbertas] = useState([false, false]);
    const todasViradas = abertas.every(Boolean);

    useEffect(() => setAbertas([false, false]), [idx]);

    useEffect(() => {
      if (todasViradas) {
        playSoundSafe("reward", somAtivo);
        showConfetti();
      }
    }, [todasViradas]);

    const virar = (i: number) => {
      if (answerLocked) return;
      playSoundSafe("click", somAtivo);
      setAbertas((prev) => {
        if (prev[i]) return prev;
        const n = [...prev];
        n[i] = true;
        return n;
      });
    };

    interface CardFlipProps {
      frontSrc: string;
      backSrc: string;
      opened: boolean;
      onClick: () => void;
    }

    const CardFlip = ({ frontSrc, backSrc, opened, onClick }: CardFlipProps) => (
      <div
        className="w-full aspect-[3/4]"
        style={{
          perspective: "1000px",
          cursor: "pointer"
        }}
        onClick={onClick}
      >
        <div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.6s",
            transform: opened ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* card-front */}
          <div
            className="absolute w-full h-full rounded-xl border shadow flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              borderColor: COLORS.border,
              background: COLORS.card,
            }}
          >
            <img
              src={frontSrc}
              alt="frente"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          {/* card-back */}
          <div
            className="absolute w-full h-full rounded-xl border shadow flex items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              borderColor: COLORS.border,
              background: COLORS.card,
            }}
          >
            <img
              src={backSrc}
              alt="verso"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="text-[15px] text-gray-700">{etapa.texto}</div>
        <div className="grid grid-cols-2 gap-4">
          <CardFlip
            frontSrc="/img/cartabase.webp"
            backSrc="/img/carta011.webp"
            opened={abertas[0]}
            onClick={() => virar(0)}
          />
          <CardFlip
            frontSrc="/img/cartabase.webp"
            backSrc="/img/carta022.webp"
            opened={abertas[1]}
            onClick={() => virar(1)}
          />
        </div>
        {todasViradas && (
          <CTA onClick={() => advanceNow(etapa.pontos)} icon="🎁">
            Continuar
          </CTA>
        )}
      </div>
    );
  }

  // 🎡 Roleta — sempre 75%, fica parada e botão continuar após girar
  function JogoRoleta() {
    const [girando, setGirando] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [terminou, setTerminou] = useState(false);

    const ANGLE_FOR_75 = 315;

    useEffect(() => {
      setRotation(0);
      setGirando(false);
      setTerminou(false);
    }, [idx]);

    const iniciar = () => {
      if (girando || answerLocked || terminou) return;
      setGirando(true);
      playSoundSafe("spin", somAtivo);
      const baseSpins = 4 * 360;
      const target = baseSpins + ANGLE_FOR_75;
      setRotation(target);
      setTimeout(() => {
        playSoundSafe("reward", somAtivo);
        showConfetti();
        setGirando(false);
        setTerminou(true);
      }, 1800);
    };

    return (
      <div className="space-y-4">
        <div className="text-[15px] text-gray-700 font-semibold">{etapa.texto}</div>
        {etapa.descricaoExtra && (
          <div className="text-[15px] text-gray-700">{etapa.descricaoExtra}</div>
        )}
        <div className="flex items-center justify-center">
          <div className="relative h-56 w-56">
            <img
              src="/img/roleta.webp"
              alt="roleta"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: girando ? "transform 1.6s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
              }}
              className="h-full w-full object-contain"
            />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">🔻</div>
          </div>
        </div>
        {!terminou ? (
          <CTA onClick={iniciar} disabled={girando} icon="🎡">
            {girando ? "Girando..." : "Girar roleta"}
          </CTA>
        ) : (
          <CTA onClick={() => advanceNow(etapa.pontos)} icon="🎁">
            Continuar
          </CTA>
        )}
      </div>
    );
  }

  // 🎯 Imagem auxiliar da etapa quando existir
  function EtapaImage() {
    if (!etapa.img) return null;
    return (
      <div className="mb-4 -mt-2">
        <img
          src={etapa.img}
          alt="etapa"
          className="w-full rounded-xl border"
          style={{ borderColor: COLORS.border }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full" style={{ background: COLORS.bg }}>
      <header className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between gap-4">
          <img src="/img/logohorizontal.webp" alt="logo" className="h-8" />
          <button
            onClick={() => setSomAtivo((s) => !s)}
            className="text-sm px-3 py-2 rounded-lg border"
            style={{ borderColor: COLORS.border, color: COLORS.title, background: COLORS.card }}
          >
            {somAtivo ? "🔊 Som: ON" : "🔈 Som: OFF"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        <ProgressBar />

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ background: COLORS.badge, color: COLORS.title }}
        >
          ⭐ Pontos: {pontos}
        </div>

        <Card>
          <EtapaImage />

          {/* INTRO */}
          {etapa.tipo === "intro" && (
            <div className="space-y-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: COLORS.title }}>
                {etapa.titulo}
              </h1>
              <p className="text-[15px] text-gray-700">{etapa.texto}</p>
              <CTA onClick={responderEtapa}>Começar agora 🎮</CTA>
            </div>
          )}

          {/* PERGUNTA */}
          {etapa.tipo === "pergunta" && (
            <div className="space-y-5">
              <p className="text-[15px] text-gray-700">{etapa.texto}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {etapa.opcoes?.map((opt, i) => {
                  const base = colorByOption(opt);
                  return (
                    <button
                      key={i}
                      onClick={responderEtapa}
                      className={`rounded-xl px-4 py-3 text-sm font-semibold shadow border transition ${
                        answerLocked ? "opacity-60" : "hover:scale-[1.01]"
                      }`}
                      style={{
                        borderColor: base,
                        color: COLORS.title,
                        background: hexToRGBA(base, 0.16),
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* JOGOS */}
          {etapa.tipo === "jogo" && etapa.subtipo === "raspadinha" && <JogoRaspadinha />}
          {etapa.tipo === "jogo" && etapa.subtipo === "cartas" && <JogoCartas />}
          {etapa.tipo === "jogo" && etapa.subtipo === "roleta" && <JogoRoleta />}

          {/* FINAL */}
          {etapa.tipo === "final" && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold" style={{ color: COLORS.title }}>
                {etapa.titulo}
              </h2>
              <p className="text-[15px] text-gray-700">{etapa.texto}</p>
              <CTA onClick={completarFunil}>
                {etapa.cta}
              </CTA>
            </div>
          )}

          {/* Contador 03>02>01 — só aparece em perguntas/intro */}
          {countdown > 0 && (
            <div className="mt-6 text-center text-sm font-semibold" style={{ color: COLORS.title }}>
              {String(countdown).padStart(2, "0")}{" "}
              <span className="opacity-60">Segundos para próxima etapa</span>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
