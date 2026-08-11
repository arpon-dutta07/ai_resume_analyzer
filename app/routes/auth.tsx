import { usePuterStore } from "~/lib/puter";
import ThemeToggle from "~/components/ThemeToggle";
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";

export const meta = () => ([
    { title: 'Resumind — Sign In & Authentication' },
    { name: 'description', content: 'Log in with Puter to access your AI resume feedback and ATS analytics.' },
]);

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1] || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next]);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient Background Lighting Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Top Bar with Theme Switcher & Back Home */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 max-w-5xl mx-auto">
                <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                    ← Back to App
                </Link>
                <ThemeToggle />
            </div>

            {/* Main Auth Card */}
            <div className="glass-card max-w-xl w-full p-8 md:p-12 flex flex-col items-center gap-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative z-10 animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white text-3xl font-black">R</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gradient mt-2">Welcome to Resumind</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                        Passwordless authentication powered by Puter Cloud OS. Access your resume feedback from anywhere.
                    </p>
                </div>

                {/* Feature Bullets */}
                <div className="w-full bg-slate-100/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span> Instant ATS Compliance & Keyword Analysis
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span> Multi-model AI Evaluation (*Claude & GPT-4o*)
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✓</span> Zero Server Costs — Powered by Puter User-Pays Cloud
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3">
                    {isLoading ? (
                        <button disabled className="primary-button w-full py-4 text-lg font-bold opacity-80 cursor-wait">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Checking Auth Status...
                        </button>
                    ) : (
                        <>
                            {auth.isAuthenticated ? (
                                <button
                                    onClick={auth.signOut}
                                    className="secondary-button w-full py-3.5 text-base font-bold text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                >
                                    Sign Out of Resumind ({auth.user?.username || 'User'})
                                </button>
                            ) : (
                                <button
                                    onClick={auth.signIn}
                                    className="primary-button w-full py-4 text-lg font-bold shadow-xl shadow-indigo-500/25"
                                >
                                    Sign In with Puter
                                </button>
                            )}
                        </>
                    )}
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                    By continuing, you agree to Puter’s open-source privacy-focused Terms & Cloud Storage protocol.
                </p>
            </div>
        </main>
    );
};

export default Auth;
