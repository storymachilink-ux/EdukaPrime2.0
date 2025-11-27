import React, { useState } from 'react';
import { TrendingUp, BookOpen, Bell, Award, Crown, Shield, Settings, RotateCcw, Save, Check } from 'lucide-react';
import { Card } from '../../ui/card';
import { PlanBadge } from '../../../dashboard/components/PlanBadge';
import { OnlineNow } from '../../../dashboard/components/OnlineNow';
import { TutorCard } from '../../../dashboard/components/TutorCard';
import { useAdminPlan } from '../../../hooks/useAdminPlan';
import { usePermissions } from '../../../hooks/usePermissions';

export const Dashboard: React.FC = () => {
  const { isAdmin, effectivePlan, isSimulating } = useAdminPlan();
  const { getCustomPermissions, DEFAULT_PLAN_PERMISSIONS, currentPlanNumber } = usePermissions();

  // Plan access management state
  const [planPermissions, setPlanPermissions] = useState(getCustomPermissions);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Adjust stats based on user plan
  const stats = [
    {
      title: 'Novos Conteúdos',
      value: currentPlanNumber === 0 ? '0' : '3',
      subtitle: 'nesta semana',
      icon: TrendingUp,
      color: 'text-[#F59E0B]'
    },
    {
      title: 'Atividades Concluídas',
      value: currentPlanNumber === 0 ? '0/0' : '5/20',
      subtitle: 'este mês',
      icon: BookOpen,
      color: 'text-[#033258]'
    },
    {
      title: 'Progresso Geral',
      value: currentPlanNumber === 0 ? '0%' : '75%',
      subtitle: 'completado',
      icon: Award,
      color: 'text-[#F59E0B]'
    }
  ];

  // Adjust recent activities based on user plan
  const recentActivities = currentPlanNumber === 0 ? [
    'Seja bem-vindo(a) ao EdukaPrime!',
    'Faça upgrade para acessar atividades',
    'Explore nossos planos de assinatura',
    'Entre em contato para suporte'
  ] : [
    'Completou "Atividades de Matemática Básica"',
    'Visualizou "Vídeo: Técnicas de Ensino"',
    'Baixou "Bônus: Planejamento de Aulas"',
    'Acessou suporte pedagógico'
  ];

  // Plan access management functions
  const features = [
    { key: 'activities', label: '📚 Atividades', required: true },
    { key: 'videos', label: '🎥 Vídeos', required: false },
    { key: 'bonus', label: '🎁 Bônus', required: false },
    { key: 'vipSupport', label: '👑 Suporte VIP', required: false }
  ];

  const plans = [
    { key: 'essencial', label: '📝 ESSENCIAL', icon: '📝' },
    { key: 'evoluir', label: '📈 EVOLUIR', icon: '📈' },
    { key: 'prime', label: '👑 PRIME', icon: '👑' }
  ];

  const handlePermissionChange = (planKey: string, featureKey: string, checked: boolean) => {
    setPlanPermissions(prev => {
      const newPermissions = { ...prev };

      if (checked) {
        // Add permission
        if (!newPermissions[planKey].includes(featureKey)) {
          newPermissions[planKey] = [...newPermissions[planKey], featureKey];
        }
      } else {
        // Remove permission with hierarchy validation
        if (featureKey === 'activities') {
          // Cannot remove activities - always required
          showToastMessage('❌ Atividades são obrigatórias para todos os planos!');
          return prev;
        }

        // Remove from current plan
        newPermissions[planKey] = newPermissions[planKey].filter(f => f !== featureKey);

        // Enforce hierarchy: if removing from higher plan, remove from lower plans too
        if (planKey === 'prime') {
          newPermissions.evoluir = newPermissions.evoluir.filter(f => f !== featureKey);
          newPermissions.essencial = newPermissions.essencial.filter(f => f !== featureKey);
        } else if (planKey === 'evoluir') {
          newPermissions.essencial = newPermissions.essencial.filter(f => f !== featureKey);
        }
      }

      return newPermissions;
    });
  };

  const handleSave = () => {
    localStorage.setItem('customPlanPermissions', JSON.stringify(planPermissions));
    showToastMessage('✅ Configurações salvas com sucesso!');
    // Force reload to apply new permissions
    window.location.reload();
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar para as configurações padrão?')) {
      setPlanPermissions(DEFAULT_PLAN_PERMISSIONS);
      localStorage.removeItem('customPlanPermissions');
      showToastMessage('🔄 Configurações resetadas para o padrão!');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 pb-8 md:pb-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#033258] mb-2">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-[#476178] mb-4 md:mb-6">
          Acompanhe seu progresso e acesse seus conteúdos
        </p>

        {/* Admin Status Indicator */}
        {isAdmin && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-red-900 text-sm md:text-base">Modo Administrador Ativo</h3>
                <p className="text-xs md:text-sm text-red-700 flex items-center gap-2 flex-wrap">
                  <span>Simulando: {effectivePlan}</span>
                  {isSimulating && <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />}
                  <span className="text-xs opacity-75 hidden sm:inline">Use o dropdown "Simular Plano" no header</span>
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-block animate-[float_3s_ease-in-out_infinite] max-w-sm md:max-w-none">
            <img
              src="/bemvindo.webp"
              alt="Bem-vindo ao Dashboard"
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
              transform: translateY(-10px);
            }
          }
          @keyframes slide-in {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>

      {/* New Components Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div>
          <PlanBadge />
        </div>
        <div className="md:col-span-2">
          <OnlineNow />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2">
          <TutorCard />
        </div>
      </div>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 rounded-full bg-[#FFE3A0] flex-shrink-0">
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs md:text-sm font-medium text-[#476178] truncate">
                  {stat.title}
                </h3>
                <p className="text-lg md:text-2xl font-bold text-[#033258]">
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

      {/* Plan Access Manager - Admin Only */}
      {isAdmin && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-[#F59E0B]" />
            <h2 className="text-xl font-bold text-[#033258]">
              Gerenciar Acessos dos Planos
            </h2>
          </div>

          {/* Table - Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#FFE3A0]">
                  <th className="text-left py-3 px-4 font-semibold text-[#033258]">
                    Funcionalidades
                  </th>
                  {plans.map(plan => (
                    <th key={plan.key} className="text-center py-3 px-4 font-semibold text-[#033258]">
                      {plan.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, featureIndex) => (
                  <tr key={feature.key} className="border-b border-[#FFE3A0] hover:bg-[#FFF9E8]">
                    <td className="py-4 px-4 font-medium text-[#033258]">
                      {feature.label}
                      {feature.required && <span className="text-red-500 ml-1">*</span>}
                    </td>
                    {plans.map((plan, planIndex) => (
                      <td key={plan.key} className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={planPermissions?.[plan.key]?.includes(feature.key) || false}
                          onChange={(e) => handlePermissionChange(plan.key, feature.key, e.target.checked)}
                          disabled={feature.required}
                          className="w-5 h-5 text-[#F59E0B] bg-gray-100 border-gray-300 rounded focus:ring-[#F59E0B] focus:ring-2"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {features.map((feature) => (
              <div key={feature.key} className="bg-[#FFF9E8] p-4 rounded-xl border border-[#FFE3A0]">
                <h3 className="font-semibold text-[#033258] mb-3 flex items-center">
                  {feature.label}
                  {feature.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <label key={plan.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#FFE3A0] cursor-pointer hover:bg-[#FFF3D6] transition-colors">
                      <span className="font-medium text-[#033258] text-sm">
                        {plan.icon} {plan.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={planPermissions?.[plan.key]?.includes(feature.key) || false}
                        onChange={(e) => handlePermissionChange(plan.key, feature.key, e.target.checked)}
                        disabled={feature.required}
                        className="w-5 h-5 text-[#F59E0B] bg-gray-100 border-gray-300 rounded focus:ring-[#F59E0B] focus:ring-2 touch-manipulation"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[#FFE3A0]">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-[#FFE3A0] text-[#033258] rounded-xl hover:bg-[#FFF3D6] transition-colors touch-manipulation font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 flex-1 px-6 py-3 bg-[#F59E0B] text-white rounded-xl hover:bg-[#D97706] transition-colors touch-manipulation font-medium"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Hierarquia:</strong> Prime ≥ Evoluir ≥ Essencial.
              Ao desmarcar uma funcionalidade em um plano superior, ela será removida automaticamente dos planos inferiores.
              <br />
              <strong>*</strong> Atividades são obrigatórias para todos os planos.
            </p>
          </div>
        </Card>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-[#FFE3A0] rounded-xl shadow-lg p-4 flex items-center gap-3 animate-slide-in">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-[#033258] font-medium">{toastMessage}</span>
        </div>
      )}

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
            {currentPlanNumber === 0
              ? 'Faça upgrade para começar a explorar nossos conteúdos'
              : 'Continue de onde parou ou explore novos conteúdos'
            }
          </p>
          <div className="space-y-2">
            {currentPlanNumber === 0 ? (
              <button className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-yellow-400 group">
                <p className="font-medium text-yellow-800">
                  🔒 Adquira um plano para começar
                </p>
                <p className="text-sm text-yellow-700">
                  Progresso: 0% - Bloqueado
                </p>
              </button>
            ) : (
              <button className="w-full text-left p-4 rounded-2xl bg-white border border-[#FFE3A0] hover:bg-[#FFF3D6] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] group">
                <p className="font-medium text-[#033258]">
                  Continuar Atividade de Português
                </p>
                <p className="text-sm text-[#476178]">
                  Progresso: 60%
                </p>
              </button>
            )}
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
    </section>
  );
};