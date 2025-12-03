// src/api/apiClient.js
import axios from 'axios';

export const BACK_URL = 'https://snaibackend-production.up.railway.app';

export const api = axios.create({
  baseURL: BACK_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snai_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
