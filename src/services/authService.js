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
        let userData = {
          ...response.data.user,
          id: response.data.user.pk,
          token: response.data.access,
          refresh: response.data.refresh,
          username: username
        };
        authService.setAuthHeader(response.data.access);
        
        // Fetch user profile
        try {
          const profileResponse = await axios.get(`${API_URL}profiles/`, {
            headers: { Authorization: `Bearer ${response.data.access}` }
          });
          const userProfile = profileResponse.data.find(profile => profile.owner === username);
          if (userProfile) {
            userData.profile = userProfile;
          }
        } catch (profileError) {
        }

        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    authService.setAuthHeader(null);
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  register: async (username, email, password1, password2) => {
    try {
      const response = await axios.post(`${API_URL}dj-rest-auth/registration/`, {
        username,
        email,
        password1,
        password2
      });
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
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Network error');
    }
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000;
    return exp < currentTime;
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
        throw error;
      }
    }
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
      return userData;
    }
  },

  initializeAuth: async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      if (authService.isTokenExpired(currentUser.token)) {
        try {
          await authService.refreshToken();
        } catch (error) {
          authService.logout();
          return null;
        }
      } else {
        authService.setAuthHeader(currentUser.token);
      }
      return currentUser;
    }
    return null;
  }
};

export default authService;
