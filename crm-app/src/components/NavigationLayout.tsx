"use client";

import SidebarBody from "@/app/SidebarBody";
import { useUI } from "@/contexts/UIContext";
import { Toaster } from "react-hot-toast";

interface NavigationLayoutProps {
    children: React.ReactNode;
}

export default function NavigationLayout({ children }: NavigationLayoutProps) {
    const { isSidebarOpen, closeSidebar } = useUI();

    return (
        <div className="app-container">
            <SidebarBody isOpen={isSidebarOpen} onClose={closeSidebar} />

            <main className="main-content">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            fontFamily: "var(--font-body)"
                        }
                    }}
                />
                {children}
            </main>
        </div>
    );
}
