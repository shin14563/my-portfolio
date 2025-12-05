// src/components/InvadersGame.tsx
import { useState, useEffect, useCallback } from 'react';

const GAME_WIDTH = 500;
const GAME_HEIGHT = 400;
const TIME_LIMIT = 60;

type AlienType = 'basic' | 'medium' | 'advanced' | 'boss';
type PowerUpType = 'rapidFire' | 'shield' | 'spreadShot';

interface Alien {
  x: number;
  y: number;
  direction: 'left' | 'right';
  type: AlienType;
  hp: number;
  id: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  id: number;
}

interface Explosion {
  x: number;
  y: number;
  id: number;
}

interface Player {
  name: string;
  score: number;
  hasPlayed: boolean;
}

type GameMode = 'timeLimit' | 'oneLife';
type GameStage = 'setup' | 'modeSelect' | 'playing' | 'turnEnd' | 'finalResults';

let alienIdCounter = 0;
let powerUpIdCounter = 0;
let explosionIdCounter = 0;

export function InvadersGame() {
  // Game setup state
  const [stage, setStage] = useState<GameStage>('setup');
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('timeLimit');

  // Game play state
  const [wave, setWave] = useState(1);
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 });
  const [bullets, setBullets] = useState<{ x: number; y: number; angle?: number }[]>([]);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  // Power-ups and combos
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState<Set<PowerUpType>>(new Set());
  const [powerUpTimers, setPowerUpTimers] = useState<Map<PowerUpType, number>>(new Map());
  const [hasShield, setHasShield] = useState(false);
  const [lastShotTime, setLastShotTime] = useState(0);

  // Initialize aliens for wave
  const initializeAliens = useCallback((waveNum: number) => {
    const aliens: Alien[] = [];
    const isBossWave = waveNum % 3 === 0;

    if (isBossWave) {
      // Boss wave
      aliens.push({
        x: GAME_WIDTH / 2,
        y: 30,
        direction: 'right',
        type: 'boss',
        hp: 10,
        id: alienIdCounter++
      });
    }

    // Regular aliens (more and faster each wave)
    const cols = Math.min(5 + Math.floor(waveNum / 2), 8);
    const rows = Math.min(3 + Math.floor(waveNum / 3), 5);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let type: AlienType = 'basic';
        if (Math.random() > 0.7) type = 'advanced';
        else if (Math.random() > 0.5) type = 'medium';

        aliens.push({
          x: 40 + i * 60,
          y: 60 + j * 40,
          direction: 'right',
          type,
          hp: 1,
          id: alienIdCounter++
        });
      }
    }

    return aliens;
  }, []);

  // Start playing
  const startPlaying = () => {
    alienIdCounter = 0;
    powerUpIdCounter = 0;
    explosionIdCounter = 0;
    setWave(1);
    setPlayer({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 });
    setBullets([]);
    setAliens(initializeAliens(1));
    setPowerUps([]);
    setExplosions([]);
    setGameOver(false);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setCombo(0);
    setComboTimer(0);
    setActivePowerUps(new Set());
    setPowerUpTimers(new Map());
    setHasShield(false);
    setStage('playing');
  };

  // Handle player setup
  const handleSetupComplete = () => {
    const newPlayers: Player[] = Array(numPlayers).fill(0).map((_, i) => ({
      name: `Player ${i + 1}`,
      score: 0,
      hasPlayed: false
    }));
    setPlayers(newPlayers);
    setStage('modeSelect');
  };

  // Handle mode selection
  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentPlayerIndex(0);
    startPlaying();
  };

  // End turn
  const endTurn = useCallback(() => {
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].score = score;
    updatedPlayers[currentPlayerIndex].hasPlayed = true;
    setPlayers(updatedPlayers);
    setStage('turnEnd');
  }, [players, currentPlayerIndex, score]);

  // Next player
  const nextPlayer = () => {
    const nextIndex = currentPlayerIndex + 1;
    if (nextIndex < players.length) {
      setCurrentPlayerIndex(nextIndex);
      startPlaying();
    } else {
      setStage('finalResults');
    }
  };

  // Play again
  const playAgain = () => {
    setStage('setup');
    setNumPlayers(2);
    setPlayers([]);
    setCurrentPlayerIndex(0);
  };

  // Check wave clear
  useEffect(() => {
    if (stage === 'playing' && aliens.length === 0 && !gameOver) {
      // Wave cleared!
      const waveBonus = wave * 100;
      setScore(s => s + waveBonus);
      setTimeout(() => {
        setWave(w => w + 1);
        setAliens(initializeAliens(wave + 1));
      }, 1000);
    }
  }, [aliens, stage, gameOver, wave, initializeAliens]);

  // Combo timer
  useEffect(() => {
    if (comboTimer > 0 && stage === 'playing') {
      const timer = setTimeout(() => {
        setComboTimer(t => t - 1);
        if (comboTimer === 1) {
          setCombo(0);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [comboTimer, stage]);

  // Power-up timers
  useEffect(() => {
    if (stage !== 'playing') return;

    const interval = setInterval(() => {
      setPowerUpTimers(prev => {
        const newTimers = new Map(prev);
        const newActive = new Set(activePowerUps);

        prev.forEach((time, type) => {
          if (time <= 1) {
            newTimers.delete(type);
            newActive.delete(type);
          } else {
            newTimers.set(type, time - 1);
          }
        });

        setActivePowerUps(newActive);
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, activePowerUps]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stage !== 'playing' || gameOver) return;

    if (e.key === 'ArrowLeft') {
      setPlayer((p) => ({ ...p, x: Math.max(p.x - 10, 10) }));
    } else if (e.key === 'ArrowRight') {
      setPlayer((p) => ({ ...p, x: Math.min(p.x + 10, GAME_WIDTH - 20) }));
    } else if (e.key === ' ') {
      e.preventDefault();
      const now = Date.now();
      const fireRate = activePowerUps.has('rapidFire') ? 150 : 300;

      if (now - lastShotTime < fireRate) return;
      setLastShotTime(now);

      if (activePowerUps.has('spreadShot')) {
        setBullets((b) => [
          ...b,
          { x: player.x, y: player.y, angle: -0.3 },
          { x: player.x, y: player.y, angle: 0 },
          { x: player.x, y: player.y, angle: 0.3 }
        ]);
      } else {
        setBullets((b) => [...b, { x: player.x, y: player.y }]);
      }
    }
  }, [player, gameOver, stage, activePowerUps, lastShotTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Timer
  useEffect(() => {
    if (stage !== 'playing' || gameMode !== 'timeLimit') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, gameMode, endTurn]);

  // Game loop
  useEffect(() => {
    if (stage !== 'playing' || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move bullets
      setBullets((prevBullets) =>
        prevBullets.map((b) => ({
          ...b,
          x: b.x + (b.angle || 0) * 50,
          y: b.y - 5
        })).filter((b) => b.y > 0 && b.x > 0 && b.x < GAME_WIDTH)
      );

      // Move aliens
      setAliens((prevAliens) => {
        const speed = 1 + wave * 0.3;
        const atEdge = prevAliens.some(a => a.x <= 10 || a.x >= GAME_WIDTH - (a.type === 'boss' ? 80 : 20));

        return prevAliens.map(a => {
          const direction: 'left' | 'right' = atEdge
            ? (a.direction === 'left' ? 'right' : 'left')
            : a.direction;

          const newY = atEdge ? a.y + 15 : a.y;
          const alienSpeed = a.type === 'boss' ? speed * 1.5 : speed;
          const newX = direction === 'right' ? a.x + alienSpeed : a.x - alienSpeed;

          if (newY > player.y - 10) {
            if (hasShield) {
              setHasShield(false);
            } else {
              setGameOver(true);
              if (gameMode === 'oneLife') {
                setTimeout(() => endTurn(), 1000);
              }
            }
          }
          return { ...a, x: newX, y: newY, direction };
        });
      });

      // Move power-ups down
      setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + 2 })).filter(p => p.y < GAME_HEIGHT));

      // Collision detection
      setBullets((prevBullets) => {
        const remainingBullets = [];

        for (const bullet of prevBullets) {
          let hit = false;

          setAliens(prevAliens => {
            return prevAliens.filter(alien => {
              if (hit) return true;

              const alienWidth = alien.type === 'boss' ? 60 : 20;
              const alienHeight = alien.type === 'boss' ? 40 : 20;
              const distance = Math.sqrt(
                Math.pow(bullet.x - alien.x, 2) + Math.pow(bullet.y - alien.y, 2)
              );

              if (distance < (alien.type === 'boss' ? 30 : 15)) {
                hit = true;

                // Damage alien
                if (alien.hp > 1) {
                  alien.hp--;
                  return true; // Keep alive
                }

                // Alien destroyed
                setExplosions(prev => [...prev, { x: alien.x, y: alien.y, id: explosionIdCounter++ }]);
                setTimeout(() => {
                  setExplosions(prev => prev.filter(e => e.x !== alien.x || e.y !== alien.y));
                }, 300);

                // Update combo
                setCombo(c => c + 1);
                setComboTimer(30); // 3 seconds

                // Calculate score
                let points = alien.type === 'boss' ? 500 :
                  alien.type === 'advanced' ? 50 :
                    alien.type === 'medium' ? 20 : 10;

                const comboMultiplier = Math.min(Math.floor(combo / 3) + 1, 5);
                points *= comboMultiplier;

                setScore(s => s + points);

                // Drop power-up
                if (Math.random() < 0.15 && alien.type !== 'boss') {
                  const types: PowerUpType[] = ['rapidFire', 'shield', 'spreadShot'];
                  const type = types[Math.floor(Math.random() * types.length)];
                  setPowerUps(prev => [...prev, { x: alien.x, y: alien.y, type, id: powerUpIdCounter++ }]);
                }

                return false; // Remove alien
              }
              return true;
            });
          });

          if (!hit) remainingBullets.push(bullet);
        }

        return remainingBullets;
      });

      // Power-up collection
      setPowerUps(prevPowerUps => {
        return prevPowerUps.filter(powerUp => {
          const distance = Math.sqrt(
            Math.pow(powerUp.x - player.x, 2) + Math.pow(powerUp.y - player.y, 2)
          );

          if (distance < 25) {
            // Collected!
            if (powerUp.type === 'shield') {
              setHasShield(true);
            } else {
              setActivePowerUps(prev => new Set(prev).add(powerUp.type));
              setPowerUpTimers(prev => new Map(prev).set(powerUp.type, 10));
            }
            return false;
          }
          return true;
        });
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [stage, gameOver, player, wave, combo, gameMode, endTurn, hasShield]);

  // SETUP SCREEN
  if (stage === 'setup') {
    return (
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">Space Invaders</h2>

        <div className="mb-8 w-full">
          <label className="block text-center mb-4 font-bold text-gray-700 text-lg">プレイヤー人数 (2-8)</label>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setNumPlayers(prev => Math.max(2, prev - 1))}
              className="w-14 h-14 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 active:scale-95 transition-all duration-200 text-2xl flex items-center justify-center"
            >
              −
            </button>
            <div className="w-24 h-20 bg-white rounded-xl shadow-inner flex items-center justify-center border-4 border-cyan-300">
              <span className="text-5xl font-black text-cyan-600">{numPlayers}</span>
            </div>
            <button
              onClick={() => setNumPlayers(prev => Math.min(8, prev + 1))}
              className="w-14 h-14 bg-cyan-600 text-white font-bold rounded-full shadow-lg hover:bg-cyan-700 active:scale-95 transition-all duration-200 text-2xl flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleSetupComplete}
          className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        >
          次へ
        </button>
      </div>
    );
  }

  // MODE SELECT SCREEN
  if (stage === 'modeSelect') {
    return (
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600">ゲームモードを選択</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <button
            onClick={() => handleModeSelect('timeLimit')}
            className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-6xl mb-4">⏱️</div>
            <h3 className="text-2xl font-black text-white mb-2">制限時間モード</h3>
            <p className="text-white/90 text-sm">60秒間でスコアを競う</p>
            <div className="mt-4 text-white/70 text-xs">飲み会向け・サクッと遊べる</div>
          </button>

          <button
            onClick={() => handleModeSelect('oneLife')}
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-6xl mb-4">💀</div>
            <h3 className="text-2xl font-black text-white mb-2">1ライフモード</h3>
            <p className="text-white/90 text-sm">ゲームオーバーまで挑戦</p>
            <div className="mt-4 text-white/70 text-xs">じっくり腕試し</div>
          </button>
        </div>
      </div>
    );
  }

  // TURN END SCREEN
  if (stage === 'turnEnd') {
    const currentPlayer = players[currentPlayerIndex];
    const sortedPlayers = [...players].filter(p => p.hasPlayed).sort((a, b) => b.score - a.score);

    return (
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl font-black mb-6 text-cyan-600">ターン終了！</h2>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="text-xl font-bold text-gray-700 mb-2">{currentPlayer.name}</div>
          <div className="text-5xl font-black text-cyan-600">{currentPlayer.score} pts</div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 w-full shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">現在のランキング</h3>
          <div className="space-y-2">
            {sortedPlayers.map((p, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-cyan-600">{index + 1}</span>
                  <span className="font-bold text-gray-700">{p.name}</span>
                </div>
                <span className="text-xl font-bold text-cyan-600">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={nextPlayer}
          className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        >
          {currentPlayerIndex < players.length - 1 ? '次のプレイヤー' : '最終結果を見る'}
        </button>
      </div>
    );
  }

  // FINAL RESULTS SCREEN
  if (stage === 'finalResults') {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="flex flex-col items-center p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">優勝！</h2>
        <div className="text-3xl font-black text-gray-800 mb-8">{winner.name}</div>

        <div className="bg-white rounded-xl p-6 mb-6 w-full shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">最終ランキング</h3>
          <div className="space-y-3">
            {sortedPlayers.map((p, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-lg ${index === 0
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-black ${index === 0 ? 'text-white' : 'text-gray-600'}`}>
                    {index === 0 ? '👑' : `${index + 1}`}
                  </span>
                  <span className={`font-bold text-lg ${index === 0 ? 'text-white' : 'text-gray-700'}`}>{p.name}</span>
                </div>
                <span className={`text-2xl font-black ${index === 0 ? 'text-white' : 'text-cyan-600'}`}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={playAgain}
          className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
        >
          もう一度プレイ
        </button>
      </div>
    );
  }

  // PLAYING SCREEN
  const currentPlayer = players[currentPlayerIndex];

  const getAlienColor = (type: AlienType) => {
    switch (type) {
      case 'boss': return '#ff00ff';
      case 'advanced': return '#ff1493';
      case 'medium': return '#00ffff';
      default: return '#00ff00';
    }
  };

  const getAlienSize = (type: AlienType) => {
    return type === 'boss' ? { w: 60, h: 40 } : { w: 20, h: 20 };
  };

  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'rapidFire': return '⚡';
      case 'shield': return '🛡️';
      case 'spreadShot': return '💥';
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Player Info Header */}
      <div className="mb-4 flex gap-4 items-center justify-center flex-wrap">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-black text-lg">{currentPlayer.name}</span>
        </div>
        <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
          <span className="font-black text-lg text-gray-800">Wave {wave}</span>
        </div>
        {gameMode === 'timeLimit' && (
          <div className={`px-6 py-3 rounded-lg shadow-lg font-black text-lg ${timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-800'
            }`}>
            ⏱️ {timeLeft}s
          </div>
        )}
        {combo > 0 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
            <span className="font-black text-lg">🔥 {combo} COMBO!</span>
          </div>
        )}
      </div>

      {/* Active Power-ups */}
      {activePowerUps.size > 0 && (
        <div className="mb-4 flex gap-2">
          {Array.from(activePowerUps).map(type => (
            <div key={type} className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">
              {getPowerUpIcon(type)} {powerUpTimers.get(type) || 0}s
            </div>
          ))}
          {hasShield && (
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">
              🛡️ Shield
            </div>
          )}
        </div>
      )}

      {/* Game Area */}
      <div style={{ width: GAME_WIDTH, height: GAME_HEIGHT }} className="relative bg-black border-4 border-cyan-600 rounded-lg overflow-hidden shadow-2xl">
        {/* Stars background */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent)' }}></div>

        {gameOver && gameMode === 'oneLife' && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70 z-10">
            <h2 className="text-4xl text-red-500 font-bold mb-4">GAME OVER</h2>
            <div className="text-2xl text-white font-bold">Score: {score}</div>
            <div className="text-xl text-white font-bold">Wave: {wave}</div>
          </div>
        )}

        <div className="absolute top-2 left-2 text-white font-bold text-xl bg-black bg-opacity-50 px-3 py-1 rounded">
          SCORE: {score}
        </div>

        {/* Player */}
        <div style={{ position: 'absolute', left: player.x, top: player.y, width: 20, height: 20 }}>
          <div className={`w-full h-full ${hasShield ? 'bg-blue-400' : 'bg-cyan-400'} rounded-sm ${hasShield ? 'shadow-lg shadow-blue-400' : ''}`} />
        </div>

        {/* Bullets */}
        {bullets.map((b, i) => (
          <div key={i} style={{ position: 'absolute', left: b.x + 8, top: b.y, width: 4, height: 10, backgroundColor: activePowerUps.has('spreadShot') ? '#ff00ff' : '#ffff00', boxShadow: '0 0 10px currentColor' }} />
        ))}

        {/* Aliens */}
        {aliens.map((a) => {
          const size = getAlienSize(a.type);
          return (
            <div key={a.id} style={{ position: 'absolute', left: a.x, top: a.y, width: size.w, height: size.h, backgroundColor: getAlienColor(a.type), borderRadius: '4px', boxShadow: `0 0 10px ${getAlienColor(a.type)}` }}>
              {a.type === 'boss' && a.hp > 1 && (
                <div className="absolute -top-3 left-0 right-0 flex gap-1 justify-center">
                  {Array(a.hp).fill(0).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-red-500 rounded-full"></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Power-ups */}
        {powerUps.map((p) => (
          <div key={p.id} style={{ position: 'absolute', left: p.x, top: p.y }} className="text-2xl animate-pulse">
            {getPowerUpIcon(p.type)}
          </div>
        ))}

        {/* Explosions */}
        {explosions.map((e) => (
          <div key={e.id} style={{ position: 'absolute', left: e.x, top: e.y }} className="text-3xl animate-ping">
            💥
          </div>
        ))}
      </div>

      <div className="mt-4 text-white bg-gray-800 px-4 py-2 rounded-lg">
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">←</kbd>
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg ml-1">→</kbd> で移動,
        <kbd className="px-4 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg ml-2">スペース</kbd> で発射
      </div>
    </div>
  );
}