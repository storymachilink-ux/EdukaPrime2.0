import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PostItTitle } from '../../components/ui/PostItTitle';
import { supabase } from '../../lib/supabase';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Eye, Search, Filter, Calendar } from 'lucide-react';

interface WebhookLog {
  id: string;
  created_at: string;
  event_type: string;
  status: string;
  message: string | null;
  customer_email: string;
  customer_name: string | null;
  product_id: string;
  plan_activated: number | null;
  plan_name: string | null;
  payment_method: string;
  amount: number;
  expiration_date: string | null;
  raw_payload: any;
}

export default function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<string>('7'); // dias

  useEffect(() => {
    // Carregar apenas uma vez ao abrir a página
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('webhook_logs')
        .select('*, product_id, product_title')
        .order('created_at', { ascending: false });

      // Filtro por status
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Filtro por data
      if (filterDateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filterDateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    filterEmail === '' || log.customer_email.toLowerCase().includes(filterEmail.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'ignored':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      success: 'bg-green-100 text-green-700 border-green-300',
      error: 'bg-red-100 text-red-700 border-red-300',
      ignored: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      pending: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return badges[status] || badges.pending;
  };

  // ✨ REMOVIDO: extractProducts agora usa product_id do banco de dados

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    ignored: logs.filter(l => l.status === 'ignored').length,
    totalAmount: logs
      .filter(l => l.status === 'success')
      .reduce((sum, l) => sum + l.amount, 0),
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-[#F8FBFF] min-h-screen">
        <PostItTitle
          title="📊 Logs de Webhooks"
          description="Monitore todos os webhooks recebidos do checkout"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">Total de Webhooks</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">Sucesso</p>
            <p className="text-3xl font-bold text-green-600">{stats.success}</p>
          </div>

          <div className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">Erros</p>
            <p className="text-3xl font-bold text-red-600">{stats.error}</p>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">Ignorados</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.ignored}</p>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-1">Faturamento</p>
            <p className="text-2xl font-bold text-purple-600">
              R$ {stats.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border-2 border-[#0F2741] rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca por Email */}
            <div>
              <label className="block text-sm font-semibold text-[#0F2741] mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Buscar por Email
              </label>
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741]"
              />
            </div>

            {/* Filtro Status */}
            <div>
              <label className="block text-sm font-semibold text-[#0F2741] mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741]"
              >
                <option value="all">Todos</option>
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
                <option value="ignored">Ignorado</option>
              </select>
            </div>

            {/* Filtro Data */}
            <div>
              <label className="block text-sm font-semibold text-[#0F2741] mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F2741]"
              >
                <option value="1">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>

            {/* Botão Atualizar */}
            <div>
              <label className="block text-sm font-semibold text-[#0F2741] mb-2">
                &nbsp;
              </label>
              <button
                onClick={loadLogs}
                disabled={loading}
                className="w-full bg-[#0F2741] text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#1a3a5c] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="bg-white border-2 border-[#0F2741] rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F2741] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Produtos</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Valor</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Carregando logs...
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-600">
                      Nenhum log encontrado
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-semibold">{log.customer_name || '-'}</p>
                          <p className="text-gray-600 text-xs">{log.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.product_id ? (
                          <div className="space-y-1">
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-300">
                              📦 {log.product_id}
                            </span>
                            {log.product_title && (
                              <div className="text-xs text-gray-600 truncate max-w-xs">
                                {log.product_title}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sem produto</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        R$ {typeof log.amount === 'number' ? log.amount.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#0F2741]">Detalhes do Webhook</h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Data/Hora</p>
                    <p className="text-gray-900">{new Date(selectedLog.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <span className={`inline-block px-2 py-1 rounded text-sm font-semibold border ${getStatusBadge(selectedLog.status)}`}>
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Evento</p>
                    <p className="text-gray-900">{selectedLog.event_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Cliente</p>
                    <p className="text-gray-900">{selectedLog.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Plano Ativado</p>
                    <p className="text-gray-900">{selectedLog.plan_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Valor</p>
                    <p className="text-gray-900 font-bold">R$ {typeof selectedLog.amount === 'number' ? selectedLog.amount.toFixed(2) : '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Método de Pagamento</p>
                    <p className="text-gray-900">{selectedLog.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Data de Expiração</p>
                    <p className="text-gray-900">
                      {selectedLog.expiration_date
                        ? new Date(selectedLog.expiration_date).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedLog.message && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-1">Mensagem</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded border">{selectedLog.message}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-2">Payload Completo (JSON)</p>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                    {JSON.stringify(selectedLog.raw_payload, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full bg-[#0F2741] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1a3a5c]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
