const TOKEN_KEY = 'scaralpha.jwt';
const USER_KEY = 'scaralpha.userId';

/**
 * JWT only — never store Binolla SSID here.
 * Web app always uses localStorage.
 */
export const tokenStore = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  getUserId(): string | null {
    try {
      return localStorage.getItem(USER_KEY);
    } catch {
      return null;
    }
  },

  setSession(accessToken: string, userId: string): void {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, userId);
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
};
