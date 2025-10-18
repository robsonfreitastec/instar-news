import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export default function UserForm() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const toast = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_super_admin: false,
    tenant_uuid: '',
    role: 'editor',
  });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userNewsCount, setUserNewsCount] = useState(0);

  useEffect(() => {
    fetchTenants();
    if (isEdit) {
      fetchUser();
    }
  }, [uuid]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get('/api/tenants?per_page=1000');
      setTenants(response.data.data);
    } catch (err) {
      console.error('Erro ao carregar tenants:', err);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${uuid}`);
      const userData = response.data.data;
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        is_super_admin: userData.is_super_admin || false,
        tenant_uuid: userData.tenants?.[0]?.uuid || '',
        role: userData.tenants?.[0]?.pivot?.role || 'editor',
      });
      setUserNewsCount(userData.news_count || 0);
    } catch (err) {
      setError('Erro ao carregar usuário');
      toast.error('Erro ao carregar usuário');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        is_super_admin: formData.is_super_admin,
      };

      // Só envia password se for preenchido
      if (formData.password) {
        payload.password = formData.password;
      }

      // Associação com tenant (se não for super admin)
      if (!formData.is_super_admin && formData.tenant_uuid) {
        payload.tenant_uuid = formData.tenant_uuid;
        payload.role = formData.role;
      }

      if (isEdit) {
        await axios.put(`/api/users/${uuid}`, payload);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        if (!formData.password) {
          setError('Senha é obrigatória ao criar usuário');
          setLoading(false);
          return;
        }
        await axios.post('/api/users', payload);
        toast.success('Usuário criado com sucesso!');
      }
      navigate('/users');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = isEdit 
    ? [
        { label: 'Usuários', href: '/users' },
        { label: 'Editar' }
      ]
    : [
        { label: 'Usuários', href: '/users' },
        { label: 'Novo Usuário' }
      ];

  if (!user?.is_super_admin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Acesso negado.</p>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Editar Usuário' : 'Criar Novo Usuário'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                placeholder="Digite o nome completo"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="usuario@example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha {isEdit && <span className="text-gray-400">(deixe em branco para manter a atual)</span>}
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required={!isEdit}
                placeholder={isEdit ? "Nova senha (opcional)" : "Mínimo 8 caracteres"}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_super_admin"
                  id="is_super_admin"
                  checked={formData.is_super_admin}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-700 focus:ring-red-700 border-gray-300 rounded"
                />
                <label htmlFor="is_super_admin" className="ml-2 block text-sm font-medium text-gray-700">
                  Super Administrador (acesso global ao sistema)
                </label>
              </div>
            </div>

            {!formData.is_super_admin && (
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Associação com Tenant</h3>
                
                {isEdit && userNewsCount > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>Tenant bloqueado:</strong> Este usuário possui {userNewsCount} notícia(s) associada(s). 
                          Não é possível alterar o tenant. Para mudar, primeiro reatribua ou delete as notícias.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="tenant_uuid" className="block text-sm font-medium text-gray-700">
                    Tenant
                  </label>
                  <select
                    name="tenant_uuid"
                    id="tenant_uuid"
                    value={formData.tenant_uuid}
                    onChange={handleChange}
                    disabled={isEdit && userNewsCount > 0}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent sm:text-sm ${
                      isEdit && userNewsCount > 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Selecione um tenant (opcional)</option>
                    {tenants.map(tenant => (
                      <option key={tenant.uuid} value={tenant.uuid}>{tenant.name}</option>
                    ))}
                  </select>
                  {isEdit && userNewsCount > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Campo bloqueado devido às notícias associadas
                    </p>
                  )}
                </div>

                {formData.tenant_uuid && (
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role no Tenant
                    </label>
                    <select
                      name="role"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent sm:text-sm"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="bg-gray-100 py-2 px-6 border-2 border-gray-400 rounded-md shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-200 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 border-2 border-green-600 hover:bg-green-700 hover:border-green-700 rounded-md shadow-sm py-2 px-6 inline-flex justify-center text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
    </div>
  );
}

