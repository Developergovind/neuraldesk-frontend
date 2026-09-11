import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

import { Suspense } from "react";
import { RouteProgressBar } from "@/components/ui/RouteProgressBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeuralDesk - Next-Gen AI Chatbot Platform",
  description: "Create branded AI chatbots, feed them knowledge, and embed them anywhere with a single script tag.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} font-body bg-obsidian-950 text-white min-h-screen antialiased selection:bg-coral-400/30 selection:text-white relative`}>
        <div className="noise-overlay" />
        <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>
        <Providers>
          {children}
        </Providers>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(44, 43, 48, 0.95)',
              color: '#D6D6D6',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(214, 214, 214, 0.15)',
            },
            success: {
              iconTheme: { primary: '#F58F7C', secondary: '#2C2B30' },
            },
          }}
        />
      </body>
    </html>
  );
}
