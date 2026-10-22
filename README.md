# Team planner

A sprint board and backlog in the family of Azure Boards. I'm using it to work on the parts of a rich client that are hard to get right: drag and drop that also works from the keyboard, two people moving cards at the same time, and a backlog of thousands of items that still scrolls smoothly.

Live demo: <https://team-planner-delta.vercel.app>

This is a work in progress. The board shows sample work items grouped by state, with counts and empty states. Drag and drop, the backlog and real-time updates are still to come. It uses React 19, TypeScript, Vite and HeroUI, with Tailwind CSS for layout.

## Running it locally

You need Node 22 and pnpm.

```sh
pnpm install
pnpm dev
```

The checks are `pnpm lint`, `pnpm format:check` and `pnpm build`.
Run `node --test tests/theme.test.mjs` to check initial theme selection, including blocked browser storage.

## Credits

The favicon is the `layout-kanban` icon from [Tabler Icons](https://tabler.io/icons), MIT licence.
