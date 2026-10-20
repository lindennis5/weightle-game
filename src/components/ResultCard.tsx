import type { Food } from "../foods";
import { useTimeUntilNextPuzzle } from "../hooks/useClock";
import { formatDuration } from "../lib/date";
import { MAX_GUESSES } from "../lib/game";
import BrandLogo from "./BrandLogo";
import { ChartIcon, ShareIcon, ShuffleIcon } from "./icons";

interface Props {
  target: Food;
  won: boolean;
  attempts: number;
  practice: boolean;
  onShare?: () => void;
  onStats?: () => void;
  onPractice: () => void;
  onExitPractice?: () => void;
}

export function Countdown() {
  const remaining = useTimeUntilNextPuzzle();
  return (
    <div className="countdown">
      <span className="countdown__label">Next item in</span>
      <span className="countdown__time">{formatDuration(remaining)}</span>
    </div>
  );
}

export function AnswerReveal({ target }: { target: Food }) {
  const facts = [
    { label: "Calories", value: target.calories },
    { label: "Protein", value: `${target.protein}g` },
    { label: "Carbs", value: `${target.carbs}g` },
    { label: "Fat", value: `${target.fat}g` },
  ];
  return (
    <div className="answer">
      <BrandLogo restaurant={target.restaurant} size={52} />
      <span className="answer__eyebrow">{target.restaurant}</span>
      <span className="answer__name">{target.name}</span>
      <span className="answer__tags">
        {target.category} · {target.subCategory}
      </span>
      <dl className="answer__facts">
        {facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Shown in place of the search box once today's game is over. */
export default function ResultCard({
  target,
  won,
  attempts,
  practice,
  onShare,
  onStats,
  onPractice,
  onExitPractice,
}: Props) {
  return (
    <section className={`result ${won ? "result--won" : "result--lost"}`}>
      <div className="result__headline">
        <span className="result__title">{won ? "Nailed it!" : "So close."}</span>
        <span className="result__sub">
          {won
            ? `Solved in ${attempts}/${MAX_GUESSES}`
            : practice
              ? "Try another round"
              : attempts
                ? "Better luck tomorrow"
              : "You’ve played today"}
        </span>
      </div>
      <AnswerReveal target={target} />
      <div className="result__footer">
        {practice ? (
          <button className="link-btn" onClick={onExitPractice}>
            ← Back to today’s puzzle
          </button>
        ) : (
          <Countdown />
        )}
        <div className="result__actions">
          {onStats && (
            <button className="btn btn--ghost" onClick={onStats}>
              <ChartIcon width={18} height={18} /> Stats
            </button>
          )}
          <button className={`btn ${onShare ? "btn--ghost" : "btn--primary"}`} onClick={onPractice}>
            <ShuffleIcon width={18} height={18} /> {practice ? "New round" : "Practice"}
          </button>
          {onShare && (
            <button className="btn btn--primary" onClick={onShare}>
              <ShareIcon width={18} height={18} /> Share
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
