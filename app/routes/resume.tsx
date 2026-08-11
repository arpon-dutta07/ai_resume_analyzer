import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { useTheme } from "~/lib/theme";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumind — Detailed ATS Resume Evaluation' },
    { name: 'description', content: 'Comprehensive AI ATS score, suggestions, and category evaluation breakdown.' },
]);

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { resolvedTheme, toggleTheme } = useTheme();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, auth.isAuthenticated]);

    useEffect(() => {
        let isMounted = true;
        let pdfObjUrl = '';
        let imgObjUrl = '';

        const loadFileUrl = async (path: string, defaultMime: string) => {
            if (!path) return '';

            // Static local images in /images/ or external URLs
            if (path.startsWith('/images/') || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
                return path;
            }

            // Puter Cloud Storage path (e.g. /AppData/...)
            try {
                const fileData = await fs.read(path);
                if (fileData) {
                    const blob = fileData instanceof Blob ? fileData : new Blob([fileData], { type: defaultMime });
                    return URL.createObjectURL(blob);
                }
            } catch (e) {
                console.warn(`Failed to read ${path} from Puter FS:`, e);
            }

            return path;
        };

        const loadResume = async () => {
            if (!id) return;
            const resumeStr = await kv.get(`resume:${id}`);

            if (!resumeStr) return;

            let data;
            try {
                data = typeof resumeStr === 'string' ? JSON.parse(resumeStr) : resumeStr;
            } catch (e) {
                console.error("Failed to parse resume JSON:", e);
                return;
            }

            if (!data) return;

            // Set feedback structure
            try {
                const parsedFeedback = typeof data.feedback === 'string' ? JSON.parse(data.feedback) : data.feedback;
                if (isMounted) setFeedback(parsedFeedback);
            } catch (e) {
                console.error("Failed to parse feedback structure:", e);
            }

            // Load resume PDF object URL
            if (data.resumePath) {
                const pdfUrl = await loadFileUrl(data.resumePath, 'application/pdf');
                if (isMounted) {
                    if (pdfUrl.startsWith('blob:')) pdfObjUrl = pdfUrl;
                    setResumeUrl(pdfUrl);
                }
            }

            // Load resume preview image object URL
            if (data.imagePath) {
                const imgUrl = await loadFileUrl(data.imagePath, 'image/png');
                if (isMounted) {
                    if (imgUrl.startsWith('blob:')) imgObjUrl = imgUrl;
                    setImageUrl(imgUrl);
                }
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (pdfObjUrl) URL.revokeObjectURL(pdfObjUrl);
            if (imgObjUrl) URL.revokeObjectURL(imgObjUrl);
        };
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await kv.delete(`resume:${id}`);
            navigate('/');
        } catch (err) {
            console.error("Failed to delete resume evaluation:", err);
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <main className="!pt-0 bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Top Navigation & Action Toolbar */}
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Dashboard</span>
                </Link>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/80 dark:border-slate-700/80"
                        title="Toggle Dark/Light Mode"
                    >
                        {resolvedTheme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    {/* Export / Print PDF */}
                    <button
                        onClick={handlePrint}
                        className="secondary-button text-xs py-2 px-3.5"
                        title="Print or Save PDF report"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Export Report
                    </button>

                    {/* Delete Action */}
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors border border-slate-200/80 dark:border-slate-800"
                        title="Delete Evaluation"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="flex flex-row w-full items-start max-lg:flex-col-reverse">
                {/* Left Side: Unconstrained Full Height Preview */}
                <section className="w-1/2 max-lg:w-full bg-[url('/images/bg-small.svg')] bg-cover p-4 md:p-6 min-h-screen">
                    <div className="gradient-border w-full rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-xl !p-3 border border-slate-200/80 dark:border-slate-800/80">
                        {imageUrl ? (
                            <a href={resumeUrl || imageUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                                <img
                                    src={imageUrl}
                                    className="w-full h-auto rounded-xl shadow-md"
                                    alt="Resume Preview"
                                    title="Click to open full resume file"
                                />
                            </a>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 gap-3 p-12 min-h-[500px]">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-base font-medium text-slate-600 dark:text-slate-400">Loading resume preview...</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Side: Feedback Overview & Details */}
                <section className="feedback-section w-1/2 max-lg:w-full">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">Resume Review</h2>
                        {resumeUrl && (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="secondary-button text-xs py-1.5 px-3"
                            >
                                Open Original PDF ↗
                            </a>
                        )}
                    </div>

                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 gap-4">
                            <img src="/images/resume-scan-2.gif" className="w-full max-w-sm rounded-2xl" alt="scanning" />
                            <span className="text-sm font-semibold text-slate-500">Loading AI evaluation data...</span>
                        </div>
                    )}
                </section>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="glass-card max-w-md w-full p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl">
                        <div className="flex items-center gap-3 text-rose-500">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                ⚠️
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Resume Review?</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Are you sure you want to delete this evaluation report? It will be permanently removed from your history.
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors shadow-md shadow-rose-600/20"
                            >
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Resume;
