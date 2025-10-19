import { useState, useCallback } from 'react';
import { logsApi } from '../api';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for activity logs operations
 */
export const useLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await logsApi.getAll(params);
      setLogs(response.data.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar logs';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getLogById = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await logsApi.getByUuid(uuid);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar log';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    getLogById,
  };
};

