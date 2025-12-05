// src/pages/PokerGamePage.tsx
import { PokerGame } from '../components/PokerGame';

export function PokerGamePage() {
    return (
        <div className="p-4 md:p-8 flex justify-center items-start bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
            <PokerGame />
        </div>
    );
}
