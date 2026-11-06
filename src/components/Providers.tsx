"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("teamily-theme") as ThemeMode) || "light";
    setThemeState(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let effective: "light" | "dark" = "light";
    if (theme === "dark") {
      effective = "dark";
    } else if (theme === "system") {
      effective = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    setResolvedTheme(effective);
    if (effective === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("teamily-theme", mode);
  };

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
