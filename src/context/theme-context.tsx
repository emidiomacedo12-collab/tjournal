"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "navy";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark"); // Default to dark

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme");
            if (stored === "light" || stored === "dark") {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTheme(stored);
            }
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark", "navy");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
