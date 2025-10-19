import axios from '../config/axios';

/**
 * News API Module
 * Handles all API calls related to news
 */

export const newsApi = {
  /**
   * Get all news with filters
   */
  getAll: (params = {}) => {
    return axios.get('/api/news', { params });
  },

  /**
   * Get single news by UUID
   */
  getByUuid: (uuid) => {
    return axios.get(`/api/news/${uuid}`);
  },

  /**
   * Create new news
   */
  create: (data) => {
    return axios.post('/api/news', data);
  },

  /**
   * Update news
   */
  update: (uuid, data) => {
    return axios.put(`/api/news/${uuid}`, data);
  },

  /**
   * Delete news
   */
  delete: (uuid) => {
    return axios.delete(`/api/news/${uuid}`);
  },
};

