import axios from "axios";

// Centralized axios instance — all API calls use this instead of raw axios
// This automatically attaches the Bearer token to every request
// so individual files don't need to manually read localStorage

const axiosInstance = axios.create({
  baseURL: "http://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attaches JWT token from localStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles 401 Unauthorized globally (e.g. expired token)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/log-in";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;