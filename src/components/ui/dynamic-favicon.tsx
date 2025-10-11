"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export function DynamicFavicon() {
  const { theme, mounted } = useTheme();

  useEffect(() => {
    // Only update favicon after mounting and when we have a valid theme
    if (!mounted || !theme) return;
    
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = theme === 'dark'
        ? '/logos/Icon_White.png'
        : '/logos/Icon_Black.png';
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = theme === 'dark'
        ? '/logos/Icon_White.png'
        : '/logos/Icon_Black.png';
      document.head.appendChild(newFavicon);
    }
  }, [theme, mounted]);

  return null;
}