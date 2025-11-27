import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CreditCard, HelpCircle, LogOut, User, Upload, Trash2 } from 'lucide-react';
import { UserAvatar } from '../components/ui/UserAvatar';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Configuracoes() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validações
    if (file.size > 2 * 1024 * 1024) {
      alert('❌ Arquivo muito grande! Máximo 2MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Formato inválido! Use JPG, PNG, GIF ou WEBP.');
      return;
    }

    setUploading(true);

    try {
      // Nome do arquivo: userId_timestamp.extensao
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar_${Date.now()}.${fileExt}`;

      // Upload para o bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar perfil com a nova URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      alert('✅ Avatar atualizado com sucesso!');
      window.location.reload(); // Recarregar para atualizar o avatar
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      alert(`❌ Erro ao atualizar avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.id) return;

    const confirmRemove = window.confirm('Tem certeza que deseja remover seu avatar?');
    if (!confirmRemove) return;

    setUploading(true);

    try {
      // Atualizar perfil para null
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: null })
        .eq('id', profile.id);

      if (error) throw error;

      alert('✅ Avatar removido!');
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao remover avatar:', error);
      alert(`❌ Erro ao remover avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const planos = [
    { id: 1, nome: 'Essencial', preco: 'R$ 17,99/mês' },
    { id: 2, nome: 'Evoluir', preco: 'R$ 27,99/mês' },
    { id: 3, nome: 'Prime', preco: 'R$ 49,99/mês' },
  ];

  const planoAtual = profile?.active_plan_id || 0;

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Personalize sua experiência no EdukaPrime</p>
        </div>

        {/* Avatar */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Meu Avatar</h2>
          </div>
          <p className="text-gray-600 mb-6">Personalize sua foto de perfil</p>

          <div className="flex items-center gap-6">
            {/* Preview do Avatar */}
            <UserAvatar
              avatarUrl={profile?.avatar_url}
              userName={profile?.nome || 'Usuário'}
              size="xl"
            />

            {/* Botões de ação */}
            <div className="flex-1">
              <div className="flex gap-3 mb-3">
                <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Enviando...' : 'Trocar Avatar'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {profile?.avatar_url && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="border border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>ℹ️ Formatos aceitos: JPG, PNG, GIF, WEBP</p>
                <p>ℹ️ Tamanho máximo: 2MB</p>
                <p>ℹ️ Recomendado: imagens quadradas (200x200px)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Notificações</h2>
          </div>
          <p className="text-gray-600 mb-4">Escolha como deseja ser avisado sobre novidades e atualizações.</p>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500" />
              <span>📧 E-mail</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-orange-500" />
              <span>🔔 Push (navegador)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500" />
              <span>🔔 Novidades e promoções</span>
            </label>
          </div>
        </div>

        {/* Gerenciar Plano */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Gerenciar Plano</h2>
          </div>
          <p className="text-gray-600 mb-4">Alterar ou cancelar sua assinatura.</p>

          <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-lg mb-6">
            <strong>Plano atual:</strong>{' '}
            {planoAtual === 0 && 'Gratuito'}
            {planoAtual === 1 && 'Essencial'}
            {planoAtual === 2 && 'Evoluir'}
            {planoAtual === 3 && 'Prime'}
          </div>

          {planoAtual === 3 ? (
            <p className="text-green-600 font-semibold">Você já está no plano mais completo! 🎉</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planos.map((plano) => (
                plano.id > planoAtual && (
                  <div key={plano.id} className="border border-gray-200 rounded-lg p-4">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                      Upgrade disponível
                    </span>
                    <h3 className="font-bold text-lg mt-2">Plano {plano.nome}</h3>
                    <p className="text-2xl font-bold text-orange-500 my-2">{plano.preco}</p>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold">
                      Migrar para {plano.nome}
                    </button>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Ajuda */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold">Precisa de Ajuda?</h2>
          </div>
          <p className="text-gray-600 mb-4">Nossa equipe de suporte está sempre pronta para ajudar você.</p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/suporte')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Contatar Suporte
            </button>
            <button
              onClick={() => navigate('/suporte')}
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold"
            >
              Ver FAQ
            </button>
          </div>
        </div>

        {/* Sair */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">Sair da Conta</h2>
          </div>
          <p className="text-gray-600 mb-4">Fazer logout da sua sessão atual.</p>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Sair
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}