"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiRequest,
  ApiError,
  normalizeUser,
  rememberTokenFromResponse,
  setStoredToken,
} from "@/lib/api";
import type { User } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const response = await apiRequest<unknown>("auth/me");
    return normalizeUser(response);
  }, []);

  const applySessionError = useCallback((reason: unknown) => {
    const message =
      reason instanceof Error ? reason.message : "Could not restore your session.";
    setUser(null);
    if (reason instanceof ApiError && reason.status === 401) {
      setStoredToken(null);
      setError(null);
      setStatus("unauthenticated");
    } else {
      setError(message);
      setStatus("error");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const nextUser = await fetchCurrentUser();
      setUser(nextUser);
      setStatus("authenticated");
      return nextUser;
    } catch (reason) {
      applySessionError(reason);
      throw reason;
    }
  }, [applySessionError, fetchCurrentUser]);

  useEffect(() => {
    let active = true;
    void fetchCurrentUser()
      .then((nextUser) => {
        if (!active) return;
        setUser(nextUser);
        setStatus("authenticated");
      })
      .catch((reason: unknown) => {
        if (active) applySessionError(reason);
      });
    return () => {
      active = false;
    };
  }, [applySessionError, fetchCurrentUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<unknown>("auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      rememberTokenFromResponse(response);
      return refreshUser();
    },
    [refreshUser],
  );

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await apiRequest<unknown>("auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await apiRequest<unknown>("auth/signout", { method: "POST" });
    } finally {
      setStoredToken(null);
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, error, signIn, signUp, signOut, refreshUser }),
    [user, status, error, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
