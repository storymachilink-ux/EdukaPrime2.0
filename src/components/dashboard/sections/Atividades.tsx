import React, { useState, useEffect } from 'react';
import { Download, Eye, Pencil, Lock, Plus, Edit, Crown, Star, Zap } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { AttractiveUpgradeModal } from '../../ui/AttractiveUpgradeModal';
import { useAdminPlan } from '../../../hooks/useAdminPlan';
import { useAtividades, type DatabaseAtividade } from '../../../hooks/useDatabase';
import { CHECKOUT_LINKS, PLAN_INFO } from '../../../constants/checkout';

export const Atividades: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<DatabaseAtividade | null>(null);

  const { canDownloadActivity, currentPlanNumber } = usePermissions();
  const { isAdmin } = useAdminPlan();

  // Use database hook
  const { atividades, loading, error, addAtividade, updateAtividade, deleteAtividade } = useAtividades();

  const colorPalette = [
    '#156EF6', // Azul
    '#24D200', // Verde
    '#FC6800', // Laranja
    '#8F10F6', // Roxo
    '#E11D48', // Carmim
    '#0EA5E9', // Ciano
    '#F59E0B', // Âmbar
    '#10B981', // Verde-água
  ];

  // Helper function to convert plan numbers to plan names
  const planNumberToName = (planNumber: number): 'essencial' | 'evoluir' | 'prime' | 'demo' => {
    switch (planNumber) {
      case 1: return 'essencial'
      case 2: return 'evoluir'
      case 3: return 'prime'
      default: return 'demo'
    }
  }

  // Helper function to check if user can download activity
  const canUserDownloadActivity = (activity: DatabaseAtividade): boolean => {
    return canDownloadActivity(activity)
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(atividades.map(m => m.category)));
  const filters = ['Todos', 'Plano Essencial', ...categories];

  const getRandomColor = (index: number) => {
    return colorPalette[index % colorPalette.length];
  };

  const filteredMaterials = activeFilter === 'Todos'
    ? atividades
    : activeFilter === 'Plano Essencial'
      ? atividades.filter(material => material.available_for_plans.includes(1)) // 1 = essencial
      : atividades.filter(material => material.category === activeFilter);

  // Admin functions
  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivity = (material: DatabaseAtividade) => {
    setEditingActivity(material);
    setShowActivityModal(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#476178]">Carregando atividades...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium mb-2">Erro ao carregar atividades</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-8 md:pb-0">
      {/* Header Section - Mobile Optimized */}
      <div className="text-center px-4 md:px-0">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#033258]">
            Acervo de atividades
          </h1>
          {isAdmin && (
            <button
              onClick={handleAddActivity}
              className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
              title="Adicionar nova atividade"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </button>
          )}
        </div>
        <p className="text-sm md:text-lg text-[#476178] mb-4 md:mb-8 px-2">
          Explore nossa biblioteca de atividades educacionais
        </p>

        {/* Hero Image - Mobile Responsive */}
        <div className="flex justify-center mb-3 md:mb-8">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-none transform transition-all duration-300 hover:scale-105 md:hover:[transform:rotateX(10deg)_rotateY(-10deg)]">
            <img
              src="/atividadeshead.webp"
              alt="Atividades Educacionais"
              className="w-full h-auto shadow-md md:shadow-2xl rounded-lg md:rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* Filter Buttons - Mobile Scrollable */}
      <div className="px-4 md:px-0">
        <div className="flex overflow-x-auto md:flex-wrap md:justify-center gap-2 md:gap-3 pb-2 md:pb-0 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] flex items-center gap-2 text-sm md:text-base touch-manipulation ${
                activeFilter === filter
                  ? 'bg-[#FFE3A0] text-[#033258] shadow-lg border border-[#F59E0B]'
                  : 'bg-white text-[#033258] hover:bg-[#FFF3D6] border border-[#FFE3A0]'
              }`}
            >
              {filter === 'Plano Essencial' && (
                <Pencil className="w-3 h-3 md:w-4 md:h-4 text-[#F59E0B]" />
              )}
              <span className="whitespace-nowrap">{filter}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo User Upgrade Banner */}
      {currentPlanNumber === 0 && (
        <div className="px-4 md:px-0">
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-300 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl md:text-2xl font-bold text-yellow-800">
                  Adquira um Plano de acesso para liberar as atividades
                </h3>
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-yellow-700 text-sm md:text-base mb-6">
                Escolha o plano ideal e tenha acesso completo ao nosso acervo de mais de 8.000 atividades educacionais
              </p>
            </div>

            {/* Plans Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {Object.entries(PLAN_INFO).map(([planKey, plan]) => (
                <div
                  key={planKey}
                  className={`relative rounded-xl border-2 p-4 md:p-6 transition-all duration-300 hover:shadow-lg bg-white ${
                    planKey === 'evoluir' ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        ⭐ MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-white mb-3">
                      {planKey === 'essencial' && <Pencil className="w-6 h-6" />}
                      {planKey === 'evoluir' && <Star className="w-6 h-6" />}
                      {planKey === 'prime' && <Crown className="w-6 h-6" />}
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h4>
                    <p className="text-2xl font-bold text-gray-900">{plan.price}</p>
                  </div>

                  {/* All Features */}
                  <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          feature.included
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-400 bg-red-50'
                        }`}>
                          {feature.included ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          ) : (
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${
                            feature.included ? 'text-gray-800' : 'text-gray-400 line-through'
                          }`}>
                            {feature.name}
                          </p>
                          <p className={`text-xs ${
                            feature.included ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <a
                    href={CHECKOUT_LINKS[planKey as keyof typeof CHECKOUT_LINKS]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 px-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                      planKey === 'prime'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white'
                        : plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                          : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    }`}
                  >
                    Escolher {plan.name}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Materials Grid - Mobile First */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-4 md:gap-6 px-1 md:px-0 pb-4 md:pb-0">
        {filteredMaterials.map((material, index) => {
          const borderColor = getRandomColor(index);

          return (
            <div
              key={material.id}
              className="w-full min-w-0 max-w-full overflow-hidden bg-white rounded-lg md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-[#FFE3A0] p-2 sm:p-4 md:p-6 relative touch-manipulation"
              style={{ borderTop: `4px solid ${borderColor}` }}
            >
              {/* Admin Edit Button */}
              {isAdmin && (
                <button
                  onClick={() => handleEditActivity(material)}
                  className="absolute top-2 md:top-3 right-2 md:right-3 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors md:opacity-0 md:group-hover:opacity-100 touch-manipulation"
                  title="Editar atividade"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* Top Badge */}
              <div className="mb-1 md:mb-4">
                <div className="inline-block">
                  <span
                    className="px-1.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium rounded md:rounded-lg text-white"
                    style={{ backgroundColor: borderColor }}
                  >
                    {material.age_range}
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="mb-1.5 md:mb-4">
                <div className="aspect-[16/10] md:aspect-video rounded-md md:rounded-2xl overflow-hidden">
                  <img
                    src={material.image}
                    alt={material.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xs md:text-lg font-semibold text-[#033258] mb-1 md:mb-3 leading-tight line-clamp-2">
                  {material.title}
                </h3>

                <p className="text-[10px] md:text-sm text-[#476178] mb-1.5 md:mb-6 leading-relaxed line-clamp-2 hidden sm:block">
                  {material.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-1 md:gap-3 mt-1.5 md:mt-4">
                  {canUserDownloadActivity(material) ? (
                    <button
                      onClick={() => window.open(material.drive_url, '_blank')}
                      className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium py-1.5 md:py-3 px-2 md:px-4 rounded-md md:rounded-xl transition-all duration-200 flex items-center justify-center gap-0.5 md:gap-2 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#FBBF24] touch-manipulation text-[10px] md:text-base"
                    >
                      <Download className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Baixar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-1.5 md:py-3 px-2 md:px-4 rounded-md md:rounded-xl transition-all duration-200 flex items-center justify-center gap-0.5 md:gap-2 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-gray-400 touch-manipulation text-[10px] md:text-base"
                    >
                      <Lock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Upgrade</span>
                    </button>
                  )}

                  <button className="px-2 md:px-4 py-1.5 md:py-3 border border-[#FFE3A0] bg-white text-[#033258] hover:bg-[#FFF3D6] rounded-md md:rounded-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#FBBF24] touch-manipulation flex-shrink-0">
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade Modal */}
      <AttractiveUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      {/* Activity Management Modal */}
      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => setShowActivityModal(false)}
          activity={editingActivity}
          onSave={async (activity) => {
            if (editingActivity) {
              // Edit existing activity
              const { error } = await updateAtividade(editingActivity.id, activity)
              if (error) {
                alert('Erro ao atualizar atividade: ' + error)
                return
              }
            } else {
              // Add new activity
              const { error } = await addAtividade({
                ...activity,
                is_custom: true
              })
              if (error) {
                alert('Erro ao adicionar atividade: ' + error)
                return
              }
            }
            setShowActivityModal(false);
          }}
          allMaterials={atividades}
        />
      )}
    </div>
  );
};

// Activity Modal Component
interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: DatabaseAtividade | null;
  onSave: (activity: Omit<DatabaseAtividade, 'id' | 'created_at' | 'updated_at'>) => void;
  allMaterials: DatabaseAtividade[];
}

const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
  allMaterials
}) => {
  const [formData, setFormData] = useState<Partial<DatabaseAtividade>>({
    title: '',
    description: '',
    image: '',
    drive_url: '',
    age_range: '',
    category: '',
    niche: '',
    available_for_plans: []
  });

  const [newCategory, setNewCategory] = useState('');
  const [newAgeRange, setNewAgeRange] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewAgeRange, setShowNewAgeRange] = useState(false);

  // Existing options
  const existingCategories = Array.from(new Set(allMaterials.map(m => m.category)));
  const existingAgeRanges = Array.from(new Set(allMaterials.map(m => m.age_range)));

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        title: '',
        description: '',
        image: '',
        drive_url: '',
        age_range: '',
        category: '',
        niche: '',
        available_for_plans: []
      });
    }
  }, [activity]);

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.drive_url || !formData.age_range || !formData.category || !formData.available_for_plans || formData.available_for_plans.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const finalCategory = showNewCategory ? newCategory : formData.category;
    const finalAgeRange = showNewAgeRange ? newAgeRange : formData.age_range;

    onSave({
      title: formData.title!,
      description: formData.description!,
      image: formData.image || null,
      drive_url: formData.drive_url!,
      age_range: finalAgeRange!,
      category: finalCategory!,
      niche: formData.niche || finalCategory,
      available_for_plans: formData.available_for_plans!,
      is_custom: true
    });
  };

  const handlePlanToggle = (planNumber: number) => {
    const currentPlans = formData.available_for_plans || [];
    const newPlans = currentPlans.includes(planNumber)
      ? currentPlans.filter(p => p !== planNumber)
      : [...currentPlans, planNumber];

    setFormData({ ...formData, available_for_plans: newPlans });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#FFE3A0] p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#033258]">
              {activity ? 'Editar Atividade' : 'Adicionar Nova Atividade'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FFF3D6] rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-[#476178]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              📝 Título *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="Digite o título da atividade"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              📝 Descrição *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="Descreva a atividade"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              🖼️ URL da Imagem
            </label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {/* Download Link */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              🔗 Link de Download *
            </label>
            <input
              type="url"
              value={formData.drive_url || ''}
              onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
              className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="Link do Google Drive ou outro"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                👶 Faixa Etária *
              </label>
              {!showNewAgeRange ? (
                <div className="space-y-2">
                  <select
                    value={formData.age_range || ''}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setShowNewAgeRange(true);
                      } else {
                        setFormData({ ...formData, age_range: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Selecione...</option>
                    {existingAgeRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                    <option value="new">+ Adicionar nova faixa etária</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newAgeRange}
                    onChange={(e) => setNewAgeRange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="Ex: 5 a 8 anos"
                  />
                  <button
                    onClick={() => setShowNewAgeRange(false)}
                    className="text-sm text-[#476178] hover:text-[#033258]"
                  >
                    ← Voltar para opções existentes
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                📁 Categoria *
              </label>
              {!showNewCategory ? (
                <div className="space-y-2">
                  <select
                    value={formData.category || ''}
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setShowNewCategory(true);
                      } else {
                        setFormData({ ...formData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  >
                    <option value="">Selecione...</option>
                    {existingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="new">+ Criar nova categoria</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    placeholder="Nome da nova categoria"
                  />
                  <button
                    onClick={() => setShowNewCategory(false)}
                    className="text-sm text-[#476178] hover:text-[#033258]"
                  >
                    ← Voltar para categorias existentes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              🏷️ Nicho/Subtema
            </label>
            <input
              type="text"
              value={formData.niche || ''}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              className="w-full px-3 py-2 border border-[#FFE3A0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="Ex: Fonética, Álgebra, etc."
            />
          </div>

          {/* Plan Visibility */}
          <div>
            <label className="block text-sm font-medium text-[#033258] mb-2">
              🔒 Planos com Acesso * (invisível para usuários)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available_for_plans?.includes(1) || false}
                  onChange={() => handlePlanToggle(1)}
                  className="rounded"
                />
                <span>Essencial</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available_for_plans?.includes(2) || false}
                  onChange={() => handlePlanToggle(2)}
                  className="rounded"
                />
                <span>Evoluir</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available_for_plans?.includes(3) || false}
                  onChange={() => handlePlanToggle(3)}
                  className="rounded"
                />
                <span>Prime</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[#FFE3A0] text-[#033258] rounded-xl hover:bg-[#FFF3D6] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[#F59E0B] text-white rounded-xl hover:bg-[#D97706] transition-colors"
            >
              {activity ? 'Salvar Alterações' : 'Adicionar Atividade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};