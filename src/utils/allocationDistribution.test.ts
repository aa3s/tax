import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SECTORS, SAMPLE_ALLOCATION_FOR_1000 } from '../data/daribatiData';
import { Locale } from '../i18n/translations';
import {
  buildSessionSectorDistribution,
  SECTOR_CHART_COLORS,
  SESSION_CHART_UI,
} from './allocationDistribution';

test('every sector in INITIAL_SECTORS has a defined chart color and localized chart UI exists', () => {
  for (const sector of INITIAL_SECTORS) {
    assert.match(SECTOR_CHART_COLORS[sector.id] ?? '', /^#[0-9A-Fa-f]{6}$/);
  }
  const locales: Locale[] = ['en', 'fr', 'ar'];
  for (const locale of locales) {
    assert.ok(SESSION_CHART_UI[locale].title.length > 0);
    assert.ok(SESSION_CHART_UI[locale].donutBtn.length > 0);
    assert.ok(SESSION_CHART_UI[locale].barBtn.length > 0);
  }
});

test('empty draft and session paid allocations return empty distribution summary', () => {
  const result = buildSessionSectorDistribution(INITIAL_SECTORS, {}, {});
  assert.deepEqual(result.points, []);
  assert.equal(result.grandTotalDH, 0);
  assert.equal(result.draftTotalDH, 0);
  assert.equal(result.paidTotalDH, 0);
  assert.equal(result.fundedSectorCount, 0);
  assert.equal(result.topSector, null);
});

test('sample 1000 DH allocation aggregates sub-sectors into 4 parent sectors sorted descending', () => {
  const result = buildSessionSectorDistribution(
    INITIAL_SECTORS,
    SAMPLE_ALLOCATION_FOR_1000,
    {}
  );

  assert.equal(result.grandTotalDH, 1000);
  assert.equal(result.draftTotalDH, 1000);
  assert.equal(result.paidTotalDH, 0);
  assert.equal(result.fundedSectorCount, 4);

  // Education has ed-k12 (400) + ed-univ (100) = 500 DH (50%)
  assert.equal(result.points[0].sectorId, 'education');
  assert.equal(result.points[0].totalDH, 500);
  assert.equal(result.points[0].sharePct, 50);
  assert.equal(result.points[0].subSectorCount, 2);

  // Healthcare has hc-hospitals = 300 DH (30%)
  assert.equal(result.points[1].sectorId, 'healthcare');
  assert.equal(result.points[1].totalDH, 300);
  assert.equal(result.points[1].sharePct, 30);

  // Sum of shares equals 100%
  const sumPct = result.points.reduce((sum, p) => sum + p.sharePct, 0);
  assert.ok(Math.abs(sumPct - 100) < 0.0001);
});

test('combines paid session allocations and active draft allocations per sector', () => {
  const sessionPaid = {
    'hc-hospitals': 600,
    'ed-k12': 400,
  };
  const activeDraft = {
    'hc-vaccination': 200,
    'ps-police': 300,
  };

  const result = buildSessionSectorDistribution(
    INITIAL_SECTORS,
    activeDraft,
    sessionPaid
  );

  assert.equal(result.grandTotalDH, 1500);
  assert.equal(result.paidTotalDH, 1000);
  assert.equal(result.draftTotalDH, 500);
  assert.equal(result.fundedSectorCount, 3);

  // Healthcare: 600 paid + 200 draft = 800 DH
  assert.equal(result.topSector?.sectorId, 'healthcare');
  assert.equal(result.topSector?.paidDH, 600);
  assert.equal(result.topSector?.draftDH, 200);
  assert.equal(result.topSector?.totalDH, 800);
  assert.equal(result.topSector?.subSectorCount, 2);

  // Education: 400 paid + 0 draft
  const edu = result.points.find((p) => p.sectorId === 'education');
  assert.equal(edu?.paidDH, 400);
  assert.equal(edu?.draftDH, 0);

  // Public Safety: 0 paid + 300 draft
  const safety = result.points.find((p) => p.sectorId === 'public-safety');
  assert.equal(safety?.paidDH, 0);
  assert.equal(safety?.draftDH, 300);
});
