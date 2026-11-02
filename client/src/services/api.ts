import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://thanhphan-rfms.onrender.com/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rfms_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/login")) {
      original._retry = true;
      refreshing ??= api
        .post("/auth/refresh")
        .then((r) => {
          const token = r.data.data.accessToken as string;
          localStorage.setItem("rfms_access", token);
          return token;
        })
        .catch(() => {
          localStorage.removeItem("rfms_access");
          return null;
        })
        .finally(() => {
          refreshing = null;
        });
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export function getErrorMessage(error: unknown, fallback = "Đã xảy ra lỗi") {
  const err = error as { response?: { data?: { message?: string } } };
  return err.response?.data?.message || fallback;
}
