import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { DynamicFavicon } from "@/components/ui/dynamic-favicon";
import { SplashScreen } from "@/components/ui/SplashScreen";

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DynamicFavicon />
          <SplashScreen>
            {children}
          </SplashScreen>
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
