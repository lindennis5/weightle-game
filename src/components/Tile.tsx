import type { CSSProperties } from "react";
import type { TileFeedback } from "../lib/game";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from "./icons";

interface Props {
  tile: Pick<TileFeedback, "label" | "value" | "state" | "direction" | "kind">;
  /** Position in the row; drives the staggered reveal. */
  index?: number;
  reveal?: boolean;
}

function describe({ state, direction, kind }: Props["tile"]): string {
  if (state === "exact") return "match";
  if (kind === "match") return "no match";
  const where = direction === "higher" ? "answer is higher" : "answer is lower";
  return state === "close" ? `close, ${where}` : `far, ${where}`;
}

export default function Tile({ tile, index = 0, reveal = false }: Props) {
  const { label, value, state, direction, kind } = tile;
  return (
    <div
      className={`tile tile--${state} tile--${kind}${reveal ? " tile--reveal" : ""}`}
      style={{ "--i": index } as CSSProperties}
      aria-label={`${label}: ${value}, ${describe(tile)}`}
    >
      <span className="tile__label" aria-hidden="true">
        {label}
      </span>
      <span className="tile__value" aria-hidden="true">
        <span className="tile__text">{value}</span>
        {state === "exact" && <CheckIcon className="tile__icon" />}
        {direction === "higher" && <ArrowUpIcon className="tile__icon" />}
        {direction === "lower" && <ArrowDownIcon className="tile__icon" />}
      </span>
    </div>
  );
}
