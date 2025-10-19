import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { newsApi, tenantsApi, usersApi, logsApi } from '../api';
import Breadcrumb from '../components/Breadcrumb';

export default function Dashboard() {
  const { user } = useAuth();
  const [newsCount, setNewsCount] = useState(0);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [logsCount, setLogsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const requests = [
        newsApi.getAll({ per_page: 1 }),
        user?.is_super_admin ? tenantsApi.getAll({ per_page: 1 }) : Promise.resolve({ data: { meta: { total: 0 } } }),
        user?.is_super_admin ? usersApi.getAll({ per_page: 1 }) : Promise.resolve({ data: { meta: { total: 0 } } }),
      ];

      if (user?.is_super_admin) {
        requests.push(logsApi.getAll({ per_page: 1 }));
      }

      const results = await Promise.all(requests);
      const [newsRes, tenantsRes, usersRes, logsRes] = results;
      
      setNewsCount(newsRes.data.meta?.total || 0);
      setTenantsCount(tenantsRes.data.meta?.total || 0);
      setUsersCount(usersRes.data.meta?.total || 0);
      if (user?.is_super_admin && logsRes) {
        setLogsCount(logsRes.data.meta?.total || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar contagens:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border-t-4 border-instar-primary">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Bem-vindo, {user?.name}!
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Sistema Multi-Tenant de Gerenciamento de Notícias
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {user?.email}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Permissão</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                  {user?.is_super_admin ? 'Super Administrador' : 'Usuário'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {user?.is_super_admin && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500 p-4 rounded-lg">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-purple-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800">Você é Super Administrador</h3>
              <div className="mt-2 text-sm text-purple-700">
                <p>Como Super Admin, você tem acesso total ao sistema:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Gerenciar todos os tenants e usuários</li>
                  <li>Criar/editar/excluir notícias de qualquer tenant</li>
                  <li>Visualizar logs de atividade completos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Notícias */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Notícias
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Gerenciar artigos de notícias
                  </dd>
                  <dd className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {loading ? '...' : `${newsCount} total`}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/news"
                className="font-medium text-instar-primary hover:text-instar-primary-dark"
              >
                Ver todas →
              </Link>
            </div>
          </div>
        </div>

        {/* Tenants */}
        {user?.is_super_admin && (
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tenants
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Gerenciar organizações
                    </dd>
                    <dd className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                        {loading ? '...' : `${tenantsCount} total`}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/tenants"
                  className="font-medium text-instar-primary hover:text-instar-primary-dark"
                >
                  Gerenciar →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Usuários */}
        {user?.is_super_admin && (
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Usuários
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Gerenciar usuários do sistema
                    </dd>
                    <dd className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {loading ? '...' : `${usersCount} total`}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/users"
                  className="font-medium text-instar-primary hover:text-instar-primary-dark"
                >
                  Gerenciar →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        {user?.is_super_admin && (
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Logs de Atividade
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Auditoria e rastreamento
                    </dd>
                    <dd className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        {loading ? '...' : `${logsCount} registros`}
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link
                  to="/logs"
                  className="font-medium text-instar-primary hover:text-instar-primary-dark"
                >
                  Ver logs →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Documentação da API */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    API Documentation
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Documentação Swagger da API
                  </dd>
                  <dd className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800">
                      OpenAPI 3.0
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/api/documentation"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-instar-primary hover:text-instar-primary-dark"
              >
                Abrir docs →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

