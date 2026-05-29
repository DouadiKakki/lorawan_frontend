const ACCESS_KEY = 'lorawan_access_token';
const REFRESH_KEY = 'lorawan_refresh_token';

function decodeJwtPayload(token: string): { sub: string; email: string; role: string } | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export const auth = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isAuthenticated: () => Boolean(localStorage.getItem(ACCESS_KEY)),
  getTokenPayload: () => {
    const token = localStorage.getItem(ACCESS_KEY);
    return token ? decodeJwtPayload(token) : null;
  },
};
