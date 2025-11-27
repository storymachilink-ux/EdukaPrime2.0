import { AdminLayout } from '../../components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { Users, BookOpen, Video, Gift, Download, Eye, CheckCircle, TrendingUp, Activity, DollarSign, Webhook, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  getOverviewMetrics,
  getUserGrowthStats,
  getEngagementStats,
  getUsersByPlanDistribution,
  getMostPopularResources,
  getMostActiveUsers,
} from '../../lib/analytics';

const COLORS = ['#9CA3AF', '#3B82F6', '#8B5CF6', '#F59E0B'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [popularResources, setPopularResources] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [savingExpense, setSavingExpense] = useState(false);
  const [dateRange, setDateRange] = useState(30); // 7, 30, 60 dias
  const [mrr, setMrr] = useState(0);
  const [newSubscriptions, setNewSubscriptions] = useState(0);
  const [cancelations, setCancelations] = useState(0);
  const [churnRate, setChurnRate] = useState(0);
  const [arpu, setArpu] = useState(0);
  const [ltv, setLtv] = useState(0);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
    fetchFinancialData();
    fetchAdvancedMetrics();
  }, [dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Carregar todas as métricas em paralelo
      const [
        overviewResult,
        growthResult,
        engagementResult,
        planResult,
        popularResult,
        activeResult,
      ] = await Promise.all([
        getOverviewMetrics(),
        getUserGrowthStats(30),
        getEngagementStats(30),
        getUsersByPlanDistribution(),
        getMostPopularResources(10),
        getMostActiveUsers(5),
      ]);

      setOverview(overviewResult);
      setGrowthData(growthResult.data);
      setEngagementData(engagementResult.data);
      setPlanDistribution(planResult.data);
      setPopularResources(popularResult.data);
      setActiveUsers(activeResult.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialData = async () => {
    try {
      // Calcular faturamento total das transações
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount')
        .in('payment_status', ['pending', 'completed', 'approved']); // Apenas pagamentos válidos

      if (!transactionsError && transactionsData) {
        const totalRevenue = transactionsData.reduce((sum, transaction) => {
          const amount = parseFloat(transaction.amount || 0);
          return sum + amount;
        }, 0);
        setRevenue(totalRevenue);
      } else if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
        // Fallback: tentar webhook_logs (compatibilidade)
        const { data: webhookData } = await supabase
          .from('webhook_logs')
          .select('price');

        if (webhookData) {
          const totalRevenue = webhookData.reduce((sum, log) => {
            const price = parseFloat(log.price || 0);
            return sum + price;
          }, 0);
          setRevenue(totalRevenue);
        }
      }

      // Calcular gastos totais
      const { data: expensesData, error: expensesError } = await supabase
        .from('admin_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!expensesError && expensesData) {
        const totalExpenses = expensesData.reduce((sum, expense) => {
          return sum + parseFloat(expense.amount || 0);
        }, 0);
        setExpenses(totalExpenses);
        setExpensesList(expensesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const fetchAdvancedMetrics = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - dateRange);

      // Buscar transações no período
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', daysAgo.toISOString())
        .in('payment_status', ['pending', 'completed', 'approved']);

      // Calcular Faturamento do período
      const periodRevenue = revenueData?.reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0) || 0;

      // Buscar usuários ativos (com plano_ativo válido)
      const { data: activeUsersData } = await supabase
        .from('users')
        .select('id, plano_ativo, subscription_started_at, subscription_cancelled_at, subscription_price')
        .not('plano_ativo', 'is', null);

      const totalActiveUsers = activeUsersData?.length || 1;

      // MRR - Monthly Recurring Revenue (soma dos preços de assinatura ativos)
      const calculatedMrr = activeUsersData?.reduce((sum, user) => {
        return sum + (parseFloat(user.subscription_price || 0));
      }, 0) || 0;
      setMrr(calculatedMrr);

      // Novas Assinaturas no período
      const newSubs = activeUsersData?.filter(user => {
        const startDate = new Date(user.subscription_started_at);
        return startDate >= daysAgo;
      }).length || 0;
      setNewSubscriptions(newSubs);

      // Cancelamentos no período
      const cancels = activeUsersData?.filter(user => {
        if (!user.subscription_cancelled_at) return false;
        const cancelDate = new Date(user.subscription_cancelled_at);
        return cancelDate >= daysAgo;
      }).length || 0;
      setCancelations(cancels);

      // Churn Rate = (Cancelamentos / Total Usuários Ativos) * 100
      const churn = totalActiveUsers > 0 ? (cancels / totalActiveUsers) * 100 : 0;
      setChurnRate(churn);

      // ARPU - Average Revenue Per User
      const calculatedArpu = totalActiveUsers > 0 ? periodRevenue / totalActiveUsers : 0;
      setArpu(calculatedArpu);

      // LTV - Lifetime Value (simplificado: MRR / Churn Rate, ou MRR * 12 se churn for zero)
      const calculatedLtv = churn > 0 ? (calculatedMrr / (churn / 100)) : calculatedMrr * 12;
      setLtv(calculatedLtv);

      // Assinaturas para tabela
      setSubscriptions(activeUsersData || []);

    } catch (error) {
      console.error('Erro ao calcular métricas avançadas:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      alert('Preencha todos os campos!');
      return;
    }

    setSavingExpense(true);
    try {
      if (editingExpense) {
        // Editar gasto existente
        const { error } = await supabase
          .from('admin_expenses')
          .update({
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
        alert('✅ Gasto atualizado com sucesso!');
        setEditingExpense(null);
      } else {
        // Adicionar novo gasto
        const { error } = await supabase
          .from('admin_expenses')
          .insert({
            description: newExpense.description,
            amount: parseFloat(newExpense.amount),
            category: 'anuncios',
          });

        if (error) throw error;
        alert('✅ Gasto adicionado com sucesso!');
      }

      setNewExpense({ description: '', amount: '' });
      fetchFinancialData();
    } catch (error: any) {
      console.error('Erro ao salvar gasto:', error);
      alert('❌ Erro ao salvar gasto: ' + error.message);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este gasto?')) return;

    try {
      const { error } = await supabase
        .from('admin_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Gasto excluído com sucesso!');
      fetchFinancialData();
    } catch (error: any) {
      console.error('Erro ao excluir gasto:', error);
      alert('❌ Erro ao excluir gasto: ' + error.message);
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
    });
    window.scrollTo({ top: 280, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-1">Visão geral da plataforma e métricas de desempenho</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
              <button
                onClick={() => setDateRange(7)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  dateRange === 7 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                7 dias
              </button>
              <button
                onClick={() => setDateRange(30)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  dateRange === 30 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                30 dias
              </button>
              <button
                onClick={() => setDateRange(60)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  dateRange === 60 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                60 dias
              </button>
            </div>
            <button
              onClick={() => navigate('/admin/webhooks')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Webhook className="w-5 h-5" />
              <span className="font-semibold">Ver Webhooks</span>
            </button>
          </div>
        </div>

        {/* 💰 SEÇÃO 1: VISÃO GERAL FINANCEIRA */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Visão Geral Financeira
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 rounded-xl p-6 shadow-lg border border-green-300/40">
              <p className="text-sm mb-1 font-bold text-green-800">💰 Faturamento Total</p>
              <p className="text-3xl font-bold text-green-950">R$ {revenue.toFixed(2)}</p>
              <p className="text-xs mt-1 text-green-700 font-medium">Soma de todos os webhooks</p>
            </div>

            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-500/30 to-pink-600/30 rounded-xl p-6 shadow-lg border border-red-300/40">
              <p className="text-sm mb-1 font-bold text-red-800">💸 Gastos Totais</p>
              <p className="text-3xl font-bold text-red-950">R$ {expenses.toFixed(2)}</p>
              <p className="text-xs mt-1 text-red-700 font-medium">{expensesList.length} gastos registrados</p>
            </div>

            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-xl p-6 shadow-lg border border-blue-300/40">
              <p className="text-sm mb-1 font-bold text-blue-800">📈 Lucro Líquido</p>
              <p className="text-3xl font-bold text-blue-950">
                R$ {(revenue - expenses).toFixed(2)}
              </p>
              <p className="text-xs mt-1 text-blue-700 font-medium">Faturamento - Gastos</p>
            </div>
          </div>
        </div>

        {/* 💸 SEÇÃO 2: GESTÃO DE GASTOS */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              💸 Gestão de Gastos
            </h3>
          </div>

          {/* Formulário Adicionar/Editar */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700">
                {editingExpense ? '✏️ Editar Gasto' : '➕ Adicionar Novo Gasto'}
              </h4>
              {editingExpense && (
                <button
                  onClick={() => {
                    setEditingExpense(null);
                    setNewExpense({ description: '', amount: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Descrição (ex: Anúncios Facebook)"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor (ex: 150.00)"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleAddExpense}
                disabled={savingExpense}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  savingExpense
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : editingExpense
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {savingExpense ? 'Salvando...' : editingExpense ? 'Atualizar Gasto' : 'Adicionar Gasto'}
              </button>
            </div>
          </div>

          {/* Lista de Gastos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expensesList.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">R$ {parseFloat(expense.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expensesList.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                📋 Nenhum gasto registrado ainda
              </div>
            )}
          </div>
        </div>

        {/* 📊 SEÇÃO 3: MÉTRICAS DE ASSINATURAS */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Métricas de Assinaturas ({dateRange} dias)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* MRR */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 rounded-xl p-6 shadow-lg border border-indigo-300/40">
              <p className="text-sm mb-1 font-bold text-indigo-800">💎 MRR</p>
              <p className="text-3xl font-bold text-indigo-950">R$ {mrr.toFixed(2)}</p>
              <p className="text-xs mt-1 text-indigo-700 font-medium">Monthly Recurring Revenue</p>
            </div>

            {/* Novas Assinaturas */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 rounded-xl p-6 shadow-lg border border-cyan-300/40">
              <p className="text-sm mb-1 font-bold text-cyan-800">🆕 Novas Assinaturas</p>
              <p className="text-3xl font-bold text-cyan-950">{newSubscriptions}</p>
              <p className="text-xs mt-1 text-cyan-700 font-medium">Nos últimos {dateRange} dias</p>
            </div>

            {/* Cancelamentos */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-orange-500/30 to-orange-600/30 rounded-xl p-6 shadow-lg border border-orange-300/40">
              <p className="text-sm mb-1 font-bold text-orange-800">❌ Cancelamentos</p>
              <p className="text-3xl font-bold text-orange-950">{cancelations}</p>
              <p className="text-xs mt-1 text-orange-700 font-medium">Nos últimos {dateRange} dias</p>
            </div>

            {/* Churn Rate */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-red-500/30 to-red-600/30 rounded-xl p-6 shadow-lg border border-red-300/40">
              <p className="text-sm mb-1 font-bold text-red-800">📉 Taxa de Churn</p>
              <p className="text-3xl font-bold text-red-950">{churnRate.toFixed(2)}%</p>
              <p className="text-xs mt-1 text-red-700 font-medium">Cancelamentos / Total</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ARPU */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-teal-500/30 to-teal-600/30 rounded-xl p-6 shadow-lg border border-teal-300/40">
              <p className="text-sm mb-1 font-bold text-teal-800">👤 ARPU</p>
              <p className="text-3xl font-bold text-teal-950">R$ {arpu.toFixed(2)}</p>
              <p className="text-xs mt-1 text-teal-700 font-medium">Average Revenue Per User ({dateRange}d)</p>
            </div>

            {/* LTV */}
            <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-violet-500/30 to-violet-600/30 rounded-xl p-6 shadow-lg border border-violet-300/40">
              <p className="text-sm mb-1 font-bold text-violet-800">💰 LTV</p>
              <p className="text-3xl font-bold text-violet-950">R$ {ltv.toFixed(2)}</p>
              <p className="text-xs mt-1 text-violet-700 font-medium">Lifetime Value Estimado</p>
            </div>
          </div>
        </div>

        {/* 📈 SEÇÃO 4: INDICADORES GERAIS */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Indicadores Gerais da Plataforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-semibold">
                +{overview?.newToday || 0} hoje
              </span>
            </div>
            <p className="text-sm text-gray-600">Total de Usuários</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Download className="w-8 h-8 text-green-500" />
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600">Total de Downloads</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalDownloads || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-500" />
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-sm text-gray-600">Visualizações de Vídeos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalViews || 0}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-orange-500" />
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600">Recursos Concluídos</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalCompleted || 0}</p>
          </div>
        </div>
        </div>

        {/* 📊 SEÇÃO 5: GRÁFICOS E ANÁLISES */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Gráficos e Análises</h2>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Crescimento de Usuários */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Crescimento de Usuários (30 dias)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="novos" stroke="#3B82F6" name="Novos Usuários" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#8B5CF6" name="Total Acumulado" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Plano */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Plano</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Engajamento (Downloads e Visualizações) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Engajamento (30 dias)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="downloads" fill="#10B981" name="Downloads" />
                <Bar dataKey="visualizacoes" fill="#8B5CF6" name="Visualizações de Vídeos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>

        {/* 👥 SEÇÃO 6: TABELAS DE DADOS */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Usuários e Recursos</h2>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recursos Mais Populares */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recursos Mais Populares</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recurso</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {popularResources.map((resource, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{resource.resource_title}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          resource.resource_type === 'atividade' ? 'bg-orange-100 text-orange-700' :
                          resource.resource_type === 'video' ? 'bg-purple-100 text-purple-700' :
                          'bg-pink-100 text-pink-700'
                        }`}>
                          {resource.resource_type === 'atividade' ? '📚 Atividade' :
                           resource.resource_type === 'video' ? '🎥 Vídeo' : '🎁 Bônus'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{resource.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {popularResources.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado de popularidade ainda
                </div>
              )}
            </div>
          </div>

          {/* Usuários Mais Ativos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Usuários Mais Ativos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Atividades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                          {user.activities}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {activeUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum usuário ativo ainda
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* 💳 SEÇÃO 7: ASSINATURAS E AÇÕES */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💳 Gestão de Assinaturas</h2>

        {/* Tabela de Assinaturas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Assinaturas Ativas</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.slice(0, 10).map((sub, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{sub.id.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        sub.plano_ativo === 3 ? 'bg-yellow-100 text-yellow-700' :
                        sub.plano_ativo === 2 ? 'bg-purple-100 text-purple-700' :
                        sub.plano_ativo === 1 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.plano_ativo === 3 ? 'VIP' :
                         sub.plano_ativo === 2 ? 'Premium' :
                         sub.plano_ativo === 1 ? 'Básico' : 'Gratuito'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      R$ {parseFloat(sub.subscription_price || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {sub.subscription_started_at ? new Date(sub.subscription_started_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.subscription_cancelled_at ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {sub.subscription_cancelled_at ? '❌ Cancelado' : '✅ Ativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscriptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma assinatura encontrada
              </div>
            )}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/admin/webhooks')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-lg border border-blue-200"
            >
              <Webhook className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Reprocessar Webhook</span>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 280, behavior: 'smooth' })}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:bg-green-50 transition-all shadow-md hover:shadow-lg border border-green-200"
            >
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Adicionar Gasto</span>
            </button>

            <button
              onClick={() => alert('Função em desenvolvimento')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:bg-purple-50 transition-all shadow-md hover:shadow-lg border border-purple-200"
            >
              <Gift className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Conceder Pontos</span>
            </button>

            <button
              onClick={() => alert('Função em desenvolvimento')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:bg-orange-50 transition-all shadow-md hover:shadow-lg border border-orange-200"
            >
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Gerar Cupom</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
