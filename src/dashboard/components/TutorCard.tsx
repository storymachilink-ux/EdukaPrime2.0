import React from 'react';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_VIP_URL } from '../constants';

export const TutorCard: React.FC = () => {
  return (
    <div className="bg-white border border-[#FFE3A0] rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img src="/whats.webp" alt="WhatsApp" className="w-16 h-16" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#033258] mb-1">
            Professora Priscila Torres · @edukaprime
          </h3>

          <p className="text-sm text-[#624044] mb-3">
            Pedagoga — suporte às atividades (BNCC)
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-[#624044] text-sm leading-relaxed">
              "Suporte rápido e direto para esclarecer dúvidas sobre as atividades, garantindo mais segurança e praticidade no seu dia a dia."
            </p>
          </div>

          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-5 py-3 shadow-md transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Suporte WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};