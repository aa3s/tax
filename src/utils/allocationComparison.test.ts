import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SECTORS } from '../data/daribatiData';
import { Locale } from '../i18n/translations';
import {
  allocationsMatch,
  buildScenarioComparison,
  COMPARE_ALLOCATIONS_UI,
  formatSignedDH,
  formatSignedUnits,
  SavedAllocationScenario,
} from './allocationComparison';

const SCENARIO_A: SavedAllocationScenario = {
  slot: 'A',
  name: 'Health & Education Priority',
  taxBillDH: 1000,
  allocations: {
    'ed-k12': 400,
    'ed-univ': 100,
    'hc-hospitals': 300,
    'tr-roads': 100,
    'ut-water': 100,
  },
  savedAt: '2026-11-22T14:00:00.000Z',
};

const SCENARIO_B: SavedAllocationScenario = {
  slot: 'B',
  name: 'Infrastructure & Clean Water',
  taxBillDH: 1000,
  allocations: {
    'tr-roads': 400,
    'ut-water': 300,
    'hc-hospitals': 150,
    'ed-k12': 150,
  },
  savedAt: '2026-11-22T14:05:00.000Z',
};

test('buildScenarioComparison returns not-ready state when either scenario slot is empty', () => {
  const onlyA = buildScenarioComparison(
    INITIAL_SECTORS,
    SCENARIO_A,
    null,
    'collective',
    'en'
  );
  assert.equal(onlyA.isReadyToCompare, false);
  assert.equal(onlyA.totalA, 1000);
  assert.equal(onlyA.totalB, 0);
  assert.equal(onlyA.sectorRows.length, 0);
});

test('buildScenarioComparison accurately computes sector funding deltas and benchmark unit shifts', () => {
  const result = buildScenarioComparison(
    INITIAL_SECTORS,
    SCENARIO_A,
    SCENARIO_B,
    'collective',
    'en'
  );

  assert.equal(result.isReadyToCompare, true);
  assert.equal(result.totalA, 1000);
  assert.equal(result.totalB, 1000);
  assert.equal(result.totalDeltaDH, 0);
  assert.equal(result.fundedSectorsA, 4);
  assert.equal(result.fundedSectorsB, 4);
  assert.equal(result.changedSectorCount, 4);

  // Education dropped from 500 -> 150 (-350 DH), so it is strongest in Scenario A
  assert.equal(result.biggestGainInA?.sectorId, 'education');
  assert.equal(result.biggestGainInA?.deltaDH, -350);

  // Transportation rose from 100 -> 400 (+300 DH), so it is strongest in Scenario B
  assert.equal(result.biggestGainInB?.sectorId, 'transportation');
  assert.equal(result.biggestGainInB?.deltaDH, 300);

  // Check healthcare rural clinic benchmark diff (300 DH -> 4 clinics vs 150 DH -> 2 clinics = -2)
  const clinicDiff = result.benchmarkDiffs.find((d) => d.subSectorId === 'hc-hospitals');
  assert.ok(clinicDiff);
  assert.equal(clinicDiff.unitsA, 4);
  assert.equal(clinicDiff.unitsB, 2);
  assert.equal(clinicDiff.deltaUnits, -2);
  assert.equal(formatSignedUnits(clinicDiff.deltaUnits), '-2');
});

test('identical scenarios report zero shifted sectors and allocationsMatch returns true', () => {
  const copyB: SavedAllocationScenario = {
    ...SCENARIO_A,
    slot: 'B',
  };
  assert.equal(allocationsMatch(SCENARIO_A.allocations, copyB.allocations), true);
  assert.equal(allocationsMatch(SCENARIO_A.allocations, SCENARIO_B.allocations), false);

  const cmp = buildScenarioComparison(
    INITIAL_SECTORS,
    SCENARIO_A,
    copyB,
    'personal',
    'fr'
  );
  assert.equal(cmp.changedSectorCount, 0);
  assert.equal(cmp.biggestGainInA, null);
  assert.equal(cmp.biggestGainInB, null);
});

test('signed currency formatter and trilingual UI strings work across en, fr, and ar', () => {
  assert.equal(formatSignedDH(300, 'en'), '+300 DH');
  assert.equal(formatSignedDH(-350, 'en'), '-350 DH');
  assert.equal(formatSignedDH(1000, 'fr'), '+1 000 DH');
  assert.equal(formatSignedDH(-500, 'ar'), '-500 د.م');

  const locales: Locale[] = ['en', 'fr', 'ar'];
  for (const loc of locales) {
    const ui = COMPARE_ALLOCATIONS_UI[loc];
    assert.ok(ui.title.trim().length > 0);
    assert.ok(ui.saveAsA.trim().length > 0);
    assert.ok(ui.saveAsB.trim().length > 0);
    assert.ok(ui.slotLabel('A').trim().length > 0);
    assert.ok(ui.slotLabel('B').trim().length > 0);
  }
});
