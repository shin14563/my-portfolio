// src/components/InvadersGame.tsx
import React, { useState, useEffect, useCallback } from 'react';

// ゲーム領域のサイズ
const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;

// ゲームコンポーネント本体
export function InvadersGame() {
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 });
  const [bullets, setBullets] = useState<{ x: number; y: number }[]>([]);
  const [aliens, setAliens] = useState<{ x: number; y: number; direction: 'left' | 'right' }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // 初回レンダリング時にエイリアンを生成
  useEffect(() => {
    const initialAliens = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        initialAliens.push({ x: 60 + i * 80, y: 50 + j * 50, direction: 'right' });
      }
    }
    setAliens(initialAliens);
  }, []);

  // キーボード操作の処理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    if (e.key === 'ArrowLeft') {
      setPlayer((p) => ({ ...p, x: Math.max(p.x - 10, 10) }));
    } else if (e.key === 'ArrowRight') {
      setPlayer((p) => ({ ...p, x: Math.min(p.x + 10, GAME_WIDTH - 20) }));
    } else if (e.key === ' ') { // スペースキーで弾を発射
      setBullets((b) => [...b, { x: player.x, y: player.y }]);
    }
  }, [player, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // ゲームのメインループ
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      // 弾の移動
      setBullets((prevBullets) =>
        prevBullets.map((b) => ({ ...b, y: b.y - 5 })).filter((b) => b.y > 0)
      );

      // エイリアンの移動
      setAliens((prevAliens) => {
        let directionChanged = false;
        const newAliens = prevAliens.map(a => {
            if(a.x <= 10 || a.x >= GAME_WIDTH - 20) directionChanged = true;
            return a;
        });

        return newAliens.map(a => {
            const direction = directionChanged ? (a.direction === 'left' ? 'right' : 'left') : a.direction;
            const newY = directionChanged ? a.y + 15 : a.y;
            const newX = direction === 'right' ? a.x + 2 : a.x - 2;
            if(newY > player.y - 10) setGameOver(true);
            return { x: newX, y: newY, direction};
        });
      });

      // 当たり判定
      setBullets((prevBullets) => {
        const remainingBullets = [];
        for(const bullet of prevBullets) {
            let hit = false;
            setAliens(prevAliens => {
                const remainingAliens = prevAliens.filter(alien => {
                    const distance = Math.sqrt(Math.pow(bullet.x - alien.x, 2) + Math.pow(bullet.y - alien.y, 2));
                    if (distance < 15) {
                        hit = true;
                        setScore(s => s + 10);
                        return false;
                    }
                    return true;
                });
                return remainingAliens;
            });
            if(!hit) remainingBullets.push(bullet);
        }
        return remainingBullets;
      });

    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameOver, player.y]);

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} className="relative bg-black border-2 border-brand-primary rounded-lg overflow-hidden">
        {/* ゲームオーバー表示 */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 z-10">
            <h2 className="text-4xl text-red-500 font-bold">GAME OVER</h2>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-secondary text-white rounded">Retry</button>
          </div>
        )}
        {/* スコア表示 */}
        <div className="absolute top-2 left-2 text-white font-bold">SCORE: {score}</div>
        {/* プレイヤー */}
        <div style={{ position: 'absolute', left: player.x, top: player.y, width: 20, height: 20, backgroundColor: 'cyan' }} />
        {/* 弾 */}
        {bullets.map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: b.x + 8, top: b.y, width: 4, height: 10, backgroundColor: 'yellow' }} />
        ))}
        {/* エイリアン */}
        {aliens.map((a, i) => (
          <div key={i} style={{ position: 'absolute', left: a.x, top: a.y, width: 20, height: 20, backgroundColor: 'lime' }} />
        ))}
      </div>
      <div className="mt-4 text-slate-600">
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">←</kbd>
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">→</kbd> で移動,
        <kbd className="px-4 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">スペース</kbd> で発射
      </div>
    </div>
  );
}