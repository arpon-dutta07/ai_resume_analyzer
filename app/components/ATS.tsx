import React, { useState } from 'react';

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Determine badge styling based on score
  const isHigh = score >= 70;
  const isMedium = score >= 50;

  const bgGrad = isHigh
    ? 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30'
    : isMedium
      ? 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30'
      : 'from-rose-500/10 via-red-500/5 to-transparent border-rose-500/30';

  const subtitle = isHigh ? 'Great Job!' : isMedium ? 'Good Start' : 'Needs Improvement';

  const handleCopyTip = (tipText: string, index: number) => {
    navigator.clipboard.writeText(tipText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`glass-card bg-gradient-to-b ${bgGrad} w-full p-8 flex flex-col gap-6 border dark:border-slate-800 backdrop-blur-xl relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg ${
            isHigh ? 'bg-emerald-500 text-white shadow-emerald-500/20' : isMedium ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
          }`}>
            {score}
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ATS Compliance Score</h2>
            <span className={`text-sm font-semibold ${isHigh ? 'text-emerald-600 dark:text-emerald-400' : isMedium ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {subtitle} ({score}/100)
            </span>
          </div>
        </div>

        <div className="px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          AI Evaluation Complete
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Applicant Tracking Systems (ATS) automatically screen resume text before a recruiter reads it. Follow the AI recommendations below to boost keyword matching and formatting accuracy.
      </p>

      {/* Suggestions checklist */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Actionable ATS Checklist ({suggestions.length} items)
        </h4>

        {suggestions.map((suggestion, index) => {
          const isGood = suggestion.type === "good";
          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all duration-200 ${
                isGood
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  isGood ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {isGood ? '✓' : '!'}
                </span>
                <p className="text-sm font-medium leading-relaxed">{suggestion.tip}</p>
              </div>

              <button
                onClick={() => handleCopyTip(suggestion.tip, index)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0"
                title="Copy suggestion prompt to clipboard"
              >
                {copiedIndex === index ? "Copied!" : "Copy Tip"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 italic border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
        💡 Tip: Keep updating your bullet points with quantitative metric keywords to continuously improve your ATS ranking.
      </p>
    </div>
  );
};

export default ATS;
