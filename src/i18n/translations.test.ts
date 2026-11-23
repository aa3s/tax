import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SECTORS, INITIAL_TENDERS } from '../data/daribatiData';
import {
  BID_TRANSLATIONS,
  formatLocalizedCompactDH,
  formatLocalizedDH,
  getLocaleDirection,
  Locale,
  PAYMENT_METHOD_TRANSLATIONS,
  SECTOR_TRANSLATIONS,
  SUB_SECTOR_TRANSLATIONS,
  TAX_CATEGORY_TRANSLATIONS,
  TENDER_TRANSLATIONS,
  UI_STRINGS,
} from './translations';

const LOCALES: Locale[] = ['en', 'fr', 'ar'];

test('locale directions resolve ltr for en/fr and rtl for ar', () => {
  assert.equal(getLocaleDirection('en'), 'ltr');
  assert.equal(getLocaleDirection('fr'), 'ltr');
  assert.equal(getLocaleDirection('ar'), 'rtl');
});

test('localized currency formatters produce valid outputs across all locales', () => {
  assert.equal(formatLocalizedDH(1000, 'en'), '1,000 DH');
  assert.equal(formatLocalizedDH(1000, 'fr'), '1 000 DH');
  assert.equal(formatLocalizedDH(1000, 'ar'), '1,000 د.م');

  assert.equal(formatLocalizedCompactDH(50_000_000, 'en'), '50M DH');
  assert.equal(formatLocalizedCompactDH(50_000_000, 'fr'), '50M DH');
  assert.equal(formatLocalizedCompactDH(50_000_000, 'ar'), '50 مليون د.م');
});

test('all locales share identical UI_STRINGS key sets with non-empty values', () => {
  const baseKeys = Object.keys(UI_STRINGS.en).sort();
  for (const loc of LOCALES) {
    const locKeys = Object.keys(UI_STRINGS[loc]).sort();
    assert.deepEqual(locKeys, baseKeys, `Missing or extra keys in locale ${loc}`);
    for (const key of baseKeys) {
      const val = UI_STRINGS[loc][key as keyof typeof UI_STRINGS.en];
      if (typeof val === 'string') {
        assert.ok(val.trim().length > 0, `Empty string for ${loc}.${key}`);
      } else {
        assert.equal(typeof val, 'function', `Expected function for ${loc}.${key}`);
      }
    }
  }
});

test('every sector, sub-sector, tender, bid, tax category, and payment method is translated in en/fr/ar', () => {
  for (const loc of LOCALES) {
    assert.equal(Object.keys(TAX_CATEGORY_TRANSLATIONS[loc]).length, 4);
    assert.equal(Object.keys(PAYMENT_METHOD_TRANSLATIONS[loc]).length, 3);

    for (const sector of INITIAL_SECTORS) {
      const sCopy = SECTOR_TRANSLATIONS[loc][sector.id];
      assert.ok(sCopy && sCopy.title.trim().length > 0, `Missing sector ${sector.id} in ${loc}`);
      for (const sub of sector.subSectors) {
        const subCopy = SUB_SECTOR_TRANSLATIONS[loc][sub.id];
        assert.ok(
          subCopy && subCopy.name.trim().length > 0 && subCopy.description.trim().length > 0,
          `Missing sub-sector ${sub.id} in ${loc}`
        );
      }
    }

    for (const tender of INITIAL_TENDERS) {
      const tCopy = TENDER_TRANSLATIONS[loc][tender.id];
      assert.ok(tCopy && tCopy.title.trim().length > 0, `Missing tender ${tender.id} in ${loc}`);
      for (const bid of tender.bids) {
        const bCopy = BID_TRANSLATIONS[loc][bid.id];
        assert.ok(bCopy && bCopy.summary.trim().length > 0, `Missing bid ${bid.id} in ${loc}`);
      }
    }
  }
});
