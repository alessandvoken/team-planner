# Team Planner

A sprint board for planning and tracking work, with pointer and keyboard drag and drop.

Live demo: <https://team-planner-delta.vercel.app>

## Features

- A sprint board with New, Active, Blocked, Resolved and Closed columns.
- Work items loaded from Postgres, with drag and drop to move and reorder cards using a pointer or keyboard.
- Type, priority and assignee on cards; descriptions and local comments in a detail modal.
- Light and dark themes, with a saved manual preference.

Work in progress: moves are not yet saved, so reloading restores the database state. Comments are local and also reset when a card moves between columns. Backlog and real-time collaboration are not implemented yet.

## Stack

Next.js 16 App Router, React 19, TypeScript, HeroUI 3, React Aria Components and Tailwind CSS 4. Server-side SQL uses `pg` with Supabase-hosted Postgres.

## Running it locally

Use Node 22.18+ in the Node 22 release line and pnpm 11.

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to your Supabase transaction-pooler URI, with a percent-encoded password. TLS is configured in the app; do not add SSL query parameters. The `NEXT_PUBLIC_SUPABASE_*` variables are reserved for future Realtime subscriptions.
3. On an empty database, apply `supabase/migrations/202610250001_initial_board.sql`, then `supabase/seed.sql` (eight cards and three teammates). Skip this if already applied. The app does not run migrations automatically.
4. Install dependencies and start the app:

```sh
pnpm install
pnpm dev
```

Open <http://localhost:3000>, or the URL printed in the terminal.

To run a production build locally:

```sh
pnpm build
pnpm start
```

## Checks

```sh
pnpm lint
pnpm format:check
pnpm build
pnpm test
pnpm db:check
```

`pnpm test` covers theme initialization. `pnpm db:check` requires `.env.local` and verifies the database connection and TLS. On an empty development database, `pnpm db:schema:check` validates the migration and seed, then rolls back.

## Credits

The favicon adapts `layout-kanban` from [Tabler Icons](https://tabler.io/icons), MIT licence. The footer's GitHub icon is from [Bootstrap Icons](https://icons.getbootstrap.com/icons/github/), also MIT. Other icons use [Lucide](https://lucide.dev).
