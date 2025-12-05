// src/pages/InvadersGamePage.tsx
import { InvadersGame } from '../components/InvadersGame';
import { Link } from 'react-router-dom';

export function InvadersGamePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-8">
            <div className="mb-8 flex justify-between items-center w-full max-w-2xl">
                <h1 className="text-4xl font-bold text-white">Space Invaders</h1>
                <Link
                    to="/"
                    className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg"
                >
                    Back to Games
                </Link>
            </div>
            <InvadersGame />
        </div>
    );
}
