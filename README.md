# Team Planner

A sprint board for planning and tracking IT based work. I'm using it to work on accessible drag and drop, with concurrent editing and a smoothly scrolling backlog of thousands of items as longer-term goals.

Live demo: <https://team-planner-delta.vercel.app>

## Current status

This is a work in progress. The current app includes:

- A sprint board with New, Active, Resolved and Closed columns.
- Initial work items loaded from Supabase-hosted Postgres through server-side SQL.
- Drag and drop from the whole card to move and reorder work items. Keyboard and screen reader users can use a Move card button that becomes visible on focus, powered by React Aria.
- Cards showing type, priority and assignee, with a modal for descriptions and local comments.
- Light and dark themes, following the system preference until a manual choice is saved.

The board starts with work items and their order from the database. Edits and moves live in browser memory; reloading restores the database values. Comments belong to each mounted item component, so they also reset when an item moves between columns. Only the theme preference is saved in browser storage, when available.

The backlog, server-side mutations and real-time collaboration are future work, not implemented features.

An architecture diagram is also planned as a learning task, showing the browser, Next.js Server and Client Components, server-side SQL and Postgres, with future Server Actions and Realtime flows clearly marked.

## Stack

The app uses **Next.js 16 App Router**, React 19, TypeScript, HeroUI 3, React Aria Components and Tailwind CSS 4 through PostCSS. Manrope is bundled locally through Fontsource. HeroUI provides styled controls; React Aria handles list interactions and drag and drop.

The root layout, header, footer and page are Server Components. The board and theme switch are the explicit Client Component boundaries. The page reads work items through `src/features/board/query.ts` and passes them to the board as serializable props.

## Running it locally

Use Node 22.18.0 or later in the Node 22 release line, and pnpm. The tests use Node's native TypeScript support.

```sh
pnpm install
pnpm dev
```

Open <http://localhost:3000>, or the local URL printed by Next.js if that port is occupied.

To run a production build locally:

```sh
pnpm build
pnpm start
```

Copy `.env.example` to `.env.local`. Set `DATABASE_URL` to the URI from **Connect → Direct → Transaction pooler**, replacing the password placeholder with your percent-encoded database password. This variable is server-only. Set the Supabase Project URL and publishable key from the Connect dialog too, for the browser's future Realtime subscriptions. `.env.local` is ignored by Git; configure the same variables in Vercel before deploying.

`src/lib/db.ts` uses `pg` to run SQL from Next.js server code through the transaction pooler, with verified TLS and a one-connection pool per module instance. The public [Supabase root CA certificate](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt) is bundled in `src/lib/supabase/prod-ca-2021.crt`. Keep SSL options out of `DATABASE_URL`; the client configures them. Use parameterized queries without a statement `name` (named prepared statements are incompatible with this pooler mode). `src/lib/supabase/client.ts` is reserved for browser-side Realtime; it does not handle database writes.

`vercel.json` selects the Next.js preset and resets the old output-directory override for deployment.

## Database schema

The initial migration in `supabase/migrations/` defines teammates, work items and comments. The migration and seed have been applied to the development database, with eight sample cards and three teammates: Nora Lind, Emil Berg and Alessandro Perchiazzi. Work items have a zero-based `position` unique within their state, plus a `version` for later conflict checks. The position constraint can be deferred within a move transaction; the server must increment the version and update `updated_at` when mutations are implemented.

RLS is enabled and the Data API roles have no table or sequence permissions. There are no browser read policies yet. SQL currently connects as `postgres`; a restricted application role must be configured before exposing server mutations. Realtime permissions and publication setup enter with subscriptions.

Run `pnpm db:schema:check` against an empty development database to validate the migration and seed in a transaction that is always rolled back. It refuses to run if board tables already exist. Migration and seed application is a separate step; they are not run during deployment.

## Deploying on Vercel

Use the existing Vercel project and Git deployment flow. `vercel.json` overrides the framework preset with Next.js, sets the build command to `pnpm build` and resets the output directory to the framework default. These settings do not need to be changed manually in the dashboard.

In the project's Build and Deployment settings, confirm:

- **Node.js Version:** `22.x` with the current maintained patch release.
- **Root Directory:** the repository root for this app; keep the current value if it already points there.
- **Install Command:** automatic package-manager detection, or `pnpm install --frozen-lockfile` if an explicit override is needed. Remove any old Vite-specific command.

Keep the same project, domain and Git integration. Deploy the new commit and check the preview; the previous deployment does not change until a new one is created. Remote project settings and a preview deployment have not been verified from this workspace.

## Checks

```sh
pnpm lint
pnpm format:check
pnpm build
pnpm test
pnpm db:check
```

The theme test checks the actual pre-hydration bootstrap, including invalid preferences and blocked browser storage. `pnpm db:check` requires `.env.local` and runs a read-only parameterized query against Postgres, checking that TLS is encrypted and verified. Lint runs separately from the Next.js build. Browser smoke checks during migration covered theme hydration, pointer and keyboard drag and drop, modal focus, comments and mobile layout in Chrome and WebKit; these are not part of `pnpm test`.

## Credits

The favicon adapts `layout-kanban` from [Tabler Icons](https://tabler.io/icons), MIT licence. The footer's GitHub icon is from [Bootstrap Icons](https://icons.getbootstrap.com/icons/github/), also MIT. Other icons use [Lucide](https://lucide.dev).
