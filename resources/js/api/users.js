import axios from '../config/axios';

/**
 * Users API Module
 * Handles all API calls related to users
 */

export const usersApi = {
  /**
   * Get all users
   */
  getAll: (params = {}) => {
    return axios.get('/api/users', { params });
  },

  /**
   * Get single user by UUID
   */
  getByUuid: (uuid) => {
    return axios.get(`/api/users/${uuid}`);
  },

  /**
   * Create new user
   */
  create: (data) => {
    return axios.post('/api/users', data);
  },

  /**
   * Update user
   */
  update: (uuid, data) => {
    return axios.put(`/api/users/${uuid}`, data);
  },

  /**
   * Delete user
   */
  delete: (uuid) => {
    return axios.delete(`/api/users/${uuid}`);
  },
};

