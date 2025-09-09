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
        ? '/logos/tiered_crest_white.svg'
        : '/logos/tiered_crest_black.svg';
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/svg+xml';
      newFavicon.href = theme === 'dark' 
        ? '/logos/tiered_crest_white.svg'
        : '/logos/tiered_crest_black.svg';
      document.head.appendChild(newFavicon);
    }
  }, [theme, mounted]);

  return null;
}