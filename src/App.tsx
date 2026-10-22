import { Link } from '@heroui/react';

import { ThemeSwitch } from './components/ThemeSwitch';
import { Board } from './features/board/Board';

function App() {
  return (
    <div className="flex min-h-dvh flex-col p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-separator pb-4">
        <p className="flex items-center gap-3 text-2xl font-medium">
          <img src="/favicon.svg?v=2" alt="" width={32} height={32} />
          Team Planner
        </p>
        <ThemeSwitch />
      </header>

      <main className="flex flex-1 flex-col">
        <h1 className="mb-4 text-xl font-medium">Sprint board</h1>
        <Board />
      </main>

      <footer className="flex justify-end pt-6">
        <Link
          href="https://github.com/alessandvoken/team-planner"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-6 items-center gap-2 text-sm text-muted hover:text-accent"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="size-4"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
          </svg>
          Source on GitHub
        </Link>
      </footer>
    </div>
  );
}

export default App;
