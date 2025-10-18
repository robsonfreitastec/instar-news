import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import Pagination from '../components/Pagination';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function TenantsList() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 5,
    total: 0
  });
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (tenants.length === 0) {
      fetchTenants(true);
    } else {
      fetchTenants(false);
    }
  }, [pagination.current_page]);

  const fetchTenants = async (isInitialLoad = false, customSearch = null) => {
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
      
      const activeSearch = customSearch !== null ? customSearch : search;
      
      if (activeSearch) {
        params.search = activeSearch;
      }
      
      const response = await axios.get('/api/tenants', { params });
      setTenants(response.data.data);
      setPagination(response.data.meta);
      setError('');
    } catch (err) {
      setError('Falha ao carregar tenants');
      toast.error('Erro ao carregar tenants');
      console.error(err);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };
  
  const applySearch = () => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchTenants(false);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    applySearch();
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
    fetchTenants(false);
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
      <Breadcrumb items={[{ label: 'Tenants' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Tenants</h1>
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
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou domínio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-instar-primary"
            />
          </div>
          <button
            type="submit"
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm"
          >
            Buscar
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { 
                setSearch(''); 
                setPagination(prev => ({ ...prev, current_page: 1 }));
                fetchTenants(false, '');
              }}
              className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-md font-semibold transition-colors shadow-sm"
            >
              Limpar
            </button>
          )}
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {tenants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum tenant encontrado.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <li key={tenant.uuid}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tenant.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Domínio: {tenant.domain || 'Não definido'}
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{tenant.users?.length || 0} usuários</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        to={`/tenants/${tenant.uuid}`}
                        className="text-instar-primary hover:text-instar-primary-dark font-medium"
                      >
                        Ver Detalhes →
                      </Link>
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
    </div>
  );
}

