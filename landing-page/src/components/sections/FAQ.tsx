import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';

export const FAQ: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: 'O que é a plataforma EdukaPrime?',
      answer: 'A EdukaPrime é uma plataforma digital que oferece acesso a um acervo completo de atividades educacionais prontas para imprimir e usar, desde atividades iniciais de leitura e matemática até conteúdos avançados de interpretação, gramática e ortografia.'
    },
    {
      question: 'Quais benefícios vou obter ao assinar a EdukaPrime?',
      answer: 'Você terá acesso a centenas de atividades prontas, economizará tempo no planejamento, terá materiais alinhados à BNCC 2023, poderá personalizar atividades baixando em Word, e contará com suporte pedagógico especializado.'
    },
    {
      question: 'Como posso acessar o material?',
      answer: 'Após assinar um plano, você receberá acesso à plataforma onde poderá navegar, visualizar e baixar todas as atividades disponíveis em seu plano. Os materiais podem ser baixados em PDF ou Word (dependendo do plano).'
    },
    {
      question: 'As atividades são compatíveis com a BNCC 2023?',
      answer: 'Sim! Todas as nossas atividades são desenvolvidas e constantemente atualizadas para estar 100% alinhadas com a Base Nacional Comum Curricular (BNCC) 2023.'
    },
    {
      question: 'Existem bônus inclusos na assinatura?',
      answer: 'Sim! Dependendo do seu plano, você terá acesso a materiais bônus como guias de planejamento, e-books educacionais, templates personalizáveis e muito mais.'
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'Aceitamos as principais formas de pagamento: cartão de crédito, débito, PIX e boleto bancário. O pagamento é processado de forma segura através de nossa plataforma.'
    },
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. O cancelamento será efetivo ao final do período já pago.'
    },
    {
      question: 'Posso experimentar antes de decidir?',
      answer: 'Claro! Oferecemos 7 dias de teste gratuito para novos usuários, além de 30 dias de garantia total. Se não ficar satisfeito, devolvemos seu dinheiro sem perguntas.'
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#F8FBFF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink mb-4">
            Dúvidas Frequentes
          </h2>
          <p className="text-lg text-body max-w-2xl mx-auto">
            Encontre respostas para as principais dúvidas sobre a EdukaPrime
          </p>
        </div>
        
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="card card-hover cursor-pointer">
              <div onClick={() => toggleFaq(index)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-ink pr-4 text-lg">
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronDown className="w-6 h-6 text-body flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-body flex-shrink-0" />
                  )}
                </div>
                
                {expandedFaq === index && (
                  <div className="mt-4 pt-4 border-t border-[#E6EEF7]">
                    <p className="text-body leading-relaxed">
                      {faq.answer}
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