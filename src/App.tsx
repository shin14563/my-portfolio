// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { GameSelectionPage } from './pages/GameSelectionPage';
import { PokerGamePage } from './pages/PokerGamePage';
import { InvadersGamePage } from './pages/InvadersGamePage';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<GameSelectionPage />} />
        <Route path="/poker" element={<PokerGamePage />} />
        <Route path="/invaders" element={<InvadersGamePage />} />
      </Routes>
    </div>
  );
}

export default App;