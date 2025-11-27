import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

export const PlanosNoelV2: React.FC = () => {
  const handleCheckout = (url: string) => {
    window.location.href = url;
  };

  return (
    <section id="planos" className="py-12 md:py-16 px-4 bg-[#F5F5F5]">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Plano Completo - Destaque */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border-4 border-[#FFD700] shadow-xl relative">
          {/* Badge */}
          <div className="absolute -top-4 -right-4 bg-[#db143c] text-white px-4 py-2 rounded-full font-bold text-sm">
            ⭐ MELHOR OPÇÃO
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-[#1a4d2e]">
                🎄 Plano Completo
              </h3>
              <p className="text-4xl font-black text-[#db143c]">
                R$ 29,99
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">60+ personagens e cenários</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">Versão colorida e para colorir</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">Conteúdos complementares natalinos</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">Guia passo a passo</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">Uso doméstico e escolar</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#00C853] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">♾️ Acesso vitalício</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="rounded-xl overflow-hidden" style={{ width: '88%', margin: '0 auto' }}>
              <img
                src="/Natal/CaixaProduto-01.webp"
                alt="Kit Completo"
                className="w-full h-auto object-cover rounded-xl shadow-md"
              />
            </div>

            {/* CTA */}
            <button
              onClick={() => handleCheckout('https://checkout.edukaprime.com.br/VCCL1O8SCFXS')}
              className="w-full bg-[#db143c] hover:bg-[#991B1B] text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              🔥 Quero o Kit Completo
            </button>
          </div>
        </div>

        {/* Plano Básico */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border-4 border-gray-300 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-[#333]">
                📦 Plano Básico
              </h3>
              <p className="text-4xl font-black text-[#009944]">
                R$ 17,99
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#009944] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">20 personagens</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#009944] flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#333]">PDF + passo a passo</span>
              </div>
              <div className="flex items-start gap-3">
                <X className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <span className="font-semibold text-[#999]">Conteúdos extras</span>
              </div>
            </div>

            {/* Product Image */}
            <div className="rounded-xl overflow-hidden" style={{ width: '88%', margin: '0 auto' }}>
              <img
                src="/Natal/recebe03.webp"
                alt="Kit Básico"
                className="w-full h-auto object-cover rounded-xl shadow-md"
              />
            </div>

            {/* CTA */}
            <button
              onClick={() => handleCheckout('https://checkout.edukaprime.com.br/VCCL1O8SCFXV')}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Quero o Básico
            </button>
          </div>
        </div>

        {/* Como funciona */}
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a4d2e] text-center">
            📦 Como funciona
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 text-center border-2 border-[#009944]">
              <p className="text-3xl mb-3">📩</p>
              <p className="font-bold text-[#333]">Recebe por e-mail</p>
              <p className="text-sm text-gray-600 mt-2">Acesso imediato aos arquivos</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border-2 border-[#009944]">
              <p className="text-3xl mb-3">🖨️</p>
              <p className="font-bold text-[#333]">Imprime quantas vezes quiser</p>
              <p className="text-sm text-gray-600 mt-2">No formato que desejar</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center border-2 border-[#009944]">
              <p className="text-3xl mb-3">✂️</p>
              <p className="font-bold text-[#333]">Monta e cria</p>
              <p className="text-sm text-gray-600 mt-2">Aprende brincando</p>
            </div>
          </div>

          {/* Imagem */}
          <div className="rounded-xl overflow-hidden shadow-lg" style={{ margin: '0 auto', width: '88%' }}>
            <img
              src="/Natal/foto07.webp"
              alt="Como funciona"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Garantia */}
        <div className="bg-[#E8F5E9] rounded-2xl p-6 md:p-8 border-2 border-[#009944]">
          <h3 className="text-2xl md:text-3xl font-black text-[#1a4d2e] mb-4 text-center">
            ✅ Garantia de Natal Tranquilo
          </h3>

          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src="/Natal/garantianatal.webp"
              alt="Garantia"
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          <p className="text-base md:text-lg text-[#333] text-center font-semibold leading-relaxed">
            <strong>30 dias para experimentar.</strong><br />
            Se não encantar, devolvemos sua compra.<br />
            <span className="text-[#009944]">Sem estresse, sem perguntas.</span>
          </p>
        </div>

        {/* Suporte */}
        <div className="bg-white rounded-xl p-6 border-2 border-[#FFD700]">
          <h3 className="text-xl md:text-2xl font-black text-[#1a4d2e] mb-4 text-center">
            📲 Suporte
          </h3>

          <div className="space-y-3 text-center">
            <p className="flex items-center justify-center gap-2 font-semibold text-[#333]">
              <span className="text-2xl">📱</span>
              <span>WhatsApp ✅</span>
            </p>
            <p className="flex items-center justify-center gap-2 font-semibold text-[#333]">
              <span className="text-2xl">🔒</span>
              <span>Pagamento Seguro</span>
            </p>
            <p className="flex items-center justify-center gap-2 font-semibold text-[#333]">
              <span className="text-2xl">⚡</span>
              <span>Acesso imediato</span>
            </p>
          </div>
        </div>

        {/* CTA Final */}
        <button
          onClick={() => handleCheckout('https://checkout.edukaprime.com.br/VCCL1O8SCFXS')}
          className="w-full bg-[#1a4d2e] hover:bg-[#0f2f1e] text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
        >
          Quero um Natal criativo agora 🎄✨
        </button>
      </div>
    </section>
  );
};
