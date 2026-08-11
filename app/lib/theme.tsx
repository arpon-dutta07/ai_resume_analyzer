import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const savedTheme = (localStorage.getItem("resumind-theme") as Theme) || "system";
        setThemeState(savedTheme);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const activeTheme = theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;

        setResolvedTheme(activeTheme);

        if (activeTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    const triggerThemeTransition = () => {
        const root = document.documentElement;
        root.classList.add("theme-transitioning");
        setIsTransitioning(true);

        setTimeout(() => {
            root.classList.remove("theme-transitioning");
            setIsTransitioning(false);
        }, 700);
    };

    const setTheme = (newTheme: Theme) => {
        triggerThemeTransition();
        setThemeState(newTheme);
        localStorage.setItem("resumind-theme", newTheme);
    };

    const toggleTheme = () => {
        triggerThemeTransition();
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
        setThemeState(nextTheme);
        localStorage.setItem("resumind-theme", nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme, isTransitioning }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
