import axios from "axios";

const API_URL = "";

const axiosApi = axios.create({
  baseURL: API_URL,
});

// Request Interceptor
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error)
  }
);

export default axiosApi;