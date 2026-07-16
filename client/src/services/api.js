import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
export const AUTH_LOGOUT_EVENT = "brewhaven-auth-logout";

export const api = axios.create({
  baseURL: BASE_URL,
});

const joinUrl = (path) => {
  const normalizedBase = BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const isAuthEndpoint = (url = "") => /\/auth\/(login|register|refresh)\//.test(url);

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setAuthSession = ({ access, refresh } = {}) => {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const notifyLogout = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
};

let refreshPromise = null;

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post(joinUrl("/auth/refresh/"), { refresh })
      .then((response) => response.data)
      .catch((error) => {
        clearAuthSession();
        notifyLogout();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed?.access) {
          localStorage.setItem(ACCESS_TOKEN_KEY, refreshed.access);
          originalRequest.headers.Authorization = `Bearer ${refreshed.access}`;
          return api(originalRequest);
        }
      } catch {
        // Fall through to the logout path below.
      }
      clearAuthSession();
      notifyLogout();
    }
    return Promise.reject(error);
  }
);

export const apiFetch = async (path, options = {}) => {
  const { retryOn401 = true, ...rest } = options;
  const headers = new Headers(rest.headers || {});
  const token = getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (rest.body && !headers.has("Content-Type") && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(joinUrl(path), { ...rest, headers });

  if (response.status === 401 && retryOn401 && !isAuthEndpoint(path)) {
    const refreshed = await refreshAccessToken().catch(() => null);
    if (refreshed?.access) {
      headers.set("Authorization", `Bearer ${refreshed.access}`);
      response = await fetch(joinUrl(path), { ...rest, headers });
    } else {
      clearAuthSession();
      notifyLogout();
    }
  }

  return response;
};
