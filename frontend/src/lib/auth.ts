// src/lib/auth.ts
export type User = { id: number; email: string; role: 'admin' | 'user' };

const TOKEN_KEY = 'lampadina_token';
const USER_KEY = 'lampadina_user';

export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const setUser = (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const getUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? (JSON.parse(raw) as User) : null; } catch { return null; }
};
export const clearUser = () => localStorage.removeItem(USER_KEY);

export const isLoggedIn = () => !!getToken();
export const isAdmin = () => getUser()?.role === 'admin';
