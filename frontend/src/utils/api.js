import axios from "axios";
import { store } from "@/redux/store";
import { login, logout } from "@/redux/slices/authSlice";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh-token");
        const newToken = data.token;

        store.dispatch(
          login({
            user: store.getState().auth.user,
            token: newToken,
          })
        );

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        store.dispatch(logout());
      }
    }

    throw error;
  }
);

export default api;
