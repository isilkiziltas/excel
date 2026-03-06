/* eslint-disable */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { tr } from "@/locales/tr";
import { en } from "@/locales/en";

type Language = "tr" | "en";
type Dictionary = typeof tr;

interface LanguageContextType {
    language: Language;
    t: (key: keyof Dictionary) => string;
    setLanguage: (lang: Language) => void;
}

const dictionaries: Record<Language, Dictionary> = {
    tr,
    en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("tr");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem("language") as Language | null;
        if (savedLang && (savedLang === "tr" || savedLang === "en")) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: keyof Dictionary): string => {
        return dictionaries[language][key] || dictionaries["tr"][key] || key;
    };

    // Provider matches SSR and CSR trees now

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
