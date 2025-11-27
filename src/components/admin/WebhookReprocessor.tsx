import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RotateCcw, AlertCircle, CheckCircle, Clock, Trash2, Edit2, X } from 'lucide-react';

interface WebhookLog {
  id: string;
  customer_email: string;
  status: 'received' | 'pending' | 'success' | 'failed' | 'error' | 'expired';
  product_ids: string[];
  transaction_id: string;
  created_at: string;
  processed_at: string;
  reprocess_count: number;
  last_reprocess_at: string;
}

export default function WebhookReprocessor() {
  const [webhooks, setWebhooks] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .in('status', ['pending', 'failed', 'error'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
      setToast({ message: 'Erro ao carregar webhooks', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (webhook: WebhookLog) => {
    try {
      setReprocessing(webhook.id);

      const { data, error } = await supabase.rpc('process_webhook_payment', {
        p_webhook_id: webhook.id,
        p_customer_email: webhook.customer_email,
        p_product_ids: webhook.product_ids,
        p_transaction_id: webhook.transaction_id,
      });

      if (error) throw error;

      if (data && data[0]) {
        setToast({
          message: `✅ ${data[0].message}`,
          type: 'success',
        });
      } else {
        setToast({
          message: 'Webhook reprocessado mas nenhum plano foi ativado',
          type: 'error',
        });
      }

      await fetchWebhooks();
    } catch (error: any) {
      console.error('Erro ao reprocessar webhook:', error);
      setToast({
        message: `Erro: ${error.message}`,
        type: 'error',
      });
    } finally {
      setReprocessing(null);
    }
  };

  const handleEditEmail = async (webhook: WebhookLog) => {
    if (!newEmail || !newEmail.includes('@')) {
      setToast({ message: 'Email inválido', type: 'error' });
      return;
    }

    try {
      const { error } = await supabase
        .from('webhook_logs')
        .update({ customer_email: newEmail.toLowerCase() })
        .eq('id', webhook.id);

      if (error) throw error;

      setToast({ message: '✅ Email atualizado com sucesso', type: 'success' });
      setEditingEmail(null);
      setNewEmail('');
      await fetchWebhooks();
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      setToast({ message: `Erro: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este webhook?')) return;

    try {
      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setToast({ message: '✅ Webhook deletado com sucesso', type: 'success' });
      await fetchWebhooks();
    } catch (error: any) {
      console.error('Erro ao deletar webhook:', error);
      setToast({ message: `Erro: ${error.message}`, type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reprocessamento de Webhooks</h2>
        <button
          onClick={fetchWebhooks}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <RotateCcw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando webhooks...</p>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum webhook pendente para reprocessar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(webhook.status)}`}>
                      {getStatusIcon(webhook.status)}
                      {webhook.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {webhook.id.substring(0, 8)}...
                    </span>
                  </div>

                  {editingEmail === webhook.id ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Novo email"
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={() => handleEditEmail(webhook)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setEditingEmail(null);
                          setNewEmail('');
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2">
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {webhook.customer_email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Planos:</span> {webhook.product_ids?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tentativas: {webhook.reprocess_count} | Criado: {new Date(webhook.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {webhook.status !== 'success' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingEmail(webhook.id);
                          setNewEmail(webhook.customer_email);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar email"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReprocess(webhook)}
                        disabled={reprocessing === webhook.id}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-4 h-4 ${reprocessing === webhook.id ? 'animate-spin' : ''}`} />
                        {reprocessing === webhook.id ? 'Processando...' : 'Reprocessar'}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
