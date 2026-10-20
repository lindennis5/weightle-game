import { shiftDateKey } from "./date";
import { MAX_GUESSES } from "./game";
import type { GameRecord, ResultsByDate } from "./storage";

export interface Stats {
  played: number;
  wins: number;
  winRate: number | null;
  currentStreak: number;
  maxStreak: number;
  /** Wins by number of guesses: index 0 = solved in 1. */
  distribution: number[];
  recent: ({ date: string } & GameRecord)[];
}

export function computeStats(results: ResultsByDate, today: string): Stats {
  const dates = Object.keys(results).filter((d) => results[d]?.length).sort();
  const games = dates.flatMap((d) => results[d]);
  const wins = games.filter((g) => g.win);

  const distribution = Array.from({ length: MAX_GUESSES }, () => 0);
  for (const g of wins) {
    distribution[Math.min(Math.max(g.attempts, 1), MAX_GUESSES) - 1]++;
  }

  const wonDay = (d: string) => results[d]?.some((g) => g.win) ?? false;

  let maxStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (!wonDay(d)) run = 0;
    else run = prev && shiftDateKey(prev, 1) === d ? run + 1 : 1;
    maxStreak = Math.max(maxStreak, run);
    prev = d;
  }

  // An unplayed today doesn't break the streak yet.
  let currentStreak = 0;
  let cursor = results[today]?.length ? today : shiftDateKey(today, -1);
  while (wonDay(cursor)) {
    currentStreak++;
    cursor = shiftDateKey(cursor, -1);
  }

  const recent = dates
    .slice(-7)
    .reverse()
    .map((date) => ({ date, ...results[date][0] }));

  return {
    played: games.length,
    wins: wins.length,
    winRate: games.length ? Math.round((wins.length / games.length) * 100) : null,
    currentStreak,
    maxStreak,
    distribution,
    recent,
  };
}
