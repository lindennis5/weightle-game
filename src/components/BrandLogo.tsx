import { useState } from "react";

const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

type LogoSource = { src: string } | { badge: { bg: string; fg: string; text: string } };

// Square site icons where the chain publishes a crisp one; a badge in the
// brand's colours where it doesn't (their icons are 16px and blur when scaled).
const LOGOS: Record<string, LogoSource> = {
  "A&W": { src: favicon("awrestaurants.com") },
  "Burger King": { src: favicon("bk.com") },
  "Chick-fil-A": { src: favicon("chick-fil-a.com") },
  Chipotle: { src: favicon("chipotle.com") },
  "Dairy Queen": { src: favicon("dairyqueen.com") },
  "Domino's": { src: favicon("dominos.com") },
  "Five Guys": { src: favicon("fiveguys.com") },
  "In-N-Out": {
    src: "https://upload.wikimedia.org/wikipedia/commons/8/8c/InNOut_2021_logo.svg",
  },
  KFC: { src: favicon("kfc.com") },
  "McDonald's": { src: favicon("mcdonalds.com") },
  "Panda Express": { src: favicon("pandaexpress.com") },
  "Pizza Hut": { src: favicon("pizzahut.com") },
  Popeyes: { src: favicon("popeyes.com") },
  "Shake Shack": { src: favicon("shakeshack.com") },
  Subway: { badge: { bg: "#008938", fg: "#ffc600", text: "S" } },
  "Taco Bell": { src: favicon("tacobell.com") },
  "Tim Hortons": { badge: { bg: "#c8102e", fg: "#ffffff", text: "TH" } },
  "Wendy's": { src: favicon("wendys.com") },
};

function initials(name: string): string {
  const words = name.replace(/[^A-Za-z& ]/g, "").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

interface Props {
  restaurant: string;
  size?: number;
}

/** The chain's own site icon, with a lettered badge if it can't be loaded. */
export default function BrandLogo({ restaurant, size = 28 }: Props) {
  const logo = LOGOS[restaurant];
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (logo && "badge" in logo) {
    const { bg, fg, text } = logo.badge;
    return (
      <span
        className="logo logo--badge"
        style={{ ...style, background: bg, color: fg }}
        aria-hidden="true"
      >
        {text}
      </span>
    );
  }

  if (!logo || failed) {
    return (
      <span className="logo logo--fallback" style={style} aria-hidden="true">
        {initials(restaurant)}
      </span>
    );
  }

  return (
    <span className="logo" style={style} aria-hidden="true">
      <img
        src={logo.src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
