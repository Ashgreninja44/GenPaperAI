import React from 'react';

interface MoonIllustrationProps {
  size?: number;
  glowIntensity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MoonIllustration: React.FC<MoonIllustrationProps> = ({
  size = 65,
  glowIntensity = 0.6,
  className = '',
  style = {}
}) => {
  const glowBlur = Math.round(size * 0.35 * glowIntensity);

  return (
    <div
      className={`relative inline-block select-none pointer-events-none rounded-full ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        filter: glowIntensity > 0
          ? `drop-shadow(0 0 ${glowBlur}px rgba(250, 245, 230, ${0.65 * glowIntensity})) drop-shadow(0 0 ${glowBlur * 2}px rgba(230, 220, 195, ${0.35 * glowIntensity}))`
          : undefined,
        ...style
      }}
    >
      <img
        src="/assets/moon.png"
        alt="Moon"
        className="w-full h-full object-contain pointer-events-none select-none rounded-full"
        referrerPolicy="no-referrer"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
};
