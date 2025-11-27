import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigation = [
    'Benefícios',
    'Educadores',
    'Planos',
    'Dúvidas Frequentes',
    'Blog',
    'Contato'
  ];

  const socialIcons = [
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Youtube, href: '#' }
  ];

  return (
    <footer className="bg-ink text-white border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              EdukaPrime
            </h2>
            <p className="text-white/80 leading-relaxed mb-6">
              Ao invés de perder horas criando atividades do zero, você terá acesso a um acervo completo de materiais prontos e editáveis para usar imediatamente em sala de aula.
            </p>
            <p className="text-white/80 leading-relaxed">
              Da leitura inicial até conteúdos avançados de interpretação, gramática, literatura e ortografia — tudo alinhado à BNCC 2023 e sempre atualizado.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">
                Links Rápidos
              </h3>
              <div className="space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-white/80 hover:text-warning transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">
                Contato
              </h3>
              <div className="space-y-2">
                <p className="text-white/80">
                  <strong>E-mail:</strong> storymachilink@gmail.com
                </p>
                <p className="text-white/80">
                  <strong>Atendimento:</strong> Segunda a Sexta, 9h às 18h
                </p>
              </div>
              
              <h4 className="font-bold text-white mt-6 mb-3">
                Redes Sociais
              </h4>
              <div className="flex space-x-4">
                <a href="#" className="text-white/80 hover:text-warning transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-white/80 hover:text-warning transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 pt-8 border-t border-white/20">
          {navigation.map((item) => (
            <a
              key={item}
              href="#"
              className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 hover:text-warning hover:border-warning/50 transition-colors text-sm"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          {socialIcons.map(({ icon: Icon, href }, index) => (
            <a
              key={index}
              href={href}
              className="text-white/80 hover:text-warning transition-colors"
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-white/60">
          © 2025 EdukaPrime. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};