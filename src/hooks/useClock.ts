import { useEffect, useState } from "react";
import { dateKey, nextPuzzleAt } from "../lib/date";

/** Today's UTC date key; updates itself when the next puzzle unlocks. */
export function usePuzzleDate(): string {
  const [key, setKey] = useState(() => dateKey());

  useEffect(() => {
    const now = new Date();
    const wait = nextPuzzleAt(now).getTime() - now.getTime() + 250;
    const timer = setTimeout(() => setKey(dateKey()), wait);
    // Timers are throttled in background tabs; re-check whenever the tab returns.
    const onVisible = () => {
      if (document.visibilityState === "visible") setKey(dateKey());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [key]);

  return key;
}

/** Milliseconds until the next puzzle, ticking once a second. */
export function useTimeUntilNextPuzzle(): number {
  const [remaining, setRemaining] = useState(
    () => nextPuzzleAt().getTime() - Date.now(),
  );

  useEffect(() => {
    const id = setInterval(
      () => setRemaining(nextPuzzleAt().getTime() - Date.now()),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return remaining;
}
