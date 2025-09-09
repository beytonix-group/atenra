"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

export function DynamicFavicon() {
  const { theme } = useTheme();

  useEffect(() => {
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
  }, [theme]);

  return null;
}