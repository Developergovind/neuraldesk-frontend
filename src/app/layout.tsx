import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

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
      <body className={`${inter.className} font-body bg-obsidian-950 text-white min-h-screen antialiased selection:bg-cyan-500/30`}>
        <div className="noise-overlay" />
        <Providers>
          {children}
        </Providers>
        <CustomCursor />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(22, 22, 46, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#00d4ff', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
