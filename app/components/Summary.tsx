import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
    const textColor = score >= 70 ? 'text-emerald-600 dark:text-emerald-400'
        : score >= 50
        ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';

    return (
        <div className="w-full px-4 py-2">
            <div className="flex flex-row items-center justify-between p-4 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                <div className="flex flex-row gap-3 items-center">
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    <span className={textColor}>{score}</span><span className="text-slate-400 dark:text-slate-500 text-sm font-normal">/100</span>
                </p>
            </div>
        </div>
    );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="glass-card w-full p-6 flex flex-col gap-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80">
            <div className="flex flex-row max-sm:flex-col items-center p-2 gap-6">
                <div className="flex-shrink-0">
                    <ScoreGauge score={feedback.overallScore} />
                </div>

                <div className="flex flex-col gap-1.5 max-sm:text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Your Resume Score</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        This score evaluates your resume's tone, structure, content impact, and skill visibility against industry ATS benchmarks.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-1 pt-2">
                <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
                <Category title="Content" score={feedback.content.score} />
                <Category title="Structure" score={feedback.structure.score} />
                <Category title="Skills" score={feedback.skills.score} />
            </div>
        </div>
    );
};

export default Summary;
