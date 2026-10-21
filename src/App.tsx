import { Board } from './features/board/Board';

function App() {
  return (
    <main className="min-h-screen bg-page p-6 text-foreground">
      <h1 className="mb-3 text-2xl font-medium">Sprint board</h1>
      <Board />
    </main>
  );
}

export default App;
