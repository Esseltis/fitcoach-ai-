"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored =
      (typeof window !== "undefined" &&
        window.localStorage.getItem("fitcoach_theme")) ||
      "light";
    const t: Theme = stored === "dark" ? "dark" : "light";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("fitcoach_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {mounted ? children : <div className="min-h-screen" />}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
