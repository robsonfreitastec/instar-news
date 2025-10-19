import { useState, useCallback } from 'react';
import { tenantsApi } from '../api';
import { useToast } from '../contexts/ToastContext';

/**
 * Custom hook for tenants operations
 */
export const useTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchTenants = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.getAll(params);
      setTenants(response.data.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar tenants';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getTenantById = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.getByUuid(uuid);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar tenant';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createTenant = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.create(data);
      toast.success('Tenant criado com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar tenant';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTenant = useCallback(async (uuid, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.update(uuid, data);
      toast.success('Tenant atualizado com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar tenant';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteTenant = useCallback(async (uuid) => {
    setLoading(true);
    setError(null);
    try {
      await tenantsApi.delete(uuid);
      toast.success('Tenant excluído com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir tenant';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addUserToTenant = useCallback(async (tenantUuid, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.addUser(tenantUuid, data);
      toast.success('Usuário adicionado ao tenant com sucesso!');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao adicionar usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const removeUserFromTenant = useCallback(async (tenantUuid, userUuid) => {
    setLoading(true);
    setError(null);
    try {
      await tenantsApi.removeUser(tenantUuid, userUuid);
      toast.success('Usuário removido do tenant com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao remover usuário';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    tenants,
    loading,
    error,
    fetchTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
    addUserToTenant,
    removeUserFromTenant,
  };
};

