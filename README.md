# Warframe Trade Companion

A personal companion app for tracking Warframe trading activity: platinum
earned and spent, transaction history, and a live-priced trading wishlist.

## Features

- **Accounting** — log trades (buy/sell), market purchases, and platinum
  purchases; see bought vs. traded platinum balances at a glance; browse,
  edit, and delete paginated transaction history.
- **Wishlist** — track items and sets you want to trade for, with live
  current price and 30-day median pulled from warframe.market (colored to
  flag good buy timing). Expand a set to see its items and their combined
  price. Marking an item bought hands off to Accounting with the trade
  pre-filled; discarding just removes it. Also shows total wishlist cost
  and the traded balance you'd have left after buying everything on it.
- **Item search** — item names autocomplete against the
  [warframe.market](https://warframe.market) catalog.

## Tech stack

- [Electron](https://www.electronjs.org) desktop shell
- [Vite](https://vite.dev) + React 19 + TypeScript — statically built UI,
  rendered inside the Electron window
- [Tailwind CSS](https://tailwindcss.com) v4
- [Prisma](https://www.prisma.io) 7 ORM over SQLite (via the
  `better-sqlite3` adapter), queried directly from Electron's main process
  over IPC

## Development

1. Install dependencies:
   ```
   npm install
   ```
   > Requires Node 22+ (see `.nvmrc`) — some dependencies ship ESM-only
   > builds that fail under `require()` on Node 20.
2. _(Optional)_ Copy `.env.example` to `.env` and fill in `DISCORD_WEBHOOK_URL`
   to enable wishlist sale notifications (native desktop notification +
   Discord webhook). Without it, notifications are just disabled.
   ```
   cp .env.example .env
   ```
3. Run the app:
   ```
   npm run electron:dev
   ```
   This builds the static UI export, compiles the Electron main process,
   and launches the app. On first launch it creates its SQLite database and
   applies migrations automatically — no manual database setup needed.

### Other scripts

| Command                  | Description                                             |
| ------------------------- | -------------------------------------------------------- |
| `npm run electron:dev`   | Build and launch the app                                |
| `npm run electron:build` | Build a distributable via electron-builder              |
| `npm run build:renderer` | Build the static UI only                                |
| `npm run build:electron` | Compile the Electron main/preload process only           |
| `npm run lint`            | Run ESLint                                              |

## Packaging

```
npm run electron:build
```

Builds the UI, compiles the Electron main process, and runs `electron-builder`
to produce a distributable in `dist/` (`.dmg`/`.zip` on macOS, `.exe` via NSIS
on Windows, `.AppImage`/`.deb` on Linux — see `electron-builder.yml`).

Native modules (`better-sqlite3`) mean this must run on the OS/architecture
you're packaging for — `node-gyp` can't cross-compile from, say, macOS to
Windows. To produce a Windows build, run the same two commands
(`npm install`, `npm run electron:build`) directly on a Windows machine. If
`node-gyp` fails there, it usually means the native build toolchain isn't
installed — either install Visual Studio Build Tools (the "Desktop
development with C++" workload) or run
`npm install --global windows-build-tools`.

macOS builds produced this way are unsigned (no Apple Developer ID
configured) — fine for running locally, but launching one on another Mac will
trigger a Gatekeeper warning (right-click → Open bypasses it).

## Data persistence

The SQLite database lives in Electron's per-OS `userData` directory (e.g.
`~/Library/Application Support/warframe-trade-companion/database.db` on
macOS) — independent of the app bundle, so updating the app never touches
existing data. Schema changes are applied on launch via
`prisma migrate deploy`, which only runs forward migrations and never
resets data.

## License

[MIT](LICENSE)
