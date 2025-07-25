
import { useState } from 'react';
import { Link } from 'react-router-dom';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const RANK_VALUES: { [key: string]: number } = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

interface Card {
  suit: string;
  rank: string;
  isFlipped: boolean;
}

interface HandResult {
    score: number; // 役のスコア (例: 8 for Straight Flush)
    name: string;  // 役の名前
    values: number[]; // 役の判定に使用したカードのランク値 (タイブレーク用)
}

type GameStage = 'setup' | 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

function createDeck(): Omit<Card, 'isFlipped'>[] {
  return SUITS.flatMap(suit => RANKS.map(rank => ({ suit, rank })));
}

function shuffleDeck(deck: Omit<Card, 'isFlipped'>[]): Omit<Card, 'isFlipped'>[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

function evaluateHand(hand: Card[], communityCards: Card[]): HandResult {
    const allCards = [...hand, ...communityCards];
    const allCardValues = allCards.map(c => ({ ...c, value: RANK_VALUES[c.rank] })).sort((a, b) => b.value - a.value);

    const rankCounts = allCardValues.reduce((acc, card) => {
        acc[card.value] = (acc[card.value] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const suitCounts = allCardValues.reduce((acc, card) => {
        acc[card.suit] = (acc[card.suit] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const uniqueValues = [...new Set(allCardValues.map(c => c.value))].sort((a, b) => b - a);

    const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5);
    const isFlush = !!flushSuit;

    let isStraight = false;
    let straightValues: number[] = [];
    const aceLowStraightValues = [14, 5, 4, 3, 2];
    if (uniqueValues.length >= 5) {
        if (aceLowStraightValues.every(v => uniqueValues.includes(v))) {
            isStraight = true;
            straightValues = [5, 4, 3, 2, 1]; // A-5 is a 5-high straight
        } else {
            for (let i = 0; i <= uniqueValues.length - 5; i++) {
                const slice = uniqueValues.slice(i, i + 5);
                if (slice[0] - slice[4] === 4) {
                    isStraight = true;
                    straightValues = slice;
                    break;
                }
            }
        }
    }

    if (isStraight && isFlush) {
        const flushCards = allCardValues.filter(c => c.suit === flushSuit);
        // Logic to find straight in flush cards
        return { score: 8, name: "Straight Flush", values: straightValues };
    }

    const groups = Object.keys(rankCounts).map(Number).sort((a, b) => b - a);
    const four = groups.find(v => rankCounts[v] === 4);
    if (four) {
        const kickers = uniqueValues.filter(v => v !== four);
        return { score: 7, name: "Four of a Kind", values: [four, kickers[0]] };
    }

    const three = groups.find(v => rankCounts[v] === 3);
    const pairs = groups.filter(v => rankCounts[v] === 2);
    if (three && pairs.length > 0) {
        return { score: 6, name: "Full House", values: [three, pairs[0]] };
    }

    if (isFlush) {
        const flushCards = allCardValues.filter(c => c.suit === flushSuit);
        return { score: 5, name: "Flush", values: flushCards.map(c => c.value).slice(0, 5) };
    }

    if (isStraight) {
        return { score: 4, name: "Straight", values: straightValues.slice(0, 5) };
    }

    if (three) {
        const kickers = uniqueValues.filter(v => v !== three);
        return { score: 3, name: "Three of a Kind", values: [three, ...kickers.slice(0, 2)] };
    }

    if (pairs.length >= 2) {
        const topTwoPairs = pairs.slice(0, 2);
        const kicker = uniqueValues.find(v => !topTwoPairs.includes(v));
        return { score: 2, name: "Two Pair", values: [...topTwoPairs, kicker!] };
    }

    if (pairs.length === 1) {
        const pairValue = pairs[0];
        const kickers = uniqueValues.filter(v => v !== pairValue);
        return { score: 1, name: "One Pair", values: [pairValue, ...kickers.slice(0, 3)] };
    }

    return { score: 0, name: "High Card", values: uniqueValues.slice(0, 5) };
}

const getRankName = (value: number): string => {
    if (value === 1) return 'A'; // For Ace-low straight
    const rankEntry = Object.entries(RANK_VALUES).find(([_, val]) => val === value);
    return rankEntry ? rankEntry[0] : '';
};

const getRankSuffix = (rank: number): string => {
    if (rank % 100 >= 11 && rank % 100 <= 13) return `${rank}th`;
    switch (rank % 10) {
        case 1: return `${rank}st`;
        case 2: return `${rank}nd`;
        case 3: return `${rank}rd`;
        default: return `${rank}th`;
    }
};

const HandDetails = ({ hand }: { hand: HandResult }) => {
    const { name, values } = hand;

    const renderMiniCard = (value: number) => (
        <span key={value} className="inline-block bg-white text-black text-xs font-bold px-1.5 py-0.5 rounded-sm mx-0.5 border border-gray-400">
            {getRankName(value)}
        </span>
    );

    let mainValues: number[] = [];
    let kickerValues: number[] = [];

    switch (name) {
        case "Four of a Kind":
            mainValues = values.slice(0, 1);
            kickerValues = values.slice(1, 2);
            break;
        case "Full House":
            mainValues = values.slice(0, 2);
            break;
        case "Three of a Kind":
            mainValues = values.slice(0, 1);
            kickerValues = values.slice(1, 3);
            break;
        case "Two Pair":
            mainValues = values.slice(0, 2);
            kickerValues = values.slice(2, 3);
            break;
        case "One Pair":
            mainValues = values.slice(0, 1);
            kickerValues = values.slice(1, 4);
            break;
        default:
            mainValues = values;
            break;
    }

    return (
        <div className="text-right">
            <span className="font-semibold text-base sm:text-lg">{name}</span>
            <div className="mt-1 h-6"> {/* Set a fixed height to prevent layout shifts */}
                {mainValues.length > 0 && (
                    <div className="inline-block align-middle">
                        {mainValues.map(v => renderMiniCard(v))}
                    </div>
                )}
                {kickerValues.length > 0 && (
                    <div className="inline-block align-middle ml-1 sm:ml-2">
                        <span className="text-xs text-gray-400 mr-1">Kicker:</span>
                        {kickerValues.map(v => renderMiniCard(v))}
                    </div>
                )}
            </div>
        </div>
    );
};

export function PokerGame() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [stage, setStage] = useState<GameStage>('setup');
  const [deck, setDeck] = useState<Omit<Card, 'isFlipped'>[]>([]);
  const [players, setPlayers] = useState<Card[][]>([]);
  const [community, setCommunity] = useState<Card[]>([]);
  const [results, setResults] = useState<{ player: number; hand: HandResult; rank: number }[]>([]);

  const startGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const newPlayers: Card[][] = Array(numPlayers).fill(0).map(() => []);

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < numPlayers; j++) {
        const card = newDeck.pop()!;
        newPlayers[j].push({ ...card, isFlipped: false });
      }
    }
    
    setPlayers(newPlayers);
    setDeck(newDeck);
    setCommunity([]);
    setResults([]);
    setStage('pre-flop');
  };

  const nextStage = () => {
    const newDeck = [...deck];
    
    if (stage === 'pre-flop') {
      const flop = newDeck.splice(0, 3).map(c => ({...c, isFlipped: true}));
      setCommunity(flop);
      setStage('flop');
    } else if (stage === 'flop') {
      const turn = newDeck.splice(0, 1).map(c => ({...c, isFlipped: true}));
      setCommunity(prev => [...prev, ...turn]);
      setStage('turn');
    } else if (stage === 'turn') {
      const river = newDeck.splice(0, 1).map(c => ({...c, isFlipped: true}));
      setCommunity(prev => [...prev, ...river]);
      setStage('river');
    }
    setDeck(newDeck);
  };

  const compareHands = (handA: HandResult, handB: HandResult): number => {
      if (handA.score !== handB.score) return handB.score - handA.score;
      for (let i = 0; i < handA.values.length; i++) {
          if (handA.values[i] !== handB.values[i]) {
              return handB.values[i] - handA.values[i];
          }
      }
      return 0; // Chop
  }

  const showResults = () => {
    const finalResults = players.map((hand, index) => {
      return { player: index + 1, hand: evaluateHand(hand, community) };
    });

    finalResults.sort((a, b) => compareHands(a.hand, b.hand));

    const rankedResults: { player: number; hand: HandResult; rank: number }[] = [];
    if (finalResults.length > 0) {
        rankedResults.push({ ...finalResults[0], rank: 1 });
        for (let i = 1; i < finalResults.length; i++) {
            const prevResult = finalResults[i - 1];
            const currentResult = finalResults[i];
            const prevRank = rankedResults[i - 1].rank;

            if (compareHands(currentResult.hand, prevResult.hand) === 0) {
                rankedResults.push({ ...currentResult, rank: prevRank });
            } else {
                rankedResults.push({ ...currentResult, rank: i + 1 });
            }
        }
    }

    setResults(rankedResults);
    setStage('showdown');
  };

  const resetGame = () => {
    setStage('setup');
  };

  const flipCard = (playerIndex: number, cardIndex: number) => {
    const newPlayers = [...players];
    const card = newPlayers[playerIndex][cardIndex];
    card.isFlipped = !card.isFlipped;
    setPlayers(newPlayers);
  };

  const renderCard = (card: Card, onClick?: () => void) => {
    const cardContent = card.isFlipped ? (
      <>
        <span className={`text-2xl ${['♥', '♦'].includes(card.suit) ? 'text-red-600' : 'text-black'}`}>{card.suit}</span>
        <span className="text-xl font-bold text-black">{card.rank}</span>
      </>
    ) : (
      <div className="w-full h-full bg-blue-700 rounded-md border-2 border-blue-900"></div>
    );

    return (
      <div className="p-1 border-2 border-gray-300 rounded-md bg-white shadow w-16 h-24 flex flex-col justify-center items-center cursor-pointer" onClick={onClick}>
        {cardContent}
      </div>
    );
  };

  if (stage === 'setup') {
    return (
      <div className="flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Poker Game</h2>
        <div className="mb-6">
          <label htmlFor="numPlayers" className="mr-2 font-semibold text-gray-700">Number of Players (2-6):</label>
          <input
            type="number"
            id="numPlayers"
            value={numPlayers}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val >= 2 && val <= 6) setNumPlayers(val);
            }}
            min="2"
            max="6"
            className="w-20 text-center p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button onClick={startGame} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200">
          Start Game
        </button>
        <Link to="/" className="mt-8 text-blue-600 hover:underline">
          Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-800 text-white rounded-lg shadow-2xl w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold">Texas Hold'em</h2>
        <Link to="/" className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-200">
          Exit Game
        </Link>
      </div>

      <div className="mb-6 p-4 border-4 border-yellow-400 rounded-lg bg-green-900 min-h-[140px]">
        <h3 className="text-xl font-semibold text-center mb-2 text-yellow-200">Community Cards</h3>
        <div className="flex justify-center items-center space-x-2">
          {community.map((card, index) => (
            <div key={index}>{renderCard(card)}</div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {players.map((hand, playerIndex) => (
          <div key={playerIndex} className="p-4 border-2 border-blue-300 rounded-lg bg-green-700">
            <h4 className="font-bold text-lg mb-2 text-center text-blue-100">Player {playerIndex + 1}</h4>
            <div className="flex justify-center space-x-2">
              {hand.map((card, cardIndex) => (
                <div key={cardIndex}>
                  {renderCard(card, () => flipCard(playerIndex, cardIndex))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center mt-4 space-x-4">
        {stage === 'pre-flop' && <button onClick={nextStage} className="btn-action">Deal Flop</button>}
        {stage === 'flop' && <button onClick={nextStage} className="btn-action">Deal Turn</button>}
        {stage === 'turn' && <button onClick={nextStage} className="btn-action">Deal River</button>}
        {stage === 'river' && <button onClick={showResults} className="btn-action">Show Results</button>}
        {stage === 'showdown' && <button onClick={resetGame} className="btn-action">Play Again</button>}
      </div>

      {stage === 'showdown' && (
        <div className="mt-6 p-4 bg-gray-900 bg-opacity-80 rounded-lg">
          <h3 className="text-2xl font-bold text-center text-yellow-400 mb-4">🏆 Results 🏆</h3>
          <div className="space-y-3">
            {results.map((result, index) => {
                const isWinner = result.rank === 1;
                return (
                    <div 
                        key={index} 
                        className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 ${isWinner ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'bg-gray-800'}`}>
                        <div className="flex items-center">
                            <span className={`font-black text-xl w-12 text-center ${isWinner ? 'text-yellow-900' : 'text-gray-400'}`}>
                                {getRankSuffix(result.rank)}
                            </span>
                            <span className={`font-bold text-lg ${isWinner ? 'text-gray-900' : 'text-white'}`}>
                                Player {result.player}
                            </span>
                        </div>
                        <HandDetails hand={result.hand} />
                    </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styleId = 'poker-styles';
if (!document.getElementById(styleId)) {
  const styleSheet = document.createElement("style");
  styleSheet.id = styleId;
  styleSheet.innerText = `
    .btn-action {
      padding: 10px 20px;
      background-color: #f59e0b; /* amber-500 */
      color: black;
      font-weight: bold;
      border-radius: 8px;
      transition: background-color 0.2s;
      cursor: pointer;
    }
    .btn-action:hover {
      background-color: #d97706; /* amber-600 */
    }
  `;
  document.head.appendChild(styleSheet);
}
