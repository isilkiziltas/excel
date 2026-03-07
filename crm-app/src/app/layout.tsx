import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment
// @ts-ignore
import SidebarBody from "./SidebarBody";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const oswald = Oswald({ subsets: ["latin"], display: "swap", variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Olympus Gold CRM",
  description: "Premium Müşteri Takip ve Hatırlatıcı Sistemi",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gold CRM",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#da251d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={oswald.variable}>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <div className="app-container">
              <SidebarBody />
              <main className="main-content">
                <Toaster position="top-right" toastOptions={{
                  style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    fontFamily: "var(--font-body)"
                  }
                }} />
                {children}
              </main>
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
