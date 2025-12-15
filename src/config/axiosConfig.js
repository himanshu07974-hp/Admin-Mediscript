import axios from 'axios';
import { API_BASE_URL } from './api';

const instance = axios.create({
  baseURL: API_BASE_URL || 'https://api.mediscript.in', // Fallback to ensure baseURL
  // baseURL: API_BASE_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request URL:', config.url);
    console.log('Token attached to request:', token ? 'Token present' : 'No token found');
    console.log('Request headers:', config.headers);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.warn('Unauthorized: Token missing or invalid for URL:', error.config.url);
      localStorage.removeItem('token');
      console.log('Token removed from localStorage due to 401');
      window.location.href = '/login';
    } else if (error.response?.status === 401) {
      console.log('401 received on login page, skipping token removal');
    }
    return Promise.reject(error);
  }
);

export default instance;