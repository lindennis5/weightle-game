const STORAGE_KEY = "weightle.results";

export type GameRecord = {
  attempts: number;
  win: boolean;
  answer: string;
};

export type DayRecord = {
  date: string; // YYYY-MM-DD
  games: GameRecord[];
};

function readRaw(): Record<string, GameRecord[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, GameRecord[]>;
  } catch (e) {
    console.error("Failed reading stats storage", e);
    return {};
  }
}

function writeRaw(payload: Record<string, GameRecord[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed writing stats storage", e);
  }
}

export function getAllResults(): DayRecord[] {
  const raw = readRaw();
  return Object.keys(raw)
    .sort()
    .map((date) => ({ date, games: raw[date] }));
}

export function recordResult(date: string, attempts: number, win: boolean, answer: string) {
  if (!date) return;
  const raw = readRaw();
  raw[date] = raw[date] || [];
  raw[date].push({ attempts, win, answer });
  writeRaw(raw);
}

export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }
}

export default {
  getAllResults,
  recordResult,
  clearAll,
};
