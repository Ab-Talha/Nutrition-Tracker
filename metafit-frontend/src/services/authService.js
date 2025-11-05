import api from './api';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/login/', { username, password });
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  register: async (name, username, email, password) => {
    try {
      const response = await api.post('/register/', {
        name,
        username,
        email,
        password
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message);
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};