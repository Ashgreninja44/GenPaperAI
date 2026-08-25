import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeAnimationConfig, DEFAULT_THEME_ANIMATION_CONFIG } from '../types';

interface ThemeBackdropProps {
  theme: string;
  config?: ThemeAnimationConfig;
  isInteractivePreview?: boolean;
}

export const ThemeBackdrop: React.FC<ThemeBackdropProps> = ({ 
  theme, 
  config = DEFAULT_THEME_ANIMATION_CONFIG,
  isInteractivePreview = false 
}) => {
  const currentConfig = config || DEFAULT_THEME_ANIMATION_CONFIG;
  const isAnimEnabled = currentConfig.enableAnimations;
  const globalSpeed = currentConfig.animationSpeed || 1.0;
  const globalIntensity = currentConfig.animationIntensity || 0.7;

  // Stable random star field for Midnight Sky
  const starField = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: (i * 37.3 + 13) % 98,
      y: (i * 61.7 + 7) % 96,
      size: (i % 3) * 0.8 + 1.2,
      delay: (i % 8) * 0.6,
      duration: (i % 5) * 1.2 + 2.5,
      opacity: (i % 4) * 0.15 + 0.45,
    }));
  }, []);

  // Stable solar dust particles for Golden Sunset
  const solarDustParticles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (i * 29.5 + 5) % 95,
      y: (i * 47.1 + 10) % 90,
      size: (i % 4) * 1.5 + 3,
      delay: (i % 7) * 0.8,
      duration: (i % 6) * 2 + 10,
    }));
  }, []);

  // Stable ocean bubbles for Deep Ocean
  const oceanBubbles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (i * 31.7 + 3) % 96,
      y: (i * 53.9 + 5) % 95,
      size: (i % 5) * 12 + 18,
      delay: (i % 10) * 0.7,
      duration: (i % 8) * 2.5 + 8,
      blur: (i % 3) * 6 + 6,
    }));
  }, []);

  // Stable fireflies for Emerald Forest
  const forestFireflies = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: (i * 41.3 + 4) % 94,
      y: (i * 67.1 + 8) % 92,
      delay: (i % 9) * 0.8,
      duration: (i % 7) * 2.5 + 12,
      pulseDuration: (i % 4) * 0.8 + 1.8,
    }));
  }, []);

  // Stable stardust for Premium Vibrant
  const vibrantParticles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (i * 39.1 + 6) % 94,
      y: (i * 57.3 + 12) % 90,
      size: (i % 3) * 2 + 2.5,
      delay: (i % 6) * 0.9,
      duration: (i % 5) * 1.5 + 4,
    }));
  }, []);

  const renderMidnight = () => {
    const mid = currentConfig.midnight || DEFAULT_THEME_ANIMATION_CONFIG.midnight;
    const count = Math.min(Math.max(mid.starCount || 50, 5), 120);
    const visibleStars = starField.slice(0, count);
    const moonSize = mid.moonSize || 65;
    const moonGlow = mid.moonGlowIntensity || 0.6;
    const twinkleSpeed = (mid.starTwinkleSpeed || 1.0) * globalSpeed;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Nebula cosmic dust overlay */}
        {mid.nebulaGlow && (
          <div 
            className="absolute inset-0 opacity-40 mix-blend-screen transition-opacity duration-500 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 80% 20%, rgba(138, 44, 176, 0.25) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(60, 18, 141, 0.3) 0%, transparent 60%)'
            }}
          />
        )}

        {/* Customizable Moon */}
        {mid.showMoon && (
          <div 
            className="absolute transition-all duration-300 pointer-events-none rounded-full"
            style={{
              top: '12%',
              right: isInteractivePreview ? '12%' : '10%',
              width: `${moonSize}px`,
              height: `${moonSize}px`,
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 60%, #94a3b8 100%)',
              boxShadow: `0 0 ${Math.round(moonSize * 0.4 * moonGlow)}px ${Math.round(15 * moonGlow)}px rgba(255, 255, 255, ${0.4 * moonGlow * globalIntensity}), 0 0 ${Math.round(moonSize * 0.8 * moonGlow)}px ${Math.round(30 * moonGlow)}px rgba(186, 230, 253, ${0.25 * moonGlow * globalIntensity})`,
              animation: isAnimEnabled ? `moonMove ${Math.max(40 / globalSpeed, 10)}s linear infinite` : 'none',
              transform: 'none'
            }}
          >
            {/* Realistic Lunar Craters */}
            <div className="absolute top-[25%] left-[30%] w-[18%] h-[18%] bg-slate-400/25 rounded-full blur-[0.5px]" />
            <div className="absolute top-[55%] left-[20%] w-[24%] h-[24%] bg-slate-400/20 rounded-full blur-[0.5px]" />
            <div className="absolute top-[45%] left-[60%] w-[28%] h-[28%] bg-slate-400/20 rounded-full blur-[0.5px]" />
          </div>
        )}

        {/* Customizable Twinkling Stars */}
        {mid.showStars && visibleStars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full transition-opacity duration-300 pointer-events-none"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.y}%`,
              left: `${star.x}%`,
              opacity: star.opacity * globalIntensity,
              boxShadow: star.size > 2 ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
              animation: isAnimEnabled ? `twinkle ${star.duration / Math.max(twinkleSpeed, 0.2)}s ease-in-out ${star.delay}s infinite` : 'none',
            }}
          />
        ))}

        {/* Shooting Stars / Meteors */}
        {mid.showShootingStars && isAnimEnabled && (
          <>
            <div 
              className="absolute pointer-events-none opacity-80"
              style={{
                top: '18%',
                left: '60%',
                width: '120px',
                height: '1.5px',
                background: 'linear-gradient(90deg, rgba(255,255,255,1), transparent)',
                transform: 'rotate(-35deg)',
                animation: `shootingStar ${12 / globalSpeed}s ease-in 2s infinite`,
              }}
            />
            <div 
              className="absolute pointer-events-none opacity-60"
              style={{
                top: '40%',
                left: '25%',
                width: '90px',
                height: '1px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.9), transparent)',
                transform: 'rotate(-30deg)',
                animation: `shootingStar ${18 / globalSpeed}s ease-in 7s infinite`,
              }}
            />
          </>
        )}
      </div>
    );
  };

  const renderSunset = () => {
    const suns = currentConfig.sunset || DEFAULT_THEME_ANIMATION_CONFIG.sunset;
    const sunSize = suns.sunSize || 100;
    const glow = suns.sunGlowIntensity || 0.7;
    const dustCount = Math.min(Math.max(suns.solarDustCount || 15, 3), 40);
    const visibleDust = solarDustParticles.slice(0, dustCount);

    const horizonColor = suns.horizonWarmth === 'crimson' 
      ? 'from-rose-600/35 via-orange-600/20' 
      : suns.horizonWarmth === 'golden' 
      ? 'from-amber-400/35 via-yellow-500/20' 
      : 'from-orange-500/30 via-rose-500/15';

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Horizon Glow Overlay */}
        {suns.showClouds && (
          <div className={`absolute inset-0 bg-gradient-to-t ${horizonColor} to-transparent pointer-events-none transition-all duration-700`} />
        )}

        {/* Ambient Sun Corona */}
        {suns.showSun && (
          <>
            <div 
              className="absolute pointer-events-none rounded-full transition-all duration-500"
              style={{
                bottom: '12%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: `${sunSize * 2.8}px`,
                height: `${sunSize * 1.6}px`,
                background: `radial-gradient(circle, rgba(255, 170, 50, ${0.45 * glow * globalIntensity}) 0%, transparent 70%)`,
                filter: 'blur(35px)',
              }}
            />

            {/* Radiant Sun Disc */}
            <div 
              className="absolute pointer-events-none rounded-full transition-all duration-300"
              style={{
                bottom: '18%',
                left: '50%',
                width: `${sunSize}px`,
                height: `${sunSize}px`,
                transform: 'translateX(-50%)',
                background: 'radial-gradient(circle at 40% 40%, #fff6cc 0%, #ffbb33 45%, #ff5500 100%)',
                boxShadow: `0 0 ${Math.round(sunSize * 0.6 * glow)}px rgba(255, 160, 40, ${0.7 * glow * globalIntensity}), 0 0 ${Math.round(sunSize * 1.2 * glow)}px rgba(255, 80, 20, ${0.4 * glow * globalIntensity})`,
                animation: isAnimEnabled ? `sunFloat ${Math.max(25 / globalSpeed, 8)}s ease-in-out infinite` : 'none',
              }}
            />
          </>
        )}

        {/* Floating Solar Dust / Ember Sparks */}
        {suns.showFloatingSolarDust && visibleDust.map((dust) => (
          <div
            key={dust.id}
            className="absolute rounded-full transition-all duration-300 pointer-events-none"
            style={{
              width: `${dust.size}px`,
              height: `${dust.size}px`,
              top: `${dust.y}%`,
              left: `${dust.x}%`,
              background: 'radial-gradient(circle, #fff7b2 0%, #ff9800 100%)',
              boxShadow: `0 0 8px rgba(255, 200, 60, ${0.8 * globalIntensity})`,
              opacity: 0.65 * globalIntensity,
              animation: isAnimEnabled ? `float ${dust.duration / Math.max(globalSpeed, 0.3)}s ease-in-out ${dust.delay}s infinite alternate` : 'none',
            }}
          />
        ))}
      </div>
    );
  };

  const renderOcean = () => {
    const ocn = currentConfig.ocean || DEFAULT_THEME_ANIMATION_CONFIG.ocean;
    const bubbleCount = Math.min(Math.max(ocn.bubbleCount || 16, 4), 40);
    const visibleBubbles = oceanBubbles.slice(0, bubbleCount);
    const rayIntensity = ocn.rayIntensity || 0.5;
    const riseSpeed = (ocn.bubbleRiseSpeed || 1.0) * globalSpeed;

    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${isAnimEnabled && ocn.showWaveShimmer ? 'ocean-waves' : ''} bg-gradient-to-br from-cyan-950/40 via-blue-950/40 to-slate-950/40`}>
        {/* Caustic Oceanic Light Rays */}
        {ocn.showLightRays && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50"
            style={{
              background: `repeating-linear-gradient(65deg, rgba(56, 189, 248, ${0.12 * rayIntensity * globalIntensity}) 0px, transparent 40px, rgba(14, 165, 233, ${0.08 * rayIntensity * globalIntensity}) 80px, transparent 120px)`,
              filter: 'blur(10px)',
              animation: isAnimEnabled ? `drift ${Math.max(20 / globalSpeed, 6)}s infinite ease-in-out alternate` : 'none',
            }}
          />
        )}

        {/* Bioluminescent Rising Bubbles & Depth Spheres */}
        {ocn.showBubbles && visibleBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full transition-all duration-300 pointer-events-none"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              top: `${bubble.y}%`,
              left: `${bubble.x}%`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, rgba(56, 189, 248, 0.15) 60%, rgba(14, 165, 233, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `0 0 12px rgba(56, 189, 248, ${0.3 * globalIntensity})`,
              opacity: 0.65 * globalIntensity,
              animation: isAnimEnabled ? `float ${bubble.duration / Math.max(riseSpeed, 0.2)}s ease-in-out ${bubble.delay}s infinite` : 'none',
            }}
          />
        ))}

        {/* Ambient Deep Plankton */}
        {ocn.ambientDeepPlankton && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        )}
      </div>
    );
  };

  const renderForest = () => {
    const forst = currentConfig.forest || DEFAULT_THEME_ANIMATION_CONFIG.forest;
    const fireflyCount = Math.min(Math.max(forst.fireflyCount || 30, 6), 60);
    const visibleFireflies = forestFireflies.slice(0, fireflyCount);
    const glowSize = forst.fireflyGlowSize || 6;
    const pulseSpeed = (forst.fireflyPulseSpeed || 1.0) * globalSpeed;

    const fireflyColorMap = {
      emerald: {
        core: '#86efac',
        glow: 'rgba(74, 222, 128, 0.7)',
        ambient: 'rgba(34, 197, 94, 0.4)'
      },
      gold: {
        core: '#fef08a',
        glow: 'rgba(250, 204, 21, 0.7)',
        ambient: 'rgba(234, 179, 8, 0.4)'
      },
      mint: {
        core: '#a7f3d0',
        glow: 'rgba(52, 211, 153, 0.7)',
        ambient: 'rgba(16, 185, 129, 0.4)'
      }
    };

    const colors = fireflyColorMap[forst.fireflyColor || 'emerald'] || fireflyColorMap.emerald;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Forest Canopy Mist */}
        {forst.forestMistOverlay && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(ellipse at bottom left, rgba(20, 83, 45, 0.3) 0%, transparent 70%), radial-gradient(ellipse at top right, rgba(5, 150, 105, 0.2) 0%, transparent 60%)',
              filter: 'blur(30px)'
            }}
          />
        )}

        {/* Glowing Fireflies */}
        {forst.showFireflies && visibleFireflies.map((fly) => (
          <div
            key={fly.id}
            className="absolute rounded-full transition-all duration-300 pointer-events-none"
            style={{
              width: `${glowSize}px`,
              height: `${glowSize}px`,
              top: `${fly.y}%`,
              left: `${fly.x}%`,
              backgroundColor: colors.core,
              boxShadow: `0 0 ${glowSize * 2}px ${colors.glow}, 0 0 ${glowSize * 4}px ${colors.ambient}`,
              opacity: 0.85 * globalIntensity,
              animation: isAnimEnabled 
                ? `float ${fly.duration / Math.max(globalSpeed, 0.3)}s ease-in-out ${fly.delay}s infinite, twinkle ${fly.pulseDuration / Math.max(pulseSpeed, 0.3)}s ease-in-out ${fly.delay}s infinite alternate`
                : 'none',
            }}
          />
        ))}

        {/* Floating Canopy Leaves / Spores */}
        {forst.showFloatingLeaves && isAnimEnabled && (
          <>
            <div 
              className="absolute w-4 h-4 bg-emerald-400/20 rounded-tr-xl rounded-bl-xl pointer-events-none"
              style={{
                top: '20%',
                left: '15%',
                animation: `float-slow ${18 / globalSpeed}s infinite ease-in-out alternate`,
                filter: 'blur(1px)'
              }}
            />
            <div 
              className="absolute w-3 h-3 bg-teal-400/20 rounded-tr-lg rounded-bl-lg pointer-events-none"
              style={{
                top: '60%',
                left: '80%',
                animation: `float-slow ${24 / globalSpeed}s infinite ease-in-out alternate`,
                filter: 'blur(1px)'
              }}
            />
          </>
        )}
      </div>
    );
  };

  const renderDefaultVibrant = () => {
    const vib = currentConfig.default || DEFAULT_THEME_ANIMATION_CONFIG.default;
    const orbCount = Math.min(Math.max(vib.orbCount || 4, 1), 6);
    const orbScale = vib.orbSizeScale || 1.0;
    const driftSpeed = (vib.orbDriftSpeed || 1.0) * globalSpeed;
    const particleDensity = Math.min(Math.max(vib.particleDensity || 12, 3), 30);
    const visibleParticles = vibrantParticles.slice(0, particleDensity);

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Center Radiant Core Glow */}
        {vib.showCenterGlow && (
          <div 
            className="absolute top-1/3 left-1/3 w-64 h-64 bg-amber-400/15 blur-[90px] rounded-full pointer-events-none"
            style={{
              animation: isAnimEnabled ? `pulse-soft ${Math.max(10 / globalSpeed, 3)}s infinite ease-in-out alternate` : 'none',
              opacity: 0.7 * globalIntensity
            }}
          />
        )}

        {/* Floating Luminous Orbs */}
        {vib.showOrbs && Array.from({ length: orbCount }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-[90px] opacity-25 pointer-events-none transition-all duration-500"
            style={{
              width: `${(35 + i * 5) * orbScale}vw`,
              height: `${(35 + i * 5) * orbScale}vw`,
              background: i % 2 === 0 ? '#3C128D' : '#8A2CB0',
              top: `${(i * 28 + 10) % 80}%`,
              left: `${(i * 37 + 15) % 80}%`,
              animation: isAnimEnabled 
                ? `float-slow ${(22 + i * 6) / Math.max(driftSpeed, 0.2)}s ease-in-out ${i * 2.5}s infinite alternate` 
                : 'none',
            }}
          />
        ))}

        {/* Sparkling Stardust Particles */}
        {vib.showStardustParticles && visibleParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-200/80 pointer-events-none transition-all duration-300"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.y}%`,
              left: `${p.x}%`,
              boxShadow: '0 0 6px rgba(254, 240, 138, 0.8)',
              opacity: 0.75 * globalIntensity,
              animation: isAnimEnabled ? `twinkle ${p.duration / Math.max(globalSpeed, 0.3)}s ease-in-out ${p.delay}s infinite alternate` : 'none',
            }}
          />
        ))}
      </div>
    );
  };

  const renderThemeElements = () => {
    switch (theme) {
      case 'midnight':
        return renderMidnight();
      case 'sunset':
        return renderSunset();
      case 'ocean':
        return renderOcean();
      case 'forest':
        return renderForest();
      case 'default':
      default:
        return renderDefaultVibrant();
    }
  };

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none ${isInteractivePreview ? 'relative h-full w-full' : ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${theme}-${isAnimEnabled ? 'anim-on' : 'anim-off'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {renderThemeElements()}
          {!isInteractivePreview && <div className="blur-overlay" />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ThemeBackdrop;
