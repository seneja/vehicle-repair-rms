import axios from 'axios';
import { StorageService } from './storage.service';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

// ── Request interceptor: attach token ────────────────────────────────────────
client.interceptors.request.use(async (config) => {
  const token = await StorageService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: normalize errors ───────────────────────────────────
// Backend always sends { error: "..." } for errors (see errorHandler.js).
// We extract that message and reject with a plain Error so all callers
// receive a consistent `error.message` string — no special casing needed.
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      // Backend shape: { error: "..." }  OR  { error: "...", details: [...] }
      const serverMessage: string =
        data?.error ||
        data?.message ||
        error.message ||
        'An unexpected error occurred';

      // On 401: clear stored token so AuthProvider redirects to login.
      // Do NOT retry — there is no refresh-token flow implemented.
      if (error.response?.status === 401) {
        await StorageService.removeToken();
      }

      return Promise.reject(new Error(serverMessage));
    }
    return Promise.reject(new Error('Network error — check your connection'));
  },
);

export default client;
