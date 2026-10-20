import { foodId, foods, type Food } from "../foods";

export const MAX_GUESSES = 8;

type NumericKey = "calories" | "protein" | "carbs" | "fat";
type MatchKey = "category" | "subCategory" | "restaurant";

export const NUMERIC_FIELDS: ReadonlyArray<{
  key: NumericKey;
  label: string;
  unit: string;
  closeRange: number;
}> = [
  { key: "calories", label: "Calories", unit: "", closeRange: 300 },
  { key: "protein", label: "Protein", unit: "g", closeRange: 20 },
  { key: "carbs", label: "Carbs", unit: "g", closeRange: 12 },
  { key: "fat", label: "Fat", unit: "g", closeRange: 8 },
];

export const MATCH_FIELDS: ReadonlyArray<{ key: MatchKey; label: string }> = [
  { key: "category", label: "Category" },
  { key: "subCategory", label: "Type" },
  { key: "restaurant", label: "Restaurant" },
];

export type TileState = "exact" | "close" | "far";
export type Direction = "higher" | "lower" | null;

export interface TileFeedback {
  key: NumericKey | MatchKey;
  label: string;
  value: string;
  state: TileState;
  /** For numeric tiles: where the answer lies relative to this guess. */
  direction: Direction;
  kind: "numeric" | "match";
}

export function evaluateGuess(guess: Food, target: Food): TileFeedback[] {
  const numeric = NUMERIC_FIELDS.map(({ key, label, unit, closeRange }) => {
    const g = guess[key];
    const t = target[key];
    const state: TileState =
      g === t ? "exact" : Math.abs(g - t) <= closeRange ? "close" : "far";
    const direction: Direction = g < t ? "higher" : g > t ? "lower" : null;
    return { key, label, value: `${g}${unit}`, state, direction, kind: "numeric" as const };
  });

  const match = MATCH_FIELDS.map(({ key, label }) => {
    const same = guess[key].toLowerCase() === target[key].toLowerCase();
    return {
      key,
      label,
      value: guess[key],
      state: same ? ("exact" as const) : ("far" as const),
      direction: null,
      kind: "match" as const,
    };
  });

  return [...numeric, ...match];
}

export function isSameFood(a: Food, b: Food): boolean {
  return foodId(a) === foodId(b);
}

/** Compact fingerprint of the feedback a guess produces against a target. */
function feedbackKey(guess: Food, target: Food): string {
  return evaluateGuess(guess, target)
    .map((t) => `${t.state}${t.direction ?? ""}`)
    .join("|");
}

/** How many menu items are still consistent with every clue so far. */
export function countPossible(guesses: Food[], target: Food): number {
  if (guesses.length === 0) return foods.length;
  const clues = guesses.map((g) => feedbackKey(g, target));
  return foods.filter((candidate) =>
    guesses.every((g, i) => feedbackKey(g, candidate) === clues[i]),
  ).length;
}

// ---------- Search ----------

function normalize(text: string): string {
  return text
    .normalize("NFD") // splits accents off so the next line drops them
    .toLowerCase()
    .replace(/[^a-z0-9& ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const searchIndex = foods.map((food) => ({
  food,
  id: foodId(food),
  name: normalize(food.name),
  restaurant: normalize(food.restaurant),
  haystack: normalize(`${food.name} ${food.restaurant} ${food.category}`),
}));

/**
 * Ranked autocomplete: name prefix > word or restaurant prefix > substring >
 * every typed word somewhere in name/restaurant/category.
 */
export function searchFoods(
  query: string,
  excludeIds: ReadonlySet<string>,
  limit = 12,
): Food[] {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ");

  const ranked: { food: Food; score: number }[] = [];
  for (const entry of searchIndex) {
    if (excludeIds.has(entry.id)) continue;
    let score: number;
    if (entry.name.startsWith(q)) score = 0;
    else if (entry.name.includes(` ${q}`) || entry.restaurant.startsWith(q)) score = 1;
    else if (entry.name.includes(q)) score = 2;
    else if (tokens.every((t) => entry.haystack.includes(t))) score = 3;
    else continue;
    ranked.push({ food: entry.food, score });
  }

  return ranked
    .sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((r) => r.food);
}

// ---------- Sharing ----------

const EMOJI: Record<TileState, string> = { exact: "🟩", close: "🟨", far: "⬜" };

export function buildShareText(
  date: string,
  guesses: Food[],
  target: Food,
  won: boolean,
): string {
  const score = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const rows = guesses.map((g) =>
    evaluateGuess(g, target)
      .map((t) => EMOJI[t.state])
      .join(""),
  );
  return [`Weightle ${date} · ${score}`, "", ...rows, "", window.location.origin].join(
    "\n",
  );
}
