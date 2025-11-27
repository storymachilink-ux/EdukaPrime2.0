import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, RefreshCw, Filter, Download, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VegaWebhookLog {
  id: string;
  created_at: string;
  source_key: string;
  event_type: string;
  webhook_format: string;
  processing_status: string;
  processing_message: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_document_masked: string | null;
  customer_phone_masked: string | null;
  transaction_token: string | null;
  order_id: number | null;
  payment_method: string | null;
  payment_status: string | null;
  amount_cents: number | null;
  plan_sku: string | null;
  plan_identified: string | null;
  plan_level: number | null;
  is_addon: boolean;
  user_id: string | null;
  action_taken: string | null;
  error_detail: string | null;
  raw_payload: any;
}

type TabType = 'webhooks' | 'metricas' | 'assinaturas';

export default function Vendas() {
  const [activeTab, setActiveTab] = useState<TabType>('webhooks');
  const [webhooks, setWebhooks] = useState<VegaWebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    plan: 'all',
    period: '30',
  });
  const [selectedWebhook, setSelectedWebhook] = useState<VegaWebhookLog | null>(null);
  const [showPayloadModal, setShowPayloadModal] = useState(false);

  // Carregar webhooks
  useEffect(() => {
    if (activeTab === 'webhooks') {
      loadWebhooks();
    }
  }, [activeTab, filter]);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vega_webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Filtro de status
      if (filter.status !== 'all') {
        query = query.eq('processing_status', filter.status);
      }

      // Filtro de plano
      if (filter.plan !== 'all') {
        query = query.eq('plan_identified', filter.plan);
      }

      // Filtro de período
      if (filter.period !== 'all') {
        const days = parseInt(filter.period);
        const date = new Date();
        date.setDate(date.setDate() - days);
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (webhook: VegaWebhookLog) => {
    if (!confirm(`Reprocessar webhook ${webhook.source_key}?\n\nIsso vai tentar ativar/renovar o plano novamente.`)) {
      return;
    }

    try {
      // Chamar Edge Function com o raw_payload original
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vega-webhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(webhook.raw_payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert('✅ Webhook reprocessado com sucesso!\n\n' + JSON.stringify(result, null, 2));
        loadWebhooks(); // Recarregar lista
      } else {
        alert('❌ Erro ao reprocessar:\n\n' + JSON.stringify(result, null, 2));
      }
    } catch (error: any) {
      alert('❌ Erro ao reprocessar webhook:\n\n' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      processed: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Processado' },
      skipped_unpaid: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Aguardando Pgto' },
      skipped_addon: { icon: AlertCircle, color: 'text-blue-600 bg-blue-50', label: 'Add-on' },
      duplicate: { icon: AlertCircle, color: 'text-gray-600 bg-gray-50', label: 'Duplicado' },
      error: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Erro' },
    };

    const config = configs[status as keyof typeof configs] || configs.error;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPlanBadge = (plan: string | null) => {
    if (!plan) return <span className="text-gray-400">-</span>;

    const colors = {
      essencial: 'bg-amber-100 text-amber-800',
      evoluir: 'bg-blue-100 text-blue-800',
      prime: 'bg-purple-100 text-purple-800',
      addon: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const formatCurrency = (cents: number | null) => {
    if (cents === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendas & Webhooks</h1>
          <p className="text-gray-600">Análise de vendas, métricas financeiras e logs de webhooks</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('webhooks')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'webhooks'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔔 Webhooks
              </button>
              <button
                onClick={() => setActiveTab('metricas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'metricas'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Métricas
              </button>
              <button
                onClick={() => setActiveTab('assinaturas')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'assinaturas'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Assinaturas
              </button>
            </nav>
          </div>

          {/* Conteúdo da aba Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="p-6">
              {/* Filtros */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="processed">Processado</option>
                    <option value="skipped_unpaid">Aguardando Pagamento</option>
                    <option value="skipped_addon">Add-on</option>
                    <option value="duplicate">Duplicado</option>
                    <option value="error">Erro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                  <select
                    value={filter.plan}
                    onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="essencial">Essencial</option>
                    <option value="evoluir">Evoluir</option>
                    <option value="prime">Prime</option>
                    <option value="addon">Add-on</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select
                    value={filter.period}
                    onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="1">Hoje</option>
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="60">60 dias</option>
                  </select>
                </div>

                <button
                  onClick={loadWebhooks}
                  className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Atualizar
                </button>
              </div>

              {/* Tabela de Webhooks */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Carregando webhooks...</p>
                </div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum webhook encontrado</p>
                  <p className="text-sm text-gray-400 mt-2">Faça um pagamento teste na Vega para ver os webhooks aqui</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {webhooks.map((webhook) => (
                        <tr key={webhook.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(webhook.created_at)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div>{webhook.customer_email || '-'}</div>
                            <div className="text-xs text-gray-500">{webhook.customer_name || ''}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getPlanBadge(webhook.plan_identified)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {webhook.payment_method?.toUpperCase() || '-'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(webhook.amount_cents)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(webhook.processing_status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedWebhook(webhook);
                                  setShowPayloadModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                title="Ver payload completo"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {(webhook.processing_status === 'error' || webhook.processing_status === 'skipped_unpaid') && (
                                <button
                                  onClick={() => handleReprocess(webhook)}
                                  className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                  title="Reprocessar webhook"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Total de webhooks */}
              {webhooks.length > 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Mostrando {webhooks.length} webhook{webhooks.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Conteúdo da aba Métricas */}
          {activeTab === 'metricas' && (
            <div className="p-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Métricas financeiras em desenvolvimento</p>
                <p className="text-sm text-gray-400 mt-2">Em breve: faturamento por plano, conversão, ticket médio, etc.</p>
              </div>
            </div>
          )}

          {/* Conteúdo da aba Assinaturas */}
          {activeTab === 'assinaturas' && (
            <div className="p-6">
              <div className="text-center py-12">
                <p className="text-gray-500">Análise de assinaturas em desenvolvimento</p>
                <p className="text-sm text-gray-400 mt-2">Em breve: ativos por plano, expiram em 7 dias, renovações, etc.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Payload */}
      {showPayloadModal && selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detalhes do Webhook</h3>
                <button
                  onClick={() => setShowPayloadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Informações Gerais</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><span className="font-medium">Source Key:</span> {selectedWebhook.source_key}</div>
                    <div><span className="font-medium">Event Type:</span> {selectedWebhook.event_type}</div>
                    <div><span className="font-medium">Formato:</span> {selectedWebhook.webhook_format}</div>
                    <div><span className="font-medium">Mensagem:</span> {selectedWebhook.processing_message}</div>
                    {selectedWebhook.error_detail && (
                      <div className="text-red-600"><span className="font-medium">Erro:</span> {selectedWebhook.error_detail}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Raw Payload (JSON)</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(selectedWebhook.raw_payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
