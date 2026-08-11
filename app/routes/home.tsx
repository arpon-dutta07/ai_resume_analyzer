import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind — Dashboard & Resume Reviews" },
    { name: "description", content: "Smart AI feedback, ATS scoring, and resume application tracking." },
  ];
}

type FilterCategory = "all" | "excellent" | "good" | "needs-work";

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      try {
        const rawItems = (await kv.list('resume:*', true)) as KVItem[];
        const parsedResumes: Resume[] = [];

        if (Array.isArray(rawItems)) {
          for (const item of rawItems) {
            if (!item?.value) continue;
            try {
              const data = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
              if (data && data.id && data.feedback && typeof data.feedback === 'object') {
                parsedResumes.push(data as Resume);
              }
            } catch (e) {
              console.error("Failed parsing resume KV item:", item.key, e);
            }
          }
        }

        setResumes(parsedResumes);
      } catch (err) {
        console.error("Failed to load resumes from KV:", err);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);

  const handleDeleteResume = (deletedId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== deletedId));
  };

  // Analytics Metrics
  const stats = useMemo(() => {
    if (resumes.length === 0) {
      return { total: 0, avgScore: 0, highestScore: 0, excellentCount: 0 };
    }
    const scores = resumes.map((r) => r.feedback?.overallScore ?? 0);
    const total = resumes.length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const highestScore = Math.max(...scores);
    const excellentCount = scores.filter((s) => s >= 80).length;

    return { total, avgScore, highestScore, excellentCount };
  }, [resumes]);

  // Filtered & Searched Resumes
  const filteredResumes = useMemo(() => {
    return resumes.filter((r) => {
      const titleMatch = (r.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase());
      const companyMatch = (r.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSearch = titleMatch || companyMatch;

      const score = r.feedback?.overallScore ?? 0;
      let matchesFilter = true;
      if (activeFilter === "excellent") matchesFilter = score >= 80;
      else if (activeFilter === "good") matchesFilter = score >= 60 && score < 80;
      else if (activeFilter === "needs-work") matchesFilter = score < 60;

      return matchesSearch && matchesFilter;
    });
  }, [resumes, searchQuery, activeFilter]);

  return (
    <main className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Navbar />

      <section className="main-section">
        {/* Page Hero Header */}
        <div className="page-heading pt-8 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            AI ATS Application Intelligence
          </div>
          <h1>Track Your Resume Ratings & Applications</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Review detailed AI compliance scores, ATS keyword matches, and actionable tips for all your job target submissions.
          </p>
        </div>

        {/* Analytics Hero Cards */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="w-full max-w-[1500px] grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 animate-in fade-in duration-700">
            <div className="glass-card p-5 flex flex-col gap-1 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Evaluated</span>
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{stats.total}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Resumes analyzed</span>
            </div>

            <div className="glass-card p-5 flex flex-col gap-1 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Average Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.avgScore}</span>
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Across all applications</span>
            </div>

            <div className="glass-card p-5 flex flex-col gap-1 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Rating</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.highestScore}</span>
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Best ATS benchmark</span>
            </div>

            <div className="glass-card p-5 flex flex-col gap-1 border border-slate-200/80 dark:border-slate-800/80">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Excellent Tier</span>
              <span className="text-3xl font-black text-teal-600 dark:text-teal-400">{stats.excellentCount}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Scores 80+ Match</span>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        {!loadingResumes && resumes.length > 0 && (
          <div className="w-full max-w-[1500px] flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 border border-slate-200/80 dark:border-slate-800/80">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role or company..."
                className="pl-11 pr-4 py-2.5 rounded-xl text-sm border-none bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                All ({resumes.length})
              </button>
              <button
                onClick={() => setActiveFilter("excellent")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "excellent"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Excellent 80+
              </button>
              <button
                onClick={() => setActiveFilter("good")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "good"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Good 60-79
              </button>
              <button
                onClick={() => setActiveFilter("needs-work")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "needs-work"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Needs Work &lt;60
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-base font-semibold text-slate-600 dark:text-slate-400">Loading your resume reviews...</span>
          </div>
        )}

        {/* Resume Cards Grid */}
        {!loadingResumes && filteredResumes.length > 0 && (
          <div className="resumes-section">
            {filteredResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} onDelete={handleDeleteResume} />
            ))}
          </div>
        )}

        {/* Search Empty State */}
        {!loadingResumes && resumes.length > 0 && filteredResumes.length === 0 && (
          <div className="glass-card max-w-md w-full p-8 text-center flex flex-col items-center gap-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              🔍
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No matching resumes found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search terms or filter selection.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveFilter("all");
              }}
              className="secondary-button text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* No Resumes Found Empty State */}
        {!loadingResumes && resumes.length === 0 && (
          <div className="glass-card max-w-xl w-full p-12 text-center flex flex-col items-center gap-6 my-12 border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">No Resumes Analyzed Yet</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                Upload your PDF resume along with a target job title to receive AI compliance ratings, ATS tips, and structural feedback.
              </p>
            </div>
            <Link to="/upload" className="primary-button w-fit text-base py-3 px-8 shadow-xl shadow-indigo-500/25">
              Upload Your First Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
