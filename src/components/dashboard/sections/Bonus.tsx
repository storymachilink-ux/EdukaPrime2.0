import React, { useState } from 'react';
import { Download, Plus, Edit, Loader2, AlertCircle } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import { AttractiveUpgradeModal } from '../../ui/AttractiveUpgradeModal';
import { useAdminPlan } from '../../../hooks/useAdminPlan';
import { useBonus, DatabaseBonus } from '../../../hooks/useDatabase';


export const BonusSection: React.FC = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<DatabaseBonus | null>(null);

  const { permissions } = usePermissions();
  const { isAdmin } = useAdminPlan();
  const { bonus, loading, error, addBonus, updateBonus, deleteBonus } = useBonus();


  // Admin functions
  const handleAddBonus = () => {
    setEditingBonus(null);
    setShowBonusModal(true);
  };

  const handleEditBonus = (bonusItem: DatabaseBonus) => {
    setEditingBonus(bonusItem);
    setShowBonusModal(true);
  };

  // If user doesn't have access to bonus, show upgrade modal content
  if (!permissions.canAccessBonus) {
    return (
      <>
        <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10">
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#033258] mb-2">
              Bônus
            </h1>
            <p className="text-sm md:text-base text-[#624044] mb-6 md:mb-8 px-2">
              Materiais extras para enriquecer sua prática pedagógica
            </p>
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-block animate-[float_4s_ease-in-out_infinite] max-w-sm md:max-w-none">
                <img
                  src="/bonushead.webp"
                  alt="Materiais Bônus EdukaPrime"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
            `}</style>
          </div>

          {/* Upgrade Content - Mobile Responsive */}
          <div className="text-center py-8 md:py-12">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 border border-[#FFE3A0] max-w-sm md:max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#FFF3D6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#033258] mb-2">
                  Acesso Restrito
                </h3>
                <p className="text-[#476178] mb-6">
                  Esta área é exclusiva para assinantes dos planos Evoluir e Prime
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl touch-manipulation"
                >
                  🚀 Liberar Acesso
                </button>
              </div>
            </div>
          </div>
        </section>

        <AttractiveUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B] mx-auto mb-4" />
          <p className="text-[#476178]">Carregando materiais bônus...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Erro ao carregar materiais bônus</p>
          <p className="text-sm text-[#476178]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-6 md:py-10 pb-8 md:pb-10">
      {/* Cabeçalho da seção - Mobile Optimized */}
      <div className="mb-6 md:mb-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-3 md:mb-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#033258]">
            Bônus
          </h1>
          {isAdmin && (
            <button
              onClick={handleAddBonus}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base touch-manipulation"
              title="Adicionar novo material bônus"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </button>
          )}
        </div>
        <p className="text-sm md:text-base text-[#624044] mb-4 md:mb-8 px-2">
          Materiais extras para enriquecer sua prática pedagógica
        </p>
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-block animate-[float_4s_ease-in-out_infinite] max-w-sm md:max-w-none">
            <img
              src="/bonushead.webp"
              alt="Materiais Bônus EdukaPrime"
              className="w-full h-auto"
            />
          </div>
        </div>
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>

      {/* Lista de materiais bônus - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-4 md:gap-6 px-1 md:px-0 pb-4 md:pb-0">
        {bonus.map((bonusItem) => (
          <article
            key={bonusItem.id}
            className="w-full min-w-0 max-w-full overflow-hidden bg-white border border-[#FFE3A0] rounded-lg md:rounded-2xl shadow-sm p-2 sm:p-4 md:p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 relative group touch-manipulation"
          >
            {/* Admin Edit Button */}
            {isAdmin && (
              <button
                onClick={() => handleEditBonus(bonusItem)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors touch-manipulation"
                title="Editar material bônus"
              >
                <Edit className="w-4 h-4 text-[#F59E0B]" />
              </button>
            )}
            <div className="space-y-1.5 md:space-y-4">
              {/* Image */}
              <div className="w-full">
                <img
                  src={bonusItem.icon || '/bonushead.webp'}
                  alt={bonusItem.title}
                  className="w-full h-auto rounded-md md:rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-[#F59E0B]"
                />
              </div>

              {/* Badge */}
              <div className="flex justify-start">
                <span className="inline-flex items-center px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-sm bg-[#FFF3D6] text-[#624044] border border-[#FFE3A0] font-medium">
                  {bonusItem.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xs md:text-lg font-bold text-[#033258] leading-tight line-clamp-2">
                {bonusItem.title}
              </h3>

              {/* Description */}
              <p className="text-[10px] md:text-base text-[#624044] leading-relaxed line-clamp-2 hidden sm:block">
                {bonusItem.description}
              </p>

              {/* Download Button */}
              <button
                onClick={() => window.open(bonusItem.drive_url, '_blank')}
                className="w-full inline-flex items-center justify-center gap-1 md:gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-md md:rounded-xl px-2 py-1.5 md:px-6 md:py-4 transition-colors duration-200 font-medium text-[10px] md:text-base touch-manipulation"
              >
                <Download className="w-3 h-3 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Baixar</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Bonus Management Modal */}
      {showBonusModal && (
        <BonusModal
          isOpen={showBonusModal}
          onClose={() => setShowBonusModal(false)}
          bonus={editingBonus}
          onSave={async (bonusData) => {
            try {
              if (editingBonus) {
                await updateBonus(editingBonus.id, bonusData);
              } else {
                await addBonus(bonusData);
              }
              setShowBonusModal(false);
              setEditingBonus(null);
            } catch (error) {
              console.error('Erro ao salvar bônus:', error);
              alert('Erro ao salvar bônus. Tente novamente.');
            }
          }}
          onDelete={editingBonus ? async () => {
            if (confirm('Tem certeza que deseja deletar este material bônus?')) {
              try {
                await deleteBonus(editingBonus.id);
                setShowBonusModal(false);
                setEditingBonus(null);
              } catch (error) {
                console.error('Erro ao deletar bônus:', error);
                alert('Erro ao deletar bônus. Tente novamente.');
              }
            }
          } : undefined}
          allBonus={bonus}
        />
      )}
    </section>
  );
};

// Bonus Modal Component
interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonus: DatabaseBonus | null;
  onSave: (bonus: Omit<DatabaseBonus, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: () => void;
  allBonus: DatabaseBonus[];
}

const BonusModal: React.FC<BonusModalProps> = ({
  isOpen,
  onClose,
  bonus,
  onSave,
  onDelete,
  allBonus
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    icon: '',
    drive_url: '',
    available_for_plans: [2, 3] as number[]
  });

  React.useEffect(() => {
    if (bonus) {
      setFormData({
        title: bonus.title,
        description: bonus.description,
        category: bonus.category,
        icon: bonus.icon || '',
        drive_url: bonus.drive_url,
        available_for_plans: bonus.available_for_plans
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        icon: '',
        drive_url: '',
        available_for_plans: [2, 3]
      });
    }
  }, [bonus]);

  const handleSave = () => {
    if (!formData.title || !formData.description || !formData.drive_url || !formData.category || formData.available_for_plans.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const bonusData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      icon: formData.icon,
      drive_url: formData.drive_url,
      available_for_plans: formData.available_for_plans,
      is_custom: true
    };

    onSave(bonusData);
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
    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm">
      {/* Modal - Full screen mobile, centered desktop */}
      <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2
                     w-full md:w-[520px] md:max-w-[90vw] bg-white md:rounded-2xl shadow-2xl
                     flex flex-col md:max-h-[90vh] overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-[#033258]">
            {bonus ? 'Editar Material Bônus' : 'Adicionar Novo Material Bônus'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-yellow-200 rounded-xl transition-colors touch-manipulation"
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6 text-[#476178]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-4 md:space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                placeholder="Digite o título do material bônus"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base resize-none"
                placeholder="Descreva o material bônus"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Categoria *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                placeholder="Ex: E-book/PDF, Template/Atividade"
              />
            </div>

            {/* Icon URL */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                URL do Ícone
              </label>
              <input
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                placeholder="https://exemplo.com/icone.jpg"
              />
            </div>

            {/* Download Link */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Link de Download *
              </label>
              <input
                type="url"
                value={formData.drive_url}
                onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                className="w-full px-3 py-3 border border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-base"
                placeholder="Link do Google Drive ou outro"
              />
            </div>

            {/* Plan Visibility */}
            <div>
              <label className="block text-sm font-medium text-[#033258] mb-2">
                Planos com Acesso *
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {[
                  { number: 1, name: 'Essencial', icon: '📝' },
                  { number: 2, name: 'Evoluir', icon: '📈' },
                  { number: 3, name: 'Prime', icon: '👑' }
                ].map(plan => (
                  <label key={plan.number} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.available_for_plans.includes(plan.number)}
                      onChange={() => handlePlanToggle(plan.number)}
                      className="w-4 h-4 text-yellow-500 bg-gray-100 border-gray-300 rounded focus:ring-yellow-400 focus:ring-2"
                    />
                    <span className="text-sm md:text-base">{plan.icon} {plan.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Mobile/Desktop Actions */}
        <div className="p-4 md:p-6 bg-white border-t border-yellow-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 border border-yellow-200 text-[#033258] rounded-xl hover:bg-yellow-50 transition-colors touch-manipulation font-medium"
            >
              Cancelar
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors touch-manipulation font-medium"
              >
                Deletar
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-colors touch-manipulation font-medium"
            >
              {bonus ? 'Salvar Alterações' : 'Adicionar Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};