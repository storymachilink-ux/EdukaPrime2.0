import { AdminLayout } from '../../components/layout/AdminLayout';
import { useState } from 'react';
import { Loader2, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { planService } from '../../lib/planService';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export default function AdminConsole() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleSyncSingleType = async (itemType: 'atividades' | 'videos' | 'bonus' | 'papercrafts') => {
    try {
      setLoading(true);
      addLog(`🔄 Sincronizando ${itemType}...`, 'info');

      const success = await planService.syncAllItemPlanAccess(itemType);

      if (success) {
        addLog(`✅ ${itemType} sincronizados com sucesso!`, 'success');
      } else {
        addLog(`❌ Erro ao sincronizar ${itemType}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setLoading(true);
      addLog('🔄 Iniciando sincronização completa...', 'info');

      const success = await planService.syncAllItemPlanAccessComplete();

      if (success) {
        addLog('✅ Sincronização completa finalizada!', 'success');
      } else {
        addLog('❌ Erro durante sincronização completa', 'error');
      }
    } catch (error) {
      addLog(`❌ Erro: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Console Administrativo</h1>
          <p className="text-gray-600 mt-1">Ferramentas de sincronização e manutenção</p>
        </div>

        {/* Cards de Sincronização */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">📚 Atividades</h3>
            <p className="text-xs text-gray-600 mb-4">Sincronizar available_for_plans</p>
            <button
              onClick={() => handleSyncSingleType('atividades')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🎥 Vídeos</h3>
            <p className="text-xs text-gray-600 mb-4">Sincronizar available_for_plans</p>
            <button
              onClick={() => handleSyncSingleType('videos')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🎁 Bônus</h3>
            <p className="text-xs text-gray-600 mb-4">Sincronizar available_for_plans</p>
            <button
              onClick={() => handleSyncSingleType('bonus')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">✂️ PaperCrafts</h3>
            <p className="text-xs text-gray-600 mb-4">Sincronizar available_for_plans</p>
            <button
              onClick={() => handleSyncSingleType('papercrafts')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">🔄 TUDO</h3>
            <p className="text-xs text-gray-600 mb-4">Sincronizar tudo de uma vez</p>
            <button
              onClick={handleSyncAll}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Sincronizando...' : 'Sincronizar TUDO'}
            </button>
          </div>
        </div>

        {/* Console de Logs */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📋 Console de Logs</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Limpar
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto border border-gray-700">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-20">
                <p>Console vazio</p>
                <p className="text-xs mt-2">Clique em um botão de sincronização para começar</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`py-1 ${
                    log.type === 'success'
                      ? 'text-green-400'
                      : log.type === 'error'
                      ? 'text-red-400'
                      : 'text-blue-400'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Informações */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ O que é sincronização?</h3>
                <p className="text-sm text-blue-800">
                  A sincronização atualiza o campo <code className="bg-blue-100 px-2 py-1 rounded">available_for_plans</code> de cada item
                  com base nas junction tables. Quando você marca/desmarca um item no admin panel,
                  isso é registrado na junction table. A sincronização copia esses dados para o campo do item.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">✅ Quando usar?</h3>
                <p className="text-sm text-green-800">
                  Use este console quando:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Você adicionou items ao admin panel</li>
                    <li>Os usuários não estão vendo items que deveriam</li>
                    <li>Você quer sincronizar tudo de uma vez</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
