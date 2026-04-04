import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface BackgroundAnimationProps {
  theme: string;
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({ theme }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 10 + 2,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10,
    }));
  }, []);

  const shapes = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      size: Math.random() * 300 + 200,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
    }));
  }, []);

  const renderAnimation = () => {
    switch (theme) {
      case 'ocean':
        return (
          <>
            {shapes.map((shape) => (
              <div
                key={shape.id}
                className="bg-shape"
                style={{
                  width: shape.size,
                  height: shape.size,
                  top: shape.top,
                  left: shape.left,
                  background: 'radial-gradient(circle, rgba(72, 202, 228, 0.4) 0%, transparent 70%)',
                  animation: `wave ${shape.duration}s infinite ease-in-out alternate`,
                  animationDelay: `${shape.delay}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent opacity-50" />
          </>
        );
      case 'sunset':
        return (
          <>
            {shapes.map((shape) => (
              <div
                key={shape.id}
                className="bg-shape"
                style={{
                  width: shape.size,
                  height: shape.size,
                  top: shape.top,
                  left: shape.left,
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
                  animation: `float-slow ${shape.duration}s infinite ease-in-out alternate`,
                  animationDelay: `${shape.delay}s`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-30" />
          </>
        );
      case 'forest':
        return (
          <>
            {particles.map((p) => (
              <div
                key={p.id}
                className="bg-particle"
                style={{
                  width: p.size,
                  height: p.size,
                  top: p.top,
                  left: p.left,
                  background: 'rgba(165, 214, 167, 0.6)',
                  animation: `float-slow ${p.duration}s infinite ease-in-out alternate`,
                  animationDelay: `${p.delay}s`,
                  boxShadow: '0 0 10px rgba(165, 214, 167, 0.4)',
                }}
              />
            ))}
          </>
        );
      case 'midnight':
        return (
          <>
            {particles.map((p) => (
              <div
                key={p.id}
                className="bg-particle"
                style={{
                  width: p.size / 2,
                  height: p.size / 2,
                  top: p.top,
                  left: p.left,
                  background: 'white',
                  animation: `twinkle ${p.duration / 4}s infinite ease-in-out alternate`,
                  animationDelay: `${p.delay}s`,
                  boxShadow: '0 0 5px white',
                }}
              />
            ))}
          </>
        );
      default: // Premium Vibrant
        return (
          <>
            {particles.map((p) => (
              <div
                key={p.id}
                className="bg-particle"
                style={{
                  width: p.size,
                  height: p.size,
                  top: p.top,
                  left: p.left,
                  background: 'rgba(255, 241, 118, 0.4)',
                  animation: `pulse-soft ${p.duration / 2}s infinite ease-in-out alternate`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {renderAnimation()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BackgroundAnimation;
