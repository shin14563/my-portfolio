// src/pages/GamesPage.tsx
import { InvadersGame } from '../components/InvadersGame'; // 作成したゲームコンポーネントをインポート

export function GamesPage() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-8">Mini Game</h2>
      <InvadersGame />
    </div>
  );
}