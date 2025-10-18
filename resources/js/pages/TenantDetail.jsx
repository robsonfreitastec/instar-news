import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function TenantDetail() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTenant();
  }, [uuid]);

  const fetchTenant = async () => {
    try {
      const response = await axios.get(`/api/tenants/${uuid}`);
      setTenant(response.data.data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar tenant');
      toast.error('Erro ao carregar dados do tenant');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_super_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Acesso negado.</p>
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

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Tenant não encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Tenants', href: '/tenants' },
        { label: tenant.name }
      ]} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Domínio: {tenant.domain || 'Não definido'}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Usuários do Tenant ({tenant.users?.length || 0})
          </h3>
        </div>
        {tenant.users && tenant.users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {tenant.users.map((tenantUser) => (
              <li key={tenantUser.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenantUser.name}</p>
                    <p className="text-sm text-gray-500">{tenantUser.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      tenantUser.pivot?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tenantUser.pivot?.role || 'editor'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            Nenhum usuário associado a este tenant.
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={() => navigate('/tenants')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          ← Voltar para Tenants
        </button>
      </div>
    </div>
  );
}

