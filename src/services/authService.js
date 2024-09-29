import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}token/`, { username, password });
      if (response.data.access) {
        const userData = { username, ...response.data };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}register/`, userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw new Error('No response received from the server');
      } else {
        throw new Error('Error setting up the request');
      }
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },
};

export default authService;
