import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";

const ScoreBadge = ({ score }: { score: number }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-1.5 items-center px-3 py-1 rounded-full text-xs font-bold border",
        score >= 70
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : score >= 40
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
      )}
    >
      <span>{score >= 70 ? "✓" : "!"}</span>
      <span>{score}/100</span>
    </div>
  );
};

const CategoryHeader = ({
  title,
  categoryScore,
}: {
  title: string;
  categoryScore: number;
}) => {
  return (
    <div className="flex flex-row gap-4 items-center py-2">
      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</p>
      <ScoreBadge score={categoryScore} />
    </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  return (
    <div className="flex flex-col gap-4 items-center w-full pt-2">
      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 w-full rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {tips.map((tip, index) => (
          <div className="flex flex-row gap-2.5 items-center" key={index}>
            <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
              tip.type === "good" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
            }`}>
              {tip.type === "good" ? "✓" : "!"}
            </span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{tip.tip}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 w-full">
        {tips.map((tip, index) => (
          <div
            key={index + tip.tip}
            className={cn(
              "flex flex-col gap-2 rounded-2xl p-4 border transition-all duration-200",
              tip.type === "good"
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
                : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200"
            )}
          >
            <div className="flex flex-row gap-2.5 items-center">
              <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                tip.type === "good" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
              }`}>
                {tip.type === "good" ? "✓" : "!"}
              </span>
              <p className="text-base font-bold">{tip.tip}</p>
            </div>
            <p className="text-sm opacity-90 leading-relaxed pl-7">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader
              title="Tone & Style"
              categoryScore={feedback.toneAndStyle.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader
              title="Content"
              categoryScore={feedback.content.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader
              title="Structure"
              categoryScore={feedback.structure.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader
              title="Skills"
              categoryScore={feedback.skills.score}
            />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Details;
