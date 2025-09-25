import React, { useState } from 'react';
import { Moon, Sun, Bell, Shield, Globe, HelpCircle, LogOut } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useTheme } from '../../../hooks/useTheme';
import { useAuth } from '../../../hooks/useAuth';

export const Config: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const configSections = [
    {
      title: 'Aparência',
      icon: isDark ? Sun : Moon,
      items: [
        {
          label: 'Modo Escuro',
          description: 'Alterar entre tema claro e escuro',
          action: (
            <button
              onClick={toggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-[#059669] dark:bg-[#10B981]' : 'bg-[#E9DCD7] dark:bg-[#2A2A2A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        }
      ]
    },
    {
      title: 'Notificações',
      icon: Bell,
      items: [
        {
          label: 'E-mail',
          description: 'Receber notificações por e-mail',
          action: (
            <button
              onClick={() => handleNotificationChange('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-[#059669] dark:bg-[#10B981]' : 'bg-[#E9DCD7] dark:bg-[#2A2A2A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        },
        {
          label: 'Push',
          description: 'Notificações no navegador',
          action: (
            <button
              onClick={() => handleNotificationChange('push')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-[#059669] dark:bg-[#10B981]' : 'bg-[#E9DCD7] dark:bg-[#2A2A2A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        },
        {
          label: 'Marketing',
          description: 'Novidades e promoções',
          action: (
            <button
              onClick={() => handleNotificationChange('marketing')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.marketing ? 'bg-[#059669] dark:bg-[#10B981]' : 'bg-[#E9DCD7] dark:bg-[#2A2A2A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        }
      ]
    },
    {
      title: 'Segurança',
      icon: Shield,
      items: [
        {
          label: 'Autenticação em Duas Etapas',
          description: 'Maior segurança para sua conta',
          action: (
            <Button
              variant={twoFactorEnabled ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            >
              {twoFactorEnabled ? 'Desativar' : 'Ativar'}
            </Button>
          )
        },
        {
          label: 'Alterar Senha',
          description: 'Atualizar sua senha de acesso',
          action: (
            <Button variant="ghost" size="sm">
              Alterar
            </Button>
          )
        }
      ]
    },
    {
      title: 'Conta',
      icon: Globe,
      items: [
        {
          label: 'Gerenciar Plano',
          description: 'Alterar ou cancelar sua assinatura',
          action: (
            <Button variant="ghost" size="sm">
              Gerenciar
            </Button>
          )
        },
        {
          label: 'Exportar Dados',
          description: 'Baixar cópia de seus dados',
          action: (
            <Button variant="ghost" size="sm">
              Exportar
            </Button>
          )
        },
        {
          label: 'Excluir Conta',
          description: 'Remover permanentemente sua conta',
          action: (
            <Button variant="ghost" size="sm" className="text-[#DC2626] dark:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20">
              Excluir
            </Button>
          )
        }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
          Configurações
        </h1>
        <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
          Personalize sua experiência no EdukaPrime
        </p>
      </div>

      <div className="space-y-6">
        {configSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#F2E9E6] dark:bg-[#252119] rounded-full flex items-center justify-center">
                <section.icon className="w-5 h-5 text-[#111111] dark:text-[#F5F5F5]" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
                {section.title}
              </h2>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-4 bg-[#F2E9E6] dark:bg-[#252119] rounded-[12px]">
                  <div>
                    <h3 className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5] mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">
                      {item.description}
                    </p>
                  </div>
                  {item.action}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Help & Support */}
      <Card className="border border-[#E9DCD7] dark:border-[#2A2A2A]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#F7D7D2] dark:bg-[#2A1F1D] rounded-full flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-[#111111] dark:text-[#F5F5F5]" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
              Precisa de Ajuda?
            </h3>
            <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3] mb-4">
              Nossa equipe de suporte está sempre pronta para ajudar você.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Contatar Suporte
              </Button>
              <Button variant="ghost" size="sm">
                Ver FAQ
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Card className="border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogOut className="w-6 h-6 text-[#DC2626] dark:text-[#EF4444]" strokeWidth={2} />
            <div>
              <h3 className="font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-1">
                Sair da Conta
              </h3>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">
                Fazer logout de sua sessão atual
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="md" 
            onClick={logout}
            className="text-[#DC2626] dark:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Sair
          </Button>
        </div>
      </Card>
    </div>
  );
};