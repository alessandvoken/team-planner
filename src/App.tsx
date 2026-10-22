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
    </div>
  );
}

export default App;
