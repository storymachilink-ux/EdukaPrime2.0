import React from 'react';
import { TrendingUp, BookOpen, Bell, Award } from 'lucide-react';
import { Card } from '../../ui/Card';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Novos Conteúdos',
      value: '3',
      subtitle: 'nesta semana',
      icon: TrendingUp,
      color: 'text-[#059669] dark:text-[#10B981]'
    },
    {
      title: 'Atividades Concluídas',
      value: '5/20',
      subtitle: 'este mês',
      icon: BookOpen,
      color: 'text-[#3B82F6]'
    },
    {
      title: 'Progresso Geral',
      value: '75%',
      subtitle: 'completado',
      icon: Award,
      color: 'text-[#F59E0B]'
    }
  ];

  const recentActivities = [
    'Completou "Atividades de Matemática Básica"',
    'Visualizou "Vídeo: Técnicas de Ensino"',
    'Baixou "Bônus: Planejamento de Aulas"',
    'Acessou suporte pedagógico'
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5] mb-2">
          Dashboard
        </h1>
        <p className="text-[#5C5C5C] dark:text-[#A3A3A3]">
          Acompanhe seu progresso e acesse seus conteúdos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-[#F2E9E6] dark:bg-[#252119]`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#5C5C5C] dark:text-[#A3A3A3]">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#5C5C5C] dark:text-[#A3A3A3]">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-[#111111] dark:text-white" />
            <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
              Ação Rápida
            </h2>
          </div>
          <p className="text-[#5C5C5C] dark:text-[#A3A3A3] mb-4">
            Continue de onde parou ou explore novos conteúdos
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-[12px] bg-[#F2E9E6] dark:bg-[#252119] hover:bg-[#F7D7D2] dark:hover:bg-[#2A1F1D] transition-colors">
              <p className="font-medium text-[#1F1F1F] dark:text-[#F5F5F5]">
                Continuar Atividade de Português
              </p>
              <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">
                Progresso: 60%
              </p>
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#111111] dark:text-white" />
            <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-[#F5F5F5]">
              Notificações Recentes
            </h2>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[#059669] dark:bg-[#10B981] rounded-full mt-2" />
                <p className="text-sm text-[#5C5C5C] dark:text-[#A3A3A3]">
                  {activity}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};