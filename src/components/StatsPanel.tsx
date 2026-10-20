import { formatDateKey } from "../lib/date";
import type { Stats } from "../lib/stats";
import BrandLogo from "./BrandLogo";

export function StatsSummary({ stats }: { stats: Stats }) {
  const items = [
    { label: "Played", value: stats.played },
    { label: "Win %", value: stats.winRate ?? "–" },
    { label: "Streak", value: stats.currentStreak },
    { label: "Best", value: stats.maxStreak },
  ];
  return (
    <dl className="summary">
      {items.map(({ label, value }) => (
        <div key={label} className="summary__item">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Distribution({
  stats,
  highlight,
}: {
  stats: Stats;
  /** Guess count to emphasise, e.g. today's winning attempt. */
  highlight?: number;
}) {
  const max = Math.max(...stats.distribution, 1);
  return (
    <div className="dist">
      <h3 className="section-title">Guess distribution</h3>
      {stats.wins === 0 ? (
        <p className="muted">Win a game to see your distribution.</p>
      ) : (
        <ol className="dist__list">
          {stats.distribution.map((count, i) => (
            <li key={i} className="dist__row">
              <span className="dist__label">{i + 1}</span>
              <span className="dist__track">
                <span
                  className={`dist__bar${highlight === i + 1 ? " dist__bar--hl" : ""}`}
                  style={{ width: `${Math.max((count / max) * 100, 8)}%` }}
                >
                  {count}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function RecentGames({
  stats,
  restaurantOf,
}: {
  stats: Stats;
  /** Looks up the chain for an answer name (records only store the name). */
  restaurantOf: (answer: string) => string | undefined;
}) {
  if (stats.recent.length === 0) return null;
  return (
    <div>
      <h3 className="section-title">Recent days</h3>
      <ul className="recent">
        {stats.recent.map((r) => (
          <li key={r.date} className="recent__row">
            <span className="recent__date">{formatDateKey(r.date)}</span>
            <span className="recent__answer">
              {restaurantOf(r.answer) && (
                <BrandLogo restaurant={restaurantOf(r.answer)!} size={22} />
              )}
              <span>{r.answer || "–"}</span>
            </span>
            <span className={`pill ${r.win ? "pill--win" : "pill--loss"}`}>
              {r.win ? `${r.attempts}/8` : "X/8"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
