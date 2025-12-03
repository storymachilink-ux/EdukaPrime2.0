import { AdminLayout } from '../../components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, Search, Edit, Trash2, X, Lock, Unlock, Calendar, TrendingUp, Users, UserX, History, Activity, Plus, AlertCircle } from 'lucide-react';
import { changUserPlan, blockUser, unblockUser, getUserStats, isPlanExpired, getDaysUntilExpiration, getUserPlanHistory } from '../../lib/userPlanManager';
import { getUserActivityStats, getUserActivityHistory } from '../../lib/activityLogger';
import { planService, Plan, UserSubscription } from '../../lib/planService';

interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  plano_ativo: number;
  is_admin: boolean;
  created_at: string;
  acesso_atividades: boolean | null;
  acesso_videos: boolean | null;
  acesso_bonus: boolean | null;
  acesso_suporte_vip: boolean | null;
  status: string | null;
  data_expiracao_plano: string | null;
  plano_anterior: number | null;
  data_mudanca_plano: string | null;

  // Novos campos para planos
  active_plan_id?: number | null;
  has_lifetime_access?: boolean;
}

export default function GestaoUsuarios() {
  const { refreshProfile } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPlano, setFiltroPlano] = useState<number | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [modalEdit, setModalEdit] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    porPlano: { gratuito: 0, essencial: 0, evoluir: 0, prime: 0 },
    bloqueados: 0,
    novosNaSemana: 0
  });
  const [activeTab, setActiveTab] = useState<'info' | 'plan_history' | 'activity_history' | 'planos_ativos'>('info');
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Novos estados para gerenciamento de planos
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [modalAddPlan, setModalAddPlan] = useState(false);
  const [selectedPlanToAdd, setSelectedPlanToAdd] = useState<number | null>(null);

  // Estados para planos pendentes
  const [pendingCountsByEmail, setPendingCountsByEmail] = useState<Record<string, number>>({});
  const [totalPendingPlans, setTotalPendingPlans] = useState(0);
  const [activatingAll, setActivatingAll] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    fetchAllPlans();
    loadPendingCounts();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);

      // Buscar estatísticas
      const statsData = await getUserStats();
      if (!statsData.error) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlans = async () => {
    try {
      const plans = await planService.getAllPlans();
      setAllPlans(plans);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  // 🆕 Carregar contagem de planos pendentes por email
  const loadPendingCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_plans')
        .select('email')
        .eq('status', 'pending');

      if (error) {
        console.error('Erro ao carregar planos pendentes:', error);
        return;
      }

      const counts: Record<string, number> = {};
      let total = 0;
      data.forEach((row) => {
        const email = row.email?.toLowerCase();
        if (!email) return;
        counts[email] = (counts[email] || 0) + 1;
        total++;
      });

      setPendingCountsByEmail(counts);
      setTotalPendingPlans(total);
    } catch (error) {
      console.error('Erro ao carregar counts de pendentes:', error);
    }
  };

  // 🆕 Ativar TODOS os planos pendentes
  const handleActivateAllPending = async () => {
    if (totalPendingPlans === 0) {
      alert('Nenhum plano pendente para ativar!');
      return;
    }

    if (!confirm(`Ativar ${totalPendingPlans} plano(s) pendente(s)? Esta ação é irreversível!`)) {
      return;
    }

    setActivatingAll(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Para cada email com pendentes
      for (const [email] of Object.entries(pendingCountsByEmail)) {
        try {
          // Buscar user_id do email
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

          if (userError || !userData) {
            errorCount++;
            continue;
          }

          // Ativar planos deste email
          const { data: activateData, error: activateError } = await supabase.rpc('activate_pending_plans', {
            p_user_id: userData.id,
            p_user_email: email
          });

          if (activateError) {
            errorCount++;
            continue;
          }

          const result = activateData?.[0] || { total_activated: 0 };
          successCount += result.total_activated || 0;
        } catch (err) {
          errorCount++;
        }
      }

      // Recarregar dados
      await loadPendingCounts();
      await fetchUsuarios();

      // Mostrar resultado
      let message = `✅ ${successCount} plano(s) ativado(s)`;
      if (errorCount > 0) {
        message += ` | ❌ ${errorCount} erro(s)`;
      }
      alert(message);
    } catch (error: any) {
      console.error('Erro ao ativar pendentes:', error);
      alert('Erro ao ativar planos pendentes');
    } finally {
      setActivatingAll(false);
    }
  };

  const fetchUserSubscriptions = async (userId: string) => {
    try {
      setLoadingSubscriptions(true);
      const subs = await planService.getUserSubscriptionHistory(userId);
      setUserSubscriptions(subs);
    } catch (error) {
      console.error('Erro ao carregar subscriptions:', error);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const getPlanName = (planId: number): string => {
    const plan = allPlans.find(p => p.id === planId);
    return plan ? plan.display_name : `Plano ${planId}`;
  };

  const getPlanType = (planId: number): 'mensal' | 'unico' => {
    const plan = allPlans.find(p => p.id === planId);
    return plan ? plan.payment_type : 'mensal';
  };

  const usuariosFiltrados = usuarios.filter(user => {
    const matchSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filtroStatus === 'todos' ||
                        (filtroStatus === 'ativo' && (user.status === 'ativo' || !user.status)) ||
                        (filtroStatus === 'bloqueado' && user.status === 'bloqueado');
    return matchSearch && matchStatus;
  });

  const getNomePlano = (plano: number) => {
    const planos = ['Gratuito', 'Essencial', 'Evoluir', 'Prime'];
    return planos[plano] || 'Desconhecido';
  };

  const handleSaveUser = async () => {
    if (!modalEdit) return;

    try {
      setSaving(true);

      console.log('💾 Salvando usuário:', modalEdit.email);

      // Atualizar apenas nome e admin (planos são gerenciados em "Planos Ativos")
      const updateData: any = {
        nome: modalEdit.nome,
        is_admin: modalEdit.is_admin
      };

      console.log('📝 Dados para atualizar:', updateData);

      const { error, data } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', modalEdit.id)
        .select();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      // Verificar se alguma linha foi atualizada
      if (!data || data.length === 0) {
        console.error('⚠️ Nenhuma linha foi atualizada! Possível problema de RLS.');
        throw new Error('Nenhuma linha foi atualizada. Verifique se você tem permissão de admin no banco de dados. Execute o SQL: sql/fix-admin-permissions.sql');
      }

      console.log('✅ Usuário atualizado no banco:', data);

      // 2. Recarregar lista de usuários
      await fetchUsuarios();
      setModalEdit(null);

      console.log('🎉 Processo completo!');
      alert('✅ Usuário atualizado com sucesso!');
    } catch (error: any) {
      console.error('💥 Erro ao atualizar usuário:', error);
      alert('❌ Erro ao atualizar usuário: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Deseja BLOQUEAR o usuário ${userEmail}?`)) return;

    const result = await blockUser(userId);
    if (result.success) {
      alert('Usuário bloqueado com sucesso!');
      await fetchUsuarios();
    } else {
      alert('Erro ao bloquear usuário: ' + result.error);
    }
  };

  const handleUnblockUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Deseja DESBLOQUEAR o usuário ${userEmail}?`)) return;

    const result = await unblockUser(userId);
    if (result.success) {
      alert('Usuário desbloqueado com sucesso!');
      await fetchUsuarios();
    } else {
      alert('Erro ao desbloquear usuário: ' + result.error);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsuarios();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const loadUserHistory = async (userId: string) => {
    setLoadingHistory(true);
    try {
      // Carregar histórico de planos
      const { data: planData, error: planError } = await getUserPlanHistory(userId);
      if (!planError) {
        setPlanHistory(planData || []);
      }

      // Carregar histórico de atividades
      const { data: activityData, error: activityError } = await getUserActivityHistory(userId, 50);
      if (!activityError) {
        setActivityHistory(activityData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAddPlanToUser = async () => {
    if (!modalEdit || selectedPlanToAdd === null) return;

    try {
      setSaving(true);

      // Buscar o plano para verificar o tipo (mensal ou unico)
      const selectedPlan = allPlans.find(p => p.id === selectedPlanToAdd);
      if (!selectedPlan) throw new Error('Plano não encontrado');

      const today = new Date();

      // Se é plano mensal, expira em 30 dias
      // Se é plano único/vitalício, NUNCA expira (end_date = NULL)
      let endDate = null;
      if (selectedPlan.payment_type === 'mensal') {
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
      }

      // 1. Criar novo registro em user_subscriptions
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: modalEdit.id,
          plan_id: selectedPlanToAdd,
          status: 'active',
          start_date: today.toISOString(),
          end_date: endDate ? endDate.toISOString() : null,
          auto_renew: false,
        });

      if (subError) throw subError;

      // 2. Atualizar users.active_plan_id e plano_ativo
      const { error: updateError } = await supabase
        .from('users')
        .update({
          active_plan_id: selectedPlanToAdd,
          plano_ativo: selectedPlanToAdd,
          data_expiracao_plano: endDate ? endDate.toISOString().split('T')[0] : null
        })
        .eq('id', modalEdit.id);

      if (updateError) throw updateError;

      console.log('✅ Plano adicionado, active_plan_id e plano_ativo atualizados!');

      // 3. Sincronizar acesso aos items do plano para o usuário
      console.log('🔄 Sincronizando items do plano...');

      // Buscar o plano para obter os items vinculados
      const { data: planItems } = await supabase
        .from('plan_atividades')
        .select('atividade_id')
        .eq('plan_id', selectedPlanToAdd);

      const { data: planVideos } = await supabase
        .from('plan_videos')
        .select('video_id')
        .eq('plan_id', selectedPlanToAdd);

      const { data: planBonus } = await supabase
        .from('plan_bonus')
        .select('bonus_id')
        .eq('plan_id', selectedPlanToAdd);

      const { data: planPapercrafts } = await supabase
        .from('plan_papercrafts')
        .select('papercraft_id')
        .eq('plan_id', selectedPlanToAdd);

      console.log('✅ Items sincronizados:', {
        atividades: planItems?.length || 0,
        videos: planVideos?.length || 0,
        bonus: planBonus?.length || 0,
        papercrafts: planPapercrafts?.length || 0
      });

      // Se o usuário é o que está logado, refresh seu perfil
      if (modalEdit.id) {
        console.log('🔄 Atualizando perfil do usuário logado...');
        await refreshProfile();
      }

      await fetchUserSubscriptions(modalEdit.id);
      setModalAddPlan(false);
      setSelectedPlanToAdd(null);
      alert('✅ Plano adicionado com sucesso! Os items já estão acessíveis!');
    } catch (error) {
      console.error('❌ Erro ao adicionar plano:', error);
      alert('Erro ao adicionar plano: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSubscription = async (subscriptionId: string) => {
    if (!confirm('Deseja remover este plano do usuário?')) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      console.log('✅ Plano removido com sucesso!');
      if (modalEdit) {
        await fetchUserSubscriptions(modalEdit.id);
      }
      alert('✅ Plano removido com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao remover plano:', error);
      alert('Erro ao remover plano');
    }
  };

  const getActiveSubscriptions = () => {
    return userSubscriptions.filter(sub => sub.status === 'active');
  };

  const getMonthlySubscriptions = () => {
    return getActiveSubscriptions().filter(sub => getPlanType(sub.plan_id) === 'mensal');
  };

  const getAdditionalSubscriptions = () => {
    return getActiveSubscriptions().filter(sub => getPlanType(sub.plan_id) === 'unico');
  };


  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600 mt-1">Gerenciar usuários e permissões</p>
          </div>

          {/* 🆕 Botão ATIVAR TODOS PENDENTES */}
          {totalPendingPlans > 0 && (
            <button
              onClick={handleActivateAllPending}
              disabled={activatingAll}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activatingAll
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {activatingAll ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ativando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  ⏳ ATIVAR {totalPendingPlans} PENDENTE{totalPendingPlans > 1 ? 'S' : ''}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Novos esta Semana</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.novosNaSemana}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Bloqueados</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.bloqueados}</p>
              </div>
              <UserX className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Por Plano</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gratuito:</span>
                  <span className="font-semibold">{stats.porPlano.gratuito}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Essencial:</span>
                  <span className="font-semibold">{stats.porPlano.essencial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">Evoluir:</span>
                  <span className="font-semibold">{stats.porPlano.evoluir}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Prime:</span>
                  <span className="font-semibold">{stats.porPlano.prime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Email ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="todos">Todos os status</option>
                <option value="ativo">Ativos</option>
                <option value="bloqueado">Bloqueados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <span className="ml-3 text-gray-600">Carregando usuários...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosFiltrados.map((user) => {
                    const isExpired = user.data_expiracao_plano && isPlanExpired(user.data_expiracao_plano);
                    const daysUntilExpiration = user.data_expiracao_plano ? getDaysUntilExpiration(user.data_expiracao_plano) : null;
                    const isBloqueado = user.status === 'bloqueado';

                    return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.nome || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          isBloqueado ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {isBloqueado ? 'Bloqueado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.is_admin ? '✅' : '☐'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2 items-center">
                          {/* 🆕 Badge de planos pendentes */}
                          {pendingCountsByEmail[user.email.toLowerCase()] && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200 font-semibold whitespace-nowrap">
                              ⏳ {pendingCountsByEmail[user.email.toLowerCase()]}
                            </span>
                          )}
                          <button
                            onClick={() => setModalEdit(user)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isBloqueado ? (
                            <button
                              onClick={() => handleUnblockUser(user.id, user.email)}
                              className="text-green-600 hover:text-green-800"
                              title="Desbloquear"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user.id, user.email)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Bloquear"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            className="text-red-600 hover:text-red-800"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  )}
                </tbody>
              </table>

              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {modalEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Editar Usuário</h2>
                <button onClick={() => {
                  setModalEdit(null);
                  setActiveTab('info');
                  setPlanHistory([]);
                  setActivityHistory([]);
                  setUserSubscriptions([]);
                }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'info'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Informações
                </button>
                <button
                  onClick={() => {
                    setActiveTab('planos_ativos');
                    // Always fetch subscriptions to ensure we show the correct user's data
                    fetchUserSubscriptions(modalEdit.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'planos_ativos'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  💳 Planos Ativos
                </button>
                <button
                  onClick={() => {
                    setActiveTab('plan_history');
                    if (planHistory.length === 0) loadUserHistory(modalEdit.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'plan_history'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Histórico
                </button>
                <button
                  onClick={() => {
                    setActiveTab('activity_history');
                    if (activityHistory.length === 0) loadUserHistory(modalEdit.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'activity_history'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Atividades
                </button>
              </div>

              {/* Tab Content - Informações */}
              {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={modalEdit.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={modalEdit.nome || ''}
                    onChange={(e) => setModalEdit({...modalEdit, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>ℹ️ Importante:</strong> Os planos são gerenciados na aba <strong>💳 Planos Ativos</strong> abaixo.
                    Adicione, remova ou atualize os planos do usuário nessa aba.
                  </p>
                </div>


                <div className="border-t pt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={modalEdit.is_admin}
                      onChange={(e) => setModalEdit({...modalEdit, is_admin: e.target.checked})}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium">👑 Tornar Administrador</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setModalEdit(null);
                      setActiveTab('info');
                      setUserSubscriptions([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveUser}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
              )}

              {/* Tab Content - Planos Ativos */}
              {activeTab === 'planos_ativos' && (
                <div className="space-y-6">
                  {loadingSubscriptions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                      <span className="ml-3 text-gray-600">Carregando planos...</span>
                    </div>
                  ) : (
                    <>
                      {/* PLANOS PRINCIPAIS (MONTHLY) */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">📅 Planos Mensais (Principais)</h3>
                          <button
                            onClick={() => {
                              setSelectedPlanToAdd(null);
                              setModalAddPlan(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>

                        {getMonthlySubscriptions().length === 0 ? (
                          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">Nenhum plano mensal ativo</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {getMonthlySubscriptions().map((sub) => (
                              <div key={sub.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{getPlanName(sub.plan_id)}</p>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                                      <div>Início: {new Date(sub.start_date).toLocaleDateString('pt-BR')}</div>
                                      <div>Expira: {sub.end_date ? new Date(sub.end_date).toLocaleDateString('pt-BR') : 'Nunca'}</div>
                                      <div>Status: <span className="font-semibold text-blue-700">{sub.status}</span></div>
                                      <div>Valor: R$ {sub.amount_paid?.toFixed(2) || '-'}</div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveSubscription(sub.id)}
                                    className="text-red-600 hover:text-red-800 ml-4"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* PLANOS ADICIONAIS (UNIQUE) */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">🎁 Planos Adicionais (Pagamento Único)</h3>
                          <button
                            onClick={() => {
                              setSelectedPlanToAdd(null);
                              setModalAddPlan(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar
                          </button>
                        </div>

                        {getAdditionalSubscriptions().length === 0 ? (
                          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 text-sm">Nenhum plano adicional</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {getAdditionalSubscriptions().map((sub) => (
                              <div key={sub.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{getPlanName(sub.plan_id)}</p>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                                      <div>Adicionado: {new Date(sub.start_date).toLocaleDateString('pt-BR')}</div>
                                      <div>Válido até: {sub.end_date ? new Date(sub.end_date).toLocaleDateString('pt-BR') : 'Permanente'}</div>
                                      <div>Status: <span className="font-semibold text-green-700">{sub.status}</span></div>
                                      <div>Valor: R$ {sub.amount_paid?.toFixed(2) || '-'}</div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveSubscription(sub.id)}
                                    className="text-red-600 hover:text-red-800 ml-4"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab Content - Histórico de Planos */}
              {activeTab === 'plan_history' && (
                <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                      <span className="ml-3 text-gray-600">Carregando histórico...</span>
                    </div>
                  ) : planHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma mudança de plano registrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {planHistory.map((history: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-700">
                                  Plano {history.plano_anterior} → Plano {history.plano_novo}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  history.motivo === 'upgrade' ? 'bg-green-100 text-green-700' :
                                  history.motivo === 'downgrade' ? 'bg-orange-100 text-orange-700' :
                                  history.motivo === 'expiration' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {history.motivo === 'upgrade' ? 'Upgrade' :
                                   history.motivo === 'downgrade' ? 'Downgrade' :
                                   history.motivo === 'expiration' ? 'Expiração' :
                                   'Admin'}
                                </span>
                              </div>
                              {history.admin && (
                                <p className="text-xs text-gray-600">
                                  Por: {history.admin.nome || history.admin.email}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(history.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content - Histórico de Atividades */}
              {activeTab === 'activity_history' && (
                <div className="space-y-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                      <span className="ml-3 text-gray-600">Carregando atividades...</span>
                    </div>
                  ) : activityHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhuma atividade registrada</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {activityHistory.map((activity: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {activity.activity_type === 'download' ? '📥' :
                               activity.activity_type === 'view_video' ? '▶️' :
                               activity.activity_type === 'access' ? '👁️' : '📋'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.resource_title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600">
                                  {activity.activity_type === 'download' ? 'Download' :
                                   activity.activity_type === 'view_video' ? 'Visualizou vídeo' :
                                   'Acessou'}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {activity.resource_type === 'atividade' ? 'Atividade' :
                                   activity.resource_type === 'video' ? 'Vídeo' :
                                   activity.resource_type === 'bonus' ? 'Bônus' : 'Outro'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(activity.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Adicionar Plano */}
        {modalAddPlan && modalEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Adicionar Plano ao Usuário</h3>
                <button onClick={() => setModalAddPlan(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Selecione um plano para adicionar a <strong>{modalEdit.email}</strong>
              </p>

              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {allPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanToAdd(plan.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      selectedPlanToAdd === plan.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{plan.display_name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          R$ {plan.price.toFixed(2)} - {plan.payment_type === 'mensal' ? '📅 Mensal' : '🎁 Único'}
                        </p>
                      </div>
                      <div className="text-2xl ml-2">{plan.icon || '📦'}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Nota:</strong> Planos mensais expiram em 30 dias. Planos únicos não expiram.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setModalAddPlan(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPlanToUser}
                  disabled={saving || selectedPlanToAdd === null}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
