// The daily puzzle rolls over at 00:00 UTC, so every date here is a UTC date.

/** YYYY-MM-DD for the given moment, in UTC. */
export function dateKey(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** The UTC instant at which the next puzzle unlocks. */
export function nextPuzzleAt(now = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
}

export function shiftDateKey(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return dateKey(d);
}

/** hh:mm:ss */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const parts = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}

/** "Oct 20" style label for a date key. */
export function formatDateKey(key: string): string {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
