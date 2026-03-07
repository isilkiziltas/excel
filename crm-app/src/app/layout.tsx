import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NavigationLayout from "@/components/NavigationLayout";

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

import { UIProvider } from "@/contexts/UIContext";

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
            <UIProvider>
              <NavigationLayout>
                {children}
              </NavigationLayout>
            </UIProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
