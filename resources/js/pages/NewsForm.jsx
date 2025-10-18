import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../config/axios';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../contexts/ToastContext';

export default function NewsForm() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const isEdit = !!uuid;
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchNews();
    }
  }, [uuid]);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`/api/news/${uuid}`);
      const newsData = response.data.data;
      setFormData({
        title: newsData.title,
        content: newsData.content,
      });
    } catch (err) {
      setError('Erro ao carregar notícia');
      toast.error('Erro ao carregar notícia');
      console.error(err);
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
    setLoading(true);

    try {
      if (isEdit) {
        await axios.put(`/api/news/${uuid}`, formData);
        toast.success('Notícia atualizada com sucesso!');
      } else {
        await axios.post('/api/news', formData);
        toast.success('Notícia criada com sucesso!');
      }
      navigate('/news');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar notícia';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

