import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    tenant_id: '',
    user_id: '',
    log_type: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTenants();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (logs.length === 0) {
      fetchLogs(true);
    } else {
      fetchLogs(false);
    }
  }, [pagination.current_page]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenants?per_page=1000');
      setTenants(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar tenants:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      // Get all users (super admin can see all)
      const response = await axios.get('/api/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const fetchLogs = async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
      };
      
      if (filters.tenant_id) params.tenant_id = filters.tenant_id;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.log_type) params.log_type = filters.log_type;
      
      const response = await axios.get('/api/logs', { params });
      setLogs(response.data.data);
      setPagination(response.data.meta);
      setError('');
    } catch (err) {
      setError('Falha ao carregar logs');
      toast.error('Erro ao carregar logs de atividade');
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // Se mudar tenant, limpar usuário selecionado
    if (field === 'tenant_id') {
      setFilters(prev => ({ ...prev, user_id: '' }));
    }
  };
  
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchLogs(false);
  };
  
  const clearFilters = () => {
    setFilters({ tenant_id: '', user_id: '', log_type: '' });
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // Recarregar logs após limpar
    setTimeout(() => fetchLogs(false), 100);
  };
  
  // Filtrar usuários baseado no tenant selecionado
  const filteredUsers = filters.tenant_id 
    ? users.filter(u => u.tenants?.some(t => t.id === parseInt(filters.tenant_id)))
    : users;
  
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };
  
  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      per_page: newPerPage,
      current_page: 1 
    }));
    setTimeout(() => fetchLogs(false), 100);
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogTypeLabel = (type) => {
    switch (type) {
      case 'created':
        return 'Criado';
      case 'updated':
        return 'Atualizado';
      case 'deleted':
        return 'Excluído';
      default:
        return type;
    }
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const getModelTypeName = (modelType) => {
    const types = {
      'App\\Models\\News': 'Notícia',
      'App\\Models\\User': 'Usuário',
      'App\\Models\\Tenant': 'Tenant',
    };
    return types[modelType] || modelType;
  };

  if (!user?.is_super_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Acesso negado. Apenas Super Administradores podem acessar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Logs de Atividade' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Logs de Atividade</h1>
          {fetching && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="animate-spin h-5 w-5 mr-2 text-red-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Atualizando...
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <select
              value={filters.tenant_id}
              onChange={(e) => handleFilterChange('tenant_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
            >
              <option value="">Todos os tenants</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
              disabled={filters.tenant_id && filteredUsers.length === 0}
            >
              <option value="">
                {filters.tenant_id 
                  ? `Todos os usuários deste tenant (${filteredUsers.length})`
                  : 'Todos os usuários'}
              </option>
              {filteredUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ação</label>
            <select
              value={filters.log_type}
              onChange={(e) => handleFilterChange('log_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
            >
              <option value="">Todas as ações</option>
              <option value="created">Criado</option>
              <option value="updated">Atualizado</option>
              <option value="deleted">Excluído</option>
            </select>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum log encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleDateString('pt-BR')} <br/>
                      {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLogTypeColor(log.log_type)}`}>
                        {getLogTypeLabel(log.log_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user?.name || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.tenant?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openDetailModal(log)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full inline-flex transition-all"
                        title="Visualizar detalhes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          perPage={pagination.per_page}
          total={pagination.total}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      </div>

      {/* Modal de Detalhes do Log */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={closeDetailModal}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            {/* Header da Modal */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Detalhes do Log
              </h3>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo da Modal */}
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">UUID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.uuid}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data/Hora</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedLog.created_at).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Ação</label>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getLogTypeColor(selectedLog.log_type)}`}>
                    {getLogTypeLabel(selectedLog.log_type)}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Modelo</label>
                  <p className="text-sm text-gray-900">{getModelTypeName(selectedLog.model_type)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Usuário</label>
                  <p className="text-sm text-gray-900">{selectedLog.user?.name || 'Sistema'}</p>
                  {selectedLog.user?.email && (
                    <p className="text-xs text-gray-500 mt-1">{selectedLog.user.email}</p>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tenant</label>
                  <p className="text-sm text-gray-900">{selectedLog.tenant?.name || '-'}</p>
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <p className="text-sm text-gray-900">{selectedLog.description}</p>
              </div>

              {/* Valores Antigos */}
              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-red-800 mb-2">
                    Valores Anteriores
                  </label>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedLog.old_values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Valores Novos */}
              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-green-800 mb-2">
                    Valores Novos
                  </label>
                  <div className="bg-white p-3 rounded border border-green-200">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Footer da Modal */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetailModal}
                className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

