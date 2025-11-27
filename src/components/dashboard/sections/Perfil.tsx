import * as React from "react";
import { Eye, EyeOff, Mail, Phone, CalendarDays, School, Camera, ExternalLink, Save, AlertCircle } from "lucide-react";
import { PlanBadge } from "../../ui/plan-badge";
import { Button } from "../../ui/button";
import { usePermissions } from '../../../hooks/usePermissions';
import { useProfile } from '../../../hooks/useProfile';
import { useAuth } from '../../../hooks/useAuth';
import { ChangePasswordModal } from '../../ui/ChangePasswordModal';

type PlanType = "Plano Essencial" | "Plano Evoluir" | "Plano Prime";

export const Perfil: React.FC = () => {
  const { currentPlan } = usePermissions();
  const { user } = useAuth();
  const { profile, loading, error, updateProfile, changePassword } = useProfile();

  // Form states
  const [editablePhone, setEditablePhone] = React.useState('');
  const [editableInstitution, setEditableInstitution] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = React.useState(false);

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditablePhone(profile.phone || '');
      setEditableInstitution(profile.institution || 'Adicione');
    }
  }, [profile]);

  // ------- Avatar: troca e preview local -------
  const [avatarUrl, setAvatarUrl] = React.useState<string>(() => {
    // Load saved avatar from localStorage
    return localStorage.getItem('userAvatar') || "/icon.webp";
  });
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  function onPickFile() {
    fileRef.current?.click();
  }
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validate file type
    if (!f.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('Por favor, selecione apenas arquivos JPG ou PNG.');
      return;
    }

    // Validate file size (2MB max)
    if (f.size > 2 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 2MB.');
      return;
    }

    // Convert to base64 and save
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setAvatarUrl(base64String);
      localStorage.setItem('userAvatar', base64String);

      // Trigger custom event to update header avatar
      window.dispatchEvent(new CustomEvent('avatarUpdated', {
        detail: { avatarUrl: base64String }
      }));
    };
    reader.readAsDataURL(f);
  }

  // Helper functions
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';

    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isGoogleLogin = user?.app_metadata?.provider === 'google';

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    setSaveMessage(null);

    try {
      const success = await updateProfile({
        phone: editablePhone,
        institution: editableInstitution === 'Adicione' ? '' : editableInstitution
      });

      if (success) {
        setSaveMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setIsEditing(false);
      } else {
        setSaveMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setSaveLoading(false);
    }

    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handlePasswordChange = async (newPassword: string): Promise<boolean> => {
    const success = await changePassword(newPassword);
    if (success) {
      setSaveMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
    return success;
  };

  const openGoogleAccount = () => {
    window.open('https://myaccount.google.com/', '_blank');
  };

  // ------- Senha: ver/ocultar (apenas visual) -------
  const [showPass, setShowPass] = React.useState(false);
  const masked = "********";

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F59E0B] mx-auto mb-4"></div>
          <p className="text-[#476178]">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 pb-12 md:pb-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-bold text-[#033258]">Perfil</h1>
        <div className="w-full sm:w-[320px]">
          <PlanBadge />
        </div>
      </div>

      {/* Success/Error Messages */}
      {saveMessage && (
        <div className={`mb-6 p-4 rounded-xl border ${
          saveMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px,1fr]">
        {/* Coluna esquerda: Avatar + ações */}
        <section className="rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl}
                className="h-28 w-28 rounded-full object-cover ring-2 ring-[#FFE3A0]"
                alt="Avatar"
              />
              <button
                onClick={onPickFile}
                className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-3 py-1 text-white shadow hover:bg-[#D97706]"
                title="Trocar avatar"
              >
                <Camera className="h-4 w-4" />
                Trocar
              </button>
            </div>

            <input
              ref={fileRef}
              onChange={onFileChange}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="hidden"
            />

            <div className="text-center">
              <p className="text-lg font-semibold text-[#033258]">{user?.name || 'Usuário'}</p>
              <p className="text-sm text-[#624044]">Gerencie suas informações pessoais</p>
            </div>
          </div>
        </section>

        {/* Coluna direita: Informações e senha */}
        <section className="rounded-2xl border border-[#FFE3A0] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#476178]">
                <Mail className="h-4 w-4" /> E-mail
              </label>
              <div className="rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2 text-[#033258]">
                {user?.email || 'Email não disponível'}
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#476178]">
                <Phone className="h-4 w-4" /> Telefone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="w-full rounded-xl border border-[#FFE3A0] bg-white px-3 py-2 text-[#033258] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  placeholder="Digite seu telefone"
                />
              ) : (
                <div className="rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2 text-[#033258]">
                  {editablePhone || 'Adicione'}
                </div>
              )}
            </div>

            {/* Instituição */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#476178]">
                <School className="h-4 w-4" /> Instituição
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editableInstitution}
                  onChange={(e) => setEditableInstitution(e.target.value)}
                  className="w-full rounded-xl border border-[#FFE3A0] bg-white px-3 py-2 text-[#033258] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
                  placeholder="Digite sua instituição"
                />
              ) : (
                <div className="rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2 text-[#033258]">
                  {editableInstitution || 'Adicione'}
                </div>
              )}
            </div>

            {/* Membro desde */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#476178]">
                <CalendarDays className="h-4 w-4" /> Membro desde
              </label>
              <div className="rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2 text-[#033258]">
                {formatDate(user?.created_at)}
              </div>
            </div>

            {/* Senha ou Login Google */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wide text-[#476178]">
                {isGoogleLogin ? 'Autenticação' : 'Senha'}
              </label>

              {isGoogleLogin ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2">
                    <span className="flex-1 text-[#033258]">
                      Sua conta é gerenciada pelo Google
                    </span>
                  </div>
                  <button
                    onClick={openGoogleAccount}
                    className="flex items-center gap-2 rounded-xl border border-[#FFE3A0] bg-white px-4 py-2 text-[#033258] hover:bg-[#FFF3D6] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Gerenciar Conta Google
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl border border-[#FFE3A0] bg-[#FFF9E8] px-3 py-2">
                    <span className="flex-1 text-[#033258]">
                      {showPass ? "Senha configurada" : masked}
                    </span>
                    <button
                      onClick={() => setShowPass((v) => !v)}
                      className="inline-flex items-center rounded-lg px-2 py-1 text-[#476178] hover:bg-white"
                      title={showPass ? "Ocultar" : "Mostrar informação"}
                    >
                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="rounded-xl border border-[#FFE3A0] bg-white px-4 py-2 text-[#033258] hover:bg-[#FFF3D6] transition-colors"
                  >
                    Alterar Senha
                  </button>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset to original values
                        if (profile) {
                          setEditablePhone(profile.phone || '');
                          setEditableInstitution(profile.institution || 'Adicione');
                        }
                      }}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={saveLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      disabled={saveLoading}
                      className="flex items-center gap-2 rounded-xl bg-[#F59E0B] px-4 py-2 text-white hover:bg-[#D97706] transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saveLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl bg-[#F59E0B] px-4 py-2 text-white hover:bg-[#D97706] transition-colors"
                  >
                    Editar Informações
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handlePasswordChange}
        loading={loading}
      />
    </div>
  );
};