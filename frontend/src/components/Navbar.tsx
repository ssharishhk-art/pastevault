import React from 'react';
import { Home, Sparkles, UserCheck } from 'lucide-react';
import { getGuestUser } from '../api';
import GradientText from './GradientText';

interface NavbarProps {
  onNavigate: (view: 'create' | 'mine' | 'public') => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activeView,
}) => {
  const guestUser = getGuestUser();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div 
        onClick={() => onNavigate('create')} 
        className="flex items-center space-x-3 cursor-pointer group"
        title="Return to Home"
      >
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_#00f0ff] transition-all duration-300">
          <Home className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-black text-xl text-white tracking-wider">
            <GradientText
              colors={["#5227FF", "#FF9FFC", "#B497CF"]}
              animationSpeed={8}
              showBorder={false}
            >
              PasteVault
            </GradientText>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={() => onNavigate('create')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 flex items-center space-x-1.5 ${
            activeView === 'create'
              ? 'neon-button'
              : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/15 hover:border hover:border-cyan-400/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>New Paste</span>
        </button>

        <button
          onClick={() => onNavigate('public')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 ${
            activeView === 'public'
              ? 'neon-button'
              : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/15 hover:border hover:border-cyan-400/50'
          }`}
        >
          Explore Feed
        </button>

        <button
          onClick={() => onNavigate('mine')}
          className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-300 ${
            activeView === 'mine'
              ? 'neon-button'
              : 'text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/15 hover:border hover:border-cyan-400/50'
          }`}
        >
          My Pastes
        </button>
      </div>

      {/* Guest Account Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-black/60 px-4 py-1.5 rounded-xl border border-cyan-500/40 text-sm text-gray-200 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-cyan-200">{guestUser.username}</span>
        </div>
      </div>
    </nav>
  );
};
