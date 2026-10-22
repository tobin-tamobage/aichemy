import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Account } from "../shared/product";
import { api } from "./api";
interface SiteContextValue {
  user: Account | null;
  loading: boolean;
  refresh: () => Promise<void>;
  notify: (message: string, error?: boolean) => void;
  dark: boolean;
  toggleTheme: () => void;
  reducedMotion: boolean;
  toggleMotion: () => void;
}
const Context = createContext<SiteContextValue>({
  user: null,
  loading: false,
  refresh: async () => {},
  notify: () => {},
  dark: false,
  toggleTheme: () => {},
  reducedMotion: false,
  toggleMotion: () => {},
});
export const useSite = () => useContext(Context);
export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );
  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      return localStorage.getItem("aichemy-reduce-motion") === "true";
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState<{
    message: string;
    error: boolean;
  } | null>(null);
  const refresh = useCallback(async () => {
    try {
      setUser((await api<{ user: Account | null }>("/session")).user);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("aichemy-theme", dark ? "dark" : "light");
    } catch {}
  }, [dark]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    try {
      localStorage.setItem("aichemy-reduce-motion", String(reducedMotion));
    } catch {}
  }, [reducedMotion]);
  const notify = useCallback(
    (message: string, error = false) => setToast({ message, error }),
    [],
  );
  return (
    <Context.Provider
      value={{
        user,
        loading,
        refresh,
        notify,
        dark,
        toggleTheme: () => setDark((v) => !v),
        reducedMotion,
        toggleMotion: () => setReducedMotion((v) => !v),
      }}
    >
      {children}
      <div
        className={`toast ${toast?.error ? "toast-error" : ""}`}
        role={toast?.error ? "alert" : "status"}
        aria-live="polite"
      >
        {toast && (
          <>
            <span aria-hidden="true">{toast.error ? "!" : "✓"}</span>
            {toast.message}
            <button
              aria-label="Tutup pemberitahuan"
              onClick={() => setToast(null)}
            >
              ×
            </button>
          </>
        )}
      </div>
    </Context.Provider>
  );
}
