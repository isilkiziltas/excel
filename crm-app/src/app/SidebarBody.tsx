"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LayoutDashboard, PhoneCall, Moon, Sun, Globe, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function SidebarBody({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === "tr" ? "en" : "tr");
    };

    // Close sidebar when a link is clicked (on mobile)
    const handleLinkClick = () => {
        if (onClose) onClose();
    };

    return (
        <>
            {/* Overlay for mobile drawer */}
            <div
                className={`sidebar-overlay ${isOpen ? "active" : ""}`}
                onClick={onClose}
            ></div>

            <aside className={`sidebar ${isOpen ? "open" : ""} flex flex-col justify-between`} style={{ height: "100vh" }}>
                <div>
                    <div className="sidebar-header">
                        <div className="flex items-center gap-3 flex-1">
                            <PhoneCall size={28} color="var(--primary)" />
                            <span>{t("appTitle")}</span>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            className="btn btn-secondary lg:hidden"
                            onClick={onClose}
                            style={{ padding: '4px', border: 'none', background: 'transparent' }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="sidebar-nav">
                        <Link
                            href="/"
                            className={`nav-item ${pathname === "/" ? "active" : ""}`}
                            onClick={handleLinkClick}
                        >
                            <LayoutDashboard size={20} />
                            {t("navDashboard")}
                        </Link>
                        <Link
                            href="/customers"
                            className={`nav-item ${pathname === "/customers" ? "active" : ""}`}
                            onClick={handleLinkClick}
                        >
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
        </>
    );
}
