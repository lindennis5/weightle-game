// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import { foods, pickDailyFood, type Food } from "./foods";
import "./App.css";
import Stats from "./Stats";
import { recordResult } from "./statsStorage";

const CALORIE_CLOSE_RANGE = 300;
const PROTEIN_CLOSE_RANGE = 20;
const PLAYED_DATE_KEY = "weightle.playedDate";

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
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [timeUntilReset, setTimeUntilReset] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);

  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Calculate time until midnight
  const calculateTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const markPlayedToday = (date: string) => {
    try {
      localStorage.setItem(PLAYED_DATE_KEY, date);
    } catch (e) {
      console.error("Failed to persist played date", e);
    }
    setHasPlayedToday(true);
  };

  // Initialize game
  const initGame = () => {
    setTargetFood(pickDailyFood());
    setGuesses([]);
    setInputValue("");
    setGameOver(null);
    setShowEndModal(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem(PLAYED_DATE_KEY);
    const playedToday = storedDate === today;
    setHasPlayedToday(playedToday);
    initGame();
    setTimeUntilReset(calculateTimeUntilReset());
  }, []);

  // Update countdown timer every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeUntilReset(calculateTimeUntilReset());
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Check for date changes and refresh game at midnight
  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toISOString().split("T")[0];
      if (today !== currentDate) {
        setCurrentDate(today);
        setHasPlayedToday(false);
        try {
          localStorage.removeItem(PLAYED_DATE_KEY);
        } catch (e) {
          console.error("Failed to clear played date", e);
        }
        initGame();
      }
    };

    // Check every minute
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [currentDate]);

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
    if (gameOver || hasPlayedToday) return;

    const newGuesses = [food, ...guesses]; // Newest on top
    setGuesses(newGuesses);
    setInputValue("");
    setSuggestions([]);
    setHighlightedIndex(-1);

    if (food.name === targetFood?.name) {
      setGameOver("win");
      markPlayedToday(currentDate);
      setShowEndModal(true);
      setShowStats(true);
      recordResult(currentDate, newGuesses.length, true, food.name);
    } else if (newGuesses.length >= 8) {
      setGameOver("lose");
      markPlayedToday(currentDate);
      setShowEndModal(true);
      setShowStats(true);
      recordResult(currentDate, newGuesses.length, false, targetFood?.name ?? "");
    }
  };

  const handleGiveUp = () => {
    if (gameOver || hasPlayedToday || guesses.length === 0) return;
    setGameOver("lose");
    markPlayedToday(currentDate);
    setShowEndModal(true);
    setShowStats(true);
    setSuggestions([]);
    recordResult(currentDate, guesses.length, false, targetFood?.name ?? "");
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
        <div className="title-container">
          <h1>Weightle</h1>
          <div className="help-icon-wrapper" aria-label="How to play">
            <div className="help-icon" aria-hidden="true">
              ❓
            </div>
            <div className="tooltip-content">
              <h3>How to Play</h3>
              <p>Guess the mystery food item in 8 tries!</p>
              <hr />
              <ul>
                <li>
                  🟩 <strong>Green:</strong> Perfect match!
                </li>
                <li>
                  🟥 <strong>Red:</strong> Incorrect category or restaurant.
                </li>
                <li>
                  🟨 <strong>Yellow + Arrow:</strong> Close! The target number
                  is higher (↑) or lower (↓).
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p>
          Guess the chain-restaurant food item! Guesses remaining:{" "}
          <strong>{8 - guesses.length}</strong>
        </p>
        <div className="header-actions">
          {!gameOver && guesses.length > 0 && (
            <button className="give-up-btn" onClick={handleGiveUp}>
              Give Up
            </button>
          )}
          <button
            className="stats-btn"
            onClick={() => setShowStats(true)}
            aria-label="Open stats"
          >
            Stats
          </button>
          <p className="timer-text">
            Next puzzle in: <strong>{timeUntilReset}</strong>
          </p>
        </div>
      </header>

      {/* Input / Autocomplete Section */}
      {!gameOver && !hasPlayedToday && (
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

      {/* Game Played Today Message */}
      {hasPlayedToday && (
        <div className="played-today-message">
          <p>You've already completed today's puzzle. Come back tomorrow for the next one.</p>
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
      {gameOver && showEndModal && (
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
            <button className="restart-btn" onClick={() => setShowEndModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="credits">
        Built by
        <a
          className="social-link"
          href="https://github.com/lindennis5"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile lindennis5"
        >
          <span className="social-icon github" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 0.297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.429.372.81 1.102.81 2.222 0 1.606-.015 2.896-.015 3.286 0 .32.21.694.825.575C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </span>
          lindennis5
        </a>
        <span className="credits-separator">•</span>
        <a
          className="social-link"
          href="https://www.linkedin.com/in/dennisdlin"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile dennisdlin"
        >
          <span className="social-icon linkedin" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.025-3.036-1.852-3.036-1.853 0-2.136 1.446-2.136 2.938v5.667H9.351V9h3.413v1.561h.049c.476-.9 1.637-1.852 3.369-1.852 3.602 0 4.268 2.371 4.268 5.456v6.287zM5.337 7.433a2.067 2.067 0 1 1 0-4.134 2.067 2.067 0 0 1 0 4.134zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.728v20.543C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.272V1.728C24 .774 23.2 0 22.225 0z" />
            </svg>
          </span>
          dennisdlin
        </a>
      </footer>
      {showStats && <Stats onClose={() => setShowStats(false)} />}
      {gameOver && showEndModal && (
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
            <button className="restart-btn" onClick={() => setShowEndModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
