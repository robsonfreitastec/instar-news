import { useState, useCallback } from 'react';
import { newsApi } from '../api';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for news operations
 */
export const useNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchNews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.getAll(params);
      setNews(response.data.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar notícias';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getNewsById = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.getByUuid(uuid);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar notícia';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createNews = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.create(data);
      toast.success('Notícia criada com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar notícia';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateNews = useCallback(async (uuid, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsApi.update(uuid, data);
      toast.success('Notícia atualizada com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar notícia';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteNews = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      await newsApi.delete(uuid);
      toast.success('Notícia excluída com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir notícia';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    news,
    loading,
    error,
    fetchNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
  };
};

