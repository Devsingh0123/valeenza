import axios from "axios";
import { logout } from "./slices/userAuthSlice";
// import {store} from "./store"

export const api = axios.create({
  baseURL: "https://backend.astrotring.shop/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Only set Content-Type if not already defined
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
  }

  return config;
});

// Response interceptor – handle token expiry (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role_id");
      const { store } = await import("./store");  // dynamic import
      store.dispatch(logout());
      // if (window.location.pathname !== "/") {
      //   window.location.href = "/";
      // }
    }
    return Promise.reject(error);
  }
);