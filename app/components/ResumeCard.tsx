import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

interface ResumeCardProps {
    resume: Resume;
    onDelete?: (id: string) => void;
}

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath, resumePath }, onDelete }: ResumeCardProps) => {
    const { fs, kv } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = '';

        const loadResume = async () => {
            if (!imagePath) return;

            // Direct URL / local static asset path
            if (imagePath.startsWith('/images/') || imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
                if (isMounted) setResumeUrl(imagePath);
                return;
            }

            // Puter FS path
            try {
                const blob = await fs.read(imagePath);
                if (blob && isMounted) {
                    objectUrl = URL.createObjectURL(blob);
                    setResumeUrl(objectUrl);
                } else if (isMounted) {
                    setResumeUrl(imagePath);
                }
            } catch (err) {
                console.error("Failed to load resume thumbnail:", err);
                if (isMounted) setResumeUrl(imagePath);
            }
        };

        loadResume();

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath]);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleting(true);

        try {
            // Delete KV entry
            await kv.delete(`resume:${id}`);

            // Optionally delete files from Puter FS
            if (imagePath && !imagePath.startsWith('/images/')) {
                await fs.delete(imagePath).catch(() => {});
            }
            if (resumePath && !resumePath.startsWith('/images/')) {
                await fs.delete(resumePath).catch(() => {});
            }

            if (onDelete) onDelete(id);
        } catch (err) {
            console.error("Failed deleting resume review:", err);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const overallScore = feedback?.overallScore ?? 0;
    const atsScore = feedback?.ATS?.score ?? 0;

    const getScoreBadge = (score: number) => {
        if (score >= 80) return { label: "Excellent Match", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
        if (score >= 60) return { label: "Good Match", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
        return { label: "Needs Revision", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
    };

    const badge = getScoreBadge(overallScore);

    return (
        <div className="relative group">
            <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-700">
                <div className="resume-card-header">
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.color}`}>
                                {badge.label}
                            </span>
                            {atsScore > 0 && (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    ATS: {atsScore}/100
                                </span>
                            )}
                        </div>
                        {companyName && (
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {companyName}
                            </h2>
                        )}
                        {jobTitle && (
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                                {jobTitle}
                            </h3>
                        )}
                        {!companyName && !jobTitle && (
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Resume Review</h2>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={overallScore} />
                    </div>
                </div>

                <div className="gradient-border flex-1 flex flex-col overflow-hidden">
                    <div className="w-full h-full min-h-[260px] flex items-center justify-center bg-slate-50 dark:bg-slate-950/60 rounded-2xl overflow-hidden relative group/img">
                        {resumeUrl ? (
                            <>
                                <img
                                    src={resumeUrl}
                                    alt="resume thumbnail"
                                    className="w-full h-[320px] max-sm:h-[220px] object-cover object-top group-hover/img:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <span className="text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                                        Click to view full review &rarr;
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-medium">Loading thumbnail...</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* Quick Action Delete Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/90 dark:bg-slate-800/90 hover:bg-rose-500 hover:text-white text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md backdrop-blur-md z-10"
                title="Delete resume review"
                aria-label="Delete resume"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                >
                    <div className="glass-card max-w-md w-full p-6 flex flex-col gap-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl rounded-3xl">
                        <div className="flex items-center gap-3 text-rose-500">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Delete Resume Review?</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Are you sure you want to delete this resume evaluation for <strong className="text-slate-900 dark:text-slate-200">{companyName || jobTitle || "this submission"}</strong>? This action cannot be undone.
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
                                {isDeleting ? "Deleting..." : "Delete Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeCard;
