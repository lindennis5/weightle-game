import { useState } from "react";
import { foodId, foods, pickDailyFood, type Food } from "../foods";
import { isSameFood, MAX_GUESSES } from "../lib/game";
import {
  getResults,
  hasPlayed,
  loadProgress,
  markPlayed,
  recordResult,
  saveProgress,
  type GameStatus,
} from "../lib/storage";

const foodsById = new Map(foods.map((f) => [foodId(f), f]));

export type GameMode = "daily" | "practice";

interface GameState {
  target: Food;
  guesses: Food[];
  status: GameStatus;
}

function restoreDaily(date: string): GameState {
  const target = pickDailyFood(date);
  const saved = loadProgress(date);
  if (saved) {
    const guesses = saved.guessIds
      .map((id) => foodsById.get(id))
      .filter((f): f is Food => f !== undefined);
    return { target, guesses, status: saved.status };
  }
  // Finished on an older version of the game, before boards were saved.
  if (hasPlayed(date)) {
    const won = getResults()[date]?.some((r) => r.win) ?? false;
    return { target, guesses: [], status: won ? "won" : "lost" };
  }
  return { target, guesses: [], status: "playing" };
}

function newPractice(date: string): GameState {
  const daily = pickDailyFood(date);
  // Never hand out today's answer as a practice item.
  const pool = foods.filter((f) => !isSameFood(f, daily));
  return {
    target: pool[Math.floor(Math.random() * pool.length)],
    guesses: [],
    status: "playing",
  };
}

/**
 * One game: today's puzzle (saved, counts toward stats) or a practice round
 * (random, in-memory only). Mount with a `key` per game so state resets.
 */
export function useGame(date: string, mode: GameMode) {
  const practice = mode === "practice";
  const [state, setState] = useState(() =>
    practice ? newPractice(date) : restoreDaily(date),
  );
  const { target } = state;

  const commit = (next: GameState) => {
    setState(next);
    if (practice) return;
    saveProgress({ date, guessIds: next.guesses.map(foodId), status: next.status });
    if (next.status !== "playing") {
      markPlayed(date);
      recordResult(date, {
        attempts: next.guesses.length,
        win: next.status === "won",
        answer: target.name,
      });
    }
  };

  const guess = (food: Food) => {
    if (state.status !== "playing") return;
    if (state.guesses.some((g) => isSameFood(g, food))) return;
    const guesses = [...state.guesses, food];
    const status: GameStatus = isSameFood(food, target)
      ? "won"
      : guesses.length >= MAX_GUESSES
        ? "lost"
        : "playing";
    commit({ target, guesses, status });
  };

  const giveUp = () => {
    if (state.status !== "playing" || state.guesses.length === 0) return;
    commit({ ...state, status: "lost" });
  };

  return { ...state, guess, giveUp };
}
