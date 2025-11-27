import React from 'react';
import { Mail, Phone, MapPin, Shield, CreditCard, Award } from 'lucide-react';

export const FooterColorir: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0F2741] to-[#1a3a52] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Sobre a EdukaPrime */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#FFB347]">Sobre a EdukaPrime</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              A EdukaPrime é uma plataforma educacional dedicada a fornecer materiais pedagógicos de alta qualidade para pais e educadores. Nosso compromisso é tornar o aprendizado mais divertido, acessível e eficaz.
            </p>
            <div className="flex gap-3 mt-4">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Pagamento 100% Seguro</span>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#FFB347]">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#FFB347] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-300">Email</p>
                  <a href="mailto:contato@edukaprime.com.br" className="text-white hover:text-[#FFB347] transition-colors">
                    contato@edukaprime.com.br
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FFB347] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-300">WhatsApp</p>
                  <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FFB347] transition-colors">
                    (67) 9 3091-1209
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#FFB347] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-300">Brasil</p>
                  <p className="text-white text-sm">Atendimento em todo território nacional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#FFB347]">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Área do Aluno
                </a>
              </li>
              <li>
                <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Suporte
                </a>
              </li>
              <li>
                <a href="#planos" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Nossos Planos
                </a>
              </li>
              <li>
                <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Dúvidas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* Garantias e Segurança */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#FFB347]">Garantias</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold text-sm">Garantia de 30 Dias</p>
                  <p className="text-gray-300 text-xs">Ou seu dinheiro de volta</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold text-sm">Pagamento Seguro</p>
                  <p className="text-gray-300 text-xs">Ambiente 100% protegido</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold text-sm">Material de Qualidade</p>
                  <p className="text-gray-300 text-xs">Aprovado por educadores</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-8"></div>

        {/* Bottom Footer */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Política de Privacidade
            </a>
            <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Termos de Uso
            </a>
            <a href="https://wa.me/+556793091209" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Política de Reembolso
            </a>
          </div>

          <p className="text-gray-400 text-sm">
            © {currentYear} EdukaPrime - Todos os direitos reservados.
          </p>

          <p className="text-gray-500 text-xs max-w-3xl mx-auto">
            EdukaPrime é uma plataforma de materiais educacionais digitais. Os materiais são disponibilizados em formato PDF para download imediato após a aprovação do pagamento.
            Oferecemos garantia incondicional de 30 dias. Este site não faz parte do Facebook ou Google e não é endossado por essas empresas.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-6 opacity-70">
          <div className="text-center">
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Site Seguro</p>
          </div>
          <div className="text-center">
            <CreditCard className="w-8 h-8 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Pagamento Protegido</p>
          </div>
          <div className="text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Qualidade Garantida</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
