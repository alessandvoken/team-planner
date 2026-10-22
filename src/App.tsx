import { ThemeSwitch } from './components/ThemeSwitch';
import { Board } from './features/board/Board';

function App() {
  return (
    <main className="flex min-h-dvh flex-col p-6">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-medium">Sprint board</h1>
        <ThemeSwitch />
      </header>

      <Board />
    </main>
  );
}

export default App;
