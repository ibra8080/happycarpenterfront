import axios from 'axios';

const API_URL = 'https://happy-carpenter-26472ba73a7c.herokuapp.com/api';

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/dj-rest-auth/login/`, { username, password });
      if (response.data.access) {  // Changed from response.data.key to response.data.access
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/dj-rest-auth/registration/`, userData);
      if (response.data.access) {  // Changed from response.data.key to response.data.access
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default authService;
