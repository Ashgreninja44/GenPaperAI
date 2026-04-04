import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeBackdropProps {
  theme: string;
}

const ThemeBackdrop: React.FC<ThemeBackdropProps> = ({ theme }) => {
  const renderThemeElements = () => {
    switch (theme) {
      case 'midnight':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="moon" />
            {/* Twinkling stars */}
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.7 + 0.3,
                  animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        );
      case 'sunset':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="sun-glow" />
            <div className="sun" />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />
          </div>
        );
      case 'ocean':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none ocean-waves bg-gradient-to-br from-cyan-900/40 via-blue-900/40 to-slate-900/40">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/10 rounded-full blur-xl"
                style={{
                  width: Math.random() * 100 + 50 + 'px',
                  height: Math.random() * 100 + 50 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `float ${Math.random() * 15 + 10}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 10}s`
                }}
              />
            ))}
          </div>
        );
      case 'forest':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-green-900/10" />
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="firefly"
                style={{
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${Math.random() * 10 + 15}s`
                }}
              />
            ))}
          </div>
        );
      case 'default':
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle floating blobs */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full blur-[100px] opacity-20"
                style={{
                  width: '40vw',
                  height: '40vw',
                  background: i % 2 === 0 ? '#3C128D' : '#8A2CB0',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animation: `float-slow ${Math.random() * 20 + 30}s infinite ease-in-out alternate`,
                  animationDelay: `${Math.random() * 10}s`
                }}
              />
            ))}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-400/10 blur-3xl rounded-full animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {renderThemeElements()}
          <div className="blur-overlay" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThemeBackdrop;
