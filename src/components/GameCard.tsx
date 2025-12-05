// src/components/GameCard.tsx
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  description: string;
  playerCount: string;
  route: string;
  icon: string;
  gradient: string;
}

export function GameCard({ title, description, playerCount, route, icon, gradient }: GameCardProps) {
  return (
    <Link to={route} className="block group">
      <div className={`relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:shadow-3xl ${gradient} p-8 h-80 flex flex-col justify-between`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-pattern"></div>
        
        {/* Icon */}
        <div className="relative z-10 text-7xl mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          {icon}
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-white/90 text-base mb-4 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="font-semibold">{playerCount}</span>
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm rounded-full p-4 transform transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
