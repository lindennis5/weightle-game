# Weightle

**Play:** https://weightle-game.vercel.app/

A daily guessing game: find the mystery fast-food menu item in **8 tries** using its
nutrition facts. A new item unlocks every day at 00:00 UTC.

## How to play

Search for any menu item (by name or restaurant) and pick it. Each guess shows seven
tiles comparing it with the answer:

| Tile | Green | Yellow | Grey |
| :--- | :--- | :--- | :--- |
| Calories | exact | within 300 | further away |
| Protein | exact | within 20 g | further away |
| Carbs | exact | within 12 g | further away |
| Fat | exact | within 8 g | further away |
| Category · Type · Restaurant | same | — | different |

Arrows on number tiles point toward the answer: **↑** means the answer is higher,
**↓** means it's lower.

### Extras

- **Items fit:** a live count of menu items still consistent with every clue so far.
- **Practice rounds:** after the daily puzzle, play unlimited random items. They
  never touch your stats.
- **Stats & streaks:** win rate, current/best streak, guess distribution and recent
  days, all stored locally.
- **Share:** copy an emoji grid of your result without spoilers.
- Your board is saved, so refreshing mid-game picks up where you left off.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

### Project layout

```
src/
  foods.ts               menu data + daily answer picker
  lib/                   pure logic: game rules, search, dates, stats, storage
  hooks/                 useGame (daily/practice state), clock + countdown
  components/            board, tiles, autocomplete, modals, stats, logos
  Game.tsx               page layout and wiring
```

Restaurant logos are loaded from each chain's public site icon and belong to their
respective owners.
