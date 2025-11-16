import api from './api';

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/login/', { username, password });
      if (response.data.success) {
        const userData = response.data.data;
        
        // ⭐ SAVE FULL USER DATA TO localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // ⭐ ALSO SAVE userID SEPARATELY FOR PROFILE PAGE
        localStorage.setItem('userID', userData.UserID);
        
        console.log('✅ Login successful. UserID saved:', userData.UserID);
        
        return userData;
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
    // ⭐ CLEAR BOTH STORAGE ITEMS
    localStorage.removeItem('user');
    localStorage.removeItem('userID');
    
    console.log('✅ Logged out. localStorage cleared');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // ⭐ NEW HELPER - Get userID only (for Profile page)
  getUserID: () => {
    return localStorage.getItem('userID');
  },

  // ⭐ NEW HELPER - Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('userID');
  }
};