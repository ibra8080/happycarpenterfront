import axios from 'axios';
import authService from '../services/authService';

const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshed = await authService.refreshToken();
          if (refreshed) {
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout the user
          authService.logout();
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
