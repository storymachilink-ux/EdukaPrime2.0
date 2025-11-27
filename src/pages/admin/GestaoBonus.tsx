import { AdminLayout } from '../../components/layout/AdminLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Edit, Trash2, X, Gift } from 'lucide-react';
import { getContrastColor } from '../../utils/colorContrast';

interface Bonus {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  icone_url: string | null;
  imagem_url: string | null;
  link_download: string;
  available_for_plans: number[];
  badge_texto: string | null;
  badge_cor: string | null;
  badge_text_color: string | null;
}

const bonusInicial: Bonus = {
  titulo: '',
  descricao: '',
  categoria: '',
  icone_url: null,
  imagem_url: null,
  link_download: '',
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

export default function GestaoBonus() {
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEdit, setModalEdit] = useState<Bonus | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchBonus();
  }, []);

  const fetchBonus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bonus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBonus(data || []);
    } catch (error) {
      console.error('Erro ao carregar bônus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!modalEdit) return;

    if (!modalEdit.titulo || !modalEdit.descricao || !modalEdit.link_download || !modalEdit.categoria) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setSaving(true);

      if (modalEdit.id) {
        // Atualizar
        const { error } = await supabase.rpc('update_bonus', {
          p_bonus_id: modalEdit.id,
          p_titulo: modalEdit.titulo,
          p_descricao: modalEdit.descricao,
          p_categoria: modalEdit.categoria,
          p_icone_url: modalEdit.icone_url,
          p_imagem_url: modalEdit.imagem_url,
          p_link_download: modalEdit.link_download,
          p_available_for_plans: modalEdit.available_for_plans,
          p_badge_texto: modalEdit.badge_texto,
          p_badge_cor: modalEdit.badge_cor,
          p_badge_text_color: modalEdit.badge_text_color
        });

        if (error) {
          throw new Error(`Erro ao atualizar bônus: ${error.message}`);
        }

        setToast({ message: 'Bônus atualizado com sucesso!', type: 'success' });
      } else {
        // Criar
        const { error } = await supabase.rpc('create_bonus', {
          p_titulo: modalEdit.titulo,
          p_descricao: modalEdit.descricao,
          p_categoria: modalEdit.categoria,
          p_icone_url: modalEdit.icone_url,
          p_imagem_url: modalEdit.imagem_url,
          p_link_download: modalEdit.link_download,
          p_available_for_plans: modalEdit.available_for_plans,
          p_badge_texto: modalEdit.badge_texto,
          p_badge_cor: modalEdit.badge_cor,
          p_badge_text_color: modalEdit.badge_text_color
        });

        if (error) {
          throw new Error(`Erro ao criar bônus: ${error.message}`);
        }

        setToast({ message: 'Bônus criado com sucesso!', type: 'success' });
      }

      await fetchBonus();
      setModalEdit(null);
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar bônus:', error);
      const errorMessage = error?.message || 'Erro ao salvar bônus';
      setToast({ message: `Erro: ${errorMessage}`, type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este bônus?')) return;

    try {
      const { error } = await supabase.rpc('delete_bonus', {
        p_bonus_id: id
      });

      if (error) throw error;

      setToast({ message: 'Bônus deletado com sucesso!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
      await fetchBonus();
    } catch (error) {
      console.error('Erro ao deletar bônus:', error);
      setToast({ message: 'Erro ao deletar bônus', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const getIconeEmoji = (categoria: string, iconeUrl: string | null) => {
    if (iconeUrl) return iconeUrl;
    if (categoria.includes('E-book') || categoria.includes('PDF')) return '📚';
    if (categoria.includes('Template')) return '📋';
    if (categoria.includes('Calendário')) return '📅';
    return '🎁';
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Bônus</h1>
            <p className="text-gray-600 mt-1">Adicionar, editar e remover materiais bônus</p>
          </div>
          <button
            onClick={() => setModalEdit(bonusInicial)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <Plus className="w-5 h-5" />
            Novo Bônus
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonus.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow">
                {/* Imagem ou Emoji */}
                {item.imagem_url ? (
                  <div className="relative w-full mb-4 overflow-hidden rounded-2xl border-3 border-purple-500 shadow-lg" style={{ aspectRatio: '340/268' }}>
                    <img
                      src={item.imagem_url}
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-4xl mb-4">{getIconeEmoji(item.categoria, item.icone_url)}</div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">
                    {item.categoria}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {item.available_for_plans?.length || 0} planos
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.titulo}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.descricao}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModalEdit(item)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {bonus.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Nenhum bônus cadastrado</p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {modalEdit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{modalEdit.id ? 'Editar' : 'Novo'} Bônus</h2>
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

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria *</label>
                  <input
                    type="text"
                    placeholder="Ex: E-book, Template, PDF"
                    value={modalEdit.categoria}
                    onChange={(e) => setModalEdit({...modalEdit, categoria: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ícone (Emoji)</label>
                  <input
                    type="text"
                    placeholder="Ex: 📚 ou deixe em branco para usar padrão"
                    value={modalEdit.icone_url || ''}
                    onChange={(e) => setModalEdit({...modalEdit, icone_url: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Imagem (URL)</label>
                  <input
                    type="text"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={modalEdit.imagem_url || ''}
                    onChange={(e) => setModalEdit({...modalEdit, imagem_url: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Se preencher, a imagem substituirá o emoji
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link de Download *</label>
                  <input
                    type="text"
                    placeholder="https://..."
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
                        placeholder="Ex: Exclusivo"
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
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
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
