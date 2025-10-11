"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "h-10 w-auto", size = 40 }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className={className} style={{ height: size }} />;
  }

  const logoSrc = resolvedTheme === "dark"
    ? "/logos/Icon_White.png"
    : "/logos/Icon_Black.png";

  return (
    <Image
      src={logoSrc}
      alt="Atenra Logo"
      width={size}
      height={size}
      className={`${className} object-contain`}
      priority
    />
  );
}