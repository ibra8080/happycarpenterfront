import axios from 'axios';

const API_URL = 'https://happy-carpenter-ebf6de9467cb.herokuapp.com/';

axios.defaults.withCredentials = true;

const authService = {
  setAuthHeader: (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}dj-rest-auth/login/`, { username, password });
      if (response.data.access) {
        const userData = {
          ...response.data.user,
          id: response.data.user.pk,
          token: response.data.access,
          refresh: response.data.refresh,
          username: username
        };
        authService.setAuthHeader(response.data.access);
        await authService.fetchUserProfile(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  logout: async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.token) {
        await axios.post(`${API_URL}dj-rest-auth/logout/`, null, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      authService.setAuthHeader(null);
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        authService.setAuthHeader(user.token);
        return user;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },

  refreshToken: async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.refresh) {
      try {
        const response = await axios.post(`${API_URL}dj-rest-auth/token/refresh/`, {
          refresh: currentUser.refresh
        });
        if (response.data.access) {
          currentUser.token = response.data.access;
          localStorage.setItem('user', JSON.stringify(currentUser));
          authService.setAuthHeader(response.data.access);
          return response.data.access;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        await authService.logout();
        throw new Error('Session expired. Please log in again.');
      }
    }
    await authService.logout();
    throw new Error('No refresh token available');
  },

  fetchUserProfile: async (userData) => {
    try {
      const profileResponse = await axios.get(`${API_URL}profiles/`, {
        headers: { Authorization: `Bearer ${userData.token}` }
      });
      const userProfile = profileResponse.data.find(profile => profile.owner === userData.username);
      userData.profile_image = userProfile ? userProfile.image : null;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return userData;
    }
  },

  initializeAuth: async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      try {
        await authService.refreshToken();
        return currentUser;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        await authService.logout();
      }
    }
    return null;
  }
};

export default authService;
