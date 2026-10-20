import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Food } from "../foods";
import { foodId } from "../foods";
import { searchFoods } from "../lib/game";
import BrandLogo from "./BrandLogo";
import { SearchIcon } from "./icons";

interface Props {
  excludeIds: ReadonlySet<string>;
  onGuess: (food: Food) => void;
  autoFocus?: boolean;
}

/** Bolds the part of `text` that matches the query. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  const at = q ? text.toLowerCase().indexOf(q) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

export default function GuessInput({ excludeIds, onGuess, autoFocus }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const results = useMemo(() => searchFoods(query, excludeIds), [query, excludeIds]);
  const activeIndex = Math.min(active, results.length - 1);
  const expanded = open && query.trim().length > 0;

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (food: Food) => {
    onGuess(food);
    setQuery("");
    setActive(0);
    setOpen(false);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!results.length) return;
      setOpen(true);
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (expanded && results[activeIndex]) choose(results[activeIndex]);
    } else if (e.key === "Escape") {
      if (expanded) {
        e.preventDefault();
        setOpen(false);
      } else {
        setQuery("");
      }
    }
  };

  return (
    <div className={`search${expanded ? " search--open" : ""}`}>
      <div className="search__field">
        <SearchIcon className="search__icon" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && results[activeIndex] ? `${listId}-${activeIndex}` : undefined
          }
          aria-label="Guess a menu item"
          placeholder="Search menu items…"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            type="button"
            className="search__clear"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {expanded && (
        <ul ref={listRef} id={listId} role="listbox" className="search__list">
          {results.length === 0 ? (
            <li className="search__empty" role="presentation">
              No items match “{query.trim()}”
            </li>
          ) : (
            results.map((food, i) => (
              <li
                key={foodId(food)}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className="search__option"
                // Keep focus in the input so blur doesn't close the list mid-click.
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => i !== activeIndex && setActive(i)}
                onClick={() => choose(food)}
              >
                <BrandLogo restaurant={food.restaurant} size={30} />
                <span className="search__text">
                  <span className="search__name">
                    <Highlight text={food.name} query={query} />
                  </span>
                  <span className="search__meta">{food.restaurant}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
