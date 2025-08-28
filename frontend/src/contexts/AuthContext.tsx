// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Api, clearToken, getToken, saveToken } from "../lib/api";

type User = { id: number; email: string; role: string } | null;

type State = {
  user: User;
  isLoading: boolean;
  error?: string;
};

type RegisterPayload = {
  companyName: string;
  vatNumber?: string;
  companyRegister?: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: { street: string; zipCode: string; city: string; country?: string };
};

type Ctx = {
  state: State;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  requestAccess: (payload: RegisterPayload) => Promise<boolean>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ user: null, isLoading: false, error: undefined });

  // Me beim Laden (falls Token da)
  useEffect(() => {
    (async () => {
      const tok = getToken();
      if (!tok) return;
      setState((s) => ({ ...s, isLoading: true }));
      try {
        const me = await Api.me();
        setState({ user: me as any, isLoading: false });
      } catch {
        clearToken();
        setState({ user: null, isLoading: false });
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setState((s) => ({ ...s, isLoading: true, error: undefined }));
    try {
      const { token, user } = await Api.login(email, password);
      saveToken(token);
      setState({ user, isLoading: false });
      return true;
    } catch (e: any) {
      setState({ user: null, isLoading: false, error: e?.message || "Login fehlgeschlagen" });
      return false;
    }
  }

  function logout() {
    clearToken();
    setState({ user: null, isLoading: false });
  }

  async function requestAccess(payload: RegisterPayload) {
    setState((s) => ({ ...s, isLoading: true, error: undefined }));
    try {
      await Api.requestAccess(payload);
      setState((s) => ({ ...s, isLoading: false }));
      return true;
    } catch (e: any) {
      setState((s) => ({ ...s, isLoading: false, error: e?.message || "Antrag fehlgeschlagen" }));
      return false;
    }
  }

  const value = useMemo<Ctx>(() => ({ state, login, logout, requestAccess }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Ctx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
