import { Link } from "react-router";
import { useTheme } from "~/lib/theme";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { resolvedTheme, toggleTheme } = useTheme();
    const { auth } = usePuterStore();

    return (
        <header className="w-full pt-4 px-4 sticky top-0 z-50">
            <nav className="navbar">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white text-xl font-black tracking-wider">R</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-extrabold tracking-tight text-gradient">RESUMIND</span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 -mt-1">AI ATS Analyzer</span>
                    </div>
                </Link>

                <div className="flex items-center gap-3">
                    {/* Theme Switcher Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer shadow-sm active:scale-95"
                        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                        aria-label="Toggle theme"
                    >
                        {resolvedTheme === 'dark' ? (
                            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth Status / Sign In Pill */}
                    {auth.isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="truncate max-w-[120px]">{auth.user?.username || 'Signed In'}</span>
                        </div>
                    ) : (
                        <Link to="/auth" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2">
                            Sign In
                        </Link>
                    )}

                    <Link to="/upload" className="primary-button w-fit text-sm py-2.5 px-5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Upload Resume
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
