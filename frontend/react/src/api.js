// src/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000', // Your FastAPI server
  timeout: 5000,
});

// Add request interceptor to inject token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Storyboard endpoints
export const storyboardAPI = {
  create: (name) => API.post('/home', { name }),
  rename: (id, name) => API.patch(`/storyboard/${id}`, { name:name }),
  delete: (id) => API.delete(`/storyboard/${id}`),
  getAll: () => API.get('/home'),
};

// Auth endpoints (based on your main.py)
export const authAPI = {
  login: (credentials) => API.post('/token', credentials),
  register: (userData) => API.post('/register', userData),
  verify: () => API.get('/verify-token'),
};