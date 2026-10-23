# Team Planner

A sprint board for planning and tracking IT based work. I'm using it to work on accessible drag and drop, with concurrent editing and a smoothly scrolling backlog of thousands of items as longer-term goals.

Live demo: <https://team-planner-delta.vercel.app>

## Current status

This is a work in progress. The current app includes:

- A sprint board with New, Active, Resolved and Closed columns.
- Drag and drop to move and reorder sample work items, including keyboard interactions through React Aria.
- Cards showing type, priority and assignee, with a modal for descriptions and local comments.
- Light and dark themes, following the system preference until a manual choice is saved.

Work items and their order live in browser memory and reset on reload. Comments belong to each mounted item component, so they also reset when an item moves between columns. Only the theme preference is saved in browser storage, when available.

The backlog, backend persistence and real-time collaboration are future work, not implemented features.

## Stack

The app uses **Next.js 16 App Router**, React 19, TypeScript, HeroUI 3, React Aria Components and Tailwind CSS 4 through PostCSS. Manrope is bundled locally through Fontsource. HeroUI provides styled controls; React Aria handles list interactions and drag and drop.

The root layout, header, footer and page are Server Components. The board and theme switch are the explicit Client Component boundaries. The page passes initial work items to the board as serializable props. See [the architecture](./ARCHITECTURE.md) for structure, naming and boundaries.

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

No environment variables or external services are required. `vercel.json` selects the Next.js preset and resets the old output-directory override for deployment.

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
```

The theme test checks the actual pre-hydration bootstrap, including invalid preferences and blocked browser storage. Lint runs separately from the Next.js build. Browser smoke checks during migration covered theme hydration, pointer and keyboard drag and drop, modal focus, comments and mobile layout in Chrome and WebKit; these are not part of `pnpm test`.

## Credits

The favicon adapts `layout-kanban` from [Tabler Icons](https://tabler.io/icons), MIT licence. The footer's GitHub icon is from [Bootstrap Icons](https://icons.getbootstrap.com/icons/github/), also MIT. Other icons use [Lucide](https://lucide.dev).
