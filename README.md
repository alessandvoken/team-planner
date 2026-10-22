# Team planner

A sprint board and backlog in the family of Azure Boards. I'm using it to work on the parts of a rich client that are hard to get right: drag and drop that also works from the keyboard, two people moving cards at the same time, and a backlog of thousands of items that still scrolls smoothly.

Live demo: <https://team-planner-delta.vercel.app>

This is a work in progress. You can move sample work items between columns and reorder them with drag and drop. Cards show type, priority and assignee; opening one shows its description and comments. The board runs locally in browser memory: changes reset on reload, and comments currently reset when an item moves between columns. The backlog, backend persistence and real-time collaboration are still to come.

It uses React 19, TypeScript, Vite, HeroUI and React Aria, with Tailwind CSS for layout. HeroUI provides the styled controls; React Aria handles list interactions and drag and drop

## Running it locally

You need Node 22 and pnpm.

```sh
pnpm install
pnpm dev
```

The checks are `pnpm lint`, `pnpm format:check` and `pnpm build`.
Run `node --test tests/theme.test.mjs` to check initial theme selection, including blocked browser storage.

## Credits

The favicon adapts `layout-kanban` from [Tabler Icons](https://tabler.io/icons), MIT licence. The footer's GitHub icon is from [Bootstrap Icons](https://icons.getbootstrap.com/icons/github/), also MIT. Other icons use [Lucide](https://lucide.dev).
