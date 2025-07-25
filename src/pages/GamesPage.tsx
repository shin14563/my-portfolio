// src/pages/GamesPage.tsx
import { PokerGame } from '../components/PokerGame';

export function GamesPage() {
  return (
    <div className="p-4 md:p-8 flex justify-center items-start bg-gray-200 min-h-screen">
      <PokerGame />
    </div>
  );
}
