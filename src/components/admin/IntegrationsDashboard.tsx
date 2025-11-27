import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, AlertCircle, RefreshCw, Copy } from 'lucide-react';

interface Integration {
  id: string;
  platform: string;
  name: string;
  is_active: boolean;
  webhook_url: string;
  last_webhook_at: string | null;
  total_webhooks: number;
  successful_webhooks: number;
  failed_webhooks: number;
  success_rate: number;
}

export function IntegrationsDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('integrations_status')
        .select('*')
        .order('platform', { ascending: true });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadIntegrations();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  const formatDate = (date: string | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Carregando integrações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Status das Integrações</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              showTutorial
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
            }`}
          >
            📖
            {showTutorial ? 'Ocultar Tutorial' : 'Como Adicionar Gateway?'}
          </button>
          <button
            onClick={loadIntegrations}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {showTutorial && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border-l-4 border-blue-600">
          <div className="flex items-center gap-2 mb-6">
            <div className="text-2xl">📖</div>
            <h3 className="text-xl font-bold text-gray-900">Guia: Adicionar Novo Gateway de Pagamento</h3>
          </div>

          <div className="space-y-6 text-sm">
            {/* Passo 1 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-bold text-gray-900 mb-2">1️⃣ Criar Edge Function</h4>
              <p className="text-gray-600 mb-2">Crie uma nova Edge Function em <code className="bg-gray-100 px-2 py-1 rounded">supabase/functions/webhook-NOVO/index.ts</code></p>
              <p className="text-xs text-gray-500">Exemplo: webhook-stripe, webhook-hotmart, etc</p>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
              <h4 className="font-bold text-gray-900 mb-3">2️⃣ Entender Estrutura JSON do Gateway</h4>
              <p className="text-gray-600 mb-3">Cada gateway envia dados diferentes. Estude o JSON de exemplo:</p>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="font-semibold text-xs text-gray-700 mb-1">GGCheckout (Seu JSON):</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 border border-gray-300">
{`{
  "event": "pix.paid",
  "customer": {
    "name": "Cliente",
    "email": "cliente@email"
  },
  "payment": {
    "id": "tx_123",
    "method": "pix",
    "amount": 100
  },
  "products": [{
    "id": "prod-123",
    "title": "Produto"
  }]
}`}
                  </pre>
                </div>

                <div>
                  <p className="font-semibold text-xs text-gray-700 mb-1">Vega (Seu JSON):</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40 border border-gray-300">
{`{
  "status": "approved",
  "method": "pix",
  "customer": {
    "name": "Cliente",
    "email": "cliente@email"
  },
  "transaction_token": "VCP123",
  "total_price": 100,
  "products": [{
    "code": "3MGN9O",
    "title": "Produto"
  }]
}`}
                  </pre>
                </div>
              </div>

              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                ⚠️ <strong>Importante:</strong> Identifique no JSON do novo gateway:
                <br/>• <code className="bg-white px-1 rounded">email</code> (do cliente)
                <br/>• <code className="bg-white px-1 rounded">amount</code> ou <code className="bg-white px-1 rounded">price</code> (valor em centavos!)
                <br/>• <code className="bg-white px-1 rounded">status</code> ou <code className="bg-white px-1 rounded">event</code> (confirmação de pagamento)
                <br/>• <code className="bg-white px-1 rounded">product_id</code> (qual plano foi comprado)
              </p>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-gray-900 mb-2">3️⃣ Extrair Dados e Inserir em webhook_logs</h4>
              <p className="text-gray-600 mb-2">Mapear os dados do JSON para as colunas da tabela:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto border border-gray-300">
{`await supabase.from('webhook_logs').insert({
  platform: 'NOVO',        // Nome do novo gateway
  customer_email: data.customer.email,
  payment_id: data.transaction_id, // ID único do pagamento
  amount: data.total_price,        // Em centavos!
  payment_method: data.method,     // pix, card, boleto, etc
  status: 'received',              // Sempre começa como received
  raw_payload: data,               // Guardar JSON completo
  created_at: new Date().toISOString()
})`}
              </pre>
            </div>

            {/* Passo 4 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="font-bold text-gray-900 mb-2">4️⃣ Processar o Pagamento</h4>
              <p className="text-gray-600 text-xs">Chamar a RPC <code className="bg-gray-100 px-1 rounded">process_webhook_payment()</code> para:</p>
              <ul className="list-disc list-inside text-xs text-gray-600 mt-1 space-y-1">
                <li>Criar/atualizar <code className="bg-gray-100 px-1 rounded">pending_plans</code></li>
                <li>Ativar plano se usuário já existe</li>
                <li>Atualizar status do webhook</li>
              </ul>
            </div>

            {/* Passo 5 */}
            <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-gray-900 mb-2">5️⃣ Registrar URL no Gateway</h4>
              <p className="text-gray-600 mb-2">Após deployed, configure no painel do novo gateway:</p>
              <code className="bg-gray-100 px-3 py-2 rounded block text-xs border border-gray-300">
                https://lkhfbhvamnqgcqlrriaw.supabase.co/functions/v1/webhook-NOVO
              </code>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-800">
              <strong>✅ Checklist antes de ir para produção:</strong>
              <br/>☐ JSON parseado corretamente
              <br/>☐ Amount em centavos (dividir por 100 se necessário)
              <br/>☐ Tratamento de erro implementado
              <br/>☐ Teste com payload real do gateway
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4"
            style={{
              borderColor: integration.is_active ? '#10b981' : '#ef4444',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{integration.platform.toUpperCase()}</p>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() =>
                    integration.is_active
                      ? null
                      : alert('Integração desativada. Ative para usar.')
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    integration.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {integration.is_active ? '✅ Ativo' : '❌ Inativo'}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total de webhooks:</span>
                <span className="font-bold text-gray-900">{integration.total_webhooks}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Sucesso:</span>
                <span className="font-bold text-green-600">{integration.successful_webhooks}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-600">Falhas:</span>
                <span className="font-bold text-red-600">{integration.failed_webhooks}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Taxa de sucesso:</span>
                <span className="font-bold text-indigo-600">{integration.success_rate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-600 mb-2 font-medium">URL do Webhook:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-gray-900 break-all flex-1">
                  {integration.webhook_url}
                </code>
                <button
                  onClick={() => copyToClipboard(integration.webhook_url, integration.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copiar URL"
                >
                  <Copy
                    className="w-4 h-4"
                    style={{
                      color: copiedId === integration.id ? '#10b981' : '#6b7280',
                    }}
                  />
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Último webhook: {formatDate(integration.last_webhook_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
