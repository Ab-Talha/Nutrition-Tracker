//E:\Nutrition Tracker (Django + React)\metafit-frontend\src\services\api.js

import axios from 'axios';
import { USERS_API } from '../utils/constants';

// Main API instance for user/auth requests
const api = axios.create({
  baseURL: USERS_API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Request interceptor
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    } catch (e) {
      console.log('Token parse error');
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear user data
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Nutrition API instance
export const nutritionApi = axios.create({
  baseURL: process.env.REACT_APP_NUTRITION_API || 'http://localhost:8000/api/nutrition',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;