import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { CreatePaste } from './components/CreatePaste';
import { ViewPaste } from './components/ViewPaste';
import { ListPastes } from './components/ListPastes';
import { OfflineErrorPage } from './components/OfflineErrorPage';
import FluidGlass from './components/FluidGlass';

export function App() {
  const [view, setView] = useState<'create' | 'view' | 'mine' | 'public'>('create');
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Splash Intro state
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(false);

  // Show Get Started button strictly after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Detect internet connection status changes in real-time
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check URL pathname for direct slug link (e.g. /p/aZ9kLm or /aZ9kLm)
  useEffect(() => {
    const path = window.location.pathname.replace(/^\/p\//, '/').replace(/^\//, '');
    if (path && path.length >= 6 && !['create', 'mine', 'public'].includes(path)) {
      setSelectedSlug(path);
      setView('view');
    }
  }, []);

  const handleSelectPaste = (slug: string) => {
    setSelectedSlug(slug);
    setView('view');
    window.history.pushState({}, '', `/p/${slug}`);
  };

  const handleNavigate = (newView: 'create' | 'mine' | 'public') => {
    setView(newView);
    if (newView === 'create') window.history.pushState({}, '', '/');
  };

  return (
    <div className="relative min-h-screen text-gray-100 flex flex-col font-sans selection:bg-accent selection:text-white">
      {/* Crisp Full-view Background Image Container */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url('/snow-devs.png')`
        }}
      />

      {/* Pure Splash Screen: First ONLY 3D DEVS text, then after 2 seconds GET STARTED button */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-3xl"
          >
            {/* Interactive 3D Glass Lens effect over DEVS text */}
            <div className="absolute inset-0 z-0">
              <FluidGlass
                mode="lens"
                lensProps={{
                  scale: 0.45,
                  ior: 1.25,
                  thickness: 3.5,
                  chromaticAberration: 0.15,
                  anisotropy: 0.05
                }}
              />
            </div>

            {/* Clean Overlay with ONLY DEVS text initially */}
            <div className="relative z-10 text-center space-y-8 px-4 pointer-events-auto">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 tracking-tighter drop-shadow-[0_10px_30px_rgba(0,240,255,0.8)]"
              >
                DEVS
              </motion.h1>

              {/* Get Started Button appears after exactly 2 seconds */}
              {showButton && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <button
                    onClick={() => setHasStarted(true)}
                    className="neon-button text-black font-black text-xl px-12 py-4 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.8)] flex items-center space-x-3 mx-auto cursor-pointer hover:scale-110 active:scale-95 transition-all"
                  >
                    <span>GET STARTED</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Foreground Content (App opens after clicking Get Started) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          onNavigate={handleNavigate}
          activeView={view}
        />

        <main className="flex-1 pb-16 flex items-center justify-center">
          {!isOnline ? (
            <OfflineErrorPage onRetry={() => setIsOnline(navigator.onLine)} />
          ) : (
            <div className="w-full">
              {view === 'create' && (
                <CreatePaste onSuccess={(slug) => handleSelectPaste(slug)} />
              )}
              {view === 'view' && (
                <ViewPaste slug={selectedSlug} onDeleted={() => handleNavigate('mine')} />
              )}
              {view === 'mine' && (
                <ListPastes mode="mine" onSelectPaste={handleSelectPaste} />
              )}
              {view === 'public' && (
                <ListPastes mode="public" onSelectPaste={handleSelectPaste} />
              )}
            </div>
          )}
        </main>

        <footer className="border-t border-cyan-500/20 py-5 text-center text-xs text-gray-300 font-mono glass-panel">
          <p>Built with React • Node.js • MongoDB • Docker</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
