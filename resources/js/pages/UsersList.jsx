import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterTenant, setFilterTenant] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.is_super_admin) {
      fetchTenants();
    }
  }, [user]);

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers(true);
    } else {
      fetchUsers(false);
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

  const fetchUsers = async (isInitialLoad = false, customTenantFilter = null) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setFetching(true);
    }
    
    try {
      const params = {
        per_page: pagination.per_page,
      };
      
      const activeTenantFilter = customTenantFilter !== null ? customTenantFilter : filterTenant;
      
      if (activeTenantFilter) params.tenant_uuid = activeTenantFilter;
      
      const response = await axios.get('/api/users', { params });
      setUsers(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Falha ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const applyFilters = () => {
    fetchUsers(false);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterTenant('');
    fetchUsers(false, '');
  };

  const openDeleteModal = (userItem) => {
    setUserToDelete(userItem);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`/api/users/${userToDelete.uuid}`);
      toast.success('Usuário excluído com sucesso!');
      closeDeleteModal();
      fetchUsers(false);
    } catch (err) {
      toast.error('Erro ao excluir usuário. Tente novamente.');
      console.error(err);
      closeDeleteModal();
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handlePerPageChange = (newPerPage) => {
    setPagination(prev => ({ 
      ...prev, 
      per_page: newPerPage,
      current_page: 1 
    }));
    fetchUsers(false);
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
      <Breadcrumb items={[{ label: 'Usuários' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
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
          to="/users/new"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors shadow-sm hover:shadow-md inline-flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tenant</label>
            <select
              value={filterTenant}
              onChange={(e) => setFilterTenant(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
            >
              <option value="">Todos os tenants</option>
              {tenants.map(tenant => (
                <option key={tenant.uuid} value={tenant.uuid}>{tenant.name}</option>
              ))}
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
            {filterTenant && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.tenants && u.tenants.length > 0 ? (
                          u.tenants.map(t => (
                            <span key={t.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {t.name}
                              {t.pivot?.role && (
                                <span className="ml-1 text-indigo-600">({t.pivot.role})</span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">Nenhum tenant</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        u.is_super_admin ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {u.is_super_admin ? 'Super Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/users/edit/${u.uuid}`}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-full inline-flex transition-all"
                        title="Editar usuário"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {u.news_count > 0 ? (
                        <span
                          className="text-gray-400 p-2 rounded-full inline-flex cursor-not-allowed"
                          title={`Não pode excluir. Usuário tem ${u.news_count} notícia(s) associada(s)`}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </span>
                      ) : (
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full inline-flex transition-all"
                          title="Excluir usuário"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
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

      <ConfirmModal
        isOpen={modalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
}

