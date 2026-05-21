import axios, { AxiosRequestConfig } from 'axios';
import { auth } from './auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token!));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;
    const refreshToken = auth.getRefreshToken();
    if (!refreshToken) {
      auth.clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, null, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      auth.setTokens(data.accessToken, data.refreshToken ?? auth.getRefreshToken()!);
      processQueue(null, data.accessToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${data.accessToken}` };
      return api(original);
    } catch (err) {
      processQueue(err, null);
      auth.clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
