import React, { useState } from 'react';
import { MessageCircle, HelpCircle, Mail, Phone, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const Suporte: React.FC = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: 'Como posso cancelar minha assinatura?',
      answer: 'Você pode cancelar sua assinatura a qualquer momento acessando as Configurações > Plano e Faturamento. O cancelamento será efetivo ao final do período atual.'
    },
    {
      question: 'Posso usar as atividades impressas comercialmente?',
      answer: 'Sim! Com sua assinatura ativa, você pode imprimir e usar todas as atividades em suas aulas e práticas pedagógicas. Não é permitida a revenda dos materiais.'
    },
    {
      question: 'Como baixo os materiais em formato WORD?',
      answer: 'Os formatos WORD estão disponíveis nos planos Evoluir e Tudo em Um. Após acessar uma atividade, clique no botão "Baixar" e selecione o formato desejado.'
    },
    {
      question: 'Existe limite de downloads?',
      answer: 'Não! Com sua assinatura ativa, você pode fazer downloads ilimitados de todos os materiais disponíveis em seu plano.'
    },
    {
      question: 'Como funciona o período de teste?',
      answer: 'Oferecemos 7 dias de teste gratuito para novos usuários. Durante esse período, você terá acesso completo ao plano escolhido.'
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Chat Online',
      description: 'Converse conosco em tempo real',
      action: 'Iniciar Chat',
      available: true
    },
    {
      icon: Mail,
      title: 'E-mail',
      description: 'contato@edukaprime.com',
      action: 'Enviar E-mail',
      available: true
    },
    {
      icon: Phone,
      title: 'Telefone',
      description: '(11) 3000-0000',
      action: 'Ligar Agora',
      available: true
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
          Suporte
        </h1>
        <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
          Estamos aqui para ajudar você a aproveitar ao máximo o EdukaPrime
        </p>
      </div>

      {/* Quick Support */}
      <Card className="bg-[#F7D7D2] dark:bg-[#2A1F1D] border-0">
        <div className="flex items-center gap-4">
          <img
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop"
            alt="Professora Maria"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1">
              Falar com Professora Maria
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3] mb-3">
              Nossa especialista pedagógica está disponível para ajudar você
            </p>
            <Button variant="primary" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Iniciar Conversa
            </Button>
          </div>
        </div>
      </Card>

      {/* Contact Options */}
      <div>
        <h2 className="text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-4">
          Entre em Contato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactOptions.map((option, index) => (
            <Card key={index} hover>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#F2E9E6] dark:bg-[#252119] rounded-full flex items-center justify-center">
                  <option.icon className="w-6 h-6 text-[#111111] dark:text-[#F5F5F5]" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3] mb-3">
                    {option.description}
                  </p>
                  <Button 
                    variant={option.available ? "primary" : "secondary"} 
                    size="sm" 
                    className="w-full"
                    disabled={!option.available}
                  >
                    {option.action}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6 text-[#111111] dark:text-white" strokeWidth={2} />
          <h2 className="text-xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
            Perguntas Frequentes
          </h2>
        </div>
        
        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <Card key={index} className="cursor-pointer transition-all duration-200">
              <div onClick={() => toggleFaq(index)}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5] pr-4">
                    {faq.question}
                  </h3>
                  {expandedFaq === index ? (
                    <ChevronDown className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3] flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#5C5C5C] dark:text-[#A3A3A3] flex-shrink-0" />
                  )}
                </div>
                
                {expandedFaq === index && (
                  <div className="mt-3 pt-3 border-t border-[#E9DCD7] dark:border-[#2A2A2A]">
                    <p className="text-[#5C5C5C] dark:text-[#A3A3A3] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};