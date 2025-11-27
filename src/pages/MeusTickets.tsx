import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Ticket, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface TicketData {
  id: string;
  category: string;
  title: string;
  description: string;
  contact_email: string;
  contact_whatsapp: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export default function MeusTickets() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTickets();
  }, [profile?.id]);

  const loadTickets = async () => {
    if (!profile?.id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar tickets:', error);
      setTickets([]);
    } else {
      setTickets(data || []);
    }

    setLoading(false);
  };

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { label: string; color: string; bg: string }> = {
      problemas: { label: 'Problemas', color: 'text-red-700', bg: 'bg-red-100' },
      contribuicao: { label: 'Contribuição', color: 'text-green-700', bg: 'bg-green-100' },
      pedir_atividades: { label: 'Pedir Atividades', color: 'text-purple-700', bg: 'bg-purple-100' },
    };
    return categories[category] || { label: category, color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; icon: any; color: string; bg: string }> = {
      aberto: { label: 'Aberto', icon: Clock, color: 'text-blue-700', bg: 'bg-blue-100' },
      em_andamento: { label: 'Em Andamento', icon: AlertCircle, color: 'text-yellow-700', bg: 'bg-yellow-100' },
      resolvido: { label: 'Resolvido', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      aprovado: { label: 'Aprovado', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
      recusado: { label: 'Recusado', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
      atendido: { label: 'Atendido', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
    };
    return (
      statuses[status] || { label: status, icon: Clock, color: 'text-gray-700', bg: 'bg-gray-100' }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('⚠️ Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { error } = await supabase.from('tickets').delete().eq('id', ticketId);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
    } else {
      alert('✅ Ticket excluído com sucesso!');
      await loadTickets();
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch =
      searchTerm === '' ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const ticketStats = {
    total: tickets.length,
    abertos: tickets.filter((t) => t.status === 'aberto').length,
    em_andamento: tickets.filter((t) => t.status === 'em_andamento').length,
    resolvidos: tickets.filter((t) => ['resolvido', 'aprovado', 'atendido'].includes(t.status)).length,
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Ticket className="w-10 h-10 text-purple-600" />
            Meus Tickets
          </h1>
          <p className="text-gray-600">Acompanhe o status dos seus atendimentos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{ticketStats.total}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 shadow-lg border-2 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Abertos</p>
            <p className="text-3xl font-bold text-blue-900">{ticketStats.abertos}</p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 shadow-lg border-2 border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">Em Andamento</p>
            <p className="text-3xl font-bold text-yellow-900">{ticketStats.em_andamento}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 shadow-lg border-2 border-green-200">
            <p className="text-sm text-green-700 mb-1">Resolvidos</p>
            <p className="text-3xl font-bold text-green-900">{ticketStats.resolvidos}</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título ou descrição..."
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categoria
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="problemas">Problemas</option>
                <option value="contribuicao">Contribuição</option>
                <option value="pedir_atividades">Pedir Atividades</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="resolvido">Resolvido</option>
                <option value="aprovado">Aprovado</option>
                <option value="atendido">Atendido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Tickets */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum ticket encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Você ainda não criou nenhum ticket'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const categoryInfo = getCategoryInfo(ticket.category);
              const statusInfo = getStatusInfo(ticket.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-100 hover:border-purple-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${categoryInfo.bg} ${categoryInfo.color}`}
                        >
                          {categoryInfo.label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Criado: {formatDate(ticket.created_at)}
                        </div>
                        {ticket.resolved_at && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Resolvido: {formatDate(ticket.resolved_at)}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir ticket"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {/* Contatos */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Contato fornecido:</p>
                    <div className="flex gap-4 text-sm">
                      {ticket.contact_email && (
                        <span className="text-gray-700">📧 {ticket.contact_email}</span>
                      )}
                      {ticket.contact_whatsapp && (
                        <span className="text-gray-700">📱 {ticket.contact_whatsapp}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
