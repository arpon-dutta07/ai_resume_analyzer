const ScoreCircle = ({ score = 75 }: { score: number }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const progress = Math.min(Math.max(score, 0), 100) / 100;
    const strokeDashoffset = circumference * (1 - progress);

    const getGradientColors = (s: number) => {
        if (s >= 80) return { start: "#10b981", end: "#06b6d4" }; // emerald to cyan
        if (s >= 60) return { start: "#f59e0b", end: "#6366f1" }; // amber to indigo
        return { start: "#f43f5e", end: "#e11d48" }; // rose
    };

    const colors = getGradientColors(score);
    const gradId = `score-grad-${score}-${Math.random().toString(36).substr(2, 4)}`;

    return (
        <div className="relative w-[85px] h-[85px] flex items-center justify-center">
            <svg
                height="100%"
                width="100%"
                viewBox="0 0 100 100"
                className="transform -rotate-90 drop-shadow-md"
            >
                <defs>
                    <linearGradient id={gradId} x1="1" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={colors.start} />
                        <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                </defs>
                {/* Track */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    className="stroke-slate-200 dark:stroke-slate-800"
                    strokeWidth={stroke}
                    fill="transparent"
                />
                {/* Animated Progress Circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={normalizedRadius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={stroke}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>

            {/* Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{`${score}/100`}</span>
            </div>
        </div>
    );
};

export default ScoreCircle;
