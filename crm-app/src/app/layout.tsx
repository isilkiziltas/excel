import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Users, LayoutDashboard, PhoneCall } from "lucide-react";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const oswald = Oswald({ subsets: ["latin"], display: "swap", variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Olympus Gold CRM",
  description: "Müşteri Takip ve Hatırlatıcı Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={oswald.variable}>
      <body className={inter.className}>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-header">
              <PhoneCall size={28} color="var(--primary)" />
              <span>Olympus Gold</span>
            </div>
            <nav className="sidebar-nav">
              <Link href="/" className="nav-item">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/customers" className="nav-item">
                <Users size={20} />
                Müşteriler
              </Link>
            </nav>
          </aside>
          <main className="main-content">
            <Toaster position="top-right" toastOptions={{
              style: {
                background: '#ffffff',
                color: '#111827',
                border: '1px solid #e5e7eb',
                fontFamily: "var(--font-body)"
              }
            }} />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
