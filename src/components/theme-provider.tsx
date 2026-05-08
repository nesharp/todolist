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

import { isAppTheme, type AppTheme } from "@/lib/theme-presets";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme: AppTheme;
  themes?: readonly string[];
  attribute?: string;
};

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (nextTheme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "todo-theme";

export function ThemeProvider({
  children,
  defaultTheme,
  themes,
  attribute = "data-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === "undefined") return defaultTheme;

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (!storedTheme || !isAppTheme(storedTheme)) return defaultTheme;
    if (themes && !themes.includes(storedTheme)) return defaultTheme;

    return storedTheme;
  });

  const applyTheme = useCallback(
    (nextTheme: AppTheme) => {
      if (typeof document === "undefined") return;
      document.documentElement.setAttribute(attribute, nextTheme);
    },
    [attribute]
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (nextTheme: AppTheme) => {
      setThemeState(nextTheme);
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    },
    [applyTheme]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
