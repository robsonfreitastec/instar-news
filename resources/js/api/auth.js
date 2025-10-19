import axios from '../config/axios';

/**
 * Auth API Module
 * Handles all API calls related to authentication
 */

export const authApi = {
  /**
   * Login user
   */
  login: (credentials) => {
    return axios.post('/api/login', credentials);
  },

  /**
   * Logout user
   */
  logout: () => {
    return axios.post('/api/logout');
  },

  /**
   * Get current user data
   */
  me: () => {
    return axios.get('/api/me');
  },

  /**
   * Refresh token
   */
  refresh: () => {
    return axios.post('/api/refresh');
  },
};

