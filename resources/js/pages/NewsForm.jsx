import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { useAuth } from '../contexts/AuthContext';
import { useNews, useTenants } from '../hooks';

export default function NewsForm() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const { user } = useAuth();

  const { getNewsById, createNews, updateNews, loading: newsLoading } = useNews();
  const { tenants, fetchTenants } = useTenants();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    tenant_uuid: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.is_super_admin) {
      fetchTenants({ per_page: 1000 });
    }
  }, [user, fetchTenants]);

  useEffect(() => {
    if (isEdit) {
      loadNews();
    }
  }, [uuid]);

  const loadNews = async () => {
    try {
      const newsData = await getNewsById(uuid);
      setFormData({
        title: newsData.title,
        content: newsData.content,
        status: newsData.status || 'draft',
        tenant_uuid: newsData.tenant?.uuid || '',
      });
    } catch (err) {
      setError('Erro ao carregar notícia');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validação: Super Admin deve selecionar um tenant ao criar
    if (user?.is_super_admin && !isEdit && !formData.tenant_uuid) {
      setError('Por favor, selecione um tenant para esta notícia.');
      return;
    }

    try {
      // Preparar dados para envio
      const dataToSend = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
      };

      // Adicionar tenant_uuid somente se for super admin e estiver criando
      if (user?.is_super_admin && !isEdit && formData.tenant_uuid) {
        dataToSend.tenant_uuid = formData.tenant_uuid;
      }

      if (isEdit) {
        await updateNews(uuid, dataToSend);
      } else {
        await createNews(dataToSend);
      }
      navigate('/news');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar notícia';
      setError(errorMessage);
    }
  };

  const breadcrumbItems = isEdit 
    ? [
        { label: 'Notícias', href: '/news' },
        { label: 'Editar' }
      ]
    : [
        { label: 'Notícias', href: '/news' },
        { label: 'Nova Notícia' }
      ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Editar Notícia' : 'Criar Nova Notícia'}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="Digite o título da notícia"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Select de Tenant - Somente para Super Admin */}
            {user?.is_super_admin && !isEdit && (
              <div>
                <label
                  htmlFor="tenant_uuid"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  name="tenant_uuid"
                  id="tenant_uuid"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.tenant_uuid}
                  onChange={handleChange}
                >
                  <option value="">Selecione um tenant</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.uuid} value={tenant.uuid}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Super Admin:</span> Você deve especificar a qual tenant esta notícia pertence.
                </p>
              </div>
            )}

            {user?.is_super_admin && isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tenant
                </label>
                <div className="mt-1 block w-full border border-gray-200 rounded-md bg-gray-50 py-2 px-3 text-sm text-gray-600">
                  {formData.tenant_uuid ? (
                    tenants.find(t => t.uuid === formData.tenant_uuid)?.name || 'Carregando...'
                  ) : (
                    'Não especificado'
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  O tenant não pode ser alterado após a criação da notícia.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Conteúdo
              </label>
              <textarea
                name="content"
                id="content"
                rows={10}
                required
                placeholder="Digite o conteúdo da notícia..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.content}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Status de Publicação
              </label>
              <select
                name="status"
                id="status"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">📝 Rascunho</option>
                <option value="published">✅ Publicado</option>
                <option value="archived">📦 Arquivado</option>
                <option value="trash">🗑️ Lixeira</option>
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Escolha o status da notícia. Rascunhos não são visíveis publicamente.
              </p>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-3">
            <button
              type="button"
              onClick={() => navigate('/news')}
              className="bg-gray-100 py-2 px-6 border-2 border-gray-400 rounded-md shadow-sm text-sm font-semibold text-gray-800 hover:bg-gray-200 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={newsLoading}
              className="bg-green-600 border-2 border-green-600 hover:bg-green-700 hover:border-green-700 rounded-md shadow-sm py-2 px-6 inline-flex justify-center text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {newsLoading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
    </div>
  );
}

