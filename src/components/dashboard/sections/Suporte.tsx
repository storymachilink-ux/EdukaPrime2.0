import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

export const Suporte: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: 'Como posso cancelar minha assinatura?',
      answer: 'Entre em contato via WhatsApp que cancelamos sua assinatura sem perguntas.'
    },
    {
      question: 'Posso usar as atividades impressas comercialmente?',
      answer: 'Pode usar comercialmente, desde que não as venda online.'
    },
    {
      question: 'Como baixo os materiais em formato WORD?',
      answer: 'Os materiais são compatíveis com Word — basta abrir no Word (ou usar um conversor de formato). Se precisar de ajuda para personalizar use o Suporte VIP'
    },
    {
      question: 'Existe limite de downloads?',
      answer: 'Não há limite para os usuários baixarem as atividades'
    }
  ];

  const contactOptions = [
    {
      icon: Mail,
      title: 'E-mail',
      description: 'storymachilink@gmail.com',
      action: 'Enviar E-mail',
      available: true
    },
    {
      icon: Phone,
      title: 'Telefone',
      description: '(67) 99309-1209',
      action: 'Ligar Agora',
      available: true
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#033258] mb-2">
          Suporte
        </h1>
        <p className="text-sm md:text-base text-[#624044] mb-4 md:mb-6">
          Estamos aqui para ajudar você a aproveitar ao máximo o EdukaPrime
        </p>
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-block animate-[float_4s_ease-in-out_infinite] max-w-sm md:max-w-none">
            <img
              src="/suporte.webp"
              alt="Suporte EdukaPrime"
              className="w-full h-auto"
            />
          </div>
        </div>
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>


      {/* Contact Options */}
      <div className="mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {contactOptions.map((option, index) => (
            <div key={index} className="bg-white border border-[#FFE3A0] rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 hover:shadow-md transition-all duration-200 touch-manipulation">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                  <option.icon className="w-5 h-5 md:w-6 md:h-6 text-amber-700" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-[#033258] mb-1 text-sm md:text-base">
                    {option.title}
                  </h3>
                  <p className="text-sm text-[#624044] mb-3">
                    {option.description}
                  </p>
                  <button
                    className={`w-full px-4 py-2 md:py-3 rounded-xl transition-colors duration-200 font-medium text-sm md:text-base touch-manipulation ${
                      index === 0
                        ? 'bg-white border border-[#FFE3A0] text-[#033258] hover:bg-[#FFF3D6]'
                        : 'bg-[#F59E0B] text-white hover:bg-[#D97706]'
                    }`}
                  >
                    {option.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-[#033258]" strokeWidth={2} />
          <h2 className="text-lg md:text-xl font-bold text-[#033258]">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-white border border-[#FFE3A0] rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md touch-manipulation">
              <div onClick={() => toggleFaq(index)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#033258] pr-4 text-sm md:text-base leading-tight">
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-[#476178] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#476178] flex-shrink-0" />
                  )}
                </div>

                {expandedFaq === index && (
                  <div className="mt-3 pt-3 border-t border-[#FFE3A0]">
                    <p className="text-[#624044] leading-relaxed text-sm md:text-base">
                      {faq.answer.includes('Suporte VIP') ? (
                        <>
                          {faq.answer.split('Suporte VIP')[0]}
                          <strong className="font-bold text-[#033258]">Suporte VIP</strong>
                          {faq.answer.split('Suporte VIP')[1]}
                        </>
                      ) : (
                        faq.answer
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};