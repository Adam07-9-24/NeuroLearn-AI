import axios from "axios";

const TOKEN_KEY = "neurolearn_token";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
