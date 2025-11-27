import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Trash2, Plus, Minus, Search, User, Image as ImageIcon, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { UserAvatar } from '../../components/ui/UserAvatar';

interface ChatMessageAdmin {
  id: string;
  user_id: string;
  message_text: string | null;
  image_url: string | null;
  created_at: string;
  is_visible: boolean;
  deleted_at: string | null;
  user_name: string;
  user_avatar: string | null;
  user_email: string;
}

interface UserStatsAdmin {
  user_id: string;
  total_points: number;
  user_name: string;
  user_email: string;
}

interface PlanAccess {
  plano_id: number;
  chat_enabled: boolean;
}

export default function ChatModeracao() {
  const [messages, setMessages] = useState<ChatMessageAdmin[]>([]);
  const [users, setUsers] = useState<UserStatsAdmin[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerButtonUrl, setBannerButtonUrl] = useState('');
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    loadMessages();
    loadUsers();
    loadBanner();
  }, []);

  const loadMessages = async () => {
    setLoading(true);

    try {
      // Buscar mensagens (excluir deletadas)
      const { data: messagesData, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);

      console.log('📩 [ADMIN] Mensagens carregadas:', messagesData);

      if (msgError) {
        console.error('❌ Erro ao carregar mensagens:', msgError);
        setLoading(false);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        console.log('ℹ️ Nenhuma mensagem encontrada');
        setMessages([]);
        setLoading(false);
        return;
      }

      // Buscar dados dos usuários
      const userIds = [...new Set(messagesData.map((m: any) => m.user_id))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, avatar_url, email')
        .in('id', userIds);

      console.log('👥 [ADMIN] Usuários carregados:', usersData);

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      const formatted: ChatMessageAdmin[] = messagesData.map((m: any) => {
        const user = usersMap.get(m.user_id);
        return {
          id: m.id,
          user_id: m.user_id,
          message_text: m.message_text,
          image_url: m.image_url,
          created_at: m.created_at,
          is_visible: m.is_visible,
          deleted_at: m.deleted_at,
          user_name: user?.nome || 'Usuário',
          user_avatar: user?.avatar_url || null,
          user_email: user?.email || '',
        };
      });

      console.log('✅ [ADMIN] Mensagens formatadas:', formatted);
      setMessages(formatted);
    } catch (error) {
      console.error('❌ Erro geral ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: statsData } = await supabase
        .from('chat_user_stats')
        .select('user_id, total_points')
        .order('total_points', { ascending: false });

      if (!statsData || statsData.length === 0) {
        setUsers([]);
        return;
      }

      const userIds = statsData.map((s) => s.user_id);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, email')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      const formatted: UserStatsAdmin[] = statsData.map((s) => {
        const user = usersMap.get(s.user_id);
        return {
          user_id: s.user_id,
          total_points: s.total_points,
          user_name: user?.nome || 'Usuário',
          user_email: user?.email || '',
        };
      });

      setUsers(formatted);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    }
  };

  const loadBanner = async () => {
    const { data, error } = await supabase
      .from('chat_banner')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (!error && data) {
      setBannerTitle(data.title || '');
      setBannerDescription(data.description || '');
      setBannerImageUrl(data.image_url || '');
      setBannerButtonUrl(data.button_url || '');
    }
  };

  const saveBanner = async () => {
    setSavingBanner(true);

    const { error } = await supabase
      .from('chat_banner')
      .update({
        title: bannerTitle,
        description: bannerDescription,
        image_url: bannerImageUrl,
        button_url: bannerButtonUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Banner atualizado com sucesso!');
    }

    setSavingBanner(false);
  };

  const handleDeleteMessage = async (messageId: string, imageUrl: string | null) => {
    const confirm = window.confirm('Tem certeza que deseja EXCLUIR esta mensagem?');
    if (!confirm) return;

    try {
      // Remover do estado local imediatamente (feedback visual instantâneo)
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Se tiver imagem, deletar do storage primeiro
      if (imageUrl) {
        const urlParts = imageUrl.split('/');
        const chatImagesIndex = urlParts.indexOf('chat-images');
        const path = chatImagesIndex !== -1 ? urlParts.slice(chatImagesIndex + 1).join('/') : urlParts[urlParts.length - 1];

        const { error: storageError } = await supabase.storage
          .from('chat-images')
          .remove([path]);

        if (storageError) {
          console.error('⚠️ Erro ao deletar imagem:', storageError);
        }
      }

      // Hard delete: remover permanentemente do banco
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erro ao excluir mensagem:', error);
        alert(`Erro: ${error.message}`);
        // Se der erro, recarregar para mostrar o estado real
        loadMessages();
      } else {
        console.log('✅ Mensagem excluída com sucesso:', messageId);
      }
    } catch (error: any) {
      console.error('❌ Erro ao excluir mensagem:', error);
      alert(`Erro: ${error.message}`);
      // Se der erro, recarregar para mostrar o estado real
      loadMessages();
    }
  };

  const handleUpdatePoints = async () => {
    if (!selectedUser) {
      alert('Selecione um usuário!');
      return;
    }

    if (pointsToAdd === 0) {
      alert('Digite uma quantidade de pontos (positivo para adicionar, negativo para remover)!');
      return;
    }

    try {
      console.log(`[ADMIN] Atualizando ${Math.abs(pointsToAdd)} ponto(s) para usuário ${selectedUser}`);

      // ✅ USAR FUNÇÃO RPC AO INVÉS DE UPDATE DIRETO
      // A função RPC contorna RLS com SECURITY DEFINER
      const { data, error } = await supabase
        .rpc('update_user_chat_points', {
          target_user_id: selectedUser,
          points_delta: pointsToAdd
        });

      if (error) {
        console.error('❌ Erro ao chamar RPC:', error);
        alert(`Erro: ${error.message}`);
        return;
      }

      // Verificar resposta da função
      if (!data || !data.success) {
        const errorMsg = data?.error || 'Erro desconhecido';
        console.error('❌ Função retornou erro:', errorMsg);
        alert(`❌ ${errorMsg}`);
        return;
      }

      // ✅ SUCESSO!
      console.log('✅ Pontos atualizados com sucesso!', data);
      alert(
        `✅ ${data.message}\n\n` +
        `Antes: ${data.old_points} pontos\n` +
        `Depois: ${data.new_points} pontos\n` +
        `Delta: ${data.delta > 0 ? '+' : ''}${data.delta}`
      );

      // Limpar campos e recarregar
      setPointsToAdd(0);
      setSelectedUser('');
      loadUsers();
    } catch (error: any) {
      console.error('❌ Erro inesperado:', error);
      alert(`Erro: ${error.message || 'Erro desconhecido ao atualizar pontos'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredMessages = messages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    return (
      msg.user_name.toLowerCase().includes(query) ||
      msg.user_email.toLowerCase().includes(query) ||
      msg.message_text?.toLowerCase().includes(query) ||
      false
    );
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderação do Chat</h1>
          <p className="text-gray-600 mt-1">Gerencie mensagens e pontos dos usuários</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Gerenciar Pontos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                Gerenciar Pontos
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Selecionar Usuário
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="">Escolha um usuário...</option>
                    {users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.user_name} ({user.total_points} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantidade de Pontos
                  </label>
                  <input
                    type="number"
                    value={pointsToAdd}
                    onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                    placeholder="Ex: 100 ou -50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use valores negativos para remover pontos
                  </p>
                </div>

                <button
                  onClick={handleUpdatePoints}
                  disabled={!selectedUser || pointsToAdd === 0}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pointsToAdd > 0 ? '➕ Adicionar Pontos' : '➖ Remover Pontos'}
                </button>
              </div>
            </div>

            {/* Top 10 */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Top 10 Pontos</h2>

              <div className="space-y-3">
                {users.slice(0, 10).map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.user_name}</p>
                        <p className="text-xs text-gray-500">{user.user_email}</p>
                      </div>
                    </div>
                    <span className="font-bold text-orange-500">{user.total_points}pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Configuração do Banner */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Banner do Chat
              </h2>

              <div className="space-y-4">
                {/* Preview */}
                {bannerImageUrl && (
                  <div className="border-2 border-purple-200 rounded-xl p-3 bg-purple-50">
                    <p className="text-xs font-semibold text-purple-700 mb-2">📱 Preview:</p>
                    <div className="bg-white rounded-lg p-3">
                      <img
                        src={bannerImageUrl}
                        alt="Preview"
                        className="w-full h-auto rounded-lg object-cover mb-2"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.alt = '❌ Erro ao carregar imagem';
                        }}
                      />
                      {bannerTitle && (
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{bannerTitle}</h3>
                      )}
                      {bannerDescription && (
                        <p className="text-xs text-gray-700 mb-2">{bannerDescription}</p>
                      )}
                      {bannerButtonUrl && (
                        <div className="inline-block px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-xs">
                          Ver Mais →
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 800x200px (formato wide)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Ex: Novidade na plataforma!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={bannerDescription}
                    onChange={(e) => setBannerDescription(e.target.value)}
                    placeholder="Descrição breve do banner..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL do Botão
                  </label>
                  <input
                    type="text"
                    value={bannerButtonUrl}
                    onChange={(e) => setBannerButtonUrl(e.target.value)}
                    placeholder="https://exemplo.com/destino (opcional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se configurado, o banner inteiro será clicável
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={saveBanner}
                    disabled={savingBanner || !bannerImageUrl}
                    className="py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingBanner ? 'Salvando...' : '💾 Salvar Banner'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Tem certeza que deseja remover o banner?')) return;
                      setSavingBanner(true);
                      const { error } = await supabase
                        .from('chat_banner')
                        .update({
                          title: '',
                          description: '',
                          image_url: '',
                          button_url: '',
                          updated_at: new Date().toISOString(),
                        })
                        .eq('id', '00000000-0000-0000-0000-000000000001');

                      if (error) {
                        alert(`Erro: ${error.message}`);
                      } else {
                        setBannerTitle('');
                        setBannerDescription('');
                        setBannerImageUrl('');
                        setBannerButtonUrl('');
                        alert('✅ Banner removido!');
                      }
                      setSavingBanner(false);
                    }}
                    disabled={savingBanner || !bannerImageUrl}
                    className="py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ Remover Banner
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Mensagens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">💬 Mensagens Recentes</h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Carregando mensagens...</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`border rounded-lg p-4 ${
                        !msg.is_visible ? 'bg-red-50 border-red-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <UserAvatar
                            avatarUrl={msg.user_avatar}
                            userName={msg.user_name}
                            size="sm"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 text-sm">{msg.user_name}</p>
                              <p className="text-xs text-gray-500">{msg.user_email}</p>
                            </div>

                            {msg.message_text && (
                              <p className="text-sm text-gray-700 mb-2">{msg.message_text}</p>
                            )}

                            {msg.image_url && (
                              <div className="mb-2">
                                <img
                                  src={msg.image_url}
                                  alt="Imagem"
                                  className="max-w-xs rounded-lg border border-gray-200"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(msg.created_at)}
                              </span>

                              {!msg.is_visible && (
                                <span className="text-red-600 font-semibold">🚫 OCULTA</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {msg.is_visible && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id, msg.image_url)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Excluir mensagem permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredMessages.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p>Nenhuma mensagem encontrada</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
