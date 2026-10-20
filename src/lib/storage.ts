// All persistence lives here. Every access is guarded: storage can be full,
// disabled, or unavailable (private mode), and the game must still work.

const KEYS = {
  results: "weightle.results",
  playedDate: "weightle.playedDate",
  progress: "weightle.progress",
  seenHelp: "weightle.seenHelp",
} as const;

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to write ${key}`, e);
  }
}

function readJson<T>(key: string, fallback: T): T {
  const raw = getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------- Today's board ----------

export type GameStatus = "playing" | "won" | "lost";

export interface DailyProgress {
  date: string;
  guessIds: string[];
  status: GameStatus;
}

export function loadProgress(date: string): DailyProgress | null {
  const p = readJson<DailyProgress | null>(KEYS.progress, null);
  return p && p.date === date && Array.isArray(p.guessIds) ? p : null;
}

export function saveProgress(progress: DailyProgress) {
  setItem(KEYS.progress, JSON.stringify(progress));
}

/** Set by every version of the game once the day's puzzle is finished. */
export function hasPlayed(date: string): boolean {
  return getItem(KEYS.playedDate) === date;
}

export function markPlayed(date: string) {
  setItem(KEYS.playedDate, date);
}

// ---------- Lifetime results ----------

export interface GameRecord {
  attempts: number;
  win: boolean;
  answer: string;
}

export type ResultsByDate = Record<string, GameRecord[]>;

export function getResults(): ResultsByDate {
  return readJson<ResultsByDate>(KEYS.results, {});
}

export function recordResult(date: string, record: GameRecord) {
  const results = getResults();
  results[date] = [...(results[date] ?? []), record];
  setItem(KEYS.results, JSON.stringify(results));
}

export function clearResults() {
  try {
    localStorage.removeItem(KEYS.results);
  } catch {
    // nothing to clear
  }
}

// ---------- Onboarding ----------

export function hasSeenHelp(): boolean {
  return getItem(KEYS.seenHelp) === "1";
}

export function markHelpSeen() {
  setItem(KEYS.seenHelp, "1");
}
