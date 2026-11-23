import React from 'react';

export const NOISE_TEXTURE_SRC = `${import.meta.env.BASE_URL}assets/aistudio/Dark_blue_gradient_shape_noise_texture_486b12c2.jfif`;

interface DarkBlueNoiseBackdropProps {
  variant: 'canvas' | 'dark-card';
  className?: string;
}

/**
 * Integrates the organic dark-blue gradient noise shape seamlessly across
 * both the light porcelain page canvas (via multiply blending + soft radial fade)
 * and deep midnight-indigo focal surfaces (via cobalt-multiplied depth + subtle film grain).
 */
export const DarkBlueNoiseBackdrop: React.FC<DarkBlueNoiseBackdropProps> = ({
  variant,
  className = '',
}) => {
  if (variant === 'canvas') {
    return (
      <div
        aria-hidden="true"
        className={`no-print pointer-events-none fixed inset-0 z-0 overflow-hidden select-none [contain:strict] ${className}`}
      >
        {/* Top-right sculptural ambient aura */}
        <img
          src={NOISE_TEXTURE_SRC}
          alt=""
          className="absolute -top-32 -right-28 w-[720px] sm:w-[900px] max-w-none opacity-[0.19] mix-blend-multiply rotate-12"
          style={{
            WebkitMaskImage:
              'radial-gradient(closest-side, rgba(0,0,0,1) 44%, rgba(0,0,0,0) 100%)',
            maskImage:
              'radial-gradient(closest-side, rgba(0,0,0,1) 44%, rgba(0,0,0,0) 100%)',
          }}
        />

        {/* Lower-left balanced organic echo */}
        <img
          src={NOISE_TEXTURE_SRC}
          alt=""
          className="absolute -bottom-44 -left-36 w-[640px] sm:w-[780px] max-w-none opacity-[0.13] mix-blend-multiply -rotate-[145deg]"
          style={{
            WebkitMaskImage:
              'radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            maskImage:
              'radial-gradient(closest-side, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none [contain:paint] ${className}`}
    >
      {/* Rich cobalt-to-midnight base field */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#080E30] via-[#11247A] to-[#2148EC]" />

      {/* Luminous royal-cobalt radial glow behind the sculpted shape */}
      <div
        className="absolute right-[8%] -top-24 w-[460px] h-[460px] rounded-full opacity-65"
        style={{
          background:
            'radial-gradient(circle, rgba(72,122,255,0.72) 0%, rgba(24,52,212,0.28) 52%, transparent 74%)',
        }}
      />

      {/* Embedded dark-blue gradient noise shape blended seamlessly via multiply */}
      <img
        src={NOISE_TEXTURE_SRC}
        alt=""
        className="absolute right-0 -top-20 w-[380px] sm:w-[490px] max-w-none opacity-95 mix-blend-multiply rotate-[16deg]"
        style={{
          WebkitMaskImage:
            'radial-gradient(closest-side, rgba(0,0,0,1) 56%, rgba(0,0,0,0) 100%)',
          maskImage:
            'radial-gradient(closest-side, rgba(0,0,0,1) 56%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Secondary soft luminous cobalt echo */}
      <img
        src={NOISE_TEXTURE_SRC}
        alt=""
        className="absolute -right-8 -bottom-24 w-[300px] sm:w-[360px] max-w-none opacity-28 mix-blend-screen -rotate-[24deg]"
        style={{
          WebkitMaskImage:
            'radial-gradient(closest-side, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
          maskImage:
            'radial-gradient(closest-side, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Left-side contrast scrim guaranteeing WCAG AAA legibility for foreground copy */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070C29]/92 via-[#0A1342]/70 to-[#0C1B66]/24" />

      {/* Subtle architectural specular top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/5 via-white/25 to-white/5" />
    </div>
  );
};
