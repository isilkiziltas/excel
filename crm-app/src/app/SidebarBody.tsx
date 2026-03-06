"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, PhoneCall, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SidebarBody() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "tr" ? "en" : "tr");
    };

    return (
        <aside className="sidebar flex flex-col justify-between" style={{ height: "100vh" }}>
            <div>
                <div className="sidebar-header">
                    <PhoneCall size={28} color="var(--primary)" />
                    <span>{t("appTitle")}</span>
                </div>
                <nav className="sidebar-nav">
                    <Link href="/" className={`nav-item ${pathname === "/" ? "active" : ""}`}>
                        <LayoutDashboard size={20} />
                        {t("navDashboard")}
                    </Link>
                    <Link href="/customers" className={`nav-item ${pathname === "/customers" ? "active" : ""}`}>
                        <Users size={20} />
                        {t("navCustomers")}
                    </Link>
                </nav>
            </div>

            <div style={{ padding: "20px", display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-tertiary)" }}>
                <button
                    onClick={toggleTheme}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "8px", fontSize: "0.8rem", textTransform: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                    {theme === "light" ? t("themeDark") : t("themeLight")}
                </button>

                <button
                    onClick={toggleLanguage}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "8px", fontSize: "0.8rem", textTransform: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "var(--font-body)" }}
                >
                    <Globe size={16} />
                    {language === "tr" ? "English" : "Türkçe"}
                </button>
            </div>
        </aside>
    );
}
