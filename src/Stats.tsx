import { useMemo, useState } from "react";
import { getAllResults, clearAll } from "./statsStorage";

type Props = { onClose: () => void };

function percent(n: number, total: number) {
  if (total === 0) return "-";
  return `${Math.round((n / total) * 100)}%`;
}

export default function Stats({ onClose }: Props) {
  const [refreshToken, setRefreshToken] = useState(0);

  const days = useMemo(() => getAllResults().sort((a, b) => (a.date < b.date ? 1 : -1)), [refreshToken]);

  // Compute lifetime stats (aggregated across all days)
  const lifetimeStats = useMemo(() => {
    const allGames = days.flatMap((d) => d.games);
    const totalGames = allGames.length;
    const wins = allGames.filter((g) => g.win);
    const winCount = wins.length;
    const winPercent = percent(winCount, totalGames);
    const avgAttempts = wins.length > 0 ? (wins.reduce((s, g) => s + g.attempts, 0) / wins.length).toFixed(2) : "-";
    return { winPercent, avgAttempts, totalGames };
  }, [days]);

  const handleClear = () => {
    if (!confirm("Clear all stored stats?")) return;
    clearAll();
    setRefreshToken((t) => t + 1);
  };

  return (
    <div className="modal-overlay stats-modal" role="dialog" aria-modal="true">
      <div className="modal-content stats-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Results</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="restart-btn" onClick={handleClear}>Clear</button>
            <button className="give-up-btn" onClick={onClose}>Close</button>
          </div>
        </div>

        {days.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No results recorded yet.</p>
        ) : (
          <>
            {/* Lifetime Aggregates */}
            <div className="lifetime-stats">
              <div className="lifetime-stat-item">
                <div className="lifetime-label">Overall Win %</div>
                <div className="lifetime-value">{lifetimeStats.winPercent}</div>
              </div>
              <div className="lifetime-stat-item">
                <div className="lifetime-label">Avg Attempts</div>
                <div className="lifetime-value">{lifetimeStats.avgAttempts}</div>
              </div>
              <div className="lifetime-stat-item">
                <div className="lifetime-label">Total Games</div>
                <div className="lifetime-value">{lifetimeStats.totalGames}</div>
              </div>
            </div>

            {/* Daily Breakdown */}
            <div className="stats-table">
              <div className="stats-row stats-header">
                <div>Date</div>
                <div>Distribution</div>
              </div>
              {days.map((d) => {
                // distribution: attempts 1..8 (wins) and losses
                const buckets = Array.from({ length: 9 }, () => 0); // 0..8 (0 reserved for losses)
                d.games.forEach((g) => {
                  if (!g.win) buckets[0]++;
                  else if (g.attempts >= 1 && g.attempts <= 8) buckets[g.attempts]++;
                  else buckets[8]++;
                });
                const max = Math.max(...buckets, 1);

                return (
                  <div className="stats-row" key={d.date}>
                    <div className="stats-date">{d.date}</div>
                    <div className="stats-dist">
                      <div className="dist-labels">
                        <span className="loss-label">L</span>
                        {Array.from({ length: 8 }, (_, i) => <span key={i}>{i + 1}</span>)}
                      </div>
                      <div className="dist-bars">
                        {buckets.map((count, idx) => (
                          <div className="dist-segment" key={idx} title={`${idx === 0 ? "Losses" : idx} : ${count}`}>
                            <div className="dist-fill" style={{ width: `${(count / max) * 100}%` }} />
                            <div className="dist-count">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
