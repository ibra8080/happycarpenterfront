import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

const followService = {
  followUser: async (userId, token) => {
    try {
      const response = await axios.post(`${API_URL}follows/`, 
        { followed: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  unfollowUser: async (followId, token) => {
    try {
      await axios.delete(`${API_URL}follows/${followId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  getFollows: async (userId, token) => {
    try {
      const response = await axios.get(`${API_URL}follows/?owner=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting follows:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  }
};

export default followService;
