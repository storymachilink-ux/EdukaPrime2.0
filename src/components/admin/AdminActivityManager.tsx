import React, { useState } from 'react';
import { Settings, Plus, Database, Play, Gift } from 'lucide-react';
import { BaseActivitySettings } from './BaseActivitySettings';
import { Videos } from '../dashboard/sections/Videos';
import { BonusSection } from '../dashboard/sections/Bonus';
import { useAdminPlan } from '../../hooks/useAdminPlan';

export const AdminActivityManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'base' | 'custom' | 'videos' | 'bonus'>('base');
  const { isAdmin } = useAdminPlan();

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium">Acesso negado</p>
          <p className="text-red-600 text-sm">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#033258] mb-2">
          Gerenciamento de Atividades
        </h1>
        <p className="text-[#476178]">
          Configure as atividades base e gerencie atividades customizadas
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FFE3A0] p-2">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={() => setActiveTab('base')}
            className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 text-xs md:text-sm ${
              activeTab === 'base'
                ? 'bg-[#F59E0B] text-white shadow-lg'
                : 'text-[#033258] hover:bg-[#FFF3D6]'
            }`}
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
            <div className="text-center md:text-left">
              <span className="block md:inline">Atividades</span>
              <span className="block md:inline md:ml-1">Base</span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
              7
            </span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 text-xs md:text-sm ${
              activeTab === 'custom'
                ? 'bg-[#F59E0B] text-white shadow-lg'
                : 'text-[#033258] hover:bg-[#FFF3D6]'
            }`}
          >
            <Database className="w-4 h-4 md:w-5 md:h-5" />
            <div className="text-center md:text-left">
              <span className="block md:inline">Atividades</span>
              <span className="block md:inline md:ml-1">Custom</span>
            </div>
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 text-xs md:text-sm ${
              activeTab === 'videos'
                ? 'bg-[#F59E0B] text-white shadow-lg'
                : 'text-[#033258] hover:bg-[#FFF3D6]'
            }`}
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            <span>Vídeos</span>
          </button>

          <button
            onClick={() => setActiveTab('bonus')}
            className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-medium transition-all duration-200 text-xs md:text-sm ${
              activeTab === 'bonus'
                ? 'bg-[#F59E0B] text-white shadow-lg'
                : 'text-[#033258] hover:bg-[#FFF3D6]'
            }`}
          >
            <Gift className="w-4 h-4 md:w-5 md:h-5" />
            <span>Bônus</span>
          </button>

        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px] pb-8 md:pb-0">
        {activeTab === 'base' && <BaseActivitySettings />}

        {activeTab === 'custom' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center">
            <Database className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#033258] mb-2">
              Atividades Customizadas
            </h3>
            <p className="text-[#476178] mb-6">
              Para gerenciar atividades customizadas, use a seção "Atividades" no dashboard principal.
              Lá você pode adicionar, editar e remover atividades personalizadas.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Como funciona:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• <strong>Atividades Base:</strong> 7 atividades fixas no código, apenas links editáveis</li>
                <li>• <strong>Atividades Customizadas:</strong> Atividades criadas dinamicamente via admin</li>
                <li>• <strong>Gerenciamento:</strong> Use o botão "+" na seção Atividades para adicionar novas</li>
                <li>• <strong>Edição:</strong> Clique no ícone de edição nas atividades customizadas</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-[#033258]">
                  Gerenciar Vídeos
                </h2>
              </div>
              <p className="text-[#476178] text-sm">
                Adicione, edite e gerencie os vídeos educacionais da plataforma. Você pode criar novos vídeos e editá-los.
              </p>
            </div>
            <Videos />
          </div>
        )}

        {activeTab === 'bonus' && (
          <div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Gift className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold text-[#033258]">
                  Gerenciar Materiais Bônus
                </h2>
              </div>
              <p className="text-[#476178] text-sm">
                Gerencie os materiais bônus exclusivos. Você pode adicionar novos materiais e editar os existentes.
              </p>
            </div>
            <BonusSection />
          </div>
        )}

      </div>
    </div>
  );
};