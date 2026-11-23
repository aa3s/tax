import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  buildBottleInteriorClipPath,
  buildBottleOutlinePath,
  buildSplashParticles,
  buildWavePath,
  computeVesselFillState,
  getBottleMetrics,
  getUnifiedCobaltPalette,
} from '../utils/vesselGeometry';

interface LiquidTank3DProps {
  currentDH: number;
  targetDH: number;
  personalAllocatedDH: number;
  totalTaxBillDH: number;
  accentTop?: string;
  accentBottom?: string;
  accentLight?: string;
  size?: 'main' | 'mini';
  isActive?: boolean;
}

interface ActiveDroplet {
  id: number;
  durationMs: number;
  travelDistance: number;
  scale: number;
}

interface ActiveSplash {
  id: number;
  surfaceY: number;
  variant: number;
}

function hashUid(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

export const LiquidTank3D: React.FC<LiquidTank3DProps> = ({
  currentDH,
  targetDH,
  personalAllocatedDH,
  totalTaxBillDH,
  accentTop = '#182EE6',
  size = 'main',
  isActive = false,
}) => {
  const { t, formatCompactMoney } = useLanguage();
  const uid = useId().replace(/:/g, '');
  const uidHash = useMemo(() => hashUid(uid), [uid]);

  const isMini = size === 'mini';
  const metrics = useMemo(() => getBottleMetrics(size), [size]);
  const palette = useMemo(() => getUnifiedCobaltPalette(accentTop), [accentTop]);

  const fillState = useMemo(
    () =>
      computeVesselFillState({
        currentDH,
        targetDH,
        personalAllocatedDH,
        totalTaxBillDH,
        metrics,
      }),
    [currentDH, targetDH, personalAllocatedDH, totalTaxBillDH, metrics]
  );

  // Subtle initial rising fill animation on first mount (respecting reduced-motion)
  const [hasMounted, setHasMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [droplets, setDroplets] = useState<ActiveDroplet[]>([]);
  const [splashes, setSplashes] = useState<ActiveSplash[]>([]);
  const [waveBoostKey, setWaveBoostKey] = useState(0);
  const [surgeCount, setSurgeCount] = useState(0);

  const nextIdRef = useRef(1);
  const timersRef = useRef<number[]>([]);
  const prevTotalRef = useRef(fillState.actualTotalDH);
  const surfaceYRef = useRef(fillState.surfaceY);
  const dropTravelRef = useRef(fillState.dropTravelDistance);

  surfaceYRef.current = fillState.surfaceY;
  dropTravelRef.current = fillState.dropTravelDistance;

  const scheduleTimer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((tId) => tId !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const spawnDroplet = useCallback(
    (scale = 1) => {
      const dropletId = nextIdRef.current++;
      const travelDistance = dropTravelRef.current;
      const durationMs = Math.round(
        Math.min(540, Math.max(320, 260 + travelDistance * 1.85))
      );

      setDroplets((prev) => [
        ...prev.slice(-4),
        { id: dropletId, durationMs, travelDistance, scale },
      ]);

      // Fire synchronized surface splash + wave ripple right as the droplet hits the meniscus
      scheduleTimer(() => {
        const splashId = nextIdRef.current++;
        const hitY = surfaceYRef.current;
        setSplashes((prev) => [
          ...prev.slice(-2),
          { id: splashId, surfaceY: hitY, variant: splashId },
        ]);
        setWaveBoostKey((k) => k + 1);

        scheduleTimer(() => {
          setSplashes((prev) => prev.filter((s) => s.id !== splashId));
        }, 560);
      }, Math.max(120, durationMs - 24));

      // Remove finished droplet element
      scheduleTimer(() => {
        setDroplets((prev) => prev.filter((d) => d.id !== dropletId));
      }, durationMs + 70);
    },
    [scheduleTimer]
  );

  const triggerDropletStream = useCallback(
    (count: number, spacingMs: number, initialDelayMs = 0) => {
      setSurgeCount((c) => c + 1);
      for (let i = 0; i < count; i += 1) {
        scheduleTimer(() => {
          spawnDroplet(i === 0 ? 1.05 : 0.92 + (i % 2) * 0.12);
        }, initialDelayMs + i * spacingMs);
      }
    },
    [scheduleTimer, spawnDroplet]
  );

  // Detect prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  // Mount entrance: gentle rising fill + staggered initial droplet stream
  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      setHasMounted(true);
    });

    if (!reducedMotion && fillState.displayFillPercent > 0) {
      const staggerMs = 120 + (uidHash % 6) * 140;
      triggerDropletStream(isMini ? 2 : 3, 190, staggerMs);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  // Trigger rapid droplet stream whenever user increases or updates DH contribution
  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = fillState.actualTotalDH;

    if (reducedMotion) return;
    if (fillState.actualTotalDH > prev) {
      triggerDropletStream(isMini ? 3 : 4, 135, 0);
    }
  }, [fillState.actualTotalDH, isMini, reducedMotion, triggerDropletStream]);

  // Subtle calm idle droplet every 6.5s - 9.5s while below 100% funded
  useEffect(() => {
    if (reducedMotion || fillState.actualPercent >= 99.5) return;

    const intervalMs = 6600 + (uidHash % 5) * 750;
    const initialOffsetMs = 2600 + (uidHash % 7) * 550;
    let intervalId: number | undefined;

    const startTimeout = window.setTimeout(() => {
      spawnDroplet(0.88);
      intervalId = window.setInterval(() => {
        spawnDroplet(0.88);
      }, intervalMs);
    }, initialOffsetMs);

    return () => {
      window.clearTimeout(startTimeout);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [fillState.actualPercent, reducedMotion, spawnDroplet, uidHash]);

  // Precomputed crisp SVG paths
  const bottleOutlinePath = useMemo(() => buildBottleOutlinePath(metrics), [metrics]);
  const bottleClipPath = useMemo(() => buildBottleInteriorClipPath(metrics, 2), [metrics]);

  const frontWaveAmp = isMini ? 3.2 : 4.2;
  const backWaveAmp = isMini ? 3.6 : 4.6;
  const frontWavePath = useMemo(
    () => buildWavePath(metrics.bodyWidth, metrics.usableHeight, frontWaveAmp, false),
    [metrics.bodyWidth, metrics.usableHeight, frontWaveAmp]
  );
  const backWavePath = useMemo(
    () => buildWavePath(metrics.bodyWidth, metrics.usableHeight, backWaveAmp, true),
    [metrics.bodyWidth, metrics.usableHeight, backWaveAmp]
  );

  // Smoothly rise from 65% of target fill on mount to exact surfaceY
  const mountStartY = Math.min(
    metrics.interiorBottomY,
    fillState.surfaceY + (isMini ? 18 : 26)
  );
  const activeSurfaceY =
    !hasMounted && !reducedMotion && fillState.displayFillPercent > 0
      ? mountStartY
      : fillState.surfaceY;

  const badgeW = isMini ? 48 : 56;
  const badgeH = isMini ? 22 : 25;
  const badgeY = metrics.interiorBottomY - (isMini ? 34 : 42);
  const percentLabel = `${fillState.actualPercent.toFixed(
    fillState.actualPercent % 1 === 0 ? 0 : 1
  )}%`;

  // Teardrop geometry centered at (0, 0) tip-up
  const dropPath = isMini
    ? 'M 0 -5.2 C 2.1 -1.8 3.2 0.8 3.2 2.4 A 3.2 3.2 0 1 1 -3.2 2.4 C -3.2 0.8 -2.1 -1.8 0 -5.2 Z'
    : 'M 0 -6.6 C 2.6 -2.2 4 1.0 4 3.0 A 4 4 0 1 1 -4 3.0 C -4 1.0 -2.6 -2.2 0 -6.6 Z';

  return (
    <div
      className="relative flex items-center justify-center select-none"
      dir="ltr"
      data-testid="liquid-vessel"
      data-size={size}
      data-fill-percent={fillState.actualPercent.toFixed(1)}
      data-surge-count={surgeCount}
    >
      <svg
        width={metrics.viewW}
        height={metrics.viewH}
        viewBox={`0 0 ${metrics.viewW} ${metrics.viewH}`}
        className="overflow-visible"
        role="img"
        aria-label={t.tankAriaLabel(
          fillState.actualPercent.toFixed(1),
          formatCompactMoney(targetDH)
        )}
      >
        <defs>
          {/* Interior clip-path matching the 2D rounded bottle silhouette */}
          <clipPath id={`bottle-clip-${uid}`}>
            <path d={bottleClipPath} />
          </clipPath>

          {/* Clip falling droplets cleanly at the current liquid surface */}
          <clipPath id={`droplet-air-clip-${uid}`}>
            <rect
              x={metrics.cx - metrics.bodyHalfW}
              y={0}
              width={metrics.bodyWidth}
              height={Math.max(metrics.neckTopY, activeSurfaceY + 5)}
            />
          </clipPath>

          {/* Subtle Glass Interior Vertical Translucent Sheen */}
          <linearGradient id={`glass-sheen-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="38%" stopColor="#F2F6FF" stopOpacity="0.58" />
            <stop offset="78%" stopColor="#E4ECFF" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#CFDDFC" stopOpacity="0.52" />
          </linearGradient>

          {/* Unified Dark-Blue Gradient Shape Noise Texture Liquid Fill */}
          <linearGradient id={`cobalt-liquid-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.highlightSky} stopOpacity="0.98" />
            <stop offset="10%" stopColor={palette.meniscusLight} stopOpacity="0.98" />
            <stop offset="34%" stopColor={palette.cobaltBright} stopOpacity="0.99" />
            <stop offset="62%" stopColor={palette.cobaltMid} stopOpacity="1" />
            <stop offset="86%" stopColor={palette.baseMid} stopOpacity="1" />
            <stop offset="100%" stopColor={palette.baseDeep} stopOpacity="1" />
          </linearGradient>

          {/* Horizontal Luminous Depth Accent across Liquid */}
          <linearGradient id={`liquid-glow-side-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#070A24" stopOpacity="0.28" />
            <stop offset="22%" stopColor="#9BB4FF" stopOpacity="0.24" />
            <stop offset="56%" stopColor="#2747FF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#070A24" stopOpacity="0.34" />
          </linearGradient>

          {/* Electric-Blue Glowing Teardrop Gradient */}
          <linearGradient id={`droplet-grad-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#C9D8FF" />
            <stop offset="45%" stopColor={palette.meniscusLight} />
            <stop offset="100%" stopColor={palette.cobaltBright} />
          </linearGradient>

          {/* Personal Allocation Subtle Luminous Crest */}
          <linearGradient id={`personal-crest-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4E1FF" stopOpacity="0.54" />
            <stop offset="14%" stopColor={palette.meniscusLight} stopOpacity="0.22" />
            <stop offset="28%" stopColor={palette.cobaltBright} stopOpacity="0" />
          </linearGradient>

          {/* Soft Specular Left Glass Reflection */}
          <linearGradient id={`left-specular-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.06" />
          </linearGradient>

          {/* Soft Diffused Cobalt-Blue Base Ambient Reflection */}
          <radialGradient id={`base-cobalt-glow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.ambientGlow} stopOpacity="0.46" />
            <stop offset="52%" stopColor="#2747FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#182EE6" stopOpacity="0" />
          </radialGradient>

          {/* Fine SVG Film-Grain / Noise Overlay harmonized with site background */}
          <filter id={`vessel-noise-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.88"
              numOctaves="2"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="monoNoise" />
          </filter>

          {/* Soft electric glow for falling droplets */}
          <filter id={`droplet-glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Soft Diffused Cobalt-Blue Ambient Reflection Beneath Base */}
        <ellipse
          cx={metrics.cx}
          cy={metrics.bottomY + (isMini ? 7 : 9)}
          rx={metrics.bodyHalfW + (isMini ? 6 : 8)}
          ry={isMini ? 7.5 : 9.5}
          fill={`url(#base-cobalt-glow-${uid})`}
          className={`vessel-base-glow ${isActive ? 'vessel-base-glow-active' : ''}`}
        />
        <ellipse
          cx={metrics.cx}
          cy={metrics.bottomY + (isMini ? 3.5 : 4.5)}
          rx={metrics.bodyHalfW * 0.72}
          ry={isMini ? 2.8 : 3.5}
          fill={palette.cobaltBright}
          fillOpacity={isActive ? '0.26' : '0.15'}
          style={{ filter: 'blur(3px)' }}
        />

        {/* Glass Bottle Interior Fill + Subtle Film-Grain Texture */}
        <g clipPath={`url(#bottle-clip-${uid})`}>
          <rect
            x={metrics.bodyLeft - 2}
            y={metrics.neckTopY}
            width={metrics.bodyWidth + 4}
            height={metrics.bottomY - metrics.neckTopY + 4}
            fill={`url(#glass-sheen-${uid})`}
          />
          {/* Subtle glass SVG noise/grain */}
          <rect
            x={metrics.bodyLeft}
            y={metrics.neckTopY}
            width={metrics.bodyWidth}
            height={metrics.bottomY - metrics.neckTopY}
            filter={`url(#vessel-noise-${uid})`}
            opacity="0.065"
            pointerEvents="none"
          />

          {/* Smoothly Animated Liquid Column + Dual Oscillating Waves */}
          {fillState.displayFillPercent > 0 && (
            <g
              style={{
                transform: `translate3d(0, ${(activeSurfaceY - frontWaveAmp - 2).toFixed(2)}px, 0)`,
                transition: reducedMotion
                  ? 'none'
                  : 'transform 640ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Brief surface wave ripple boost wrapper keyed on droplet impact */}
              <g
                key={waveBoostKey > 0 ? `boost-${waveBoostKey}` : 'calm'}
                className={waveBoostKey > 0 && !reducedMotion ? 'vessel-wave-boost' : undefined}
              >
                {/* Offset Back Wave for Depth */}
                <g transform={`translate(${metrics.bodyLeft}, 0)`}>
                  <g className="liquid-wave-back">
                    <path
                      d={backWavePath}
                      fill={palette.backWaveFill}
                      fillOpacity="0.62"
                    />
                  </g>
                </g>

                {/* Primary Luminous Front Wave */}
                <g transform={`translate(${metrics.bodyLeft}, 0)`}>
                  <g className="liquid-wave-front">
                    <path
                      d={frontWavePath}
                      fill={`url(#cobalt-liquid-${uid})`}
                    />
                    {/* Personal Contribution Luminous Wave Crest (follows curved wave contour) */}
                    {personalAllocatedDH > 0 && (
                      <path
                        d={frontWavePath}
                        fill={`url(#personal-crest-${uid})`}
                        pointerEvents="none"
                      />
                    )}
                    {/* Luminous periwinkle meniscus rim along top crest */}
                    <path
                      d={frontWavePath}
                      fill="none"
                      stroke={personalAllocatedDH > 0 ? '#C7D7FF' : palette.highlightSky}
                      strokeWidth={isMini ? '1.35' : '1.75'}
                      strokeOpacity={personalAllocatedDH > 0 ? '0.96' : '0.88'}
                    />
                  </g>
                </g>
              </g>

              {/* Subtle Rising Micro-Bubbles when User Allocates DH */}
              {personalAllocatedDH > 0 && !reducedMotion && (
                <g pointerEvents="none">
                  <circle
                    cx={metrics.bodyLeft + metrics.bodyWidth * 0.27}
                    cy={36}
                    r={isMini ? 1.5 : 2}
                    fill="#C9D8FF"
                    className="liquid-bubble-1"
                  />
                  <circle
                    cx={metrics.bodyLeft + metrics.bodyWidth * 0.54}
                    cy={44}
                    r={isMini ? 1.2 : 1.6}
                    fill="#9BB4FF"
                    className="liquid-bubble-2"
                  />
                  <circle
                    cx={metrics.bodyLeft + metrics.bodyWidth * 0.74}
                    cy={32}
                    r={isMini ? 1.4 : 1.8}
                    fill="#FFFFFF"
                    className="liquid-bubble-3"
                  />
                </g>
              )}

              {/* Subtle Film-Grain Texture Mask Over Liquid Body */}
              <rect
                x={metrics.bodyLeft}
                y={frontWaveAmp + 2}
                width={metrics.bodyWidth}
                height={metrics.usableHeight + 36}
                filter={`url(#vessel-noise-${uid})`}
                opacity="0.14"
                style={{ mixBlendMode: 'soft-light' }}
                pointerEvents="none"
              />

              {/* Subtle Horizontal Depth Shading Over Liquid */}
              <rect
                x={metrics.bodyLeft}
                y={frontWaveAmp + 2}
                width={metrics.bodyWidth}
                height={metrics.usableHeight + 36}
                fill={`url(#liquid-glow-side-${uid})`}
                pointerEvents="none"
              />
            </g>
          )}

          {/* Stylized Surface Splash Particles & Expanding Ripple (Clipped Inside Bottle) */}
          {!reducedMotion &&
            splashes.map((splash) => {
              const particles = buildSplashParticles(isMini, splash.variant);
              return (
                <g
                  key={splash.id}
                  transform={`translate(${metrics.cx}, ${splash.surfaceY.toFixed(1)})`}
                  pointerEvents="none"
                >
                  {/* Expanding Horizontal Meniscus Ripple */}
                  <ellipse
                    cx={0}
                    cy={0}
                    rx={isMini ? 15 : 19}
                    ry={isMini ? 2.4 : 3}
                    fill="none"
                    stroke="#B8CCFF"
                    strokeWidth={isMini ? '1.3' : '1.6'}
                    className="vessel-surface-ripple"
                  />

                  {/* Outward & Upward Arcing Splash Micro-Droplets */}
                  {particles.map((p) => (
                    <circle
                      key={p.id}
                      cx={0}
                      cy={0}
                      r={p.radius}
                      fill={p.id % 2 === 0 ? '#A9C0FF' : '#6F8EFF'}
                      className="vessel-splash-particle"
                      style={
                        {
                          '--splash-dx': `${p.dx.toFixed(1)}px`,
                          '--splash-peak-y': `${p.peakY.toFixed(1)}px`,
                          animationDelay: `${p.delayMs}ms`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </g>
              );
            })}

          {/* Minimalist Vertical Left Glass Specular Sheen */}
          <rect
            x={metrics.bodyLeft + (isMini ? 6 : 7.5)}
            y={metrics.shoulderBottomY + 4}
            width={isMini ? 4.2 : 5}
            height={metrics.bottomY - metrics.shoulderBottomY - metrics.cornerRadius - 4}
            rx={2.5}
            fill={`url(#left-specular-${uid})`}
            pointerEvents="none"
          />
          <line
            x1={metrics.bodyRight - (isMini ? 6.5 : 8)}
            y1={metrics.shoulderBottomY + 12}
            x2={metrics.bodyRight - (isMini ? 6.5 : 8)}
            y2={metrics.bottomY - metrics.cornerRadius - 10}
            stroke="#FFFFFF"
            strokeOpacity="0.24"
            strokeWidth={isMini ? '1.4' : '1.8'}
            strokeLinecap="round"
            pointerEvents="none"
          />
        </g>

        {/* Falling Electric-Blue Teardrop Droplets Entering Through Bottle Neck */}
        {!reducedMotion && droplets.length > 0 && (
          <g clipPath={`url(#droplet-air-clip-${uid})`} pointerEvents="none">
            {droplets.map((drop) => (
              <g
                key={drop.id}
                transform={`translate(${metrics.cx}, ${metrics.dropStartY})`}
              >
                <g
                  className="vessel-droplet"
                  style={
                    {
                      '--drop-distance': `${drop.travelDistance.toFixed(1)}px`,
                      '--drop-duration': `${drop.durationMs}ms`,
                    } as React.CSSProperties
                  }
                >
                  <g transform={`scale(${drop.scale.toFixed(2)})`}>
                    <path
                      d={dropPath}
                      fill={`url(#droplet-grad-${uid})`}
                      filter={`url(#droplet-glow-${uid})`}
                    />
                    <circle
                      cx={-1}
                      cy={0.8}
                      r={isMini ? 0.75 : 0.95}
                      fill="#FFFFFF"
                      fillOpacity="0.88"
                    />
                  </g>
                </g>
              </g>
            ))}
          </g>
        )}

        {/* Crisp 2D Minimalist Bottle Silhouette Outline (Hover & Active Cobalt Glow) */}
        <path
          d={bottleOutlinePath}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`vessel-outline ${isActive ? 'vessel-outline-active' : ''}`}
        />

        {/* Subtle Inner Neck Rim Lip Highlight */}
        <line
          x1={metrics.cx - metrics.neckHalfW + 1}
          y1={metrics.neckTopY + 1.5}
          x2={metrics.cx + metrics.neckHalfW - 1}
          y2={metrics.neckTopY + 1.5}
          stroke={isActive ? '#6F8EFF' : 'rgba(11, 15, 59, 0.14)'}
          strokeWidth="1"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {/* Delicate Calibration Ticks along Right Glass Wall (25%, 50%, 75%) */}
        {[25, 50, 75].map((tick) => {
          const yPos =
            metrics.interiorBottomY - (tick / 100) * metrics.usableHeight;
          return (
            <line
              key={tick}
              x1={metrics.bodyRight - (isMini ? 5 : 6)}
              y1={yPos}
              x2={metrics.bodyRight - 1}
              y2={yPos}
              stroke="#FFFFFF"
              strokeOpacity="0.38"
              strokeWidth="1"
              strokeLinecap="round"
              pointerEvents="none"
            />
          );
        })}

        {/* Horizontal Dashed TARGET / OBJECTIF Line + Amount Label */}
        <line
          x1={metrics.bodyLeft - 5}
          y1={metrics.targetLineY}
          x2={metrics.bodyRight + (isMini ? 44 : 52)}
          y2={metrics.targetLineY}
          stroke="#0A1238"
          strokeWidth="1.2"
          strokeDasharray="3.5 2.5"
          strokeOpacity="0.72"
        />
        <circle
          cx={metrics.bodyRight + 2}
          cy={metrics.targetLineY}
          r="2.2"
          fill={isActive ? '#1B34F0' : '#0A1238'}
        />
        <text
          x={metrics.bodyRight + 7}
          y={metrics.targetLineY - 4.5}
          fill="#0A1238"
          fontSize={isMini ? '7.8' : '8.4'}
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, IBM Plex Sans Arabic, sans-serif"
          letterSpacing="0.04em"
        >
          {t.tankTargetLabel}
        </text>
        <text
          x={metrics.bodyRight + 7}
          y={metrics.targetLineY + 9.5}
          fill="#475878"
          fontSize={isMini ? '7.8' : '8.4'}
          fontWeight="600"
          fontFamily="IBM Plex Mono, IBM Plex Sans Arabic, monospace"
        >
          {formatCompactMoney(targetDH)}
        </text>

        {/* High-Contrast Midnight-Navy Percentage Pill Inside Bottle */}
        <g pointerEvents="none">
          <rect
            x={metrics.cx - badgeW / 2}
            y={badgeY}
            width={badgeW}
            height={badgeH}
            rx={badgeH / 2}
            fill="#080C2B"
            fillOpacity="0.92"
            stroke="rgba(155, 180, 255, 0.34)"
            strokeWidth="1"
          />
          <text
            x={metrics.cx}
            y={badgeY + badgeH * 0.67}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={isMini ? '10.5' : '11.5'}
            fontWeight="700"
            fontFamily="IBM Plex Mono, monospace"
          >
            {percentLabel}
          </text>
        </g>
      </svg>
    </div>
  );
};
