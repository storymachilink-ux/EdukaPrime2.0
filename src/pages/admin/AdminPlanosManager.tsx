import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { planService, Plan } from '../../lib/planService';
import { Edit2, Save, X, Loader2, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type ItemType = 'atividades' | 'videos' | 'bonus' | 'papercrafts';
type TabType = ItemType;

interface Item {
  id: string;
  titulo?: string;
  title?: string;
  name?: string;
  selected: boolean;
}

export default function AdminPlanosManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('atividades');
  const [itemsLoading, setItemsLoading] = useState(false);

  // Items por tipo
  const [atividadesItems, setAtividadesItems] = useState<Item[]>([]);
  const [videosItems, setVideosItems] = useState<Item[]>([]);
  const [bonusItems, setBonusItems] = useState<Item[]>([]);
  const [papercraftsItems, setPapercraftsItems] = useState<Item[]>([]);

  // Criar novo plano
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    display_name: '',
    description: '',
    price: '',
    payment_type: 'unico' as 'mensal' | 'unico',
    duration_days: '',
    vega_product_id: '',
    ggcheckout_product_id: '',
    amplopay_product_id: '',
    color_code: '#0F2741'
  });

  // Carregar planos ao montar
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await planService.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('❌ Erro ao carregar planos:', error);
      setMessage({ text: 'Erro ao carregar planos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getItemsState = (type: ItemType) => {
    switch (type) {
      case 'atividades': return atividadesItems;
      case 'videos': return videosItems;
      case 'bonus': return bonusItems;
      case 'papercrafts': return papercraftsItems;
    }
  };

  const setItemsState = (type: ItemType, items: Item[]) => {
    switch (type) {
      case 'atividades': return setAtividadesItems(items);
      case 'videos': return setVideosItems(items);
      case 'bonus': return setBonusItems(items);
      case 'papercrafts': return setPapercraftsItems(items);
    }
  };

  const getTableName = (type: ItemType): string => {
    switch (type) {
      case 'atividades': return 'atividades';
      case 'videos': return 'videos';
      case 'bonus': return 'bonus';
      case 'papercrafts': return 'papercrafts';
    }
  };

  const getJunctionTableName = (type: ItemType): string => {
    switch (type) {
      case 'atividades': return 'plan_atividades';
      case 'videos': return 'plan_videos';
      case 'bonus': return 'plan_bonus';
      case 'papercrafts': return 'plan_papercrafts';
    }
  };

  const getTitleField = (type: ItemType): string => {
    switch (type) {
      case 'atividades': return 'titulo';
      case 'videos': return 'titulo';
      case 'bonus': return 'titulo';
      case 'papercrafts': return 'title';
    }
  };

  const handleEditPlan = async (plan: Plan) => {
    try {
      setEditingPlanId(plan.id);
      setEditingPlan({ ...plan });
      setActiveTab('atividades');

      // Carregar items para todas as abas
      await loadAllItems(plan.id);
    } catch (error) {
      console.error('❌ Erro ao carregar items:', error);
      setMessage({ text: 'Erro ao carregar items do plano', type: 'error' });
    }
  };

  const loadAllItems = async (planId: number) => {
    setItemsLoading(true);
    try {
      await Promise.all([
        loadItemsForTab(planId, 'atividades'),
        loadItemsForTab(planId, 'videos'),
        loadItemsForTab(planId, 'bonus'),
        loadItemsForTab(planId, 'papercrafts'),
      ]);
    } catch (error) {
      console.error('❌ Erro ao carregar items:', error);
    } finally {
      setItemsLoading(false);
    }
  };

  const loadItemsForTab = async (planId: number, type: ItemType) => {
    try {
      const tableName = getTableName(type);
      const junctionTable = getJunctionTableName(type);
      const titleField = getTitleField(type);
      const linkField = type === 'bonus' ? 'bonus_id' :
                        `${type.slice(0, -1)}_id`;

      console.log(`📋 Carregando ${type}: tabela=${tableName}, titleField=${titleField}`);

      let query = supabase
        .from(tableName)
        .select('id, ' + titleField)
        .order('created_at', { ascending: false });

      if (type === 'papercrafts') {
        query = query.eq('is_active', true);
      }

      const { data: allItems, error: itemsError } = await query;

      if (itemsError) {
        console.error(`❌ Erro ao carregar items de ${type}:`, itemsError);
        throw itemsError;
      }

      console.log(`✅ ${type}: ${allItems?.length || 0} items carregados`);

      const { data: linkedItems, error: linkedError } = await supabase
        .from(junctionTable)
        .select(linkField)
        .eq('plan_id', planId);

      if (linkedError && linkedError.code !== 'PGRST116') {
        console.error(`❌ Erro ao carregar vinculação de ${type}:`, linkedError);
        throw linkedError;
      }

      const linkedIds = new Set(linkedItems?.map((item: any) => item[linkField]) || []);

      const items = (allItems || []).map((item: any) => ({
        id: item.id,
        titulo: item[titleField],
        selected: linkedIds.has(item.id),
      }));

      setItemsState(type, items);
      console.log(`📦 ${type}: ${items.length} items na UI`);
    } catch (error) {
      console.error(`❌ Erro ao carregar items de ${type}:`, error);
      setMessage({ text: `Erro ao carregar ${type}: ${(error as any).message}`, type: 'error' });
    }
  };

  const handleToggleItem = async (type: ItemType, itemId: string, currentSelected: boolean) => {
    if (!editingPlan) return;

    try {
      const junctionTable = getJunctionTableName(type);
      const linkField = type === 'bonus' ? 'bonus_id' :
                        `${type.slice(0, -1)}_id`;

      if (currentSelected) {
        // Remover
        const { error } = await supabase
          .from(junctionTable)
          .delete()
          .eq('plan_id', editingPlan.id)
          .eq(linkField, itemId);

        if (error) throw error;
      } else {
        // Adicionar
        const { error } = await supabase
          .from(junctionTable)
          .insert({
            plan_id: editingPlan.id,
            [linkField]: itemId,
          });

        if (error) throw error;
      }

      // Atualizar estado local
      const items = getItemsState(type).map((item) =>
        item.id === itemId ? { ...item, selected: !currentSelected } : item
      );
      setItemsState(type, items);

      // NOVO: Sincronizar available_for_plans do item com a junction table
      if (['atividades', 'videos', 'bonus', 'papercrafts'].includes(type)) {
        await planService.syncItemPlanAccess(type as any, itemId);
        console.log(`✅ Sincronizado available_for_plans para ${type}(${itemId})`);
      }

      console.log(`✅ Item ${itemId} ${currentSelected ? 'removido de' : 'adicionado a'} ${type}`);
    } catch (error) {
      console.error('❌ Erro ao toggle item:', error);
      setMessage({ text: `Erro ao atualizar ${type}`, type: 'error' });
    }
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      setSaving(true);

      console.log(`💾 Salvando plano ${editingPlan.id} (${editingPlan.display_name})...`);

      // 1. Atualizar informações do plano
      await planService.updatePlan(editingPlan.id, {
        name: editingPlan.name,
        display_name: editingPlan.display_name,
        description: editingPlan.description,
        price: editingPlan.price,
        payment_type: editingPlan.payment_type,
        vega_product_id: (editingPlan as any).vega_product_id,
        ggcheckout_product_id: (editingPlan as any).ggcheckout_product_id,
        amplopay_product_id: (editingPlan as any).amplopay_product_id,
        checkout_url: editingPlan.checkout_url,
        has_comunidade: editingPlan.has_comunidade,
        has_suporte_vip: editingPlan.has_suporte_vip,
      });

      console.log('✅ Plano salvo. Iniciando sincronização de items...');

      // 2. NOVO: Sincronizar TODOS os items deste plano para todos os usuários
      const syncResult = await planService.syncAllItemsForPlan(editingPlan.id);

      if (syncResult.success) {
        setMessage({
          text: `✅ Plano salvo e sincronizado!\n${syncResult.message}\n${
            editingPlan.has_comunidade
              ? '✅ Chat/Comunidade HABILITADA'
              : '❌ Chat/Comunidade DESABILITADA'
          }\nTodos os usuários verão as mudanças!`,
          type: 'success',
        });
      } else {
        setMessage({
          text: `⚠️ Plano salvo, mas erro na sincronização: ${syncResult.message}`,
          type: 'error',
        });
      }

      console.log(`📊 Resultado da sincronização:`, syncResult.stats);
      setTimeout(() => setMessage(null), 5000);

      await fetchPlans();
      setEditingPlanId(null);
      setEditingPlan(null);
    } catch (error) {
      console.error('❌ Erro ao salvar plano:', error);
      setMessage({ text: `Erro ao salvar plano: ${(error as any).message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPlanId(null);
    setEditingPlan(null);
  };

  const handleDeletePlan = async (plan: Plan) => {
    const confirmDelete = window.confirm(
      `⚠️ Tem certeza que deseja deletar o plano "${plan.display_name}"?\n\n` +
      `Usuários com subscriptions ativas continuarão tendo acesso.\n` +
      `Essa ação é irreversível!`
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('plans_v2')
        .delete()
        .eq('id', plan.id);

      if (error) throw error;

      setMessage({ text: `✅ Plano "${plan.display_name}" deletado com sucesso!`, type: 'success' });
      setTimeout(() => setMessage(null), 3000);
      await fetchPlans();
    } catch (error: any) {
      console.error('❌ Erro ao deletar plano:', error);
      setMessage({ text: `Erro ao deletar plano: ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!newPlanForm.name || !newPlanForm.display_name || !newPlanForm.price) {
        setMessage({ text: 'Preencha todos os campos obrigatórios', type: 'error' });
        return;
      }

      setSaving(true);

      const { data, error } = await supabase
        .from('plans_v2')
        .insert([
          {
            name: newPlanForm.name.toUpperCase(),
            display_name: newPlanForm.display_name,
            description: newPlanForm.description || null,
            price: parseFloat(newPlanForm.price),
            payment_type: newPlanForm.payment_type,
            currency: 'BRL',
            duration_days: newPlanForm.duration_days ? parseInt(newPlanForm.duration_days) : null,
            vega_product_id: newPlanForm.vega_product_id || null,
            ggcheckout_product_id: newPlanForm.ggcheckout_product_id || null,
            amplopay_product_id: newPlanForm.amplopay_product_id || null,
            color_code: newPlanForm.color_code,
            is_active: true,
            checkout_url: null,
            product_id_gateway: null,
            gateway_product_id: null,
            modal_image_url: null,
            modal_text: null,
            modal_button_text: null,
            icon: null,
            order_position: (plans.length + 1) * 10
          }
        ])
        .select();

      if (error) throw error;

      setMessage({ text: '✅ Plano criado com sucesso!', type: 'success' });
      setNewPlanForm({
        name: '',
        display_name: '',
        description: '',
        price: '',
        payment_type: 'unico',
        duration_days: '',
        vega_product_id: '',
        ggcheckout_product_id: '',
        amplopay_product_id: '',
        color_code: '#0F2741'
      });
      setIsCreatingPlan(false);
      await fetchPlans();
    } catch (error: any) {
      console.error('❌ Erro ao criar plano:', error);
      setMessage({ text: `Erro ao criar plano: ${error.message}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'atividades', label: 'Atividades', emoji: '📚' },
    { id: 'videos', label: 'Vídeos', emoji: '🎥' },
    { id: 'bonus', label: 'Bônus', emoji: '🎁' },
    { id: 'papercrafts', label: 'PaperCrafts', emoji: '✂️' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gerenciar Planos</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {editingPlanId !== null && editingPlan ? (
          // Modal de edição com abas
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Editar: {editingPlan.display_name}</h2>

            {/* Seção de informações básicas */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingPlan.price}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  IDs de Produtos por Plataforma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🟢 Vega Checkout
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 3MGN9O"
                      value={(editingPlan as any).vega_product_id || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          vega_product_id: e.target.value || null,
                        } as any)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🔵 GGCheckout
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: WpjID8aV49ShaQ07ABzP"
                      value={(editingPlan as any).ggcheckout_product_id || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          ggcheckout_product_id: e.target.value || null,
                        } as any)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🟣 AmploPay
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: prod_amplopay123"
                      value={(editingPlan as any).amplopay_product_id || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          amplopay_product_id: e.target.value || null,
                        } as any)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Badges de IDs configurados */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">IDs Configurados:</p>
                  <div className="flex flex-wrap gap-2">
                    {(editingPlan as any).vega_product_id && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        🟢 Vega: {(editingPlan as any).vega_product_id}
                      </span>
                    )}
                    {(editingPlan as any).ggcheckout_product_id && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        🔵 GGCheckout: {(editingPlan as any).ggcheckout_product_id}
                      </span>
                    )}
                    {(editingPlan as any).amplopay_product_id && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        🟣 AmploPay: {(editingPlan as any).amplopay_product_id}
                      </span>
                    )}
                    {!(editingPlan as any).vega_product_id &&
                     !(editingPlan as any).ggcheckout_product_id &&
                     !(editingPlan as any).amplopay_product_id && (
                      <span className="text-sm text-gray-500 italic">Nenhum ID configurado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Abas */}
            <div className="border-b mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.emoji} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles para Comunidade e Suporte VIP */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan?.has_comunidade || false}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan!,
                      has_comunidade: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-700">
                  👥 Habilitar Comunidade (Chat)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan?.has_suporte_vip || false}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan!,
                      has_suporte_vip: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-700">
                  ⭐ Habilitar Suporte VIP
                </span>
              </label>
            </div>

            {/* Conteúdo das abas */}
            {itemsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {getItemsState(activeTab).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleItem(activeTab, item.id, item.selected)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700 flex-1 truncate">
                      {item.titulo}
                    </span>
                    {item.selected && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {getItemsState(activeTab).length === 0 && !itemsLoading && (
              <div className="text-center py-8 text-gray-500">
                Nenhum item disponível para {activeTab}
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleSavePlan}
                disabled={saving}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : isCreatingPlan ? (
          // Modal para criar novo plano
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">Criar Novo Plano</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Interno (Código) *
                </label>
                <input
                  type="text"
                  placeholder="Ex: PAPERCRAFTS, VITALICIO_2"
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome para Exibição *
                </label>
                <input
                  type="text"
                  placeholder="Ex: PaperCrafts, Acesso Vitalício"
                  value={newPlanForm.display_name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, display_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  placeholder="Descrição do plano"
                  value={newPlanForm.description}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={newPlanForm.price}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={newPlanForm.payment_type}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, payment_type: e.target.value as 'mensal' | 'unico' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="unico">Pagamento Único (Add-on)</option>
                  <option value="mensal">Mensal (Subscription)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (dias) - Opcional
                </label>
                <input
                  type="number"
                  placeholder="Ex: 30, 365"
                  value={newPlanForm.duration_days}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, duration_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Vega Checkout - Opcional
                </label>
                <input
                  type="text"
                  placeholder="Ex: 3MGN9O"
                  value={newPlanForm.vega_product_id}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, vega_product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID GGCheckout - Opcional
                </label>
                <input
                  type="text"
                  placeholder="Ex: WpjID8aV49ShaQ07ABzP"
                  value={newPlanForm.ggcheckout_product_id}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, ggcheckout_product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID AmploPay - Opcional
                </label>
                <input
                  type="text"
                  placeholder="Ex: prod_amplopay123"
                  value={newPlanForm.amplopay_product_id}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, amplopay_product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Plano
                </label>
                <input
                  type="color"
                  value={newPlanForm.color_code}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, color_code: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <button
                onClick={() => {
                  setIsCreatingPlan(false);
                  setNewPlanForm({
                    name: '',
                    display_name: '',
                    description: '',
                    price: '',
                    payment_type: 'unico',
                    duration_days: '',
                    vega_product_id: '',
                    ggcheckout_product_id: '',
                    amplopay_product_id: '',
                    color_code: '#0F2741'
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancelar
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={saving}
                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? 'Criando...' : 'Criar Plano'}
              </button>
            </div>
          </div>
        ) : (
          // Lista de planos
          <div>
            <button
              onClick={() => setIsCreatingPlan(true)}
              className="mb-6 px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Novo Plano
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.display_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                </div>

                <div className="border-t pt-4 my-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Preço:</span>
                    <span className="text-lg font-bold text-gray-900">
                      R$ {plan.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {plan.payment_type === 'mensal' ? 'Mensal' : 'Vitalício'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Gerenciar Items
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    disabled={saving}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                    title="Deletar plano"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
