import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Loader, Upload } from 'lucide-react';
import {
  EducationalActivity,
  EducationalActivityCreateInput,
  EducationalActivityUpdateInput,
  PaperCraft,
  PaperCraftCreateInput,
  PaperCraftUpdateInput,
} from '../../types/papercraft';
import {
  getEducationalActivities,
  createEducationalActivity,
  updateEducationalActivity,
  deleteEducationalActivity,
  getEducationalSubjects,
  getEducationalCategories,
} from '../../lib/educationalActivityService';
import {
  getPaperCrafts,
  createPaperCraft,
  updatePaperCraft,
  deletePaperCraft,
  getPaperCraftCategories,
  uploadImageToSupabase,
  uploadGifToSupabase,
} from '../../lib/paperCraftService';

export function GestãoAtividades() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'atividades' | 'papercrafts'>('atividades');

  // ATIVIDADES states
  const [activities, setActivities] = useState<EducationalActivity[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // PAPERCRAFTS states
  const [papercrafts, setPapercrafts] = useState<PaperCraft[]>([]);
  const [paperCraftCategories, setPaperCraftCategories] = useState<string[]>([]);
  const [paperCraftLoading, setPaperCraftLoading] = useState(false);
  const [paperCraftSearchTerm, setPaperCraftSearchTerm] = useState('');
  const [filterPCCategory, setFilterPCCategory] = useState('');
  const [editingPapercraftId, setEditingPapercraftId] = useState<string | null>(null);
  const [showPaperCraftForm, setShowPaperCraftForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGif, setUploadingGif] = useState(false);

  const [formData, setFormData] = useState<EducationalActivityCreateInput>({
    title: '',
    subject: '',
    difficulty: 'fácil',
    description: '',
    category: '',
    min_age: 7,
    max_age: 12,
    has_answer_key: false,
    content_url: '',
    image_url: '',
    is_active: true,
  });

  const [paperCraftFormData, setPaperCraftFormData] = useState<PaperCraftCreateInput>({
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
  });

  // Load activities, subjects, and categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setPaperCraftLoading(true);
    try {
      const [activitiesData, subjectsData, categoriesData, papercraftsData, pcCategoriesData] = await Promise.all([
        getEducationalActivities(),
        getEducationalSubjects(),
        getEducationalCategories(),
        getPaperCrafts(),
        getPaperCraftCategories(),
      ]);
      setActivities(activitiesData);
      setSubjects(subjectsData);
      setCategories(categoriesData);
      setPapercrafts(papercraftsData);
      setPaperCraftCategories(pcCategoriesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    }
    setLoading(false);
    setPaperCraftLoading(false);
  };

  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || a.subject === filterSubject;
    const matchesCategory = !filterCategory || a.category === filterCategory;
    return matchesSearch && matchesSubject && matchesCategory;
  });

  const handleCreateNew = () => {
    setFormData({
      title: '',
      subject: '',
      difficulty: 'fácil',
      description: '',
      category: '',
      min_age: 7,
      max_age: 12,
      has_answer_key: false,
      content_url: '',
      image_url: '',
      is_active: true,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (activity: EducationalActivity) => {
    setFormData({
      title: activity.title,
      subject: activity.subject,
      difficulty: activity.difficulty,
      description: activity.description,
      category: activity.category,
      min_age: activity.min_age,
      max_age: activity.max_age,
      has_answer_key: activity.has_answer_key,
      content_url: activity.content_url || '',
      image_url: activity.image_url || '',
      is_active: activity.is_active,
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subject) {
      alert('Título e disciplina são obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await updateEducationalActivity(editingId, formData as EducationalActivityUpdateInput);
        alert('Atividade atualizada com sucesso!');
      } else {
        await createEducationalActivity(formData);
        alert('Atividade criada com sucesso!');
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar atividade');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta atividade?')) {
      return;
    }

    try {
      await deleteEducationalActivity(id);
      alert('Atividade deletada com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao deletar atividade');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestão de Atividades Educacionais
        </h1>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          <Plus className="w-5 h-5" />
          Nova Atividade
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingId ? 'Editar Atividade' : 'Nova Atividade'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                {/* Subject and Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Disciplina *
                    </label>
                    <input
                      type="text"
                      list="subjects"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <datalist id="subjects">
                      {subjects.map((subj) => (
                        <option key={subj} value={subj} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dificuldade
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="fácil">Fácil</option>
                      <option value="médio">Médio</option>
                      <option value="difícil">Difícil</option>
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Idade Mínima
                    </label>
                    <input
                      type="number"
                      value={formData.min_age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          min_age: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Idade Máxima
                    </label>
                    <input
                      type="number"
                      value={formData.max_age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_age: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL da Imagem
                    </label>
                    <input
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL do Conteúdo
                    </label>
                    <input
                      type="url"
                      value={formData.content_url || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, content_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.has_answer_key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_answer_key: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Inclui Gabarito
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Ativo
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {editingId ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
        >
          <option value="">Todas as disciplinas</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Disciplina
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Dificuldade
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Gabarito
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {activity.title}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {activity.subject}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {activity.category || '-'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {activity.difficulty}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {activity.has_answer_key ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Sim
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {activity.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma atividade encontrada
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          Total: <strong>{activities.length}</strong> atividades | Ativos:{' '}
          <strong>{activities.filter((a) => a.is_active).length}</strong> | Inativos:{' '}
          <strong>{activities.filter((a) => !a.is_active).length}</strong> | Com gabarito:{' '}
          <strong>{activities.filter((a) => a.has_answer_key).length}</strong>
        </p>
      </div>
    </div>
  );
}
