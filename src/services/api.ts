import axios from 'axios';
import type { User, ChatMessage, ChatSession, Incident, KBArticle } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('Request interceptor - Token exists:', !!token);
    console.log('Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Response error:', error.config?.url, error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Clearing auth and redirecting to login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    console.log('Login successful, storing token and user');
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  register: async (name: string, email: string, password: string) => {
    console.log('Attempting registration for:', email);
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async () => {
    console.log('Logging out');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Could call API logout endpoint if implemented
  },

  getProfile: async (): Promise<User> => {
    console.log('Fetching user profile');
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    console.log('Updating profile');
    const response = await api.put('/auth/profile', updates);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, sessionId?: string) => {
    console.log('Sending message:', message, 'Session ID:', sessionId);
    const response = await api.post('/chat/message', { message, sessionId });
    return response.data;
  },

  getSessions: async (): Promise<ChatSession[]> => {
    console.log('Fetching chat sessions');
    const response = await api.get('/chat/sessions');
    console.log('Chat sessions received:', response.data.length);
    return response.data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    console.log('Fetching session:', sessionId);
    const response = await api.get(`/chat/sessions/${sessionId}`);
    return response.data;
  },

  deleteSession: async (sessionId: string) => {
    console.log('Deleting session:', sessionId);
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
  }
};

// Test connection function
export const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/health');
    console.log('Health check successful:', response.data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Incidents API (simplified for now)
export const incidentsAPI = {
  create: async (incident: any) => {
    console.log('Creating incident');
    const response = await api.post('/incidents', incident);
    return response.data;
  },

  getAll: async (params?: any) => {
    console.log('Fetching incidents');
    const response = await api.get('/incidents', { params });
    return response.data;
  }
};

// Export everything for debugging
export { api };