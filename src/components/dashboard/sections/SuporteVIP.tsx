import React, { useState } from 'react';
import { MessageCircle, Crown, Star, Sparkles } from 'lucide-react';
import { WHATSAPP_VIP_URL } from '../../../dashboard/constants';
import { usePermissions } from '../../../hooks/usePermissions';
import { AttractiveUpgradeModal } from '../../ui/AttractiveUpgradeModal';

export const SuporteVIP: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { permissions } = usePermissions();

  // If user doesn't have access to VIP Support, show upgrade modal content
  if (!permissions.canAccessVipSupport) {
    return (
      <>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-600" />
              <h1 className="text-4xl font-bold text-[#033258]">
                Suporte VIP
              </h1>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-lg text-[#476178] mb-8">
              Atendimento exclusivo e personalizado para nossos membros premium
            </p>
          </div>

          {/* Upgrade Content */}
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#FFE3A0] max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-[#033258] mb-2">
                  Acesso Exclusivo Prime
                </h3>
                <p className="text-[#476178] mb-6">
                  O Suporte VIP é exclusivo para assinantes do Plano Prime
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  🚀 Liberar Acesso VIP
                </button>
              </div>
            </div>
          </div>
        </div>

        <AttractiveUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-600" />
          <h1 className="text-4xl font-bold text-[#033258]">
            Suporte VIP
          </h1>
          <Crown className="w-8 h-8 text-yellow-600" />
        </div>
        <p className="text-lg text-[#476178] mb-8">
          Atendimento exclusivo e personalizado para nossos membros premium
        </p>
      </div>

      {/* Premium WhatsApp Card */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Premium Border & Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl blur opacity-75"></div>

          <div className="relative bg-white border-2 border-yellow-400 rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Premium Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                <Crown className="w-4 h-4" />
                ACESSO VIP
                <Crown className="w-4 h-4" />
              </div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-8 right-8 opacity-20">
              <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
            </div>
            <div className="absolute bottom-8 left-8 opacity-20">
              <Star className="w-10 h-10 text-yellow-500 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Enhanced Avatar */}
              <div className="flex-shrink-0 relative">
                {/* Glow effect behind avatar */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-xl opacity-50 scale-110"></div>

                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full p-2 shadow-2xl">
                    <img
                      src="/whats.webp"
                      alt="WhatsApp VIP"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>

                  {/* Premium indicator */}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full p-2 shadow-lg">
                    <Crown className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                {/* Name and Handle */}
                <h2 className="text-3xl font-bold text-[#033258] mb-2 flex items-center justify-center md:justify-start gap-2">
                  Professora Priscila Torres
                  <Crown className="w-6 h-6 text-yellow-600" />
                </h2>

                <p className="text-xl text-yellow-600 font-semibold mb-2">
                  @edukaprime
                </p>

                <p className="text-lg text-[#624044] mb-6">
                  Pedagoga — suporte às atividades (BNCC)
                </p>

                {/* Premium Quote Box */}
                <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-2xl p-6 mb-8 shadow-inner">
                  {/* Quote marks */}
                  <div className="absolute -top-3 -left-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg">
                    "
                  </div>
                  <div className="absolute -bottom-3 -right-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg rotate-180">
                    "
                  </div>

                  <p className="text-[#624044] text-lg leading-relaxed font-medium italic">
                    Suporte rápido e exclusivo para tirar dúvidas, adaptar conteúdos,
                    sugerir melhorias e fornecer novas atividades personalizadas sempre que precisar.
                  </p>
                </div>

                {/* Premium CTA Button */}
                <a
                  href={WHATSAPP_VIP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl px-8 py-4 shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg font-bold"
                >
                  {/* Button glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>

                  <div className="relative flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    <span>Suporte WhatsApp VIP</span>
                    <Crown className="w-5 h-5 text-yellow-300" />
                  </div>
                </a>

                {/* Additional Info */}
                <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-[#476178]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online agora</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Resposta em até 2h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span>Acesso exclusivo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="mt-12 pt-8 border-t border-yellow-200">
              <h3 className="text-2xl font-bold text-[#033258] mb-6 text-center flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-600" />
                Benefícios VIP
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <MessageCircle className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-[#033258] mb-2">Atendimento Direto</h4>
                  <p className="text-sm text-[#624044]">Contato direto com nossa pedagoga especializada</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-[#033258] mb-2">Prioridade Total</h4>
                  <p className="text-sm text-[#624044]">Suas dúvidas são atendidas com máxima prioridade</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-[#033258] mb-2">Personalização</h4>
                  <p className="text-sm text-[#624044]">Solicite atividades customizadas para suas necessidades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};