import * as React from "react";
import {
  CreditCard, ArrowUpRight, LogOut, Bell, Mail, BellRing, Info, Pencil, Star, Crown,
  Shield, Users, Database, BarChart3, Settings, FileText, Video, Gift
} from "lucide-react";
import { Button } from "../../ui/button";
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminPlan } from '../../../hooks/useAdminPlan';
import { useNotifications } from '../../../hooks/useNotifications';
import { usePixelTracking } from '../../../hooks/usePixelTracking';
import { supabase } from '../../../lib/supabase';
import { CHECKOUT_LINKS } from '../../../constants/checkout';

// Plan types matching our permission system
type PlanKey = "demo" | "essencial" | "evoluir" | "prime" | "admin";
type PlanDisplay = "Demo/Gratuito" | "Plano Essencial" | "Plano Evoluir" | "Plano Prime" | "Admin";

const nextPlans: Record<PlanKey, PlanKey[]> = {
  "demo": ["essencial", "evoluir", "prime"],
  "essencial": ["evoluir", "prime"],
  "evoluir": ["prime"],
  "prime": [],
  "admin": [],
};

const planInfo: Record<PlanKey, {
  display: PlanDisplay;
  price: string;
  chip: string;
  text: string;
  ring: string;
  icon: React.ComponentType<any>;
}> = {
  "demo": {
    display: "Demo/Gratuito",
    price: "Gratuito (Funções bloqueadas)",
    chip: "bg-gradient-to-br from-red-100 to-red-200",
    text: "text-red-800",
    ring: "ring-1 ring-red-300/70",
    icon: Info,
  },
  "essencial": {
    display: "Plano Essencial",
    price: "R$ 17,99/mês",
    chip: "bg-gradient-to-br from-gray-100 to-gray-200",
    text: "text-gray-800",
    ring: "ring-1 ring-gray-300/70",
    icon: Pencil,
  },
  "evoluir": {
    display: "Plano Evoluir",
    price: "R$ 27,99/mês",
    chip: "bg-gradient-to-br from-blue-100 to-blue-200",
    text: "text-blue-900",
    ring: "ring-1 ring-blue-300/70",
    icon: Star,
  },
  "prime": {
    display: "Plano Prime",
    price: "R$ 49,99/mês",
    chip: "bg-gradient-to-br from-purple-100 to-purple-200",
    text: "text-purple-900",
    ring: "ring-1 ring-purple-300/70",
    icon: Crown,
  },
  "admin": {
    display: "Admin",
    price: "Todas as funcoes liberadas",
    chip: "bg-gradient-to-br from-green-100 to-green-200",
    text: "text-green-900",
    ring: "ring-1 ring-green-300/70",
    icon: Crown,
  },
};

export const Config: React.FC = () => {
  const { currentPlan } = usePermissions();
  const { signOut } = useAuth();
  const { isAdmin } = useAdminPlan();
  const { trackCheckoutOpen } = usePixelTracking();

  // Admin modal states
  const [showUserManagement, setShowUserManagement] = React.useState(false);
  const [showContentManagement, setShowContentManagement] = React.useState(false);
  const [showNotificationsManagement, setShowNotificationsManagement] = React.useState(false);

  // Stats state
  const [stats, setStats] = React.useState({
    atividades: 0,
    videos: 0,
    bonus: 0,
    usuarios: 0
  });

  // Fetch stats when admin
  React.useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [atividadesRes, videosRes, bonusRes, usuariosRes] = await Promise.all([
        supabase.from('atividades').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('bonus').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        atividades: atividadesRes.count || 0,
        videos: videosRes.count || 0,
        bonus: bonusRes.count || 0,
        usuarios: usuariosRes.count || 0
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleLogoutConfig = () => {
    signOut()
  }

  const handleCheckoutClick = (planKey: string, planDisplay: string, price: string) => {
    // Rastrear no pixel Utmify
    const priceNum = parseFloat(price.replace('R$ ', '').replace('/mês', '').replace(',', '.'));
    trackCheckoutOpen(planDisplay, isNaN(priceNum) ? undefined : priceNum);

    // Build URL with UTM parameters
    const params = new URLSearchParams(window.location.search);
    const utm_source = params.get('utm_source') || 'organic';
    const utm_medium = params.get('utm_medium') || 'config';
    const utm_campaign = params.get('utm_campaign') || planKey;
    const utm_content = params.get('utm_content') || 'upgrade-config';
    const utm_term = params.get('utm_term') || '';

    const checkoutUrl = CHECKOUT_LINKS[planKey as keyof typeof CHECKOUT_LINKS];
    const urlWithUtm = `${checkoutUrl}?utm_source=${utm_source}&utm_medium=${utm_medium}&utm_campaign=${utm_campaign}&utm_content=${utm_content}&utm_term=${utm_term}`;

    // Navegar para checkout na página atual
    window.location.href = urlWithUtm;
  }

  const upgrades = nextPlans[currentPlan as PlanKey];
  const currentPlanInfo = planInfo[currentPlan as PlanKey];
  const CurrentPlanIcon = currentPlanInfo.icon;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-12 md:pb-6">
      <header className="mb-6 flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#033258]">Configurações</h1>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF3D6] px-3 py-1 text-sm text-[#624044] ring-1 ring-[#FFE3A0]">
          <Info className="h-4 w-4" /> Personalize sua experiência no EdukaPrime
        </span>
      </header>

      {/* ADMIN PANEL - Only visible to admins */}
      {isAdmin && (
        <section className="mb-8 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Painel Administrativo</h2>
            <span className="rounded-full bg-red-200 px-3 py-1 text-xs font-medium text-red-800">
              Acesso Restrito
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* User Management */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Usuários</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">Gerenciar usuários e planos</p>
              <button
                onClick={() => setShowUserManagement(true)}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors"
              >
                Gerenciar Usuários
              </button>
            </div>

            {/* Content Management */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Conteúdo</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">CRUD de atividades, vídeos e bônus</p>
              <button
                onClick={() => setShowContentManagement(true)}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors"
              >
                Gerenciar Conteúdo
              </button>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Ações Rápidas</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700 transition-colors">
                  + Adicionar Atividade
                </button>
                <button className="w-full rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 transition-colors">
                  + Adicionar Vídeo
                </button>
                <button className="w-full rounded-lg bg-yellow-600 px-3 py-1.5 text-xs text-white hover:bg-yellow-700 transition-colors">
                  + Adicionar Bônus
                </button>
              </div>
            </div>

            {/* Notifications Management */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <Bell className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Notificações</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">Enviar notificações para usuários</p>
              <button
                onClick={() => setShowNotificationsManagement(true)}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 transition-colors"
              >
                Gerenciar Notificações
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-3 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-900">{stats.atividades}</div>
              <div className="text-xs text-red-700">Atividades</div>
            </div>
            <div className="rounded-lg bg-white p-3 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-900">{stats.videos}</div>
              <div className="text-xs text-red-700">Vídeos</div>
            </div>
            <div className="rounded-lg bg-white p-3 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-900">{stats.bonus}</div>
              <div className="text-xs text-red-700">Bônus</div>
            </div>
            <div className="rounded-lg bg-white p-3 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-900">{stats.usuarios}</div>
              <div className="text-xs text-red-700">Usuários</div>
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* NOTIFICAÇÕES */}
        <section className="rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-[#033258]">Notificações</h2>
          <p className="mb-4 text-sm text-[#624044]">
            Escolha como deseja ser avisado sobre novidades e atualizações.
          </p>

          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2">
              <span className="flex items-center gap-2 text-[#033258]">
                <Mail className="h-4 w-4" /> E-mail
              </span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#F59E0B]" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2">
              <span className="flex items-center gap-2 text-[#033258]">
                <Bell className="h-4 w-4" /> Push (navegador)
              </span>
              <input type="checkbox" className="h-5 w-5 accent-[#F59E0B]" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2">
              <span className="flex items-center gap-2 text-[#033258]">
                <BellRing className="h-4 w-4" /> Novidades e promoções
              </span>
              <input type="checkbox" defaultChecked className="h-5 w-5 accent-[#F59E0B]" />
            </label>
          </div>
        </section>


        {/* GERENCIAR PLANO (Atualizar Plano) */}
        <section className="md:col-span-2 rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#033258]">Gerenciar Plano</h2>
              <p className="text-sm text-[#624044]">Alterar ou cancelar sua assinatura.</p>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1 text-sm ${currentPlanInfo.chip} ${currentPlanInfo.text} ${currentPlanInfo.ring}`}>
              <CurrentPlanIcon className="h-4 w-4" />
              Plano atual: <strong className="ml-1">{currentPlanInfo.display}</strong>
            </span>
          </div>

          {/* CTA renomeado */}
          <div className="mb-4">
            <button
              onClick={() => {
                const plansSection = document.querySelector('[data-plans-section]');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-4 py-2 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              ⚡ Escolher Novo Plano
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </button>
          </div>

          {/* Mostrar apenas upgrades válidos */}
          {upgrades.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-plans-section>
              {upgrades.map((planKey) => {
                const plan = planInfo[planKey];
                const PlanIcon = plan.icon;
                return (
                  <div
                    key={planKey}
                    className={[
                      "relative overflow-hidden rounded-2xl p-5",
                      plan.chip, plan.ring, plan.text, "shadow-sm"
                    ].join(" ")}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-40">
                      <div className="absolute -top-10 -left-6 h-28 w-40 rotate-[15deg] bg-white/50 blur-2xl" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <PlanIcon className="h-5 w-5" />
                      <p className="text-xs/4 opacity-70">Upgrade disponível</p>
                    </div>
                    <h3 className="mb-1 text-xl font-bold">{plan.display}</h3>
                    <p className="text-sm opacity-80 mb-3">{plan.price}</p>
                    <button
                      onClick={() => handleCheckoutClick(planKey, plan.display, plan.price)}
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 px-4 py-2 text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      Migrar para {plan.display}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-xl border p-4 flex items-center gap-3 ${currentPlanInfo.chip} ${currentPlanInfo.ring} ${currentPlanInfo.text}`}>
              <Crown className="h-6 w-6 text-yellow-600" />
              <span className="font-medium">Você já está no plano mais completo! 🎉</span>
            </div>
          )}
        </section>


        {/* AJUDA & SAIR */}
        <section className="rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-[#033258]">Precisa de Ajuda?</h2>
          <p className="mb-4 text-sm text-[#624044]">
            Nossa equipe de suporte está sempre pronta para ajudar você.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-xl border border-[#FFE3A0] bg-white px-4 py-2 text-[#033258] hover:bg-[#FFF3D6]">Contatar Suporte</button>
            <button className="rounded-xl border border-[#FFE3A0] bg-white px-4 py-2 text-[#033258] hover:bg-[#FFF3D6]">Ver FAQ</button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-[#033258]">Sair da Conta</h2>
          <p className="mb-4 text-sm text-[#624044]">Fazer logout da sua sessão atual.</p>
          <button
            onClick={handleLogoutConfig}
            className="inline-flex items-center rounded-xl border border-[#FFE3A0] bg-white px-4 py-2 text-[#033258] hover:bg-[#FFF3D6] transition-colors duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </button>
        </section>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <UserManagementModal onClose={() => setShowUserManagement(false)} />
      )}

      {/* Content Management Modal */}
      {showContentManagement && (
        <ContentManagementModal onClose={() => setShowContentManagement(false)} />
      )}

      {/* Notifications Management Modal */}
      {showNotificationsManagement && (
        <NotificationsManagementModal onClose={() => setShowNotificationsManagement(false)} />
      )}
    </div>
  );
};

// User Management Modal Component
interface UserManagementModalProps {
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch users from Supabase
  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar usuários:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: number) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ plano_ativo: newPlan })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, plano_ativo: newPlan } : user
      ));
    } catch (err: any) {
      console.error('Erro ao atualizar plano:', err);
      alert('Erro ao atualizar plano: ' + err.message);
    }
  };

  const getPlanName = (plano: number) => {
    const plans = { 0: 'Demo', 1: 'Essencial', 2: 'Evoluir', 3: 'Prime', 5: 'Admin' };
    return plans[plano as keyof typeof plans] || 'Desconhecido';
  };

  const getPlanColor = (plano: number) => {
    const colors = {
      0: 'bg-gray-100 text-gray-800',
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-purple-100 text-purple-800',
      5: 'bg-red-100 text-red-800'
    };
    return colors[plano as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Gestão de Usuários</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Carregando usuários...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Erro ao carregar usuários:</div>
              <div className="text-sm text-gray-600 mb-4">{error}</div>
              <button
                onClick={fetchUsers}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Plano Atual</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Admin</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Cadastro</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(user.plano_ativo)}`}>
                            {getPlanName(user.plano_ativo)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.is_admin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.is_admin ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.plano_ativo}
                            onChange={(e) => updateUserPlan(user.id, Number(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value={0}>Demo</option>
                            <option value={1}>Essencial</option>
                            <option value={2}>Evoluir</option>
                            <option value={3}>Prime</option>
                            <option value={5}>Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Content Management Modal Component
interface ContentManagementModalProps {
  onClose: () => void;
}

const ContentManagementModal: React.FC<ContentManagementModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'atividades' | 'videos' | 'bonus'>('atividades');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Gestão de Conteúdo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('atividades')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'atividades'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📚 Atividades
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'videos'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎥 Vídeos
          </button>
          <button
            onClick={() => setActiveTab('bonus')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'bonus'
                ? 'border-b-2 border-yellow-500 text-yellow-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎁 Bônus
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'atividades' && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Atividades</h3>
              <p className="text-gray-600 mb-6">Aqui você pode gerenciar todas as atividades da plataforma</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                + Adicionar Nova Atividade
              </button>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Vídeos</h3>
              <p className="text-gray-600 mb-6">Aqui você pode gerenciar todos os vídeos da plataforma</p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                + Adicionar Novo Vídeo
              </button>
            </div>
          )}

          {activeTab === 'bonus' && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão de Bônus</h3>
              <p className="text-gray-600 mb-6">Aqui você pode gerenciar todos os materiais bônus</p>
              <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700">
                + Adicionar Novo Bônus
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Notifications Management Modal Component
interface NotificationsManagementModalProps {
  onClose: () => void;
}

const NotificationsManagementModal: React.FC<NotificationsManagementModalProps> = ({ onClose }) => {
  const { createNotification } = useNotifications();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    target_plans: [] as number[]
  });

  const planOptions = [
    { id: 0, name: 'Demo/Gratuito' },
    { id: 1, name: 'Essencial' },
    { id: 2, name: 'Evoluir' },
    { id: 3, name: 'Prime' },
    { id: 5, name: 'Admin' }
  ];

  const handlePlanToggle = (planId: number) => {
    setFormData(prev => ({
      ...prev,
      target_plans: prev.target_plans.includes(planId)
        ? prev.target_plans.filter(id => id !== planId)
        : [...prev.target_plans, planId]
    }));
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      target_plans: planOptions.map(p => p.id)
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      target_plans: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim() || formData.target_plans.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const result = await createNotification(formData);

      if (result.error) {
        alert(`Erro ao criar notificação: ${result.error}`);
      } else {
        alert('Notificação criada com sucesso!');
        setFormData({
          title: '',
          message: '',
          type: 'info',
          target_plans: []
        });
        onClose();
      }
    } catch (error) {
      alert('Erro inesperado ao criar notificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Notificações</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Notificação *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ex: 🎉 Novas atividades adicionadas!"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 caracteres</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descreva a notificação em detalhes..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 caracteres</p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo da Notificação
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="info">🔵 Informação</option>
                <option value="success">🟢 Sucesso</option>
                <option value="warning">🟡 Aviso</option>
                <option value="error">🔴 Erro</option>
              </select>
            </div>

            {/* Target Plans */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planos que receberão a notificação *
              </label>

              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Selecionar todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Desselecionar todos
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {planOptions.map((plan) => (
                  <label
                    key={plan.id}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.target_plans.includes(plan.id)}
                      onChange={() => handlePlanToggle(plan.id)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{plan.name}</span>
                  </label>
                ))}
              </div>

              {formData.target_plans.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Selecione pelo menos um plano</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim() || !formData.message.trim() || formData.target_plans.length === 0}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};