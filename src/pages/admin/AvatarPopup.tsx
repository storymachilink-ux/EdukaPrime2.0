import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Bot, Eye, Monitor, Smartphone, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AvatarPopup() {
  const [avatarImageUrl, setAvatarImageUrl] = useState('');
  const [messageText, setMessageText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [showOnFirstVisit, setShowOnFirstVisit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');

  // Função para quebrar texto a cada 15 caracteres (mesma do FloatingAvatar)
  const formatMessageText = (text: string) => {
    const maxCharsPerLine = 15;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    return lines;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from('avatar_popup')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000002')
      .single();

    if (!error && data) {
      setAvatarImageUrl(data.avatar_image_url || '');
      setMessageText(data.message_text || '');
      setLinkUrl(data.link_url || '');
      setIsActive(data.is_active || false);
      setShowOnFirstVisit(data.show_on_first_visit || false);
    }
  };

  const saveConfig = async () => {
    // Validar mensagem com mínimo de 5 palavras
    const wordCount = messageText.trim().split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 5) {
      alert(`❌ A mensagem deve ter no mínimo 5 palavras para quebrar a linha.\nVocê tem apenas ${wordCount} palavra(s).`);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('avatar_popup')
      .update({
        avatar_image_url: avatarImageUrl,
        message_text: messageText,
        link_url: linkUrl,
        is_active: isActive,
        show_on_first_visit: showOnFirstVisit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000002');

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('✅ Configuração salva com sucesso!');
    }

    setSaving(false);
  };

  const clearConfig = async () => {
    if (!confirm('Tem certeza que deseja limpar todas as configurações?')) return;

    setSaving(true);

    const { error } = await supabase
      .from('avatar_popup')
      .update({
        avatar_image_url: '',
        message_text: '',
        link_url: '',
        is_active: false,
        show_on_first_visit: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', '00000000-0000-0000-0000-000000000002');

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      setAvatarImageUrl('');
      setMessageText('');
      setLinkUrl('');
      setIsActive(false);
      setShowOnFirstVisit(false);
      alert('✅ Configuração limpa!');
    }

    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Avatar Flutuante Pop-up</h1>
          <p className="text-gray-600 mt-1">Configure o avatar interativo que aparece na tela dos usuários</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="space-y-6">
            {/* Ativação Global */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Configuração Global
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Ativar Avatar</p>
                    <p className="text-xs text-gray-500">Mostrar avatar para todos os usuários</p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isActive ? '✅ Ativo' : '❌ Inativo'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Abrir na Primeira Visita</p>
                    <p className="text-xs text-gray-500">Mensagem abre automaticamente para novos visitantes</p>
                  </div>
                  <button
                    onClick={() => setShowOnFirstVisit(!showOnFirstVisit)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      showOnFirstVisit
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showOnFirstVisit ? '✅ Sim' : '❌ Não'}
                  </button>
                </div>
              </div>
            </div>

            {/* Imagem do Avatar */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🖼️ Imagem do Avatar</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da Imagem PNG
                  </label>
                  <input
                    type="text"
                    value={avatarImageUrl}
                    onChange={(e) => setAvatarImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/avatar.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: PNG transparente, tamanho 120x120px
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagem */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">💬 Mensagem Pop-up</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texto da Mensagem
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Olá! Precisa de ajuda? Clique aqui para acessar o suporte."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                  {(() => {
                    const wordCount = messageText.trim().split(/\s+/).filter(word => word.length > 0).length;
                    const isValid = wordCount >= 5;
                    return (
                      <p className={`text-xs mt-1 font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {isValid ? '✅' : '❌'} {wordCount} {wordCount === 1 ? 'palavra' : 'palavras'} {!isValid && `(mínimo 5 para quebrar linha)`}
                      </p>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Link (Opcional)
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://exemplo.com/suporte"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se preenchido, a mensagem será clicável e abrirá em nova aba
                  </p>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={saveConfig}
                disabled={saving || !avatarImageUrl}
                className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : '💾 Salvar Configuração'}
              </button>
              <button
                onClick={clearConfig}
                disabled={saving}
                className="py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Limpar Tudo
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Preview
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-lg transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                className={`relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden ${
                  previewMode === 'mobile' ? 'h-[600px] max-w-[375px] mx-auto' : 'h-[500px]'
                }`}
              >
                {/* Mockup Interface */}
                <div className="absolute inset-0 p-4">
                  <div className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>

                {/* Avatar Preview */}
                {avatarImageUrl && (
                  <div className="absolute bottom-6 right-6 z-50">
                    <div className="relative">
                      {/* Mensagem (sempre visível no preview) - FORMATO RETANGULAR */}
                      <div
                        className={`absolute ${
                          previewMode === 'mobile' ? 'bottom-full mb-2 right-0' : 'right-full mr-3 bottom-0'
                        } animate-fade-in`}
                      >
                        <div
                          className={`bg-white rounded-lg shadow-xl px-4 py-2 relative whitespace-nowrap ${
                            linkUrl ? 'cursor-pointer hover:shadow-2xl transition-shadow' : ''
                          }`}
                        >
                          {/* Texto com quebras de linha a cada 15 caracteres */}
                          <div className="text-xs text-gray-800 font-medium leading-tight">
                            {messageText ? (
                              formatMessageText(messageText).map((line, index) => (
                                <div key={index} className="whitespace-nowrap">
                                  {line}
                                </div>
                              ))
                            ) : (
                              <div className="whitespace-nowrap text-gray-400">Sua mensagem...</div>
                            )}
                          </div>
                          {linkUrl && (
                            <div className="mt-1 pt-1 border-t border-gray-200">
                              <span className="text-[10px] text-blue-600 font-bold whitespace-nowrap flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                Clique para abrir
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Seta */}
                        <div
                          className={`absolute ${
                            previewMode === 'mobile'
                              ? 'top-full right-4 -mt-2'
                              : 'left-full top-1/2 -translate-y-1/2 -ml-2'
                          }`}
                        >
                          <div
                            className={`w-0 h-0 ${
                              previewMode === 'mobile'
                                ? 'border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-white'
                                : 'border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-white'
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <img
                          src={avatarImageUrl}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = '❌';
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!avatarImageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Configure uma imagem para ver o preview</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Dica:</strong> O balão da mensagem é <strong>retangular horizontal</strong> com quebra de linha a cada <strong>15 caracteres</strong>.
                  A mensagem fecha apenas ao clicar fora ou no botão X vermelho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
