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
      color: 'text-[#F59E0B]'
    },
    {
      title: 'Atividades Concluídas',
      value: '5/20',
      subtitle: 'este mês',
      icon: BookOpen,
      color: 'text-[#033258]'
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
        <h1 className="text-3xl font-bold text-[#033258] mb-2">
          Dashboard
        </h1>
        <p className="text-[#476178]">
          Acompanhe seu progresso e acesse seus conteúdos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-[#FFE3A0]`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#476178]">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-[#033258]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#476178]">
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
            <BookOpen className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-lg font-bold text-[#033258]">
              Ação Rápida
            </h2>
          </div>
          <p className="text-[#476178] mb-4">
            Continue de onde parou ou explore novos conteúdos
          </p>
          <div className="space-y-2">
            <button className="w-full text-left p-4 rounded-2xl bg-white border border-[#FFE3A0] hover:bg-[#FFF3D6] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] group">
              <p className="font-medium text-[#033258]">
                Continuar Atividade de Português
              </p>
              <p className="text-sm text-[#476178]">
                Progresso: 60%
              </p>
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-lg font-bold text-[#033258]">
              Notificações Recentes
            </h2>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-[#F59E0B] rounded-full mt-2" />
                <p className="text-sm text-[#476178]">
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