import { useState, useCallback } from 'react';
import { usersApi } from '../api';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for users operations
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll(params);
      setUsers(response.data.data || []);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar usuários';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getUserById = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getByUuid(uuid);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createUser = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.create(data);
      toast.success('Usuário criado com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUser = useCallback(async (uuid, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.update(uuid, data);
      toast.success('Usuário atualizado com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteUser = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.delete(uuid);
      toast.success('Usuário excluído com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};

