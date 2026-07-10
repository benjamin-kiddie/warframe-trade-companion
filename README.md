# Warframe Trade Companion

A personal companion app for tracking Warframe trading activity: platinum
earned and spent, transaction history, and a live-priced trading wishlist.

## Features

- **Accounting** — log trades (buy/sell), market purchases, and platinum
  purchases; see bought vs. traded platinum balances at a glance; browse,
  edit, and delete paginated transaction history.
- **Wishlist** — track items and sets you want to trade for, with live
  current price and 30-day average pulled from warframe.market (colored to
  flag good buy timing). Expand a set to see its items and their combined
  price. Marking an item bought hands off to Accounting with the trade
  pre-filled; discarding just removes it. Also shows total wishlist cost
  and the traded balance you'd have left after buying everything on it.
- **Item search** — item names autocomplete against the
  [warframe.market](https://warframe.market) catalog.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) + React 19 +
  TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [Prisma](https://www.prisma.io) 7 ORM over SQLite (via the
  `better-sqlite3` adapter)
- Docker for packaging/deployment

## Running it (Docker, no source needed)

This pulls the published image and persists its SQLite database in a Docker
volume, so it survives future updates.

1. Download `docker-compose.deploy.yml` from this repo:
   ```
   curl -O https://raw.githubusercontent.com/benjamin-kiddie/WarframeTradeCompanion/main/docker-compose.deploy.yml
   ```
2. In the same folder, run:
   ```
   docker compose -f docker-compose.deploy.yml pull
   docker compose -f docker-compose.deploy.yml up -d
   ```
3. Open [http://localhost:3000](http://localhost:3000).

To update later, re-run those same two commands — the `db-data` volume is
untouched by pulling a new image.

## Building the image yourself

If you're working on the app and want to build/push the image rather than
just run the published one, use `docker-compose.yml` (which builds from the
local `Dockerfile`) instead:

```
docker compose build
docker compose push   # publishes benjaminkiddie/warframe-trade-companion:latest
docker compose up -d
```

## Local development (without Docker)

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and adjust as needed:
   ```
   cp .env.example .env
   ```
3. Set up the database:
   ```
   npx prisma migrate dev
   ```
   > Requires Node 22+. Prisma's CLI currently fails on Node 20 with an
   > `ERR_REQUIRE_ESM` error from one of its dependencies. This only
   > affects Prisma CLI commands (`migrate`, `generate`, etc.) — the app
   > itself runs fine on Node 20+.
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

### Other scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start a production build |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite connection string used by Prisma | `file:./data/database.db` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Port the server listens on | `3000` |
| `HOSTNAME` | Host the server binds to | `0.0.0.0` |

## Data persistence

The SQLite database lives at whatever path `DATABASE_URL` points to. In
Docker, this is `/app/data/database.db`, backed by the named volume
`db-data` — it's independent of the image, so pulling/rebuilding a new
version never touches existing data. Schema changes are applied on startup
via `prisma migrate deploy`, which only runs forward migrations and never
resets data.

## License

[MIT](LICENSE)
