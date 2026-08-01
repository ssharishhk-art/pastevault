import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import GlitchText from './GlitchText';
import ElectricBorder from './ElectricBorder';

interface OfflineErrorPageProps {
  onRetry: () => void;
}

export const OfflineErrorPage: React.FC<OfflineErrorPageProps> = ({ onRetry }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <ElectricBorder color="#ef4444" speed={1.2} chaos={0.18} borderRadius={24}>
          <div className="glass-panel p-8 rounded-3xl text-center space-y-6 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.25)] backdrop-blur-2xl">
            {/* Glowing Offline Icon */}
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.4)]">
              <WifiOff className="w-10 h-10 animate-pulse" />
            </div>

            {/* Error Code & Glitch Headline */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ERROR 404 / NO CONNECTION</span>
              </div>
              <div className="pt-2">
                <GlitchText speed={0.8} enableShadows enableOnHover={false} className="text-3xl font-black">
                  You are Offline
                </GlitchText>
              </div>
            </div>

            <p className="text-gray-300 text-sm max-w-sm mx-auto leading-relaxed">
              Unable to connect to PasteVault. Please check your internet connection or network settings and try again.
            </p>

            {/* Retry Button */}
            <div className="pt-2">
              <button
                onClick={onRetry}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-cyan-400 text-black font-extrabold text-sm flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        </ElectricBorder>
      </motion.div>
    </div>
  );
};
