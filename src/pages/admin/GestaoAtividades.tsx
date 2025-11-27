import { AdminLayout } from '../../components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import { getContrastColor } from '../../utils/colorContrast';
import {
  getPaperCrafts,
  createPaperCraft,
  updatePaperCraft,
  deletePaperCraft,
  uploadImageToSupabase,
  uploadGifToSupabase,
} from '../../lib/paperCraftService';
import {
  PaperCraft,
  PaperCraftCreateInput,
  PaperCraftUpdateInput,
} from '../../types/papercraft';

interface Atividade {
  id?: string;
  titulo: string;
  descricao: string;
  imagem: string | null;
  link_download: string;
  faixa_etaria: string;
  categoria: string;
  nicho: string | null;
  available_for_plans: number[];
  badge_texto: string | null;
  badge_cor: string | null;
  badge_text_color: string | null;
}

const atividadeInicial: Atividade = {
  titulo: '',
  descricao: '',
  imagem: null,
  link_download: '',
  faixa_etaria: '',
  categoria: '',
  nicho: null,
  available_for_plans: [],
  badge_texto: null,
  badge_cor: '#FFC107',
  badge_text_color: null
};

// Plan options for selection
const PLAN_OPTIONS = [
  { id: 1, name: 'ESSENCIAL', icon: '⭐' },
  { id: 2, name: 'EVOLUIR', icon: '🚀' },
  { id: 3, name: 'PRIME', icon: '👑' },
  { id: 4, name: 'VITALÍCIO', icon: '💎' }
];

export default function GestaoAtividades() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'atividades' | 'papercrafts'>('atividades');

  // ATIVIDADES states
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEdit, setModalEdit] = useState<Atividade | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // PAPERCRAFTS states
  const [papercrafts, setPapercrafts] = useState<PaperCraft[]>([]);
  const [paperCraftLoading, setPaperCraftLoading] = useState(false);
  const [modalEditPaperCraft, setModalEditPaperCraft] = useState<PaperCraft | null>(null);
  const [savingPaperCraft, setSavingPaperCraft] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGif, setUploadingGif] = useState(false);

  useEffect(() => {
    fetchAtividades();
    fetchPapercrafts();
  }, []);

  const fetchPapercrafts = async () => {
    try {
      setPaperCraftLoading(true);
      const data = await getPaperCrafts();
      setPapercrafts(data);
    } catch (error) {
      console.error('Erro ao carregar papercrafts:', error);
    } finally {
      setPaperCraftLoading(false);
    }
  };

  const fetchAtividades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAtividades(data || []);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!modalEdit) return;

    if (!modalEdit.titulo || !modalEdit.descricao || !modalEdit.link_download || !modalEdit.faixa_etaria || !modalEdit.categoria) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Salvando...', modalEdit);

      if (modalEdit.id) {
        // Atualizar
        console.log('📝 Atualizando atividade ID:', modalEdit.id);

        const { error } = await supabase.rpc('update_atividade', {
          p_atividade_id: modalEdit.id,
          p_titulo: modalEdit.titulo,
          p_descricao: modalEdit.descricao,
          p_imagem: modalEdit.imagem,
          p_link_download: modalEdit.link_download,
          p_faixa_etaria: modalEdit.faixa_etaria,
          p_categoria: modalEdit.categoria,
          p_nicho: modalEdit.nicho,
          p_available_for_plans: modalEdit.available_for_plans,
          p_badge_texto: modalEdit.badge_texto,
          p_badge_cor: modalEdit.badge_cor,
          p_badge_text_color: modalEdit.badge_text_color
        });

        if (error) {
          console.error('Erro na RPC:', error);
          throw new Error(`Erro ao atualizar atividade: ${error.message}`);
        }

        console.log('✅ Atualização bem-sucedida!');
        setToast({ message: 'Atividade atualizada com sucesso!', type: 'success' });
      } else {
        // Criar
        console.log('➕ Criando nova atividade via RPC...');

        const { error } = await supabase.rpc('create_atividade', {
          p_titulo: modalEdit.titulo,
          p_descricao: modalEdit.descricao,
          p_imagem: modalEdit.imagem,
          p_link_download: modalEdit.link_download,
          p_faixa_etaria: modalEdit.faixa_etaria,
          p_categoria: modalEdit.categoria,
          p_nicho: modalEdit.nicho,
          p_available_for_plans: modalEdit.available_for_plans,
          p_badge_texto: modalEdit.badge_texto,
          p_badge_cor: modalEdit.badge_cor,
          p_badge_text_color: modalEdit.badge_text_color
        });

        if (error) {
          console.error('Erro na RPC:', error);
          throw new Error(`Erro ao criar atividade: ${error.message}`);
        }

        console.log('✅ Criação bem-sucedida!');
        setToast({ message: 'Atividade criada com sucesso!', type: 'success' });
      }

      await fetchAtividades();
      setModalEdit(null);
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar atividade:', error);
      const errorMessage = error?.message || 'Erro ao salvar atividade';
      setToast({ message: `Erro: ${errorMessage}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta atividade?')) return;

    try {
      const { error } = await supabase.rpc('delete_atividade', {
        p_atividade_id: id
      });

      if (error) throw error;
      setToast({ message: 'Atividade deletada com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      await fetchAtividades();
    } catch (error) {
      console.error('Erro ao deletar atividade:', error);
      setToast({ message: 'Erro ao deletar atividade', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  // PAPERCRAFTS HANDLERS
  const handleSavePaperCraft = async () => {
    if (!modalEditPaperCraft) return;

    if (!modalEditPaperCraft.title || !modalEditPaperCraft.category || !modalEditPaperCraft.theme || !modalEditPaperCraft.drive_folder_url) {
      setToast({ message: 'Preencha todos os campos obrigatórios do PaperCraft', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!modalEditPaperCraft.image_url && !modalEditPaperCraft.gif_url) {
      setToast({ message: 'Forneça pelo menos uma imagem ou GIF', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setSavingPaperCraft(true);

      if (modalEditPaperCraft.id) {
        await updatePaperCraft(modalEditPaperCraft.id, modalEditPaperCraft as PaperCraftUpdateInput);
        setToast({ message: 'PaperCraft atualizado com sucesso!', type: 'success' });
      } else {
        await createPaperCraft(modalEditPaperCraft as PaperCraftCreateInput);
        setToast({ message: 'PaperCraft criado com sucesso!', type: 'success' });
      }

      await fetchPapercrafts();
      setModalEditPaperCraft(null);
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar papercraft:', error);
      setToast({ message: `Erro: ${error?.message || 'Erro ao salvar'}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSavingPaperCraft(false);
    }
  };

  const handleDeletePaperCraft = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este papercraft?')) return;

    try {
      await deletePaperCraft(id);
      setToast({ message: 'PaperCraft deletado com sucesso!', type: 'success' });
      await fetchPapercrafts();
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Erro ao deletar papercraft:', error);
      setToast({ message: 'Erro ao deletar papercraft', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modalEditPaperCraft) return;

    setUploadingImage(true);
    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setModalEditPaperCraft({ ...modalEditPaperCraft, image_url: url });
        setToast({ message: 'Imagem enviada com sucesso!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setToast({ message: 'Erro ao fazer upload da imagem', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleGifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modalEditPaperCraft) return;

    setUploadingGif(true);
    try {
      const url = await uploadGifToSupabase(file);
      if (url) {
        setModalEditPaperCraft({ ...modalEditPaperCraft, gif_url: url });
        setToast({ message: 'GIF enviado com sucesso!', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setToast({ message: 'Erro ao fazer upload do GIF', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUploadingGif(false);
      e.target.value = '';
    }
  };

  return (
    <AdminLayout>
      {/* Toast de notificação */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestão de Atividades e PaperCrafts</h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'atividades' ? 'Gerenciar Atividades BNCC' : 'Gerenciar Coleções PaperCrafts'}
              </p>
            </div>
            <button
              onClick={() => {
                if (activeTab === 'atividades') {
                  setModalEdit(atividadeInicial);
                } else {
                  setModalEditPaperCraft({
                    id: '',
                    title: '',
                    category: '',
                    theme: 'Natal',
                    difficulty: 'fácil',
                    description: '',
                    model_count: '',
                    min_age: 4,
                    max_age: 12,
                    image_url: '',
                    gif_url: '',
                    drive_folder_url: '',
                    items_json: [],
                    price: 0,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    created_by: '',
                  } as any);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'atividades' ? 'Nova Atividade' : 'Novo PaperCraft'}
            </button>
          </div>

          {/* Abas */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('atividades')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'atividades'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📚 Atividades BNCC ({atividades.length})
            </button>
            <button
              onClick={() => setActiveTab('papercrafts')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'papercrafts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ✨ Coleções PaperCrafts ({papercrafts.length})
            </button>
          </div>
        </div>

        {/* ATIVIDADES TAB */}
        {activeTab === 'atividades' && (
          <>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividades.map((atividade) => (
              <div key={atividade.id} className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src={atividade.imagem || 'https://via.placeholder.com/300x200?text=Atividade'}
                  alt={atividade.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                      {atividade.categoria}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                      {atividade.available_for_plans?.length || 0} planos
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{atividade.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{atividade.descricao}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalEdit(atividade)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(atividade.id!)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {atividades.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhuma atividade cadastrada</p>
              </div>
            )}
          </div>
        )}
        </>
        )}

        {/* PAPERCRAFTS TAB */}
        {activeTab === 'papercrafts' && (
          <>
        {paperCraftLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papercrafts.map((papercraft) => (
              <div key={papercraft.id} className="bg-white rounded-xl shadow overflow-hidden">
                <img
                  src={papercraft.image_url || 'https://via.placeholder.com/300x200?text=PaperCraft'}
                  alt={papercraft.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                      {papercraft.category}
                    </span>
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                      {papercraft.theme === 'Natal' ? '🎄' : '🎃'} {papercraft.theme}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{papercraft.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{papercraft.description}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalEditPaperCraft(papercraft)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePaperCraft(papercraft.id)}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {papercrafts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum papercraft cadastrado</p>
              </div>
            )}
          </div>
        )}
        </>
        )}

        {/* Modal ATIVIDADES*/}
        {modalEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{modalEdit.id ? 'Editar' : 'Nova'} Atividade</h2>
                <button onClick={() => setModalEdit(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={modalEdit.titulo}
                    onChange={(e) => setModalEdit({...modalEdit, titulo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    value={modalEdit.descricao}
                    onChange={(e) => setModalEdit({...modalEdit, descricao: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria *</label>
                    <input
                      type="text"
                      placeholder="Ex: Matemática"
                      value={modalEdit.categoria}
                      onChange={(e) => setModalEdit({...modalEdit, categoria: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Faixa Etária *</label>
                    <input
                      type="text"
                      placeholder="Ex: 5 a 8 anos"
                      value={modalEdit.faixa_etaria}
                      onChange={(e) => setModalEdit({...modalEdit, faixa_etaria: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={modalEdit.imagem || ''}
                    onChange={(e) => setModalEdit({...modalEdit, imagem: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link de Download *</label>
                  <input
                    type="text"
                    value={modalEdit.link_download}
                    onChange={(e) => setModalEdit({...modalEdit, link_download: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">📋 Disponível em (Selecione os planos):</label>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {PLAN_OPTIONS.map(plan => (
                      <label key={plan.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={modalEdit.available_for_plans?.includes(plan.id) || false}
                          onChange={(e) => {
                            const plans = modalEdit.available_for_plans || [];
                            if (e.target.checked && !plans.includes(plan.id)) {
                              setModalEdit({
                                ...modalEdit,
                                available_for_plans: [...plans, plan.id].sort()
                              });
                            } else if (!e.target.checked) {
                              setModalEdit({
                                ...modalEdit,
                                available_for_plans: plans.filter(p => p !== plan.id)
                              });
                            }
                          }}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-lg">{plan.icon}</span>
                        <span className="font-medium text-gray-700">{plan.name}</span>
                        {modalEdit.available_for_plans?.includes(plan.id) && (
                          <span className="ml-auto text-green-600 font-bold">✓</span>
                        )}
                      </label>
                    ))}
                  </div>
                  {(!modalEdit.available_for_plans || modalEdit.available_for_plans.length === 0) && (
                    <p className="text-sm text-orange-600 mt-2">⚠️ Nenhum plano selecionado - item não será visível</p>
                  )}
                </div>

                {/* Campos de Badge */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-bold mb-3 text-gray-700">🏷️ Badge de Destaque (Opcional)</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Texto do Badge</label>
                      <input
                        type="text"
                        placeholder="Ex: Mais Popular"
                        value={modalEdit.badge_texto || ''}
                        onChange={(e) => setModalEdit({...modalEdit, badge_texto: e.target.value || null})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cor de Fundo do Badge</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={modalEdit.badge_cor || '#FFC107'}
                          onChange={(e) => {
                            const bgColor = e.target.value;
                            const textColor = getContrastColor(bgColor);
                            setModalEdit({
                              ...modalEdit,
                              badge_cor: bgColor,
                              badge_text_color: textColor
                            });
                          }}
                          className="w-16 h-10 border rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={modalEdit.badge_cor || '#FFC107'}
                          onChange={(e) => {
                            const bgColor = e.target.value;
                            const textColor = getContrastColor(bgColor);
                            setModalEdit({
                              ...modalEdit,
                              badge_cor: bgColor,
                              badge_text_color: textColor
                            });
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg uppercase font-mono text-sm"
                          placeholder="#FFC107"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview do Badge */}
                  {modalEdit.badge_texto && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-xs font-medium text-gray-600 mb-2">Preview do Badge:</label>
                      <div className="flex justify-center">
                        <div
                          className="px-3 py-1 rounded-full rotate-12 text-sm border-2 border-[#0F2741] font-bold shadow-md"
                          style={{
                            backgroundColor: modalEdit.badge_cor || '#FFC107',
                            color: modalEdit.badge_text_color || getContrastColor(modalEdit.badge_cor || '#FFC107')
                          }}
                        >
                          {modalEdit.badge_texto}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Cor do texto: {modalEdit.badge_text_color || getContrastColor(modalEdit.badge_cor || '#FFC107')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalEdit(null)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal PAPERCRAFTS */}
        {modalEditPaperCraft && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{modalEditPaperCraft.id ? 'Editar' : 'Novo'} PaperCraft</h2>
                <button onClick={() => setModalEditPaperCraft(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-1">Título *</label>
                  <input
                    type="text"
                    value={modalEditPaperCraft.title}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Categoria e Tema */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria *</label>
                    <input
                      type="text"
                      value={modalEditPaperCraft.category}
                      onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tema *</label>
                    <select
                      value={modalEditPaperCraft.theme || 'Natal'}
                      onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, theme: e.target.value as any})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Natal">🎄 Natal</option>
                      <option value="Halloween">🎃 Halloween</option>
                    </select>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={modalEditPaperCraft.description}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-medium mb-1">Dificuldade</label>
                  <select
                    value={modalEditPaperCraft.difficulty}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="fácil">Fácil</option>
                    <option value="médio">Médio</option>
                    <option value="difícil">Difícil</option>
                  </select>
                </div>

                {/* Faixa Etária */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Idade Mínima</label>
                    <input
                      type="number"
                      value={modalEditPaperCraft.min_age}
                      onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, min_age: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Idade Máxima</label>
                    <input
                      type="number"
                      value={modalEditPaperCraft.max_age}
                      onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, max_age: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* URLs de Imagem e GIF */}
                <div>
                  <label className="block text-sm font-medium mb-1">URL da Imagem ou Enviar</label>
                  <input
                    type="text"
                    value={modalEditPaperCraft.image_url || ''}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, image_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <div className="w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Enviar Imagem
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL do GIF ou Enviar</label>
                  <input
                    type="text"
                    value={modalEditPaperCraft.gif_url || ''}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, gif_url: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".gif,image/gif"
                      onChange={handleGifUpload}
                      disabled={uploadingGif}
                      className="hidden"
                    />
                    <div className="w-full px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                      {uploadingGif ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Enviar GIF
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Google Drive URL */}
                <div>
                  <label className="block text-sm font-medium mb-1">URL do Google Drive *</label>
                  <input
                    type="text"
                    value={modalEditPaperCraft.drive_folder_url || ''}
                    onChange={(e) => setModalEditPaperCraft({...modalEditPaperCraft, drive_folder_url: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setModalEditPaperCraft(null)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePaperCraft}
                    disabled={savingPaperCraft}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {savingPaperCraft ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
