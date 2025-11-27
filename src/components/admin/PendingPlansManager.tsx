import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { CheckCircle, Clock, XCircle, RefreshCw, Edit2, Check, X } from 'lucide-react'

interface PendingPlan {
  id: string
  email: string
  plan_id: number
  status: 'pending' | 'activated' | 'expired'
  start_date: string
  end_date: string | null
  payment_id: string | null
  amount_paid: number | null
  created_at: string
  platform: string
  product_id_gateway?: string
  raw_payload?: any
}

interface ProductInfo {
  code?: string
  title?: string
  description?: string
  price?: number
}

interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}

export const PendingPlansManager: React.FC = () => {
  const [pendingPlans, setPendingPlans] = useState<PendingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    activated: 0,
    expired: 0
  })

  useEffect(() => {
    loadPendingPlans()
  }, [])

  const extractProductInfo = (plan: PendingPlan): ProductInfo => {
    const info: ProductInfo = {}

    // Se temos product_id_gateway, mostrar
    if (plan.product_id_gateway) {
      info.code = plan.product_id_gateway
    }

    // Se temos raw_payload do webhook, extrair informações
    if (plan.raw_payload) {
      const payload = plan.raw_payload

      // VEGA: procurar em items ou product
      if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
        const item = payload.items[0]
        info.title = item.name || item.title || item.description
        info.code = info.code || item.id || item.code
      }

      // Qualquer plataforma: procurar product_name, product_title
      if (payload.product_name) info.title = payload.product_name
      if (payload.product_title) info.title = payload.product_title
      if (payload.product_description) info.description = payload.product_description

      // Preço: procurar em várias formas
      if (payload.unit_amount) info.price = payload.unit_amount / 100 // centavos
      if (payload.price) info.price = payload.price
    }

    return info
  }

  const loadPendingPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pending_plans')
        .select('*, webhook_logs(raw_payload)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar pending_plans:', error)
        showToast('Erro ao carregar planos pendentes', 'error')
        return
      }

      let plansWithPayloads = (data || []) as any[]

      // Buscar webhooks para enriquecer com informações de produtos
      const plansWithWebhookId = plansWithPayloads.filter(p => p.webhook_id)
      if (plansWithWebhookId.length > 0) {
        const webhookIds = plansWithWebhookId.map(p => p.webhook_id).filter(Boolean)
        const { data: webhooks } = await supabase
          .from('webhook_logs')
          .select('id, raw_payload')
          .in('id', webhookIds)

        const webhookMap = new Map(webhooks?.map(w => [w.id, w.raw_payload]) || [])
        plansWithPayloads = plansWithPayloads.map(p => ({
          ...p,
          raw_payload: webhookMap.get(p.webhook_id)
        }))
      }

      setPendingPlans(plansWithPayloads)
      setSelectedIds([])

      // Calcular estatísticas
      const plans = data || []
      setStats({
        total: plans.length,
        pending: plans.filter(p => p.status === 'pending').length,
        activated: plans.filter(p => p.status === 'activated').length,
        expired: plans.filter(p => p.status === 'expired').length
      })
    } catch (error) {
      console.error('Erro ao carregar pending_plans:', error)
      showToast('Erro inesperado ao carregar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    const pendingIds = pendingPlans
      .filter(p => p.status === 'pending')
      .map(p => p.id)
    setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds)
  }

  const handleEditEmail = async (planId: string, newEmail: string) => {
    if (!newEmail || !newEmail.includes('@')) {
      showToast('Email inválido', 'error')
      return
    }

    try {
      const { error } = await supabase
        .from('pending_plans')
        .update({ email: newEmail.toLowerCase() })
        .eq('id', planId)

      if (error) throw error

      showToast('✅ Email atualizado com sucesso', 'success')
      setEditingId(null)
      setEditingEmail('')
      await loadPendingPlans()
    } catch (error: any) {
      showToast(`Erro ao atualizar email: ${error.message}`, 'error')
    }
  }

  const processInBatches = async (batchSize: number = 20) => {
    if (selectedIds.length === 0) {
      showToast('Selecione pelo menos um plano', 'error')
      return
    }

    setProcessing(true)
    let totalActivated = 0
    let totalFailed = 0

    try {
      // Processar em lotes
      for (let i = 0; i < selectedIds.length; i += batchSize) {
        const batch = selectedIds.slice(i, i + batchSize)

        const { data, error } = await supabase.rpc('activate_pending_plans_batch', {
          p_pending_plan_ids: batch
        })

        if (error) {
          console.error('Erro ao processar lote:', error)
          totalFailed += batch.length
        } else if (data && data[0]) {
          totalActivated += data[0].activated_count
          totalFailed += data[0].failed_count
        }

        // Pequena pausa entre lotes
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      showToast(
        `✅ Lote processado! Ativados: ${totalActivated}, Falhados: ${totalFailed}`,
        'success'
      )
      await loadPendingPlans()
    } catch (error: any) {
      showToast(`Erro ao processar lote: ${error.message}`, 'error')
    } finally {
      setProcessing(false)
    }
  }

  const manuallyActivatePlan = async (planId: string, email: string) => {
    try {
      // Buscar usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (userError || !userData) {
        showToast('❌ Usuário não encontrado com este email', 'error')
        return
      }

      // Chamar função para ativar
      const { data, error } = await supabase.rpc('activate_pending_plans', {
        user_id: userData.id,
        user_email: email.toLowerCase()
      })

      if (error) {
        showToast(`❌ Erro ao ativar: ${error.message}`, 'error')
        return
      }

      showToast('✅ Plano ativado com sucesso!', 'success')
      await loadPendingPlans()
    } catch (error: any) {
      showToast(`❌ Erro: ${error.message}`, 'error')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activated':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activated':
        return 'Ativado'
      case 'pending':
        return 'Pendente'
      case 'expired':
        return 'Expirado'
      default:
        return status
    }
  }

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>
  }

  const pendingPlansCount = pendingPlans.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">⏳ Planos Pendentes</h2>
          <p className="text-sm text-gray-600 mt-1">Pagamentos aguardando ativação de usuários</p>
        </div>
        <Button onClick={loadPendingPlans} variant="outline" disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Recarregar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="text-sm text-yellow-700">Pendentes</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="text-sm text-green-700">Ativados</div>
          <div className="text-2xl font-bold text-green-700">{stats.activated}</div>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-sm text-red-700">Expirados</div>
          <div className="text-2xl font-bold text-red-700">{stats.expired}</div>
        </Card>
      </div>

      {/* Batch Actions */}
      {pendingPlansCount > 0 && (
        <Card className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-indigo-900">Processamento em Lotes</h3>
              <p className="text-sm text-indigo-700 mt-1">
                {selectedIds.length} de {pendingPlansCount} plano(s) selecionado(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={selectAll}
                variant="outline"
                size="sm"
                className="border-indigo-300 text-indigo-700"
              >
                {selectedIds.length === pendingPlansCount ? 'Desselecionar Tudo' : 'Selecionar Tudo'}
              </Button>
              <Button
                onClick={() => processInBatches(20)}
                disabled={selectedIds.length === 0 || processing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                size="sm"
              >
                {processing ? '⏳ Processando...' : `Processar ${selectedIds.length > 0 ? `${selectedIds.length}` : ''} em Lotes`}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {pendingPlans.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Nenhum plano pendente</p>
            <p className="text-gray-400 text-sm mt-2">Todos os pagamentos já foram ativados!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === pendingPlansCount && pendingPlansCount > 0}
                      onChange={selectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Produtos</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Plataforma</th>
                  <th className="px-4 py-3 text-left font-semibold">Valor</th>
                  <th className="px-4 py-3 text-left font-semibold">Criado em</th>
                  <th className="px-4 py-3 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendingPlans.map(plan => (
                  <tr
                    key={plan.id}
                    className={`border-b hover:bg-gray-50 ${
                      plan.status !== 'pending' ? 'opacity-75' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      {plan.status === 'pending' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(plan.id)}
                          onChange={() => toggleSelect(plan.id)}
                          className="rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === plan.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="email"
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            className="px-2 py-1 border rounded text-xs"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditEmail(plan.id, editingEmail)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <span>{plan.email}</span>
                          {plan.status === 'pending' && (
                            <button
                              onClick={() => {
                                setEditingId(plan.id)
                                setEditingEmail(plan.email)
                              }}
                              className="text-gray-400 hover:text-gray-600"
                              title="Editar email"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const productInfo = extractProductInfo(plan)
                          if (productInfo.code || productInfo.title) {
                            return (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-300 whitespace-nowrap">
                                {productInfo.title || productInfo.code || 'Produto'}
                                {productInfo.price && ` (R$ ${productInfo.price.toFixed(2)})`}
                              </span>
                            )
                          }
                          return <span className="text-gray-400 text-xs">-</span>
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(plan.status)}
                        <span>{getStatusLabel(plan.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{plan.platform}</td>
                    <td className="px-4 py-3">
                      {plan.amount_paid ? `R$ ${plan.amount_paid.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      {plan.status === 'pending' && (
                        <Button
                          onClick={() => manuallyActivatePlan(plan.id, plan.email)}
                          variant="outline"
                          size="sm"
                        >
                          Ativar Agora
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-700">
          <strong>ℹ️ Como funciona:</strong>
          <ul className="mt-2 space-y-1 text-xs">
            <li>✅ Webhooks recebidos de clientes sem conta aparecem aqui</li>
            <li>✅ Você pode editar o email se o cliente se registrou com outro</li>
            <li>✅ Selecione múltiplos planos e processe até 20 por vez</li>
            <li>✅ Quando o usuário faz login, os planos são ativados automaticamente</li>
            <li>✅ Use "Ativar Agora" para ativar manualmente um plano individual</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
