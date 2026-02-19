import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://taskflowbackend-zv21.onrender.com/api",
  timeout: 30000,
});

let unauthorizedHandler = null;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasStoredToken = Boolean(localStorage.getItem("token"));
    if (error.response?.status === 401 && unauthorizedHandler && hasStoredToken) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export default api;
