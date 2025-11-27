import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Trophy, Send, Image as ImageIcon, Loader, X, Users, AlertTriangle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { planService } from '../lib/planService';
import { UserAvatar } from '../components/ui/UserAvatar';
import { NeonCheckbox } from '../components/ui/animated-check-box';
import { AttractiveUpgradeModal } from '../components/ui/AttractiveUpgradeModal';

interface ChatMessage {
  id: string;
  user_id: string;
  message_text: string | null;
  image_url: string | null;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
  user_points: number;
  is_admin?: boolean;
  ranking_position?: number;
}

interface UserStats {
  user_id: string;
  total_points: number;
  last_message_at: string | null;
  user_name?: string;
  user_avatar?: string | null;
}

interface ChatBanner {
  title: string;
  description: string;
  image_url: string;
  button_url: string;
}

export default function Ranking() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rankings, setRankings] = useState<UserStats[]>([]);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [banner, setBanner] = useState<ChatBanner | null>(null);
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkChatAccess();
    checkTermsAcceptance();
    loadRankings();
    loadMessages();
    loadBanner();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkCooldown();
  }, []);

  const scrollToBottom = () => {
    // Usar scrollTop no container ao invés de scrollIntoView para não afetar a página
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const checkChatAccess = async () => {
    if (!profile?.id) return;

    try {
      // Usar a nova função robusta de feature access
      const hasAccess = await planService.hasAccessToFeature(profile.id, 'comunidade');
      setChatEnabled(hasAccess);
    } catch (error) {
      console.error('❌ Erro ao verificar acesso ao chat:', error);
      setChatEnabled(false);
    }
  };

  const checkTermsAcceptance = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('users')
      .select('chat_terms_accepted')
      .eq('id', profile.id)
      .single();

    if (!error && data) {
      const accepted = data.chat_terms_accepted || false;
      setTermsAccepted(accepted);
      if (!accepted) {
        setShowTermsModal(true);
      }
    }
  };

  const checkCooldown = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('chat_user_stats')
      .select('last_message_at')
      .eq('user_id', profile.id)
      .single();

    if (data?.last_message_at) {
      const lastMessage = new Date(data.last_message_at).getTime();
      const now = Date.now();
      const diff = 3000 - (now - lastMessage); // 3 segundos

      if (diff > 0) {
        setCooldown(Math.ceil(diff / 1000));
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const loadRankings = async () => {
    const { data, error } = await supabase
      .from('chat_user_stats')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(10);

    if (!error && data) {
      // Buscar dados dos usuários
      const userIds = data.map(stat => stat.user_id);
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, avatar_url')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      const rankingsWithUsers = data.map(stat => {
        const user = usersMap.get(stat.user_id);
        return {
          ...stat,
          user_name: user?.nome || 'Usuário',
          user_avatar: user?.avatar_url || null,
        };
      });

      setRankings(rankingsWithUsers);
    }
  };

  const loadBanner = async () => {
    const { data, error } = await supabase
      .from('chat_banner')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .eq('active', true)
      .single();

    if (!error && data && data.image_url) {
      setBanner({
        title: data.title || '',
        description: data.description || '',
        image_url: data.image_url,
        button_url: data.button_url || '',
      });
    }
  };

  const loadMessages = async () => {
    try {
      const { data: messagesData, error: msgError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_visible', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (msgError) {
        console.error('❌ Erro ao carregar mensagens:', msgError);
        setLoading(false);
        return;
      }

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(messagesData.map((m: any) => m.user_id))];
      const { data: usersData } = await supabase
        .from('users')
        .select('id, nome, avatar_url, is_admin')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      const { data: statsData } = await supabase
        .from('chat_user_stats')
        .select('user_id, total_points')
        .in('user_id', userIds);

      const pointsMap = new Map(statsData?.map((s) => [s.user_id, s.total_points]) || []);

      // Calcular ranking (top 3)
      const sortedStats = [...(statsData || [])].sort((a, b) => b.total_points - a.total_points);
      const rankingMap = new Map(sortedStats.map((s, index) => [s.user_id, index + 1]));

      const formatted: ChatMessage[] = messagesData.map((m: any) => {
        const user = usersMap.get(m.user_id);
        const position = rankingMap.get(m.user_id);
        return {
          id: m.id,
          user_id: m.user_id,
          message_text: m.message_text,
          image_url: m.image_url,
          created_at: m.created_at,
          user_name: user?.nome || 'Usuário',
          user_avatar: user?.avatar_url || null,
          user_points: pointsMap.get(m.user_id) || 0,
          is_admin: user?.is_admin || false,
          ranking_position: position && position <= 3 ? position : undefined,
        };
      });

      setMessages(formatted);
    } catch (error) {
      console.error('❌ Erro geral ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('❌ Imagem muito grande! Máximo 2MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAcceptTerms = async () => {
    if (!termsChecked) {
      alert('⚠️ Você precisa marcar o checkbox para aceitar os termos.');
      return;
    }

    if (!profile?.id) return;

    const { error } = await supabase
      .from('users')
      .update({
        chat_terms_accepted: true,
        chat_terms_accepted_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (!error) {
      setTermsAccepted(true);
      setShowTermsModal(false);
    } else {
      alert('❌ Erro ao aceitar termos. Tente novamente.');
    }
  };

  const handleSendMessage = async () => {
    if (!profile?.id) return;

    if (!termsAccepted) {
      setShowTermsModal(true);
      alert('⚠️ Você precisa aceitar os termos para usar o chat.');
      return;
    }

    if (!chatEnabled) {
      setShowUpgradeModal(true);
      return;
    }

    if (!messageText.trim() && !imageFile) {
      alert('❌ Digite uma mensagem ou selecione uma imagem!');
      return;
    }

    if (cooldown > 0) {
      alert(`⏳ Aguarde ${cooldown} segundos para enviar outra mensagem.`);
      return;
    }

    setSending(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${profile.id}/chat_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: messageError } = await supabase.from('chat_messages').insert({
        user_id: profile.id,
        message_text: messageText.trim() || null,
        image_url: imageUrl,
      });

      if (messageError) throw messageError;

      const { data: existingStats } = await supabase
        .from('chat_user_stats')
        .select('total_points')
        .eq('user_id', profile.id)
        .single();

      if (existingStats) {
        await supabase
          .from('chat_user_stats')
          .update({
            total_points: existingStats.total_points + 10,
            last_message_at: new Date().toISOString(),
          })
          .eq('user_id', profile.id);
      } else {
        await supabase.from('chat_user_stats').insert({
          user_id: profile.id,
          total_points: 10,
          last_message_at: new Date().toISOString(),
        });
      }

      setMessageText('');
      setImageFile(null);
      setImagePreview(null);

      loadMessages();
      loadRankings();

      setCooldown(3);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const getPointsColor = (points: number): string => {
    if (points >= 5000) return 'text-yellow-600';
    if (points >= 3000) return 'text-orange-500';
    if (points >= 2000) return 'text-purple-500';
    if (points >= 1000) return 'text-green-500';
    return 'text-blue-500';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="w-8 h-8 text-orange-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#0F2741]">Comunidade EdukaPrime</h1>
            </div>
            <p className="text-gray-600">Converse, compartilhe e ganhe pontos a cada mensagem</p>
          </div>

          {/* Layout: Ranking + Chat */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* RANKING - Card Glassmorphism */}
            <div className="lg:col-span-4">
              <div className="relative w-full">
                {/* Card com efeito de vidro */}
                <div className="relative z-10 w-full overflow-hidden rounded-3xl backdrop-blur-xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                  <div className="p-6">
                    {/* Header */}
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">Os Melhores!! 🥳</h2>
                      </div>
                      <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    </div>

                    {/* Rankings */}
                    <div className="space-y-3">
                      {rankings.map((user, index) => (
                        <div
                          key={user.user_id}
                          className={`flex items-center justify-between rounded-2xl p-3 transition-all backdrop-blur-sm ${
                            user.user_id === profile?.id
                              ? 'bg-gradient-to-r from-green-500/30 to-blue-500/30 ring-2 ring-green-400/50 shadow-lg'
                              : 'bg-white/40 hover:bg-white/60 border border-white/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-md ${
                                index === 0
                                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900'
                                  : index === 1
                                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                                  : index === 2
                                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900'
                                  : 'bg-gray-200/80 text-gray-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <UserAvatar
                              avatarUrl={user.user_avatar}
                              userName={user.user_name || 'Usuário'}
                              size="sm"
                            />
                            <p className="text-sm font-semibold text-gray-900">
                              {user.user_id === profile?.id ? 'Você' : user.user_name}
                            </p>
                          </div>
                          <p className={`text-xs font-bold ${getPointsColor(user.total_points)}`}>
                            {user.total_points}pts
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Banner AD */}
                  {banner && (
                    <div className="mt-6">
                      <div
                        className={`relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all ${
                          banner.button_url ? 'cursor-pointer hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5)] hover:scale-[1.02]' : ''
                        }`}
                        onClick={() => {
                          if (banner.button_url) {
                            window.open(banner.button_url, '_blank');
                          }
                        }}
                      >
                        <div className="p-4">
                          {banner.image_url && (
                            <div className="mb-3">
                              <img
                                src={banner.image_url}
                                alt={banner.title}
                                className="w-full h-auto rounded-xl object-cover"
                              />
                            </div>
                          )}
                          {banner.title && (
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{banner.title}</h3>
                          )}
                          {banner.description && (
                            <p className="text-sm text-gray-700 mb-3">{banner.description}</p>
                          )}
                          {banner.button_url && (
                            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm shadow-md pointer-events-none">
                              Ver Mais →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CHAT - Estilo Glassmorphism */}
            <div className="lg:col-span-8">
              <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                {/* Header do Chat */}
                <div className="backdrop-blur-sm bg-gradient-to-r from-green-500/40 to-emerald-500/40 p-4 border-b border-white/30">
                  <div className="flex items-center gap-3">
                    <img
                      src="/be01.webp"
                      alt="Grupo EdukaPrime"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                    />
                    <div>
                      <h2 className="text-gray-900 font-bold text-lg">Grupo EdukaPrime</h2>
                      <p className="text-gray-700 text-sm">Compartilhe sugestões que possam ajudar outras mães e professoras na rotina educativa.</p>
                    </div>
                  </div>
                </div>

                {/* Mensagens */}
                <div
                  ref={messagesContainerRef}
                  className={`h-[500px] overflow-y-auto p-4 space-y-4 relative ${!chatEnabled ? 'blur-sm select-none pointer-events-none' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p>Nenhuma mensagem ainda. Seja o primeiro!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.user_id === profile?.id;

                      return (
                        <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <div className="relative flex-shrink-0">
                            <div
                              className={`rounded-full ${
                                msg.ranking_position === 1
                                  ? 'ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                                  : msg.ranking_position === 2
                                  ? 'ring-2 ring-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]'
                                  : msg.ranking_position === 3
                                  ? 'ring-2 ring-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]'
                                  : ''
                              }`}
                            >
                              <UserAvatar
                                avatarUrl={msg.user_avatar}
                                userName={msg.user_name}
                                size="sm"
                              />
                            </div>
                          </div>

                          <div className={`flex-1 max-w-[70%] ${isMe ? 'items-end' : ''}`}>
                            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <div className="flex items-center gap-1">
                                {msg.is_admin && (
                                  <Shield className="w-3 h-3 text-red-500" title="Administrador" />
                                )}
                                <p className={`text-xs font-bold text-[#0F2741]`}>
                                  {isMe ? 'Você' : msg.user_name}
                                </p>
                              </div>
                              {msg.is_admin ? (
                                <p className="text-xs font-bold text-red-500">
                                  Administrador
                                </p>
                              ) : (
                                <p className={`text-xs font-bold ${getPointsColor(msg.user_points)}`}>
                                  {msg.user_points}pts
                                </p>
                              )}
                            </div>

                            <div
                              className={`rounded-2xl p-3 shadow-lg ${
                                isMe
                                  ? 'backdrop-blur-md bg-green-200/60 text-gray-900 rounded-br-sm border-2 border-green-300/40'
                                  : 'backdrop-blur-md bg-purple-200/50 text-gray-900 rounded-bl-sm border-2 border-purple-300/40'
                              }`}
                            >
                              {msg.message_text && <p className="text-sm leading-relaxed">{msg.message_text}</p>}

                              {msg.image_url && (
                                <div
                                  className="mt-2 relative border-4 border-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                  style={{ maxWidth: '120px' }}
                                  onClick={() => setModalImage(msg.image_url)}
                                >
                                  <img
                                    src={msg.image_url}
                                    alt="Imagem"
                                    className="w-full h-auto"
                                  />
                                  {/* Moldura de foto */}
                                  <div className="absolute inset-0 border-2 border-gray-200 rounded-lg pointer-events-none"></div>
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mt-1">{formatTime(msg.created_at)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Overlay de Chat Desabilitado */}
                {!chatEnabled && (
                  <div className="absolute inset-0 top-[88px] flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center border-4 border-white">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-2xl font-bold mb-3">Chat Desabilitado</h3>
                      <p className="text-white/90 mb-4">
                        O acesso ao chat não está disponível para o seu plano atual.
                      </p>
                      <p className="text-lg font-semibold bg-white/20 rounded-lg p-3">
                        Faça upgrade para ter acesso ao chat e ganhar pontos!
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview da Imagem */}
                {imagePreview && (
                  <div className={`px-4 pb-2 ${!chatEnabled ? 'blur-sm pointer-events-none' : ''}`}>
                    <div className="relative inline-block border-4 border-white shadow-lg rounded-lg">
                      <img src={imagePreview} alt="Preview" className="h-24 rounded" />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Input - Glassmorphism */}
                <div className="backdrop-blur-sm bg-white/40 border-t border-white/30 p-4">
                  {!chatEnabled ? (
                    <div className="backdrop-blur-md bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-4 text-center">
                      <p className="text-red-900 text-sm font-bold mb-2">
                        🚫 Chat desabilitado para o seu plano
                      </p>
                      <p className="text-red-800 text-xs">
                        Faça upgrade para ter acesso ao chat e ganhar pontos!
                      </p>
                    </div>
                  ) : cooldown > 0 ? (
                    <div className="backdrop-blur-md bg-orange-500/20 border-2 border-orange-400/50 rounded-2xl p-3 text-center">
                      <p className="text-orange-900 text-sm font-bold">
                        ⏳ Aguarde {cooldown}s para enviar outra mensagem
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || !chatEnabled}
                        className="p-3 backdrop-blur-sm bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-xl transition-colors disabled:opacity-50 shadow-md border border-white/20"
                        title="Enviar imagem"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>

                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !sending && chatEnabled && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        disabled={sending || !chatEnabled}
                        className="flex-1 px-4 py-3 backdrop-blur-sm bg-white/60 border-2 border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 placeholder-gray-600"
                      />

                      <button
                        onClick={handleSendMessage}
                        disabled={sending || (!messageText.trim() && !imageFile) || !chatEnabled}
                        className="p-3 backdrop-blur-sm bg-green-600/80 hover:bg-green-700/80 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md border border-white/20"
                      >
                        {sending ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Regras do Chat - Accordion Colapsável */}
            <div className="lg:col-span-12 mt-6">
              <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/30 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                {/* Título Clicável */}
                <button
                  onClick={() => setRulesExpanded(!rulesExpanded)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/20 transition-colors"
                >
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    📌 Regras de Educação no Chat
                  </h3>
                  {rulesExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-700 transition-transform" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-700 transition-transform" />
                  )}
                </button>

                {/* Conteúdo Colapsável */}
                {rulesExpanded && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <ul className="space-y-3 text-gray-800 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span>Respeite todos os participantes, evitando ofensas ou palavras de baixo calão.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span>Mantenha o foco em temas educativos, trocando ideias, dicas e experiências que possam ajudar.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span>Evite spam, propagandas ou links que não tenham relação com o grupo.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span>Valorize a diversidade de opiniões e contribua de forma construtiva.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span>Seja claro e objetivo nas mensagens para facilitar a comunicação de todos.</span>
                      </li>
                    </ul>

                    <div className="backdrop-blur-md bg-red-500/15 border-2 border-dashed border-red-400/50 rounded-xl p-4 text-center">
                      <p className="text-red-800 font-bold text-sm md:text-base flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        Descumprimento das regras resultará na perda da conta
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Imagem Ampliada */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-4 right-4 bg-white text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={modalImage}
            alt="Imagem ampliada"
            className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal de Aceite de Termos */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border-2 border-red-500 p-8">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </div>

            <div className="mb-6 flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <NeonCheckbox
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                />
              </div>
              <p className="text-gray-800 text-base font-medium leading-relaxed flex-1">
                Concordo em seguir as regras da plataforma, ciente de que o <span className="text-red-600 font-bold">descumprimento pode resultar em banimento</span>.
              </p>
            </div>

            <button
              onClick={handleAcceptTerms}
              disabled={!termsChecked}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                termsChecked
                  ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Upgrade para Chat */}
      <AttractiveUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </DashboardLayout>
  );
}
