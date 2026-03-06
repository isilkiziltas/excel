import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Users, LayoutDashboard, PhoneCall } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Olympus CRM",
  description: "Müşteri Takip ve Hatırlatıcı Sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="app-container">
          <aside className="sidebar">
            <div className="sidebar-header">
              <PhoneCall size={28} color="var(--primary)" />
              <span>Olympus CRM</span>
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
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              }
            }} />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
