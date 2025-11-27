import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, RefreshCw, AlertCircle, CheckCircle, Trash2, Edit2, Check, X, Info } from 'lucide-react';

interface WebhookLog {
  id: string;
  platform: string;
  event_type: string;
  customer_email: string;
  customer_name: string | null;
  payment_method: string;
  amount: number;
  transaction_id: string;
  status: string;
  raw_payload: any;
  created_at: string;
  processed_successfully?: boolean | null;
  processed_user_id?: string | null;
  error_message?: string | null;
  product_id?: string | null;
  product_title?: string | null;
}

interface Product {
  code: string;
  title: string;
  description: string;
  amount: number;
}

interface Toast {
  text: string;
  type: 'success' | 'error';
}

const ITEMS_PER_PAGE = 10;

export function WebhooksDashboard() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<Toast | null>(null);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showColumnInfo, setShowColumnInfo] = useState<string | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<string | null>(null);

  const [filter, setFilter] = useState({
    platform: 'all',
    status: 'all',
    period: 'all',
    email: '',
  });

  // Informações sobre cada coluna
  const columnInfo: Record<string, { title: string; description: string; examples: string[] }> = {
    checkbox: {
      title: 'Seleção',
      description: 'Selecione webhooks para reprocessar ou deletar em lotes',
      examples: ['Marque para reprocessar múltiplos', 'Marque para deletar em lotes']
    },
    data: {
      title: 'Data',
      description: 'Data e hora que o webhook foi recebido',
      examples: ['26/11/2025, 14:30', '25/11/2025, 10:15']
    },
    plataforma: {
      title: 'Plataforma',
      description: 'De qual gateway de pagamento o webhook veio',
      examples: ['VEGA (azul)', 'GGCHECKOUT (verde)', 'AMPLOPAY (roxo)']
    },
    email: {
      title: 'Email do Cliente',
      description: 'Email do cliente que fez a compra. Clique no lápis para editar',
      examples: ['user@email.com', 'Editável: clique no ícone ✏️']
    },
    planos: {
      title: 'Planos/Produtos',
      description: 'ID e descrição do produto comprado',
      examples: ['PREMIUM_123', 'Plan Name']
    },
    metodo: {
      title: 'Método de Pagamento',
      description: 'Como o cliente pagou',
      examples: ['PIX', 'CARD', 'BOLETO']
    },
    valor: {
      title: 'Valor',
      description: 'Valor total da transação em reais',
      examples: ['R$ 12,99', 'R$ 299,90', 'R$ 1.999,00']
    },
    status: {
      title: 'Status',
      description: 'Estado atual do webhook',
      examples: ['✅ Sucesso (verde)', '⏳ Pendente (amarelo)', '🔴 Falhado (vermelho)', '📭 Recebido (cinza)']
    },
    acoes: {
      title: 'Ações',
      description: 'Operações disponíveis para este webhook',
      examples: ['👁️ Ver JSON (detalhes completos)', '✏️ Editar email', '🗑️ Deletar webhook', '🔄 Reprocessar (só se falhado)']
    }
  };

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar:', error);
        showToast('Erro ao carregar webhooks', 'error');
        return;
      }

      let filtered = data || [];

      if (filter.platform !== 'all') {
        filtered = filtered.filter(w => w.platform === filter.platform);
      }

      if (filter.status !== 'all') {
        filtered = filtered.filter(w => w.status === filter.status);
      }

      if (filter.period !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(filter.period));
        filtered = filtered.filter(w => new Date(w.created_at) >= daysAgo);
      }

      if (filter.email.trim() !== '') {
        filtered = filtered.filter(w => w.customer_email.toLowerCase().includes(filter.email.toLowerCase()));
      }

      setLogs(filtered);
      setCurrentPage(1);
      setSelectedIds([]);
    } catch (error) {
      console.error('Erro ao carregar webhooks:', error);
      showToast('Erro inesperado', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebhooks();
  }, [filter]);


  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const extractProducts = (rawPayload: any): Product[] => {
    if (!rawPayload || !rawPayload.products) return [];
    return rawPayload.products.map((product: any) => ({
      code: product.code || '',
      title: product.title || 'Produto sem título',
      description: product.description || 'Sem descrição',
      amount: product.amount || 0,
    }));
  };

  const getAllProducts = (log: WebhookLog): Product[] => {
    const productMap = new Map<string, Product>();

    // 1. Adicionar product_id (do DB) se existir
    if (log.product_id) {
      const productId = log.product_id;
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          code: productId,
          title: log.product_title || 'Produto sem título',
          description: log.product_title || 'Sem descrição',
          amount: log.amount || 0,
        });
      }
    }

    // 2. Extrair produtos do raw_payload.products[] (GGCheckout, Amplopay)
    if (log.raw_payload?.products && Array.isArray(log.raw_payload.products)) {
      log.raw_payload.products.forEach((product: any) => {
        const productId = product.id || product.code;
        if (productId && !productMap.has(productId)) {
          productMap.set(productId, {
            code: productId,
            title: product.name || product.title || 'Produto sem título',
            description: product.name || product.title || 'Sem descrição',
            amount: product.price || 0,
          });
        }
      });
    }

    // 3. Extrair produtos do raw_payload.plans[].products[] (VEGA)
    if (log.raw_payload?.plans && Array.isArray(log.raw_payload.plans)) {
      log.raw_payload.plans.forEach((plan: any) => {
        if (plan.products && Array.isArray(plan.products)) {
          plan.products.forEach((product: any) => {
            const productId = product.id || product.code;
            if (productId && !productMap.has(productId)) {
              productMap.set(productId, {
                code: product.code || productId,
                title: product.title || 'Produto sem título',
                description: product.description || product.title || 'Sem descrição',
                amount: product.amount || 0,
              });
            }
          });
        }
      });
    }

    return Array.from(productMap.values());
  };

  const getPaginatedLogs = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return logs.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(logs.length / ITEMS_PER_PAGE);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: JSX.Element }> = {
      received: { color: 'bg-gray-50 text-gray-600', label: 'Recebido', icon: <AlertCircle className="w-3 h-3" /> },
      success: { color: 'bg-green-50 text-green-600', label: 'Sucesso', icon: <CheckCircle className="w-3 h-3" /> },
      pending: { color: 'bg-yellow-50 text-yellow-600', label: 'Pendente', icon: <AlertCircle className="w-3 h-3" /> },
      failed: { color: 'bg-red-50 text-red-600', label: 'Falhado', icon: <AlertCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || statusConfig.received;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      vega: 'bg-blue-100 text-blue-700',
      ggcheckout: 'bg-green-100 text-green-700',
      amplopay: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[platform] || 'bg-gray-100 text-gray-700'}`}>
        {platform.toUpperCase()}
      </span>
    );
  };

  const handleReprocess = async (webhookId: string) => {
    setReprocessing(webhookId);
    try {
      const { data, error } = await supabase.rpc('reprocess_webhook_manual', {
        p_webhook_id: webhookId,
      });

      if (error) {
        showToast(`Erro ao reprocessar: ${error.message}`, 'error');
      } else if (data && data.length > 0) {
        const result = data[0];
        showToast(
          result.success
            ? `✅ Webhook reprocessado! ${result.subscriptions_created} plano(s) ativado(s).`
            : `❌ Falha: ${result.message}`,
          result.success ? 'success' : 'error'
        );
        await loadWebhooks();
      }
    } catch (error) {
      showToast(`Erro inesperado: ${error instanceof Error ? error.message : 'desconhecido'}`, 'error');
    } finally {
      setReprocessing(null);
    }
  };

  const handleEditEmail = async (webhookId: string, newEmail: string) => {
    if (!newEmail || !newEmail.includes('@')) {
      showToast('Email inválido', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('webhook_logs')
        .update({ customer_email: newEmail.toLowerCase() })
        .eq('id', webhookId);

      if (error) throw error;

      showToast('✅ Email atualizado com sucesso', 'success');
      setEditingId(null);
      setEditingEmail('');
      await loadWebhooks();
    } catch (error: any) {
      showToast(`Erro ao atualizar email: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (webhookId: string) => {
    try {
      const { error } = await supabase.from('webhook_logs').delete().eq('id', webhookId);

      if (error) throw error;

      showToast('✅ Webhook deletado com sucesso', 'success');
      setShowDeleteConfirm(null);
      await loadWebhooks();
    } catch (error: any) {
      showToast(`Erro ao deletar: ${error.message}`, 'error');
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = getPaginatedLogs().map(log => log.id);
    setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
  };

  const reprocessInBatch = async () => {
    if (selectedIds.length === 0) {
      showToast('Selecione pelo menos um webhook', 'error');
      return;
    }

    setProcessingBatch(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const id of selectedIds) {
        try {
          const { data, error } = await supabase.rpc('reprocess_webhook_manual', {
            p_webhook_id: id,
          });

          if (error || !data || data.length === 0) {
            failCount++;
          } else {
            const result = data[0];
            if (result.success) {
              successCount++;
            } else {
              failCount++;
            }
          }
        } catch (error) {
          failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      showToast(
        `✅ Batch processado! ${successCount} sucesso, ${failCount} falhado`,
        'success'
      );
      setSelectedIds([]);
      await loadWebhooks();
    } catch (error) {
      showToast(`Erro ao processar lote: ${error instanceof Error ? error.message : 'desconhecido'}`, 'error');
    } finally {
      setProcessingBatch(false);
    }
  };

  const deleteInBatch = async () => {
    if (selectedIds.length === 0) {
      showToast('Selecione pelo menos um webhook', 'error');
      return;
    }

    setDeletingBatch(true);
    try {
      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      showToast(`✅ ${selectedIds.length} webhook(s) deletado(s)`, 'success');
      setSelectedIds([]);
      await loadWebhooks();
    } catch (error: any) {
      showToast(`Erro ao deletar: ${error.message}`, 'error');
    } finally {
      setDeletingBatch(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${
          toastMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="text"
              placeholder="Pesquisar por email..."
              value={filter.email}
              onChange={(e) => setFilter({ ...filter, email: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
            <select
              value={filter.platform}
              onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas</option>
              <option value="vega">Vega Checkout</option>
              <option value="ggcheckout">GGCheckout</option>
              <option value="amplopay">AmploPay</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="received">Recebido</option>
              <option value="success">Sucesso</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falhado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={filter.period}
              onChange={(e) => setFilter({ ...filter, period: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="1">Hoje</option>
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
            </select>
          </div>

          <button
            onClick={() => loadWebhooks()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 mt-6"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📥 Webhooks Recebidos</h2>
          <p className="text-sm text-gray-600 mt-1">Todos os webhooks recebidos das plataformas de pagamento</p>
        </div>
        <div className="bg-blue-100 rounded-lg px-4 py-2">
          <p className="text-sm font-semibold text-blue-900">{logs.length} webhooks</p>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-indigo-900">Ações em Lotes</h3>
              <p className="text-sm text-indigo-700 mt-1">{selectedIds.length} webhook(s) selecionado(s)</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reprocessInBatch}
                disabled={processingBatch}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {processingBatch ? '⏳ Reprocessando...' : `🔄 Reprocessar ${selectedIds.length}`}
              </button>
              <button
                onClick={deleteInBatch}
                disabled={deletingBatch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {deletingBatch ? '⏳ Deletando...' : `🗑️ Deletar ${selectedIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando webhooks...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum webhook encontrado</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === getPaginatedLogs().length && getPaginatedLogs().length > 0}
                          onChange={selectAll}
                          className="rounded"
                        />
                        <div className="relative group">
                          <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          {showColumnInfo === 'checkbox' && (
                            <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                              <p className="font-semibold mb-1">{columnInfo.checkbox.title}</p>
                              <p className="text-gray-200 mb-2">{columnInfo.checkbox.description}</p>
                              <p className="text-gray-300 text-xs">
                                {columnInfo.checkbox.examples.join(' • ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Data</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'data' ? null : 'data')} />
                        {showColumnInfo === 'data' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.data.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.data.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.data.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Plataforma</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'plataforma' ? null : 'plataforma')} />
                        {showColumnInfo === 'plataforma' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.plataforma.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.plataforma.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.plataforma.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Email</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'email' ? null : 'email')} />
                        {showColumnInfo === 'email' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.email.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.email.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.email.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Planos</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'planos' ? null : 'planos')} />
                        {showColumnInfo === 'planos' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.planos.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.planos.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.planos.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Método</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'metodo' ? null : 'metodo')} />
                        {showColumnInfo === 'metodo' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.metodo.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.metodo.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.metodo.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Valor</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'valor' ? null : 'valor')} />
                        {showColumnInfo === 'valor' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.valor.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.valor.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.valor.examples.join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Status</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'status' ? null : 'status')} />
                        {showColumnInfo === 'status' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-48 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.status.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.status.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.status.examples.map((ex, i) => (
                                <div key={i}>{ex}</div>
                              ))}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <div className="flex items-center gap-2 relative group">
                        <span>Ações</span>
                        <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" onClick={() => setShowColumnInfo(showColumnInfo === 'acoes' ? null : 'acoes')} />
                        {showColumnInfo === 'acoes' && (
                          <div className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 w-56 shadow-lg">
                            <p className="font-semibold mb-1">{columnInfo.acoes.title}</p>
                            <p className="text-gray-200 mb-2">{columnInfo.acoes.description}</p>
                            <p className="text-gray-300 text-xs">
                              {columnInfo.acoes.examples.map((ex, i) => (
                                <div key={i}>{ex}</div>
                              ))}
                            </p>
                          </div>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getPaginatedLogs().map((log) => (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(log.id)}
                          onChange={() => toggleSelect(log.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {getPlatformBadge(log.platform)}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {editingId === log.id ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="email"
                              value={editingEmail}
                              onChange={(e) => setEditingEmail(e.target.value)}
                              className="px-2 py-1 border rounded text-xs w-48"
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditEmail(log.id, editingEmail)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-900">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <div>
                              <div className="font-medium text-gray-900">{log.customer_email}</div>
                              <div className="text-xs text-gray-500">{log.customer_name || '-'}</div>
                            </div>
                            <button
                              onClick={() => {
                                setEditingId(log.id);
                                setEditingEmail(log.customer_email);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Editar email"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {(() => {
                          const allProducts = getAllProducts(log);
                          if (allProducts.length === 0) {
                            return <span className="text-gray-400 text-xs">Sem produto</span>;
                          }

                          const firstProduct = allProducts[0];
                          const hasMore = allProducts.length > 1;

                          return (
                            <div className="flex items-start gap-2">
                              <div className="space-y-1">
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-300">
                                  📦 {firstProduct.code}
                                </span>
                                {firstProduct.title && (
                                  <div className="text-xs text-gray-600 line-clamp-2 max-w-xs">
                                    {firstProduct.title}
                                  </div>
                                )}
                              </div>
                              {hasMore && (
                                <button
                                  onClick={() => setExpandedProducts(expandedProducts === log.id ? null : log.id)}
                                  className="mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-300 hover:bg-blue-200 transition-colors whitespace-nowrap"
                                >
                                  +{allProducts.length - 1}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.payment_method?.toUpperCase() || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(log.amount / 100)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver JSON"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(log.status === 'pending' || log.status === 'failed') && (
                            <button
                              onClick={() => handleReprocess(log.id)}
                              disabled={reprocessing === log.id}
                              className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                              title="Reprocessar"
                            >
                              {reprocessing === log.id ? <div className="animate-spin">⟳</div> : <RefreshCw className="w-4 h-4" />}
                            </button>
                          )}

                          <button
                            onClick={() => setShowDeleteConfirm(log.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                      {expandedProducts === log.id && getAllProducts(log).length > 1 && (
                        <tr className="bg-blue-50 border-b border-blue-200">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold text-blue-900">Todos os Planos/Produtos ({getAllProducts(log).length}):</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {getAllProducts(log).map((product, idx) => (
                                  <div key={idx} className="px-4 py-3 bg-white border-2 border-blue-300 rounded-lg">
                                    <p className="text-xs text-blue-600 font-semibold mb-1">Produto {idx + 1}</p>
                                    <p className="text-sm font-bold text-blue-900 mb-1">📦 {product.code}</p>
                                    {product.title && (
                                      <p className="text-xs text-gray-600 mb-1">{product.title}</p>
                                    )}
                                    <p className="text-xs text-green-700 font-semibold">
                                      R$ {(product.amount / 100).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, logs.length)} de {logs.length} webhook{logs.length !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  ← Anterior
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page ? 'bg-indigo-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                  disabled={currentPage === getTotalPages()}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  Próximo →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal: Ver JSON */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Detalhes do Webhook</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver Produto */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Detalhes do Produto</h3>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Código</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Título</p>
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Descrição</p>
                  <p className="text-sm text-gray-700">{selectedProduct.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Valor</p>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedProduct.amount / 100)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Deleção */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Deletar Webhook?</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Tem certeza que deseja deletar este webhook? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setDeleting(showDeleteConfirm);
                    handleDelete(showDeleteConfirm);
                  }}
                  disabled={deleting === showDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {deleting === showDeleteConfirm ? '⏳ Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
