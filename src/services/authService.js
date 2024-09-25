import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/dj-rest-auth/login/`, { username, password });
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
      const formattedData = {
        username: userData.username,
        email: userData.email,
        password1: userData.password1,
        password2: userData.password2,
        first_name: userData.first_name,
        last_name: userData.last_name,
        user_type: userData.user_type,
        years_of_experience: userData.user_type === 'professional' ? Number(userData.years_of_experience) : null,
        specialties: userData.specialties,
        portfolio_url: userData.portfolio_url,
        interests: userData.interests,
        address: userData.address,
        content: userData.content,
      };
      const response = await axios.post(`${API_URL}dj-rest-auth/registration/`, formattedData);
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
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default authService;
