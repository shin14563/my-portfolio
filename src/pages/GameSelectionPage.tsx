// src/pages/GameSelectionPage.tsx
import { GameCard } from '../components/GameCard';

export function GameSelectionPage() {
    const games = [
        {
            title: 'Texas Hold\'em Poker',
            description: '友達と一緒にポーカーを楽しもう！最大8人まで同時プレイ可能。',
            playerCount: '2-8 Players',
            route: '/poker',
            icon: '🃏',
            gradient: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600'
        },
        {
            title: 'Space Invaders',
            description: 'みんなでスコアを競おう！制限時間モードと1ライフモードで盛り上がる!',
            playerCount: '1-8 Players',
            route: '/invaders',
            icon: '👾',
            gradient: 'bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 mb-6 tracking-tight">
                        Game Collection
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mx-auto">
                        さあ、ゲームを選んで遊びましょう！
                    </p>
                </div>

                {/* Game Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {games.map((game, index) => (
                        <div
                            key={game.route}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <GameCard {...game} />
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="text-center mt-16 text-white/40 text-sm">
                    <p>より多くのゲームが近日公開予定...</p>
                </div>
            </div>
        </div>
    );
}
