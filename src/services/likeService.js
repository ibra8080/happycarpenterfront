import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

const likeService = {
  likePost: async (postId, token) => {
    try {
      const response = await axios.post(`${API_URL}likes/`, 
        { post: postId },
        { 
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  unlikePost: async (postId, token) => {
    try {
      await axios.delete(`${API_URL}likes/${postId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  getLikes: async (postId, token) => {
    try {
      const response = await axios.get(`${API_URL}likes/?post=${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  }
};

export default likeService;
