import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}token/`, { username, password });
      if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  register: async (userData) => {
    try {
      const registerResponse = await axios.post(`${API_URL}register/`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2
      });
      
      // Auto-login after successful registration
      const loginResponse = await authService.login(userData.username, userData.password);
      return { registerData: registerResponse.data, loginData: loginResponse };
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
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default authService;
