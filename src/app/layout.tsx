import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/lib/theme/theme-script";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { DynamicFavicon } from "@/components/ui/dynamic-favicon";

export const runtime = 'edge';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atenra",
  description: "Professional SaaS Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ThemeScript/>
      </head>
      <body className={inter.className}>
        <Providers>
          <DynamicFavicon />
          {children}
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              style: {
                fontSize: '1.125rem',  // 18px instead of default 14px (roughly 50% bigger)
                padding: '1rem 1.25rem',  // Larger padding
                minHeight: '4rem',  // Minimum height for consistency
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
