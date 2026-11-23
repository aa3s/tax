import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBottleInteriorClipPath,
  buildBottleOutlinePath,
  buildSplashParticles,
  buildWavePath,
  computeVesselFillState,
  getBottleMetrics,
  getUnifiedCobaltPalette,
} from './vesselGeometry';

test('getBottleMetrics returns symmetric main and mini bottle geometry with positive headroom', () => {
  const main = getBottleMetrics('main');
  const mini = getBottleMetrics('mini');

  assert.ok(main.viewW > mini.viewW);
  assert.ok(main.viewH > mini.viewH);
  assert.ok(main.bodyHalfW > main.neckHalfW, 'Bottle body must be wider than neck');
  assert.ok(main.rimHalfW > main.neckHalfW, 'Bottle top rim must flare slightly beyond neck');
  assert.ok(main.dropStartY < main.neckTopY, 'Droplets must originate above bottle opening');
  assert.ok(main.usableHeight > 80, 'Main bottle must have ample usable liquid height');
  assert.equal(main.bodyWidth, main.bodyHalfW * 2);
});

test('buildBottleOutlinePath and buildBottleInteriorClipPath emit valid SVG Bézier silhouette paths', () => {
  const m = getBottleMetrics('main');
  const outline = buildBottleOutlinePath(m);
  const clip = buildBottleInteriorClipPath(m, 2);

  assert.ok(outline.startsWith('M '), 'Outline starts with move command');
  assert.ok(outline.includes(' C '), 'Outline uses smooth cubic Bézier shoulders');
  assert.ok(outline.includes(' Q '), 'Outline uses softly rounded bottom corners');
  assert.ok(!outline.endsWith('Z'), 'Bottle outline leaves top opening unclosed');

  assert.ok(clip.startsWith('M '), 'Clip path starts with move command');
  assert.ok(clip.endsWith('Z'), 'Interior clip path must be closed');
});

test('computeVesselFillState accurately maps 0%, partial, personal lift, and 100% bounds', () => {
  const m = getBottleMetrics('main');

  const empty = computeVesselFillState({
    currentDH: 0,
    targetDH: 50_000_000,
    personalAllocatedDH: 0,
    totalTaxBillDH: 1000,
    metrics: m,
  });
  assert.equal(empty.actualPercent, 0);
  assert.equal(empty.displayFillPercent, 0);
  assert.equal(empty.surfaceY, m.interiorBottomY);

  const partial = computeVesselFillState({
    currentDH: 36_000_000,
    targetDH: 50_000_000,
    personalAllocatedDH: 0,
    totalTaxBillDH: 1000,
    metrics: m,
  });
  assert.equal(partial.actualPercent, 72);
  assert.equal(partial.personalVisualLift, 0);
  assert.ok(partial.surfaceY > m.targetLineY && partial.surfaceY < m.interiorBottomY);

  const allocated = computeVesselFillState({
    currentDH: 36_000_000,
    targetDH: 50_000_000,
    personalAllocatedDH: 500,
    totalTaxBillDH: 1000,
    metrics: m,
  });
  assert.ok(allocated.personalVisualLift >= 2.5, 'Personal allocation provides visible liquid rise');
  assert.ok(allocated.surfaceY < partial.surfaceY, 'Liquid surface rises when DH is allocated');
  assert.ok(allocated.dropTravelDistance >= 20, 'Droplet fall distance stays positive');

  const full = computeVesselFillState({
    currentDH: 60_000_000,
    targetDH: 50_000_000,
    personalAllocatedDH: 500,
    totalTaxBillDH: 1000,
    metrics: m,
  });
  assert.equal(full.actualPercent, 100);
  assert.equal(full.displayFillPercent, 98.5);
});

test('getUnifiedCobaltPalette stays strictly within deep-navy to electric-cobalt spectrum', () => {
  const palA = getUnifiedCobaltPalette('#087E83');
  const palB = getUnifiedCobaltPalette('#1A8A5C');
  const palDefault = getUnifiedCobaltPalette();

  for (const pal of [palA, palB, palDefault]) {
    assert.match(pal.baseDeep, /^#0[678]/i);
    assert.match(pal.cobaltMid, /^#1[58C]/i);
    assert.match(pal.highlightSky, /^#[9A]/i);
  }
});

test('buildWavePath and buildSplashParticles produce seamless loops and symmetric splash arcs', () => {
  const wave = buildWavePath(84, 120, 4.5, false);
  assert.ok(wave.includes('168.0'), 'Wave span equals 2x bottle body width for seamless looping');
  assert.ok(wave.endsWith('Z'), 'Wave path closes cleanly below liquid body');

  const particlesMain = buildSplashParticles(false, 0);
  const particlesMini = buildSplashParticles(true, 1);
  assert.equal(particlesMain.length, 5);
  assert.equal(particlesMini.length, 5);
  assert.ok(particlesMain.some((p) => p.dx < 0) && particlesMain.some((p) => p.dx > 0));
  assert.ok(particlesMain.every((p) => p.peakY < 0), 'Splash droplets must arc upward');
});
