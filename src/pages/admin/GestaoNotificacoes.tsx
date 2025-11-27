import { AdminLayout } from '../../components/layout/AdminLayout';
import { useState, useEffect } from 'react';
import { Bell, Send, Trash2, Pin, Clock, Users, Filter, Plus, X, Calendar, Link as LinkIcon, Tag, MessageSquare, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EMOJI_PALETTE = {
  sistema: ['📢', '📣', '🔔', '⚠️', 'ℹ️', '✅', '❗', '💬'],
  conquistas: ['🏆', '🎖️', '⭐', '🌟', '💫', '👑', '🥇', '🎯'],
  conteudo: ['📚', '📖', '📝', '🎓', '📘', '📕', '✏️', '📄'],
  bonus: ['🎁', '🎉', '🎊', '💝', '🎈', '✨', '🌈', '💎'],
  outros: ['❤️', '💙', '💚', '🔥', '💪', '👍', '🚀', '⚡'],
};

const BUTTON_COLORS = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'green', label: 'Verde', class: 'bg-green-600 hover:bg-green-700' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-600 hover:bg-purple-700' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-600 hover:bg-orange-700' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-600 hover:bg-red-700' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-600 hover:bg-pink-700' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-500 hover:bg-yellow-600' },
];

export default function GestaoNotificacoes() {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notificationType, setNotificationType] = useState<'broadcast' | 'individual'>('broadcast');
  const [users, setUsers] = useState<any[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: 'system',
    title: '',
    message: '',
    icon: '📢',
    button_color: 'blue',
    action_url: '',
    action_label: '',
    is_pinned: false,
    days_to_expire: 0,
    target_audience: 'all' as 'all' | 'plan_1' | 'plan_2' | 'plan_3',
  });
  const [filterActive, setFilterActive] = useState<boolean | 'all'>('all');
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_PALETTE>('sistema');

  useEffect(() => {
    loadBroadcasts();
    loadUsers();
  }, [filterActive]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, nome, email')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadBroadcasts = async () => {
    setLoading(true);
    let query = supabase
      .from('broadcast_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterActive !== 'all') {
      query = query.eq('is_active', filterActive);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao carregar broadcasts:', error);
      setBroadcasts([]);
    } else {
      // Para cada broadcast, buscar contagem de destinatários e leituras
      const broadcastsWithStats = await Promise.all(
        (data || []).map(async (broadcast) => {
          const { data: recipientCount } = await supabase.rpc('count_broadcast_recipients', {
            audience: broadcast.target_audience,
          });
          const { data: readCount } = await supabase.rpc('count_broadcast_reads', {
            broadcast_id_param: broadcast.id,
          });
          return {
            ...broadcast,
            recipient_count: recipientCount || 0,
            read_count: readCount || 0,
          };
        })
      );
      setBroadcasts(broadcastsWithStats);
    }
    setLoading(false);
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      alert('Preencha título e mensagem!');
      return;
    }

    if (notificationType === 'broadcast') {
      const { error } = await supabase.from('broadcast_notifications').insert({
        type: formData.type,
        title: formData.title,
        message: formData.message,
        icon: formData.icon,
        button_color: formData.button_color,
        action_url: formData.action_url || null,
        action_label: formData.action_label || null,
        is_pinned: formData.is_pinned,
        days_to_expire: formData.days_to_expire > 0 ? formData.days_to_expire : null,
        target_audience: formData.target_audience,
        is_active: true,
      });

      if (error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert('✅ Notificação broadcast enviada com sucesso!');
        setShowForm(false);
        resetForm();
        loadBroadcasts();
      }
    } else {
      // Notificação individual
      if (!selectedUser) {
        alert('Selecione um usuário!');
        return;
      }

      const { error } = await supabase.from('notifications').insert({
        user_id: selectedUser.id,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        icon: formData.icon,
        action_url: formData.action_url || null,
        action_label: formData.action_label || null,
        read: false,
        is_pinned: formData.is_pinned,
      });

      if (error) {
        alert(`Erro: ${error.message}`);
      } else {
        alert(`✅ Notificação enviada para ${selectedUser.email} com sucesso!`);
        setShowForm(false);
        resetForm();
        setSelectedUser(null);
        setSearchEmail('');
      }
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    if (!confirm('Deseja realmente deletar esta notificação? Ela será removida para TODOS os usuários.')) return;

    const { error } = await supabase.from('broadcast_notifications').delete().eq('id', id);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Notificação deletada para todos os usuários!');
      loadBroadcasts();
    }
  };

  const handleDeactivateExpired = async () => {
    const { error } = await supabase.rpc('deactivate_expired_broadcasts');
    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Notificações expiradas desativadas!');
      loadBroadcasts();
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'system',
      title: '',
      message: '',
      icon: '📢',
      button_color: 'blue',
      action_url: '',
      action_label: '',
      is_pinned: false,
      days_to_expire: 0,
      target_audience: 'all',
    });
    setEmojiCategory('sistema');
    setNotificationType('broadcast');
    setSelectedUser(null);
    setSearchEmail('');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      user.nome.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const formatDate = (date: string) => new Date(date).toLocaleString('pt-BR');

  const getButtonColorClass = (color: string) => {
    return BUTTON_COLORS.find((c) => c.value === color)?.class || 'bg-blue-600';
  };

  return (
    <AdminLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-600" />
            Gestão de Notificações
          </h1>
          <p className="text-gray-600 mt-1">Envie notificações broadcast para seus usuários</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nova Notificação
          </button>
          <button
            onClick={handleDeactivateExpired}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Desativar Expiradas
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterActive === 'all' ? 'all' : filterActive ? 'true' : 'false'}
              onChange={(e) => setFilterActive(e.target.value === 'all' ? 'all' : e.target.value === 'true')}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            >
              <option value="all">Todas</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas/Expiradas</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ícone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mensagem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Público</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alcance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {broadcasts.map((broadcast) => (
                    <tr key={broadcast.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-2xl">{broadcast.icon}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {broadcast.is_pinned && <Pin className="w-4 h-4 text-purple-600" />}
                          <span className="font-semibold text-gray-900">{broadcast.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-600">{broadcast.message}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {broadcast.target_audience === 'all'
                            ? 'Todos'
                            : 'Plano ' + broadcast.target_audience.replace('plan_', '')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-semibold">
                            {broadcast.read_count}/{broadcast.recipient_count}
                          </p>
                          <p className="text-gray-500 text-xs">leram</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {broadcast.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>Ativa
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                            Inativa
                          </span>
                        )}
                        {broadcast.expires_at && (
                          <p className="text-xs text-gray-500 mt-1">Expira: {formatDate(broadcast.expires_at)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(broadcast.created_at)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteBroadcast(broadcast.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Deletar para todos"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {notificationType === 'broadcast' ? 'Nova Notificação Broadcast' : 'Enviar Notificação Individual'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="border-b pb-4 mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Notificação</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setNotificationType('broadcast');
                          setSelectedUser(null);
                          setSearchEmail('');
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                          notificationType === 'broadcast'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        Broadcast (Todos)
                      </button>
                      <button
                        onClick={() => {
                          setNotificationType('individual');
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                          notificationType === 'individual'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Search className="w-4 h-4 inline mr-2" />
                        Usuário Específico
                      </button>
                    </div>
                  </div>

                  {notificationType === 'individual' && (
                    <div className="border-b pb-4 mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Procurar Usuário por Email
                      </label>
                      <input
                        type="text"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Digite email ou nome do usuário..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none mb-2"
                      />

                      {searchEmail && filteredUsers.length > 0 && (
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                          {filteredUsers.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                setSelectedUser(user);
                                setSearchEmail('');
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-purple-50 border-b last:border-b-0 transition-colors ${
                                selectedUser?.id === user.id ? 'bg-purple-100' : ''
                              }`}
                            >
                              <div className="font-semibold text-gray-900">{user.nome}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </button>
                          ))}
                        </div>
                      )}

                      {selectedUser && (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mt-2">
                          <div className="font-semibold text-green-900">{selectedUser.nome}</div>
                          <div className="text-sm text-green-700">{selectedUser.email}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Categoria da Notificação
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    >
                      <option value="system">Sistema</option>
                      <option value="achievement">Conquista</option>
                      <option value="new_content">Novo Conteúdo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Escolha um Emoji</label>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(Object.keys(EMOJI_PALETTE) as Array<keyof typeof EMOJI_PALETTE>).map((category) => (
                        <button
                          key={category}
                          onClick={() => setEmojiCategory(category)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                            emojiCategory === category
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-wrap p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      {EMOJI_PALETTE[emojiCategory].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className={`text-3xl p-3 rounded-lg border-2 transition-all ${
                            formData.icon === emoji
                              ? 'border-purple-500 bg-purple-50 scale-110'
                              : 'border-transparent hover:border-purple-300 hover:bg-white'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Nova atualização disponível!"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mensagem</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escreva a mensagem da notificação..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      URL de Ação (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.action_url}
                      onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                      placeholder="/atividades ou https://..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Esta URL será aberta quando o usuário clicar na notificação. Use URLs internas (/atividades) ou externas (https://...)
                    </p>
                  </div>

                  {formData.action_url && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Texto do Botão</label>
                        <input
                          type="text"
                          value={formData.action_label}
                          onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                          placeholder="Ex: Ver Agora"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Cor do Botão</label>
                        <div className="grid grid-cols-4 gap-2">
                          {BUTTON_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setFormData({ ...formData, button_color: color.value })}
                              className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                                color.class
                              } ${
                                formData.button_color === color.value
                                  ? 'ring-4 ring-offset-2 ring-purple-300'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              {color.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {notificationType === 'broadcast' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Público Alvo
                      </label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      >
                        <option value="all">Todos os Usuários</option>
                        <option value="plan_1">Plano Essencial</option>
                        <option value="plan_2">Plano Evoluir</option>
                        <option value="plan_3">Plano Prime</option>
                      </select>
                    </div>
                  )}

                  <div className="border-t-2 border-gray-100 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Configurações</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_pinned}
                          onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <Pin className="w-4 h-4" />
                            Notificação Fixa
                          </p>
                          <p className="text-sm text-gray-600">Permanece visível até ser lida pelo usuário</p>
                        </div>
                      </label>

                      {notificationType === 'broadcast' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Dias para Expirar (0 = permanente)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.days_to_expire}
                            onChange={(e) =>
                              setFormData({ ...formData, days_to_expire: parseInt(e.target.value) || 0 })
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                          />
                          {formData.days_to_expire > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              Expira em:{' '}
                              {new Date(Date.now() + formData.days_to_expire * 24 * 60 * 60 * 1000).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSendNotification}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Enviar Notificação
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
