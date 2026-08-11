import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import ThemeToggle from "~/components/ThemeToggle";

const Navbar = () => {
    const { auth } = usePuterStore();

    return (
        <header className="w-full pt-4 px-4 sticky top-0 z-50">
            <nav className="navbar flex items-center justify-between gap-4">
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
                    {/* Modern Theme Switcher Toggle Pill */}
                    <ThemeToggle />

                    {/* Auth Status / Sign In Pill */}
                    {auth.isAuthenticated ? (
                        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="truncate max-w-[120px]">{auth.user?.username || 'Signed In'}</span>
                        </div>
                    ) : (
                        <Link to="/auth" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2">
                            Sign In
                        </Link>
                    )}

                    <Link to="/upload" className="primary-button w-fit text-xs md:text-sm py-2.5 px-4 md:px-5">
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
