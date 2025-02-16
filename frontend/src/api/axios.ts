import axios from 'axios';
import { showToast } from '../utils/toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for 409 conflicts as they're handled specifically
    if (error.response?.status !== 409) {
      const message = error.response?.data?.detail || 'An error occurred';
      showToast.error(message);
    }
    return Promise.reject(error);
  }
); 
