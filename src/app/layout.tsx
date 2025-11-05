import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner'; // 👈 add this
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VeriAct - AI-Powered Meeting Action Item Tracker",
  description: "Extract, track, and never miss action items from your meetings. Privacy-first, GDPR compliant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}

          {/* ✅ Cookie consent banner (appears site-wide) */}
          <CookieBanner />

          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
