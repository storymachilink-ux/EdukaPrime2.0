import React, { useState } from 'react';
import { Edit, Eye, EyeOff, Save, X, ExternalLink, Settings } from 'lucide-react';
import { useHybridActivities } from '../../hooks/useHybridActivities';
import { BASE_ACTIVITIES } from '../../data/baseActivities';

export const BaseActivitySettings: React.FC = () => {
  const {
    baseActivities,
    loading,
    error,
    updateBaseActivityUrl,
    toggleBaseActivityStatus
  } = useHybridActivities();

  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditStart = (activityId: string, currentUrl: string) => {
    setEditingActivity(activityId);
    setEditUrl(currentUrl);
  };

  const handleSave = async (activityId: string) => {
    if (!editUrl.trim()) {
      alert('URL não pode estar vazia');
      return;
    }

    setSaving(true);
    try {
      const success = await updateBaseActivityUrl(activityId, editUrl.trim());
      if (success) {
        setEditingActivity(null);
        setEditUrl('');
      } else {
        alert('Erro ao salvar URL');
      }
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingActivity(null);
    setEditUrl('');
  };

  const handleToggleStatus = async (activityId: string, currentStatus: boolean) => {
    setSaving(true);
    try {
      const success = await toggleBaseActivityStatus(activityId, !currentStatus);
      if (!success) {
        alert('Erro ao alterar status da atividade');
      }
    } catch (err) {
      alert('Erro ao alterar status: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Get full base activity info including inactive ones
  const getAllBaseActivities = () => {
    return BASE_ACTIVITIES.map(baseActivity => {
      const hybridActivity = baseActivities.find(h => h.id === baseActivity.id);
      return {
        ...baseActivity,
        current_drive_url: hybridActivity?.drive_url || baseActivity.default_drive_url,
        is_active: hybridActivity?.is_active ?? true,
        has_custom_settings: !!hybridActivity
      };
    }).sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#476178]">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium mb-2">Erro ao carregar configurações</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const allBaseActivities = getAllBaseActivities();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-[#033258]">
            Configurações das Atividades Base
          </h2>
        </div>
        <p className="text-[#476178] text-sm">
          Gerencie os links do Google Drive das 7 atividades principais do sistema.
          Essas atividades são fixas no código, mas seus links podem ser editados aqui.
        </p>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {allBaseActivities.map((activity) => (
          <div
            key={activity.id}
            className={`bg-white border rounded-2xl p-6 transition-all duration-200 ${
              activity.is_active
                ? 'border-[#FFE3A0] shadow-sm hover:shadow-md'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`font-semibold text-lg ${
                    activity.is_active ? 'text-[#033258]' : 'text-gray-500'
                  }`}>
                    {activity.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-lg ${
                    activity.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {activity.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  {activity.has_custom_settings && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg">
                      Personalizado
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-[#476178] mb-3">
                  <div>
                    <span className="font-medium">Faixa etária:</span> {activity.age_range}
                  </div>
                  <div>
                    <span className="font-medium">Categoria:</span> {activity.category}
                  </div>
                  <div>
                    <span className="font-medium">Planos:</span> {
                      activity.available_for_plans.map(p =>
                        p === 1 ? 'Essencial' : p === 2 ? 'Evoluir' : 'Prime'
                      ).join(', ')
                    }
                  </div>
                </div>

                <p className="text-sm text-[#476178] mb-4">{activity.description}</p>

                {/* URL Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#033258]">
                    Link do Google Drive:
                  </label>

                  {editingActivity === activity.id ? (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[#FFE3A0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-sm"
                        placeholder="https://drive.google.com/..."
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleSave(activity.id)}
                        disabled={saving}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 break-all">
                        {activity.current_drive_url}
                      </div>
                      <button
                        onClick={() => window.open(activity.current_drive_url, '_blank')}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
                        title="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Abrir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {editingActivity !== activity.id && (
                  <button
                    onClick={() => handleEditStart(activity.id, activity.current_drive_url)}
                    className="p-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors flex items-center justify-center"
                    title="Editar URL"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleToggleStatus(activity.id, activity.is_active)}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 ${
                    activity.is_active
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  title={activity.is_active ? 'Desativar atividade' : 'Ativar atividade'}
                >
                  {activity.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Informações Importantes:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Atividades Base:</strong> Estrutura fixa no código, apenas os links são editáveis</li>
          <li>• <strong>Status Inativo:</strong> A atividade não aparece para os usuários</li>
          <li>• <strong>Links Padrão:</strong> Se não configurado, usa o link padrão do código</li>
          <li>• <strong>Planos:</strong> Controle de acesso baseado no plano do usuário (não editável aqui)</li>
        </ul>
      </div>
    </div>
  );
};