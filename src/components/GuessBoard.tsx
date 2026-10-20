import { useState } from "react";
import { foodId, type Food } from "../foods";
import { evaluateGuess, isSameFood } from "../lib/game";
import BrandLogo from "./BrandLogo";
import Tile from "./Tile";

interface Props {
  guesses: Food[];
  target: Food;
}

export default function GuessBoard({ guesses, target }: Props) {
  // Guesses restored from storage appear instantly; only new ones animate in.
  const [restoredCount] = useState(guesses.length);

  if (guesses.length === 0) return null;

  return (
    <ol className="board" aria-label="Your guesses" reversed>
      {guesses
        .map((food, i) => ({ food, n: i + 1 }))
        .reverse()
        .map(({ food, n }) => {
          const solved = isSameFood(food, target);
          const reveal = n > restoredCount;
          return (
            <li
              key={foodId(food)}
              className={`guess${solved ? " guess--solved" : ""}${reveal ? " guess--new" : ""}`}
            >
              <div className="guess__head">
                <BrandLogo restaurant={food.restaurant} size={34} />
                <span className="guess__title">
                  <span className="guess__name">{food.name}</span>
                  <span className="guess__sub">
                    Guess {n} · {food.restaurant}
                  </span>
                </span>
                {solved && <span className="guess__badge">Answer</span>}
              </div>
              <div className="guess__tiles">
                {evaluateGuess(food, target).map((tile, i) => (
                  <Tile key={tile.key} tile={tile} index={i} reveal={reveal} />
                ))}
              </div>
            </li>
          );
        })}
    </ol>
  );
}
