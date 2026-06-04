// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import { foods, pickRandomFood, type Food } from "./foods";
import "./App.css";

const CALORIE_CLOSE_RANGE = 300;
const PROTEIN_CLOSE_RANGE = 20;

type NumericProximity = "exact" | "close" | "far";

function getNumericProximity(
  guess: number,
  target: number,
  closeRange: number,
): NumericProximity {
  if (guess === target) return "exact";
  if (Math.abs(guess - target) <= closeRange) return "close";
  return "far";
}

export default function App() {
  const [targetFood, setTargetFood] = useState<Food | null>(null);
  const [guesses, setGuesses] = useState<Food[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Food[]>([]);
  const [gameOver, setGameOver] = useState<"win" | "lose" | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Initialize game
  const initGame = () => {
    setTargetFood(pickRandomFood());
    setGuesses([]);
    setInputValue("");
    setGameOver(null);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    initGame();
  }, []);

  // Handle Autocomplete Logic
  useEffect(() => {
    if (inputValue.trim() === "" || gameOver) {
      setSuggestions([]);
      return;
    }

    const filtered = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !guesses.some((g) => g.name === food.name), // Don't suggest already guessed items
    );
    setSuggestions(filtered);
    setHighlightedIndex((prev) => Math.min(prev, filtered.length - 1));
  }, [inputValue, guesses, gameOver]);

  const handleGuess = (food: Food) => {
    if (gameOver) return;

    const newGuesses = [food, ...guesses]; // Newest on top
    setGuesses(newGuesses);
    setInputValue("");
    setSuggestions([]);
    setHighlightedIndex(-1);

    if (food.name === targetFood?.name) {
      setGameOver("win");
    } else if (newGuesses.length >= 8) {
      setGameOver("lose");
    }
  };

  // Keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleGuess(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleGuess(suggestions[0]); // Default to first match
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const renderNumericCell = (
    guessVal: number,
    targetVal: number,
    closeRange: number,
    unit?: string,
  ) => {
    const proximity = getNumericProximity(guessVal, targetVal, closeRange);
    const display = unit ? `${guessVal}${unit}` : String(guessVal);
    const arrow = guessVal < targetVal ? "↑" : guessVal > targetVal ? "↓" : "";

    if (proximity === "exact") {
      return <td className="cell exact">{display}</td>;
    }

    const className =
      proximity === "close" ? "cell close" : "cell higher-lower";
    return (
      <td className={className}>
        {display} {arrow}
      </td>
    );
  };

  const renderMatchCell = (
    guessVal: string,
    targetVal: string,
    field: "category" | "restaurant",
  ) => {
    const isMatch = guessVal.toLowerCase() === targetVal.toLowerCase();
    return (
      <td
        className={`cell match-cell ${isMatch ? "match-cell--correct" : "match-cell--incorrect"}`}
        aria-label={`${field} ${isMatch ? "correct" : "incorrect"}`}
      >
        <div className="match-cell__inner">
          <span className="match-cell__icon" aria-hidden="true">
            {isMatch ? "✓" : "✗"}
          </span>
          <span className="match-cell__value">{guessVal}</span>
        </div>
      </td>
    );
  };

  if (!targetFood) return <div className="loading">Loading Weightle...</div>;

  return (
    <div className="game-container">
      <header>
        <h1>Weightle</h1>
        <p>
          Guess the chain-restaurant food item! Guesses remaining:{" "}
          <strong>{8 - guesses.length}</strong>
        </p>
      </header>

      {/* Input / Autocomplete Section */}
      {!gameOver && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Type a food name (e.g., Big Mac)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {suggestions.length > 0 && (
            <ul className="suggestions-list" ref={suggestionsRef}>
              {suggestions.map((food, index) => (
                <li
                  key={food.name}
                  className={index === highlightedIndex ? "active" : ""}
                  onClick={() => handleGuess(food)}
                >
                  {food.name}{" "}
                  <span className="subtext">({food.restaurant})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Comparison Table */}
      {guesses.length > 0 && (
        <div className="table-container">
          <table className="guess-table">
            <colgroup>
              <col className="col-name" />
              <col className="col-numeric" />
              <col className="col-numeric" />
              <col className="col-match" />
              <col className="col-match" />
            </colgroup>
            <thead>
              <tr>
                <th>Food Name</th>
                <th title="Yellow = within 300 cal of answer">Calories</th>
                <th title="Yellow = within 20 g of answer">Protein (g)</th>
                <th title="Green = same category, red = different">Category</th>
                <th title="Green = same restaurant, red = different">
                  Restaurant
                </th>
              </tr>
            </thead>
            <tbody>
              {guesses.map((guess, idx) => (
                <tr key={idx} className="fade-in">
                  <td
                    className={`cell name-cell ${guess.name === targetFood.name ? "exact" : ""}`}
                  >
                    {guess.name}
                  </td>
                  {renderNumericCell(
                    guess.calories,
                    targetFood.calories,
                    CALORIE_CLOSE_RANGE,
                  )}
                  {renderNumericCell(
                    guess.protein,
                    targetFood.protein,
                    PROTEIN_CLOSE_RANGE,
                    "g",
                  )}
                  {renderMatchCell(
                    guess.category,
                    targetFood.category,
                    "category",
                  )}
                  {renderMatchCell(
                    guess.restaurant,
                    targetFood.restaurant,
                    "restaurant",
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Win / Lose Modals */}
      {gameOver && (
        <div className="modal-overlay">
          <div className="modal-content">
            {gameOver === "win" ? (
              <h2 className="win-title">🎉 You Win! 🎉</h2>
            ) : (
              <h2 className="lose-title">💀 Game Over 💀</h2>
            )}
            <p>The answer was:</p>
            <div className="target-reveal">
              <h3>{targetFood.name}</h3>
              <p>
                {targetFood.restaurant} • {targetFood.category}
              </p>
              <p>
                {targetFood.calories} Calories | {targetFood.protein}g Protein
              </p>
            </div>
            <button className="restart-btn" onClick={initGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
