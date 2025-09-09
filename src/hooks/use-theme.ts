"use client";

import { useState, useEffect, useCallback } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get the actual theme once mounted
    const actualTheme = window.__theme || (() => {
      try {
        const stored = localStorage.getItem("__PREFERRED_THEME__");
        if (stored === "dark" || stored === "light") return stored;
      } catch {}
      
      if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      
      return "light";
    })();
    
    setTheme(actualTheme);
    window.__onThemeChange = setTheme;
  }, []);

  const toggleTheme = useCallback(() => {
    if (theme) {
      window?.__setPreferredTheme(theme === "light" ? "dark" : "light");
    }
  }, [theme]);

  return { theme, toggleTheme, mounted };
}