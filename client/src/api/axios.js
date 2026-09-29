import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

instance.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('udyogsetu_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user?.role && !config.headers['x-user-role']) {
          config.headers['x-user-role'] = user.role;
        }
        if (user?._id && !config.headers['x-user-id']) {
          config.headers['x-user-id'] = user._id;
        }
      }
    } catch (e) {
      // Ignore parse error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;

