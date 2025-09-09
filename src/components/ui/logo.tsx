"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "h-10 w-10", size = 40 }: LogoProps) {
  // Simple img tag that uses CSS classes for theme handling
  return (
    <img
      src="/logos/tiered_crest_black.svg"
      alt="Atenra Logo"
      width={size}
      height={size}
      className={`dark:invert ${className}`}
    />
  );
}