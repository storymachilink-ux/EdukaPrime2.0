import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, DollarSign, Users, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FinancialMetric {
  id: string;
  date: string;
  total_revenue: number;
  total_expenses: number;
  new_subscriptions: number;
  canceled_subscriptions: number;
  active_subscriptions: number;
  mrr: number;
  arpu: number;
  churn_rate: number;
  ltv: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export function FinancialMetricsDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    activeSubscriptions: 0,
    avgChurn: 0,
    avgArpu: 0,
  });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '' });
  const [saving, setSaving] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - period);

      const [metricsData, expensesData] = await Promise.all([
        supabase
          .from('financial_metrics')
          .select('*')
          .gte('date', daysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        supabase
          .from('expenses')
          .select('*')
          .gte('date', daysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false }),
      ]);

      if (metricsData.error) throw metricsData.error;
      if (expensesData.error) throw expensesData.error;

      setMetrics(metricsData.data || []);
      setExpenses(expensesData.data || []);

      if (metricsData.data && metricsData.data.length > 0) {
        const totalRev = metricsData.data.reduce((sum, m) => sum + m.total_revenue, 0);
        const totalExp = metricsData.data.reduce((sum, m) => sum + m.total_expenses, 0);
        const lastMetric = metricsData.data[metricsData.data.length - 1];
        const avgChurn =
          metricsData.data.reduce((sum, m) => sum + m.churn_rate, 0) / metricsData.data.length;
        const avgArpu =
          metricsData.data.reduce((sum, m) => sum + m.arpu, 0) / metricsData.data.length;

        setTotals({
          totalRevenue: totalRev,
          totalExpenses: totalExp,
          profit: totalRev - totalExp,
          activeSubscriptions: lastMetric.active_subscriptions,
          avgChurn,
          avgArpu,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) {
      alert('Preencha todos os campos');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('create_expense', {
        p_description: newExpense.description,
        p_amount: parseFloat(newExpense.amount),
        p_category: newExpense.category || 'Outros',
        p_date: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      setNewExpense({ description: '', amount: '', category: '' });
      loadMetrics();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      alert('Erro ao adicionar despesa');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta despesa?')) return;

    try {
      const { error } = await supabase.rpc('delete_expense', {
        p_expense_id: id
      });
      if (error) throw error;
      loadMetrics();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      alert('Erro ao deletar despesa');
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Métricas Financeiras</h2>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={60}>60 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalRevenue)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalExpenses)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-600 opacity-20" />
          </div>
        </div>

        <div
          className={`rounded-xl p-6 border ${
            totals.profit >= 0
              ? 'bg-blue-50 border-blue-200'
              : 'bg-orange-50 border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lucro Líquido</p>
              <p
                className={`text-2xl font-bold ${
                  totals.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                {formatCurrency(totals.profit)}
              </p>
            </div>
            <DollarSign
              className={`w-10 h-10 opacity-20 ${
                totals.profit >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Assinaturas Ativas</p>
          <p className="text-3xl font-bold text-indigo-600">{totals.activeSubscriptions}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Churn Rate Médio</p>
          <p className="text-3xl font-bold text-orange-600">{totals.avgChurn.toFixed(2)}%</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">ARPU Médio</p>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totals.avgArpu)}</p>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução de Receita vs Despesas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(date) => formatDate(date)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_revenue"
                stroke="#10b981"
                name="Receita"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total_expenses"
                stroke="#ef4444"
                name="Despesas"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Despesa</h3>
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Descrição da despesa"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              placeholder="Valor (R$)"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              step="0.01"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione categoria</option>
              <option value="Infraestrutura">Infraestrutura</option>
              <option value="Marketing">Marketing</option>
              <option value="Pessoal">Pessoal</option>
              <option value="Licenças">Licenças</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Adicionar Despesa'}
          </button>
        </form>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-red-600">
                      -{formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
