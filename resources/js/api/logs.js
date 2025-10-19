import axios from '../config/axios';

/**
 * Activity Logs API Module
 * Handles all API calls related to activity logs
 */

export const logsApi = {
  /**
   * Get all logs with filters
   */
  getAll: (params = {}) => {
    return axios.get('/api/logs', { params });
  },

  /**
   * Get single log by UUID
   */
  getByUuid: (uuid) => {
    return axios.get(`/api/logs/${uuid}`);
  },
};

