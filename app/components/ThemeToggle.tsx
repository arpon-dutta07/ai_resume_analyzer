import { useTheme } from "~/lib/theme";

const ThemeToggle = ({ className = "" }: { className?: string }) => {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <div
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-10 p-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-md cursor-pointer select-none transition-all duration-300 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm ${className}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleTheme();
                }
            }}
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            aria-label="Toggle dark and light theme"
        >
            {/* Light Segment Icon */}
            <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10 text-xs font-bold transition-colors duration-300 ${
                    !isDark ? "text-indigo-950 dark:text-white font-extrabold" : "text-slate-500 dark:text-slate-400"
                }`}
            >
                <svg className={`w-4 h-4 transition-transform duration-300 ${!isDark ? "scale-110 text-amber-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">Light</span>
            </div>

            {/* Dark Segment Icon */}
            <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10 text-xs font-bold transition-colors duration-300 ${
                    isDark ? "text-indigo-300 font-extrabold" : "text-slate-500 dark:text-slate-400"
                }`}
            >
                <svg className={`w-4 h-4 transition-transform duration-300 ${isDark ? "scale-110 text-indigo-400" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden sm:inline">Dark</span>
            </div>

            {/* Sliding Pill Indicator */}
            <div
                className={`absolute top-1 bottom-1 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300 ease-spring ${
                    isDark
                        ? "left-[50%] right-1"
                        : "left-1 right-[50%]"
                }`}
            />
        </div>
    );
};

export default ThemeToggle;
