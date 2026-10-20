import { useState } from "react";
import Game from "./Game";
import { usePuzzleDate } from "./hooks/useClock";

export default function App() {
  const date = usePuzzleDate();
  // null = today's puzzle; a number = the nth practice round this session.
  const [practiceRound, setPracticeRound] = useState<number | null>(null);

  return (
    <Game
      // A new key mounts a completely fresh game: new day or new practice round.
      key={practiceRound === null ? date : `${date}:practice:${practiceRound}`}
      date={date}
      mode={practiceRound === null ? "daily" : "practice"}
      onPractice={() => setPracticeRound((n) => (n ?? 0) + 1)}
      onExitPractice={() => setPracticeRound(null)}
    />
  );
}
