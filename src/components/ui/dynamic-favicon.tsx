"use client";

import { useEffect } from "react";

export function DynamicFavicon() {
  useEffect(() => {
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = '/logos/favicon.png';
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.type = 'image/png';
      newFavicon.href = '/logos/favicon.png';
      document.head.appendChild(newFavicon);
    }
  }, []);

  return null;
}