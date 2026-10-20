import { nextPuzzleAt } from "../lib/date";
import { MATCH_FIELDS, MAX_GUESSES, NUMERIC_FIELDS } from "../lib/game";
import Tile from "./Tile";

export default function HelpContent({ onStart }: { onStart: () => void }) {
  const unlockTime = nextPuzzleAt().toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="help">
      <p className="help__lead">
        Guess today’s mystery fast-food item in <strong>{MAX_GUESSES} tries</strong>.
        Every guess shows how its nutrition and details compare to the answer.
      </p>

      <div className="help__examples">
        <div className="help__example">
          <Tile tile={{ label: "Protein", value: "28g", state: "exact", direction: null, kind: "numeric" }} />
          <p><strong>Green</strong> — an exact match.</p>
        </div>
        <div className="help__example">
          <Tile tile={{ label: "Calories", value: "540", state: "close", direction: "higher", kind: "numeric" }} />
          <p><strong>Yellow</strong> — close. The arrow points toward the answer.</p>
        </div>
        <div className="help__example">
          <Tile tile={{ label: "Fat", value: "12g", state: "far", direction: "lower", kind: "numeric" }} />
          <p><strong>Grey</strong> — not close, or a different category.</p>
        </div>
      </div>

      <h3 className="section-title">What counts as close</h3>
      <ul className="help__ranges">
        {NUMERIC_FIELDS.map((f) => (
          <li key={f.key}>
            <span>{f.label}</span>
            <span>
              within {f.closeRange}
              {f.unit || " cal"}
            </span>
          </li>
        ))}
        <li>
          <span>{MATCH_FIELDS.map((f) => f.label).join(", ")}</span>
          <span>exact match only</span>
        </li>
      </ul>

      <p className="muted help__note">
        A new item unlocks every day at {unlockTime} your time. Your board and
        stats are saved on this device.
      </p>

      <button className="btn btn--primary btn--block" onClick={onStart}>
        Let’s play
      </button>
    </div>
  );
}
