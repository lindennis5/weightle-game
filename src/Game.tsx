import { useEffect, useMemo, useRef, useState } from "react";
import { foodId, foods, type Food } from "./foods";
import { useGame, type GameMode } from "./hooks/useGame";
import { formatDateKey } from "./lib/date";
import { buildShareText, countPossible, MAX_GUESSES } from "./lib/game";
import { computeStats } from "./lib/stats";
import { clearResults, getResults, hasSeenHelp, markHelpSeen } from "./lib/storage";
import GuessBoard from "./components/GuessBoard";
import GuessInput from "./components/GuessInput";
import HelpContent from "./components/HelpContent";
import Modal from "./components/Modal";
import ResultCard from "./components/ResultCard";
import { Distribution, RecentGames, StatsSummary } from "./components/StatsPanel";
import { ChartIcon, FlagIcon, HelpIcon } from "./components/icons";
import Footer from "./components/Footer";

/** Long enough for the newest row's tiles to finish flipping. */
const REVEAL_MS = 1500;

type Dialog = "help" | "stats" | null;

const restaurantByName = new Map(foods.map((f) => [f.name, f.restaurant]));
const restaurantOf = (name: string) => restaurantByName.get(name);

async function shareText(text: string): Promise<"shared" | "copied" | null> {
  const mobile = window.matchMedia("(pointer: coarse)").matches;
  if (mobile && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch {
      return null; // dismissed
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return null;
  }
}

interface Props {
  date: string;
  mode: GameMode;
  onPractice: () => void;
  onExitPractice: () => void;
}

export default function Game({ date, mode, onPractice, onExitPractice }: Props) {
  const { target, guesses, status, guess, giveUp } = useGame(date, mode);
  const practice = mode === "practice";
  const [dialog, setDialog] = useState<Dialog>(() => (hasSeenHelp() ? null : "help"));
  const [toast, setToast] = useState<string | null>(null);
  const [confirmGiveUp, setConfirmGiveUp] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);
  const timers = useRef<number[]>([]);

  const playing = status === "playing";
  const won = status === "won";
  const excludeIds = useMemo(() => new Set(guesses.map(foodId)), [guesses]);
  const possible = useMemo(() => countPossible(guesses, target), [guesses, target]);
  // statsVersion forces a re-read after a game ends or stats are cleared.
  const stats = useMemo(
    () => computeStats(getResults(), date),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [date, status, statsVersion],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const showToast = (message: string) => {
    setToast(message);
    later(() => setToast((t) => (t === message ? null : t)), 2200);
  };

  const onGuess = (food: Food) => {
    const attempt = guesses.length + 1;
    guess(food);
    const solved = foodId(food) === foodId(target);
    if (!practice && (solved || attempt >= MAX_GUESSES)) {
      later(() => setDialog("stats"), REVEAL_MS);
    }
  };

  const onGiveUp = () => {
    if (!confirmGiveUp) {
      setConfirmGiveUp(true);
      later(() => setConfirmGiveUp(false), 3000);
      return;
    }
    setConfirmGiveUp(false);
    giveUp();
  };

  const onShare = async () => {
    const result = await shareText(buildShareText(date, guesses, target, won));
    if (result === "copied") showToast("Result copied to clipboard");
    else if (result === null) showToast("Couldn’t share — try again");
  };

  const closeDialog = () => {
    if (dialog === "help") markHelpSeen();
    setDialog(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <button
            className="icon-btn"
            onClick={() => setDialog("help")}
            aria-label="How to play"
          >
            <HelpIcon />
          </button>
          <h1 className="brand">Weightle</h1>
          <button
            className="icon-btn"
            onClick={() => setDialog("stats")}
            aria-label="Statistics"
          >
            <ChartIcon />
          </button>
        </div>
      </header>

      <main className="main">
        <section className="intro">
          {practice ? (
            <>
              <p className="intro__date intro__date--practice">Practice round</p>
              <p className="intro__text">
                A random item — just for fun, it won’t affect your stats.{" "}
                <button className="link-btn" onClick={onExitPractice}>
                  Back to today’s puzzle
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="intro__date">{formatDateKey(date)}</p>
              <p className="intro__text">Guess today’s fast-food item by its nutrition.</p>
            </>
          )}
        </section>

        <div className="status">
          <div
            className="pips"
            role="img"
            aria-label={`${guesses.length} of ${MAX_GUESSES} guesses used`}
          >
            {Array.from({ length: MAX_GUESSES }, (_, i) => (
              <span
                key={i}
                className={`pip${i < guesses.length ? " pip--used" : ""}${
                  won && i === guesses.length - 1 ? " pip--win" : ""
                }`}
              />
            ))}
          </div>
          <span className="status__count">
            {playing
              ? `${MAX_GUESSES - guesses.length} ${MAX_GUESSES - guesses.length === 1 ? "guess" : "guesses"} left`
              : won
                ? "Solved"
                : "Game over"}
          </span>
          {playing && guesses.length > 0 && (
            <span
              className="status__possible"
              title="Menu items that still fit every clue so far"
            >
              {possible} {possible === 1 ? "item fits" : "items fit"}
            </span>
          )}
          {playing && guesses.length > 0 && (
            <button
              className={`btn btn--sm ${confirmGiveUp ? "btn--danger" : "btn--ghost"}`}
              onClick={onGiveUp}
              onBlur={() => setConfirmGiveUp(false)}
            >
              <FlagIcon width={16} height={16} />
              {confirmGiveUp ? "Tap again to give up" : "Give up"}
            </button>
          )}
        </div>

        {playing ? (
          <GuessInput
            excludeIds={excludeIds}
            onGuess={onGuess}
            autoFocus={hasSeenHelp()}
          />
        ) : (
          <ResultCard
            target={target}
            won={won}
            attempts={guesses.length}
            practice={practice}
            onShare={guesses.length && !practice ? onShare : undefined}
            onStats={practice ? undefined : () => setDialog("stats")}
            onPractice={onPractice}
            onExitPractice={practice ? onExitPractice : undefined}
          />
        )}

        {playing && guesses.length === 0 && (
          <div className="empty">
            <div className="empty__tiles" aria-hidden="true">
              <span className="tile-ghost tile-ghost--exact" />
              <span className="tile-ghost tile-ghost--close" />
              <span className="tile-ghost tile-ghost--far" />
            </div>
            <p>
              Start with any item — a Big Mac, a burrito, some fries. The tiles will
              tell you how close you are.
            </p>
          </div>
        )}

        <GuessBoard guesses={guesses} target={target} />
      </main>

      <Footer />

      <Modal open={dialog === "help"} onClose={closeDialog} title="How to play">
        <HelpContent onStart={closeDialog} />
      </Modal>

      <Modal open={dialog === "stats"} onClose={closeDialog} title="Statistics">
        <div className="stats">
          {!playing && !practice && (
            <p className={`stats__headline ${won ? "is-win" : "is-loss"}`}>
              {won
                ? `You got it in ${guesses.length}! It was ${target.name}.`
                : `Today’s answer was ${target.name} (${target.restaurant}).`}
            </p>
          )}
          <StatsSummary stats={stats} />
          <Distribution stats={stats} highlight={won ? guesses.length : undefined} />
          <RecentGames stats={stats} restaurantOf={restaurantOf} />
          <div className="stats__actions">
            {stats.played > 0 && (
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  if (!window.confirm("Clear all saved stats on this device?")) return;
                  clearResults();
                  setStatsVersion((v) => v + 1);
                }}
              >
                Reset stats
              </button>
            )}
            {!playing && !practice && guesses.length > 0 && (
              <button className="btn btn--primary" onClick={onShare}>
                Share result
              </button>
            )}
          </div>
        </div>
      </Modal>

      <div className={`toast${toast ? " toast--show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}
