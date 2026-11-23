export type VesselSize = 'main' | 'mini';

export interface BottleMetrics {
  viewW: number;
  viewH: number;
  cx: number;
  neckTopY: number;
  neckBottomY: number;
  neckHalfW: number;
  rimHalfW: number;
  shoulderBottomY: number;
  bodyHalfW: number;
  bottomY: number;
  cornerRadius: number;
  targetLineY: number;
  interiorBottomY: number;
  usableHeight: number;
  bodyLeft: number;
  bodyRight: number;
  bodyWidth: number;
  dropStartY: number;
}

export interface VesselCobaltPalette {
  baseDeep: string;
  baseMid: string;
  cobaltMid: string;
  cobaltBright: string;
  meniscusLight: string;
  highlightSky: string;
  backWaveFill: string;
  ambientGlow: string;
}

export interface VesselFillInput {
  currentDH: number;
  targetDH: number;
  personalAllocatedDH: number;
  totalTaxBillDH: number;
  metrics: BottleMetrics;
}

export interface VesselFillState {
  actualTotalDH: number;
  actualPercent: number;
  personalVisualLift: number;
  displayFillPercent: number;
  surfaceY: number;
  baseSurfaceY: number;
  dropTravelDistance: number;
}

export interface SplashParticle {
  id: number;
  dx: number;
  peakY: number;
  radius: number;
  delayMs: number;
}

/**
 * Computes clean, symmetric 2D minimalist bottle coordinates for both main
 * sector cards and mini sub-sector cards, leaving headroom for falling droplets,
 * right-side clearance for the dashed TARGET/OBJECTIF indicator, and base glow.
 */
export function getBottleMetrics(size: VesselSize): BottleMetrics {
  const isMini = size === 'mini';
  const viewW = isMini ? 156 : 186;
  const viewH = isMini ? 168 : 206;
  const cx = isMini ? 56 : 66;

  const neckTopY = isMini ? 26 : 30;
  const neckBottomY = isMini ? 40 : 48;
  const neckHalfW = isMini ? 11.5 : 14;
  const rimHalfW = neckHalfW + (isMini ? 2.5 : 3);

  const shoulderBottomY = isMini ? 57 : 69;
  const bodyHalfW = isMini ? 35 : 42;
  const bottomY = isMini ? 148 : 182;
  const cornerRadius = isMini ? 15 : 19;

  const targetLineY = shoulderBottomY + 2;
  const interiorBottomY = bottomY - 2;
  const usableHeight = interiorBottomY - targetLineY;

  const bodyLeft = cx - bodyHalfW;
  const bodyRight = cx + bodyHalfW;
  const bodyWidth = bodyHalfW * 2;
  const dropStartY = neckTopY - (isMini ? 18 : 22);

  return {
    viewW,
    viewH,
    cx,
    neckTopY,
    neckBottomY,
    neckHalfW,
    rimHalfW,
    shoulderBottomY,
    bodyHalfW,
    bottomY,
    cornerRadius,
    targetLineY,
    interiorBottomY,
    usableHeight,
    bodyLeft,
    bodyRight,
    bodyWidth,
    dropStartY,
  };
}

/**
 * Generates the outer stroke path of the 2D minimalist rounded bottle
 * (open top rim, tapered neck, smooth Bézier shoulders, straight vertical walls,
 * and softly rounded bottom corners).
 */
export function buildBottleOutlinePath(m: BottleMetrics): string {
  const {
    cx,
    neckTopY,
    neckBottomY,
    neckHalfW,
    rimHalfW,
    shoulderBottomY,
    bodyHalfW,
    bottomY,
    cornerRadius: r,
  } = m;

  const leftNeck = cx - neckHalfW;
  const rightNeck = cx + neckHalfW;
  const leftRim = cx - rimHalfW;
  const rightRim = cx + rimHalfW;
  const leftBody = cx - bodyHalfW;
  const rightBody = cx + bodyHalfW;
  const shoulderCtrlY1 = neckBottomY + (shoulderBottomY - neckBottomY) * 0.56;
  const shoulderCtrlY2 = neckBottomY + (shoulderBottomY - neckBottomY) * 0.36;

  return [
    `M ${leftRim.toFixed(1)} ${neckTopY.toFixed(1)}`,
    `Q ${leftNeck.toFixed(1)} ${(neckTopY + 1.5).toFixed(1)} ${leftNeck.toFixed(1)} ${(neckTopY + 4.5).toFixed(1)}`,
    `L ${leftNeck.toFixed(1)} ${neckBottomY.toFixed(1)}`,
    `C ${leftNeck.toFixed(1)} ${shoulderCtrlY1.toFixed(1)} ${leftBody.toFixed(1)} ${shoulderCtrlY2.toFixed(1)} ${leftBody.toFixed(1)} ${shoulderBottomY.toFixed(1)}`,
    `L ${leftBody.toFixed(1)} ${(bottomY - r).toFixed(1)}`,
    `Q ${leftBody.toFixed(1)} ${bottomY.toFixed(1)} ${(leftBody + r).toFixed(1)} ${bottomY.toFixed(1)}`,
    `L ${(rightBody - r).toFixed(1)} ${bottomY.toFixed(1)}`,
    `Q ${rightBody.toFixed(1)} ${bottomY.toFixed(1)} ${rightBody.toFixed(1)} ${(bottomY - r).toFixed(1)}`,
    `L ${rightBody.toFixed(1)} ${shoulderBottomY.toFixed(1)}`,
    `C ${rightBody.toFixed(1)} ${shoulderCtrlY2.toFixed(1)} ${rightNeck.toFixed(1)} ${shoulderCtrlY1.toFixed(1)} ${rightNeck.toFixed(1)} ${neckBottomY.toFixed(1)}`,
    `L ${rightNeck.toFixed(1)} ${(neckTopY + 4.5).toFixed(1)}`,
    `Q ${rightNeck.toFixed(1)} ${(neckTopY + 1.5).toFixed(1)} ${rightRim.toFixed(1)} ${neckTopY.toFixed(1)}`,
  ].join(' ');
}

/**
 * Generates a closed, inset clip-path for the bottle interior so liquid waves,
 * noise grain, and specular glass highlights never bleed outside the glass stroke.
 */
export function buildBottleInteriorClipPath(m: BottleMetrics, inset = 2): string {
  const {
    cx,
    neckTopY,
    neckBottomY,
    neckHalfW,
    shoulderBottomY,
    bodyHalfW,
    bottomY,
    cornerRadius,
  } = m;

  const leftNeck = cx - (neckHalfW - inset);
  const rightNeck = cx + (neckHalfW - inset);
  const leftBody = cx - (bodyHalfW - inset);
  const rightBody = cx + (bodyHalfW - inset);
  const innerBottom = bottomY - inset;
  const r = Math.max(6, cornerRadius - inset);
  const shoulderCtrlY1 = neckBottomY + (shoulderBottomY - neckBottomY) * 0.56;
  const shoulderCtrlY2 = neckBottomY + (shoulderBottomY - neckBottomY) * 0.36;

  return [
    `M ${leftNeck.toFixed(1)} ${(neckTopY + 2).toFixed(1)}`,
    `L ${leftNeck.toFixed(1)} ${neckBottomY.toFixed(1)}`,
    `C ${leftNeck.toFixed(1)} ${shoulderCtrlY1.toFixed(1)} ${leftBody.toFixed(1)} ${shoulderCtrlY2.toFixed(1)} ${leftBody.toFixed(1)} ${shoulderBottomY.toFixed(1)}`,
    `L ${leftBody.toFixed(1)} ${(innerBottom - r).toFixed(1)}`,
    `Q ${leftBody.toFixed(1)} ${innerBottom.toFixed(1)} ${(leftBody + r).toFixed(1)} ${innerBottom.toFixed(1)}`,
    `L ${(rightBody - r).toFixed(1)} ${innerBottom.toFixed(1)}`,
    `Q ${rightBody.toFixed(1)} ${innerBottom.toFixed(1)} ${rightBody.toFixed(1)} ${(innerBottom - r).toFixed(1)}`,
    `L ${rightBody.toFixed(1)} ${shoulderBottomY.toFixed(1)}`,
    `C ${rightBody.toFixed(1)} ${shoulderCtrlY2.toFixed(1)} ${rightNeck.toFixed(1)} ${shoulderCtrlY1.toFixed(1)} ${rightNeck.toFixed(1)} ${neckBottomY.toFixed(1)}`,
    `L ${rightNeck.toFixed(1)} ${(neckTopY + 2).toFixed(1)}`,
    'Z',
  ].join(' ');
}

/**
 * Generates a seamless 2-period horizontal wave path (total width = 2 * bodyWidth)
 * that loops smoothly via translateX(0 -> -50%).
 */
export function buildWavePath(
  bodyWidth: number,
  fillDepth: number,
  amplitude: number,
  invertPhase = false
): string {
  const span = bodyWidth * 2;
  const midY = amplitude + 2;
  const peakA = invertPhase ? midY + amplitude : midY - amplitude;
  const q1 = bodyWidth * 0.25;
  const q2 = bodyWidth * 0.5;
  const q5 = bodyWidth * 1.25;
  const q6 = bodyWidth * 1.5;

  return [
    `M 0 ${midY.toFixed(1)}`,
    `Q ${q1.toFixed(1)} ${peakA.toFixed(1)}, ${q2.toFixed(1)} ${midY.toFixed(1)}`,
    `T ${bodyWidth.toFixed(1)} ${midY.toFixed(1)}`,
    `Q ${q5.toFixed(1)} ${peakA.toFixed(1)}, ${q6.toFixed(1)} ${midY.toFixed(1)}`,
    `T ${span.toFixed(1)} ${midY.toFixed(1)}`,
    `L ${span.toFixed(1)} ${(fillDepth + 44).toFixed(1)}`,
    `L 0 ${(fillDepth + 44).toFixed(1)}`,
    'Z',
  ].join(' ');
}

/**
 * Calculates exact mathematical funding percentage, visual fill lift for active
 * personal DH contributions, liquid surface Y coordinate, and droplet fall distance.
 */
export function computeVesselFillState(input: VesselFillInput): VesselFillState {
  const { currentDH, targetDH, personalAllocatedDH, totalTaxBillDH, metrics } = input;
  const safeTarget = Math.max(1, targetDH);
  const actualTotalDH = Math.max(0, currentDH) + Math.max(0, personalAllocatedDH);
  const actualPercent = Math.min(100, (actualTotalDH / safeTarget) * 100);

  const personalVisualLift =
    personalAllocatedDH > 0 && totalTaxBillDH > 0
      ? Math.min(16, Math.max(2.5, (personalAllocatedDH / totalTaxBillDH) * 18))
      : 0;

  const displayFillPercent =
    actualTotalDH <= 0
      ? 0
      : Math.min(98.5, Math.max(8, actualPercent + personalVisualLift));

  const surfaceY =
    metrics.interiorBottomY - (displayFillPercent / 100) * metrics.usableHeight;
  const baseSurfaceY =
    metrics.interiorBottomY - (actualPercent / 100) * metrics.usableHeight;

  const dropTravelDistance = Math.max(20, surfaceY - metrics.dropStartY);

  return {
    actualTotalDH,
    actualPercent,
    personalVisualLift,
    displayFillPercent,
    surfaceY,
    baseSurfaceY,
    dropTravelDistance,
  };
}

/**
 * Unified dark-blue / electric-cobalt palette matching the site's
 * "Dark blue gradient shape noise texture" theme, with subtle tonal luminance
 * variants so all 9 sectors stay harmonious without clashing greens or teals.
 */
const UNIFIED_COBALT_VARIANTS: readonly VesselCobaltPalette[] = [
  {
    baseDeep: '#070A24',
    baseMid: '#0D1342',
    cobaltMid: '#182EE6',
    cobaltBright: '#2747FF',
    meniscusLight: '#6F8EFF',
    highlightSky: '#9BB4FF',
    backWaveFill: '#0F1C6B',
    ambientGlow: '#1B34F0',
  },
  {
    baseDeep: '#060922',
    baseMid: '#0B1240',
    cobaltMid: '#152AD8',
    cobaltBright: '#2445FA',
    meniscusLight: '#6A8BFF',
    highlightSky: '#9AB2FF',
    backWaveFill: '#0D1963',
    ambientGlow: '#1D3BF5',
  },
  {
    baseDeep: '#080B29',
    baseMid: '#10184D',
    cobaltMid: '#1C34F0',
    cobaltBright: '#2F52FF',
    meniscusLight: '#7A97FF',
    highlightSky: '#A6BEFF',
    backWaveFill: '#122178',
    ambientGlow: '#2747FF',
  },
];

export function getUnifiedCobaltPalette(seedKey = ''): VesselCobaltPalette {
  if (!seedKey) return UNIFIED_COBALT_VARIANTS[0];
  let hash = 0;
  for (let i = 0; i < seedKey.length; i += 1) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) >>> 0;
  }
  return UNIFIED_COBALT_VARIANTS[hash % UNIFIED_COBALT_VARIANTS.length];
}

/**
 * Generates stylized outward-arcing splash micro-droplets triggered at the
 * liquid meniscus when a falling droplet hits the surface.
 */
export function buildSplashParticles(isMini: boolean, variant = 0): SplashParticle[] {
  const scale = isMini ? 0.78 : 1;
  const flip = variant % 2 === 0 ? 1 : -1;
  return [
    { id: 0, dx: -15 * scale * flip, peakY: -13 * scale, radius: 2.1 * scale, delayMs: 0 },
    { id: 1, dx: -8 * scale * flip, peakY: -18 * scale, radius: 1.7 * scale, delayMs: 25 },
    { id: 2, dx: 2 * scale * flip, peakY: -15 * scale, radius: 1.4 * scale, delayMs: 15 },
    { id: 3, dx: 10 * scale * flip, peakY: -17 * scale, radius: 1.8 * scale, delayMs: 20 },
    { id: 4, dx: 16 * scale * flip, peakY: -12 * scale, radius: 2.0 * scale, delayMs: 10 },
  ];
}
