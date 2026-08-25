"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
      title={theme === "dark" ? "Jasny motyw" : "Ciemny motyw"}
      className="fixed bottom-4 right-4 z-50 grid h-12 w-12 place-items-center rounded-full border shadow-lg transition hover:scale-105 bg-white text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
