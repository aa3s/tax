import test from 'node:test';
import assert from 'node:assert/strict';
import { Locale } from '../i18n/translations';
import { TaxReceipt } from '../types/daribati';
import { calculateCivicRank, CIVIC_RANK_TIERS, CIVIC_RANK_UI } from './civicRank';

function makeReceipt(id: string, amountDH: number): TaxReceipt {
  return {
    id,
    paidAt: '2026-11-22T12:00:00.000Z',
    taxCategory: 'IR — Impôt sur le Revenu',
    totalAmountDH: amountDH,
    paymentMethod: 'cmi_card',
    paymentReference: 'CMI-****7709',
    citizenName: 'Youssef El Mansouri',
    citizenCIN: 'AB482910',
    citizenCity: 'Rabat, Morocco',
    allocations: [
      {
        sectorId: 'education',
        sectorTitle: 'Education and Training',
        subSectorId: 'edu-k12',
        subSectorName: 'Public schools (K-12)',
        amountDH,
      },
    ],
  };
}

test('0 receipts yields Civic Observer (rank 1) with 0% progress toward Contributor', () => {
  const result = calculateCivicRank([]);
  assert.equal(result.currentTier.id, 'observer');
  assert.equal(result.currentTier.level, 1);
  assert.equal(result.nextTier?.id, 'contributor');
  assert.equal(result.receiptsRemaining, 1);
  assert.equal(result.amountRemainingDH, 500);
  assert.equal(result.progressPct, 0);
  assert.equal(result.qualifyingPath, 'none');
  assert.equal(result.isMaxRank, false);
});

test('1 receipt of 1,000 DH assigns Contributor and tracks 50% progress toward Public Patron', () => {
  const result = calculateCivicRank([makeReceipt('DAR-1', 1000)]);
  assert.equal(result.currentTier.id, 'contributor');
  assert.equal(result.currentTier.level, 2);
  assert.equal(result.qualifyingPath, 'both');
  assert.equal(result.nextTier?.id, 'patron');
  assert.equal(result.receiptsRemaining, 1);
  assert.equal(result.amountRemainingDH, 1500);
  assert.equal(result.receiptProgressPct, 50);
  assert.equal(result.amountProgressPct, 40);
  assert.equal(result.progressPct, 50);
});

test('Public Patron unlocks via EITHER 2 receipts OR 2,500 DH allocated', () => {
  const byReceipts = calculateCivicRank([
    makeReceipt('DAR-1', 400),
    makeReceipt('DAR-2', 400),
  ]);
  assert.equal(byReceipts.currentTier.id, 'patron');
  assert.equal(byReceipts.qualifyingPath, 'receipts');

  const byAmount = calculateCivicRank([makeReceipt('DAR-1', 2500)]);
  assert.equal(byAmount.currentTier.id, 'patron');
  assert.equal(byAmount.qualifyingPath, 'amount');
});

test('Civic Leader unlocks at 4 receipts or 7,500 DH', () => {
  const byReceipts = calculateCivicRank([
    makeReceipt('DAR-1', 500),
    makeReceipt('DAR-2', 500),
    makeReceipt('DAR-3', 500),
    makeReceipt('DAR-4', 500),
  ]);
  assert.equal(byReceipts.currentTier.id, 'civic-leader');
  assert.equal(byReceipts.currentTier.level, 4);
  assert.equal(byReceipts.nextTier?.id, 'nation-builder');

  const byAmount = calculateCivicRank([makeReceipt('DAR-1', 8000)]);
  assert.equal(byAmount.currentTier.id, 'civic-leader');
  assert.equal(byAmount.qualifyingPath, 'amount');
});

test('Nation Builder unlocks at 6 receipts or 15,000 DH with 100% max rank status', () => {
  const maxByAmount = calculateCivicRank([makeReceipt('DAR-1', 15000)]);
  assert.equal(maxByAmount.currentTier.id, 'nation-builder');
  assert.equal(maxByAmount.currentTier.level, 5);
  assert.equal(maxByAmount.nextTier, null);
  assert.equal(maxByAmount.isMaxRank, true);
  assert.equal(maxByAmount.progressPct, 100);
  assert.equal(
    maxByAmount.tiers.every((tier) => tier.unlocked),
    true
  );

  const maxByReceipts = calculateCivicRank([
    makeReceipt('DAR-1', 200),
    makeReceipt('DAR-2', 200),
    makeReceipt('DAR-3', 200),
    makeReceipt('DAR-4', 200),
    makeReceipt('DAR-5', 200),
    makeReceipt('DAR-6', 200),
  ]);
  assert.equal(maxByReceipts.currentTier.id, 'nation-builder');
  assert.equal(maxByReceipts.qualifyingPath, 'receipts');
});

test('all 5 Civic Rank tiers have non-empty trilingual copy in en, fr, and ar', () => {
  const locales: Locale[] = ['en', 'fr', 'ar'];
  for (const loc of locales) {
    const ui = CIVIC_RANK_UI[loc];
    assert.ok(ui.sectionTitle.trim().length > 0);
    for (const tier of CIVIC_RANK_TIERS) {
      const copy = ui.tiers[tier.id];
      assert.ok(copy && copy.title.trim().length > 0, `Missing title for ${loc}.${tier.id}`);
      assert.ok(copy && copy.summary.trim().length > 0, `Missing summary for ${loc}.${tier.id}`);
    }
  }
});
