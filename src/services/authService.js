import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

axios.defaults.withCredentials = true;

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}dj-rest-auth/login/`, { username, password });
      if (response.data.user) {
        // Fetch the user's profile data
        const profileResponse = await axios.get(`${API_URL}profiles/`, {
          headers: { Authorization: `Bearer ${response.data.access}` }
        });
        const userProfile = profileResponse.data.find(profile => profile.owner === username);
        const userData = {
          ...response.data.user,
          id: response.data.user.pk,
          token: response.data.access,
          profile_image: userProfile ? userProfile.image : null,
          username: username
        };
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}dj-rest-auth/logout/`);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  refreshUserData: async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      try {
        const profileResponse = await axios.get(`${API_URL}profiles/`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        const userProfile = profileResponse.data.find(profile => profile.owner === currentUser.username);
        const updatedUserData = {
          ...currentUser,
          profile_image: userProfile ? userProfile.image : null
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        return updatedUserData;
      } catch (error) {
        console.error('Error refreshing user data:', error);
        return currentUser;
      }
    }
    return null;
  }
};

export default authService;
