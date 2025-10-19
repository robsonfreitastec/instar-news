import axios from '../config/axios';

/**
 * Tenants API Module
 * Handles all API calls related to tenants
 */

export const tenantsApi = {
  /**
   * Get all tenants with pagination
   */
  getAll: (params = {}) => {
    return axios.get('/api/tenants', { params });
  },

  /**
   * Get single tenant by UUID
   */
  getByUuid: (uuid) => {
    return axios.get(`/api/tenants/${uuid}`);
  },

  /**
   * Create new tenant
   */
  create: (data) => {
    return axios.post('/api/tenants', data);
  },

  /**
   * Update tenant
   */
  update: (uuid, data) => {
    return axios.put(`/api/tenants/${uuid}`, data);
  },

  /**
   * Delete tenant
   */
  delete: (uuid) => {
    return axios.delete(`/api/tenants/${uuid}`);
  },

  /**
   * Add user to tenant
   */
  addUser: (tenantUuid, data) => {
    return axios.post(`/api/tenants/${tenantUuid}/users`, data);
  },

  /**
   * Remove user from tenant
   */
  removeUser: (tenantUuid, userUuid) => {
    return axios.delete(`/api/tenants/${tenantUuid}/users/${userUuid}`);
  },
};

