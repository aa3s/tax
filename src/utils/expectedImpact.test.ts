import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SECTORS, SAMPLE_ALLOCATION_FOR_1000 } from '../data/daribatiData';
import { Locale } from '../i18n/translations';
import {
  calculateExpectedImpacts,
  calculateSectorExpectedImpacts,
  COLLECTIVE_TAXPAYER_MULTIPLIER,
  EXPECTED_IMPACT_UI,
  SUB_SECTOR_BENCHMARKS,
  summarizeExpectedImpactHeadline,
} from './expectedImpact';

const LOCALES: Locale[] = ['en', 'fr', 'ar'];

test('every sub-sector across all 9 sectors has valid EN/FR/AR benchmarks', () => {
  const allSubSectorIds = INITIAL_SECTORS.flatMap((s) => s.subSectors.map((sub) => sub.id));
  assert.equal(allSubSectorIds.length, 32);

  for (const id of allSubSectorIds) {
    const bench = SUB_SECTOR_BENCHMARKS[id];
    assert.ok(bench, `Missing benchmark for sub-sector ${id}`);
    assert.ok(bench.collectiveUnitCostDH > 0, `Invalid collective cost for ${id}`);
    assert.ok(bench.personalUnitCostDH > 0, `Invalid personal cost for ${id}`);

    for (const locale of LOCALES) {
      assert.ok(bench.collective[locale].singular.length > 0);
      assert.ok(bench.collective[locale].plural.length > 0);
      assert.ok(bench.collective[locale].unitNoun.length > 0);
      assert.ok(bench.personal[locale].singular.length > 0);
      assert.ok(bench.personal[locale].plural.length > 0);
      assert.ok(bench.personal[locale].unitNoun.length > 0);
    }
  }
});

test('empty allocations yield no impact items and empty summary headline', () => {
  for (const locale of LOCALES) {
    const items = calculateExpectedImpacts({}, INITIAL_SECTORS, 'collective', locale);
    assert.deepEqual(items, []);
    assert.equal(summarizeExpectedImpactHeadline(items, locale), '');
    assert.ok(EXPECTED_IMPACT_UI[locale].title.length > 0);
  }
});

test('sample 1000 DH allocation supports 4 new rural clinics and 20 modern classrooms in collective scope', () => {
  const impacts = calculateExpectedImpacts(
    SAMPLE_ALLOCATION_FOR_1000,
    INITIAL_SECTORS,
    'collective',
    'en'
  );

  assert.equal(impacts.length, 5);
  // Sorted descending by allocatedDH: ed-k12 (400), hc-hospitals (300), ...
  assert.equal(impacts[0].subSectorId, 'ed-k12');
  assert.equal(impacts[0].displayQuantity, '20');
  assert.match(impacts[0].statement, /20 modern public classrooms/);

  const clinics = impacts.find((i) => i.subSectorId === 'hc-hospitals');
  assert.ok(clinics);
  assert.equal(clinics.effectivePoolDH, 300 * COLLECTIVE_TAXPAYER_MULTIPLIER);
  assert.equal(clinics.displayQuantity, '4');
  assert.equal(clinics.statement, 'This allocation supports 4 new rural clinics');

  const headline = summarizeExpectedImpactHeadline(impacts, 'en');
  assert.match(headline, /20 modern public classrooms/);
  assert.match(headline, /4 new rural clinics/);
});

test('personal scope computes 1-to-1 citizen units without collective multiplier', () => {
  const impacts = calculateExpectedImpacts(
    { 'hc-hospitals': 300 },
    INITIAL_SECTORS,
    'personal',
    'en'
  );
  assert.equal(impacts.length, 1);
  assert.equal(impacts[0].effectivePoolDH, 300);
  assert.equal(impacts[0].displayQuantity, '4');
  assert.equal(impacts[0].statement, 'This allocation supports 4 primary clinic consultation kits');
});

test('small allocations below 1 full benchmark unit render percentage progress toward 1 unit', () => {
  const impacts = calculateExpectedImpacts(
    { 'hc-hospitals': 30 },
    INITIAL_SECTORS,
    'collective',
    'en'
  );
  // 30 * 10,000 = 300,000 DH / 750,000 DH = 40%
  assert.equal(impacts.length, 1);
  assert.equal(impacts[0].isPartialUnit, true);
  assert.equal(impacts[0].displayQuantity, '40%');
  assert.equal(impacts[0].progressToNextUnitPct, 40);
  assert.equal(impacts[0].statement, 'This allocation funds 40% toward 1 new rural clinic');
});

test('sector-scoped calculation filters to the expanded sector and supports FR & AR locales', () => {
  const healthcareSector = INITIAL_SECTORS.find((s) => s.id === 'healthcare')!;
  const frImpacts = calculateSectorExpectedImpacts(
    SAMPLE_ALLOCATION_FOR_1000,
    healthcareSector,
    'collective',
    'fr'
  );
  assert.equal(frImpacts.length, 1);
  assert.equal(frImpacts[0].statement, 'Cette répartition soutient 4 nouveaux dispensaires ruraux');

  const arImpacts = calculateSectorExpectedImpacts(
    SAMPLE_ALLOCATION_FOR_1000,
    healthcareSector,
    'collective',
    'ar'
  );
  assert.equal(arImpacts.length, 1);
  assert.equal(arImpacts[0].statement, 'يدعم هذا التوزيع 4 مستوصفات قروية جديدة');
});
