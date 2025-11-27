import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { usePixelTracking } from '../../hooks/usePixelTracking';
import { trackInitiateCheckout } from '../../lib/tiktokTracker';

export const PlanosSimplificadosNoel: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { trackProductClick } = usePixelTracking();

  const handleCheckout = (productName: string, price: number, url: string) => {
    // Rastrear em ambos os pixels: Utmify e TikTok
    trackProductClick(productName, price);

    trackInitiateCheckout([
      {
        content_id: productName.replace(/\s+/g, '_').toLowerCase(),
        content_type: 'product',
        content_name: productName
      }
    ], price, 'BRL');

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'papercrafts';
    const utm_campaign = params.get('utm_campaign') || productName.toLowerCase();
    const utm_content = params.get('utm_content') || 'papercraft-kit';
    const utm_term = params.get('utm_term') || '';

    const urlWithUtm = `${url}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;

    // Aguardar 150ms para garantir que eventos foram disparados antes de redirecionar
    setTimeout(() => {
      window.location.href = urlWithUtm;
    }, 150);
  };

  const handleUpgradeYes = () => {
    handleCheckout('Coleção Completa de Natal com Desconto', 19.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCGRI');
    setShowUpgradeModal(false);
  };

  const handleUpgradeNo = () => {
    handleCheckout('Coleção Básica de Natal', 12.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCFXV');
    setShowUpgradeModal(false);
  };

  return (
    <section className="py-12 md:py-16 px-4 bg-[#F5F5F5]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 9) Kit Completo - DESTAQUE (Aparece primeiro) */}
        <style>{`
          .kit-completo-card {
            background: #FFFFFF;
            border: 2px solid #f8c630;
            border-radius: 14px;
            padding: 20px;
            box-shadow: 0 10px 20px rgba(0,0,0,.06);
            position: relative;
            transition: all 0.3s ease;
          }
          .kit-completo-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 28px rgba(200,155,60,.2);
            border-color: #b8862a;
          }
          .kit-completo-selo {
            position: absolute;
            top: -12px;
            right: 16px;
            background: #145C44;
            color: #f8c630;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: bold;
            border: 1px solid #f8c630;
            animation: pulse-slow 4s ease-in-out infinite;
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
          }
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .kit-completo-check {
            width: 24px;
            height: 24px;
            background: #16A34A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .kit-completo-btn {
            background: #145C44;
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 4px 12px rgba(20,92,68,.2);
            transition: all 0.2s ease;
            animation: pulse-scale 2.5s ease-in-out infinite;
          }
          .kit-completo-btn:hover {
            background: #0F4734;
            transform: scale(1.02);
            box-shadow: 0 6px 16px rgba(20,92,68,.3);
            animation: none;
          }
        `}</style>

        <div id="kit-completo-noel" className="kit-completo-card scroll-mt-20">
          <div className="kit-completo-selo">
            ⭐ BÔNUS INCLUSOS
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-[#0D3B2E] mb-3 pt-2">
            Coleção Completa de Natal
          </h3>
          <div className="mb-6">
            <p className="text-xs text-[#9CA3AF] line-through mb-1">
              R$ 150,00
            </p>
            <p className="text-3xl font-black text-[#16A34A]">
              R$ 29,99
            </p>
            <p className="text-sm text-[#6B7280]">ou até 5x de R$ 6,27</p>
            <p className="text-xs text-[#6B7280] mt-2">pagamento único</p>
            <p className="text-sm font-semibold text-[#16A34A]">Você economiza R$ 120 + R$ 147 em bônus</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">60+ personagens e cenários 3D</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Versão colorida e para colorir</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Conteúdos complementares inclusos</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Guias passo a passo ilustrados</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Ideal para casa e escola</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-completo-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Acesso imediato e vitalício</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-[#ECD9BD] mb-6 flex items-center gap-2">
            <span className="text-green-600 font-bold text-lg">✓</span>
            <p className="text-sm text-[#1F2937] font-semibold">Você economiza R$267,00</p>
          </div>

          <div className="rounded-xl overflow-hidden mb-6" style={{ width: '88%', margin: '0 auto' }}>
            <img
              src="/Natal/produto-plat.webp"
              alt="Kit Completo"
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>

          <button
            onClick={() => handleCheckout('Coleção Completa de Natal', 29.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCFXS')}
            className="kit-completo-btn"
          >
            QUERO COLEÇÃO COMPLETA
          </button>
        </div>

        {/* 8) Kit Básico (Aparece segundo) */}
        <style>{`
          .kit-basico-card {
            background: #F7F7F7;
            border: 1px solid #E5E7EB;
            border-radius: 14px;
            padding: 20px;
            box-shadow: none;
            position: relative;
            transition: all 0.3s ease;
          }
          .kit-basico-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,.04);
            border-color: #f8c630;
          }
          .kit-basico-check {
            width: 24px;
            height: 24px;
            background: #16A34A;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .kit-basico-btn {
            background: #145C44;
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            box-shadow: 0 2px 8px rgba(20,92,68,.15);
            transition: all 0.2s ease;
          }
          .kit-basico-btn:hover {
            background: #0F4734;
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(20,92,68,.25);
          }
        `}</style>

        <div className="kit-basico-card">
          <h3 className="text-xl md:text-2xl font-bold text-[#0D3B2E] mb-3">
            Coleção Básica de Natal
          </h3>
          <div className="mb-6">
            <p className="text-xs text-[#9CA3AF] line-through mb-1">
              R$ 60,00
            </p>
            <p className="text-3xl font-black text-[#16A34A]">
              R$ 12,99
            </p>
            <p className="text-sm text-[#6B7280]">ou 3x de R$ 4,33</p>
            <p className="text-xs text-[#6B7280] mt-2">pagamento único</p>
            <p className="text-sm font-semibold text-[#16A34A]">Você economiza R$ 47,00</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="kit-basico-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">20 personagens natalinos</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-basico-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">PDF + passo a passo simples</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="kit-basico-check">✓</div>
              <p className="font-semibold text-[#2E2E2E]">Perfeito para brincar e decorar</p>
            </div>
            <div className="flex items-start gap-3">
              <X className="w-5 h-5 text-[#db143c] flex-shrink-0" />
              <p className="font-semibold text-[#db143c] text-sm">Não inclui conteúdos complementares</p>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden mb-6" style={{ width: '88%', margin: '0 auto' }}>
            <img
              src="/Natal/recebe04.webp"
              alt="Kit Básico"
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>

          <button
            onClick={() => handleCheckout('Coleção Básica de Natal', 12.99, 'https://checkout.edukaprime.com.br/VCCL1O8SCFXV')}
            className="kit-basico-btn"
          >
            QUERO O BÁSICO
          </button>
        </div>

        {/* EXTRAS */}
        <div className="space-y-6">
          {/* Vídeo Depoimento */}
          <style>{`
            .video-depoimento-container {
              width: 100%;
              max-width: 100%;
            }
            .video-wrapper {
              position: relative;
              width: 100%;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              cursor: pointer;
              transition: all 0.3s ease;
            }
            .video-wrapper:hover {
              box-shadow: 0 8px 20px rgba(0,0,0,0.15);
              transform: translateY(-2px);
            }
            .video-wrapper video {
              width: 100%;
              height: auto;
              display: block;
              border-radius: 16px;
            }
            .video-thumbnail {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 1;
            }
            .video-thumbnail img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
              border-radius: 16px;
            }
            .video-thumbnail.hidden {
              display: none;
            }
          `}</style>

          <div className="video-depoimento-container">
            <p className="text-base md:text-lg font-bold text-[#0D3B2E] text-center mb-4">
              Olha que lindo as criações da família Takachi
            </p>
            <div
              className="video-wrapper"
              onClick={(e) => {
                const video = e.currentTarget.querySelector('video') as HTMLVideoElement;
                const thumbnail = e.currentTarget.querySelector('.video-thumbnail');
                if (video && thumbnail) {
                  thumbnail.classList.add('hidden');
                  video.play();
                }
              }}
            >
              <video>
                <source src="/Natal/edukaprime.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos HTML5.
              </video>
              <div className="video-thumbnail">
                <img src="/Natal/capa-vid.webp" alt="Criações da família Takachi" />
              </div>
            </div>
          </div>

          {/* Depoimentos curtos */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-[#db143c] shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="/carla.webp"
                    alt="Ana"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#db143c]"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-bold text-[#f8c630]">⭐⭐⭐⭐⭐</p>
                    <p className="text-xs font-semibold text-[#333]">Ana</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-[#333] italic">
                  "Meu sobrinho ficou concentrado por horas! depois veio todo feliz me mostrar um amor 🥰"
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-[#f8c630] shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="/luciana.webp"
                    alt="Prof. Camila"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#f8c630]"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-bold text-[#f8c630]">⭐⭐⭐⭐⭐</p>
                    <p className="text-xs font-semibold text-[#333]">Prof. Camila</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-[#333] italic">
                  "As crianças amaram na escola!"
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-[#0D3B2E] shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src="/mariana.webp"
                    alt="Júlia"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#0D3B2E]"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-bold text-[#f8c630]">⭐⭐⭐⭐⭐</p>
                    <p className="text-xs font-semibold text-[#333]">Júlia</p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-[#333] italic">
                  "É ótimo para coordenação motora, atenção e para termos este momento mãe e filho! ❤️ adoramos 😍"
                </p>
              </div>
            </div>
          </div>

          {/* Garantia */}
          <div className="bg-[#FFF5DD] rounded-2xl p-6 border-2 border-[#f8c630]">
            <h3 className="text-xl md:text-2xl font-black text-[#0D3B2E] mb-4 text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-[#16A34A]" />
              Garantia de 30 Dias
            </h3>
            <div className="rounded-lg overflow-hidden mb-4">
              <img
                src="/Natal/garantianatal.webp"
                alt="Garantia"
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="text-base md:text-lg text-[#2E2E2E] font-semibold text-center">
              Teste sem risco por 30 dias. Se não encantar, devolvemos seu investimento.
            </p>
          </div>

          {/* Como funciona */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-black text-[#0D3B2E] text-center">
              Como funciona
            </h3>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-5 border-l-4 border-[#f8c630]">
                <img src="/email.png" alt="Email" className="w-12 h-12 mb-2" />
                <p className="font-bold text-[#0D3B2E] mb-1">Acesse sua área exclusiva</p>
                <p className="text-sm text-[#6B7280]">Receba seu login no e-mail e entre na plataforma.</p>
              </div>
              <div className="bg-white rounded-lg p-5 border-l-4 border-[#f8c630]">
                <img src="/imprimir.png" alt="Imprimir" className="w-12 h-12 mb-2" />
                <p className="font-bold text-[#0D3B2E] mb-1">Escolha o projeto e baixe</p>
                <p className="text-sm text-[#6B7280]">Selecione o modelo que quiser — imprima quantas vezes desejar.</p>
              </div>
              <div className="bg-white rounded-lg p-5 border-l-4 border-[#f8c630]">
                <img src="/corte.png" alt="Corte" className="w-12 h-12 mb-2" />
                <p className="font-bold text-[#0D3B2E] mb-1">Recorte, monte e decore</p>
                <p className="text-sm text-[#6B7280]">Dê vida ao Natal com as crianças e aproveite momentos especiais.</p>
              </div>
            </div>

            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src="/boo/aprovado.webp"
                alt="Como funciona"
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="text-center mt-6">
              <p className="text-base md:text-lg text-[#2E2E2E] leading-relaxed">
                O Kit EdukaPapers é recomendado por <span className="font-bold text-[#16A34A]">educadores e pais, que acreditam no verdadeiro desempenho das crianças e reforçam seu desenvolvimento</span>, o melhor em atividades lúdicas e interativas.
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-base md:text-lg py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <img src="/whats.webp" alt="WhatsApp" className="w-6 h-6" />
                Tenho Dúvidas
              </button>
            </div>
          </div>

        </div>

        {/* Modal de Upgrade */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg aspect-square p-8 space-y-4 flex flex-col">
              {/* Fechar */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Título */}
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#145C44] mb-1">
                  Espere!
                </h2>
                <p className="text-lg font-bold text-[#db143c]">
                  Oferta Exclusiva!
                </p>
              </div>

              {/* Mensagem */}
              <div className="text-center space-y-3 flex-1">
                <p className="text-base font-semibold text-[#2E2E2E]">
                  Upgrade para Coleção Completa com DESCONTO EXTRA
                </p>

                {/* Preços */}
                <div className="bg-[#FFF3D6] rounded-lg p-4 space-y-2">
                  <p className="text-sm text-[#6B7280] line-through">
                    De R$29,99
                  </p>
                  <p className="text-3xl font-black text-[#16A34A]">
                    Por apenas R$19,99
                  </p>
                  <p className="text-sm font-bold text-[#db143c]">
                    Economize R$10 agora!
                  </p>
                </div>

                {/* Benefícios */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Todos os 3 bônus inclusos
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Atualizações mensais
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold text-lg">✓</span>
                    <p className="text-sm font-semibold text-[#2E2E2E]">
                      Suporte prioritário
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={handleUpgradeYes}
                  className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-3 rounded-lg transition-colors"
                >
                  SIM, QUERO O DESCONTO!
                </button>
                <button
                  onClick={handleUpgradeNo}
                  className="w-full bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#2E2E2E] font-bold py-3 rounded-lg transition-colors"
                >
                  Não, quero o básico
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
