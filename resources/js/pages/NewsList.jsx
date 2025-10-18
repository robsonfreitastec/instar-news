import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import ConfirmModal from '../components/ConfirmModal';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    tenant_uuid: '',
    author_uuid: '',
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0
  });
  const toast = useToast();
  const { user } = useAuth();
  
  // Check if user can edit/delete a specific news
  const canEdit = (newsItem) => {
    if (user?.is_super_admin) return true;
    // Both admin and editor can edit any news in their tenant
    return true; // Backend will validate tenant membership
  };
  
  const canDelete = (newsItem) => {
    // Super admin can delete any news
    if (user?.is_super_admin) return true;
    
    // Only admin can delete (editor cannot)
    // Get role from localStorage
    const userRole = localStorage.getItem('role');
    return userRole === 'admin';
  };

  useEffect(() => {
    if (user?.is_super_admin) {
      fetchTenants();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (news.length === 0) {
      fetchNews(true); // Initial load
    } else {
      fetchNews(false); // Refetch
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
      const response = await axios.get('/api/users');
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const fetchNews = async (isInitialLoad = false, customFilters = null, customSearch = null) => {
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
      
      // Usar filtros customizados se fornecidos, caso contrário usar os do state
      const activeFilters = customFilters !== null ? customFilters : filters;
      const activeSearch = customSearch !== null ? customSearch : search;
      
      if (activeFilters.tenant_uuid) params.tenant_uuid = activeFilters.tenant_uuid;
      if (activeFilters.author_uuid) params.author_uuid = activeFilters.author_uuid;
      if (activeSearch) params.search = activeSearch;
      
      const response = await axios.get('/api/news', { params });
      setNews(response.data.data);
      setPagination(response.data.meta);
      setError('');
    } catch (err) {
      setError('Falha ao carregar notícias');
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    
    // Se mudar tenant, limpar autor selecionado
    if (field === 'tenant_uuid') {
      setFilters(prev => ({ ...prev, author_uuid: '' }));
    }
  };
  
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchNews(false);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };
  
  const clearFilters = () => {
    const emptyFilters = { tenant_uuid: '', author_uuid: '' };
    const emptySearch = '';
    
    setFilters(emptyFilters);
    setSearch(emptySearch);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    
    // Passar filtros limpos diretamente para evitar problemas de timing com state
    fetchNews(false, emptyFilters, emptySearch);
  };
  
  // Filtrar usuários baseado no tenant selecionado
  const filteredUsers = filters.tenant_uuid 
    ? users.filter(u => u.tenants?.some(t => t.uuid === filters.tenant_uuid))
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
    // Forçar refetch
    setTimeout(() => fetchNews(false), 100);
  };

  const openDeleteModal = (newsItem) => {
    setNewsToDelete(newsItem);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setNewsToDelete(null);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!newsToDelete) return;

    try {
      await axios.delete(`/api/news/${newsToDelete.uuid}`);
      toast.success('Notícia excluída com sucesso!');
      closeDeleteModal();
      
      // Recarregar a lista para mostrar os próximos itens da paginação
      fetchNews(false);
    } catch (err) {
      toast.error('Erro ao excluir notícia. Tente novamente.');
      console.error(err);
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Notícias' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
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
        <Link
          to="/news/new"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors shadow-sm hover:shadow-md inline-flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Notícia
        </Link>
      </div>

      {/* Filtros (apenas para super admin) */}
      {user?.is_super_admin && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  placeholder="Título ou conteúdo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
                <select
                  value={filters.tenant_uuid}
                  onChange={(e) => handleFilterChange('tenant_uuid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
                >
                  <option value="">Todos os tenants</option>
                  {tenants.map(tenant => (
                    <option key={tenant.uuid} value={tenant.uuid}>{tenant.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                <select
                  value={filters.author_uuid}
                  onChange={(e) => handleFilterChange('author_uuid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
                  disabled={filters.tenant_uuid && filteredUsers.length === 0}
                >
                  <option value="">
                    {filters.tenant_uuid 
                      ? `Todos os autores deste tenant (${filteredUsers.length})`
                      : 'Todos os autores'}
                  </option>
                  {filteredUsers.map(u => (
                    <option key={u.uuid} value={u.uuid}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyFilters}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm"
              >
                Aplicar
              </button>
              {(filters.tenant_uuid || filters.author_uuid || search) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma notícia encontrada.</p>
            <Link
              to="/news/new"
              className="mt-4 inline-block text-instar-primary hover:text-instar-primary-dark font-medium"
            >
              Criar sua primeira notícia
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {news.map((item) => (
              <li key={item.uuid}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {item.content}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-2">
                        <span>Por {item.author?.name}</span>
                        {item.tenant && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {item.tenant.name}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(item.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      {canEdit(item) && (
                        <Link
                          to={`/news/edit/${item.uuid}`}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full transition-all"
                          title="Editar notícia"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      )}
                      {canDelete(item) && (
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-all"
                          title="Excluir notícia"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
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

      <ConfirmModal
        isOpen={modalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a notícia "${newsToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}

