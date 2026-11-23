import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SECTORS } from '../data/daribatiData';
import { TaxReceipt } from '../types/daribati';
import {
  buildReceiptPdfData,
  computeReceiptVerificationCode,
  createReceiptPdfDocument,
  sanitizePdfLatinText,
} from './receiptPdf';

const SAMPLE_RECEIPT: TaxReceipt = {
  id: 'DAR-2026-MA-482910',
  paidAt: '2026-11-22T10:30:00.000Z',
  taxCategory: 'IR — Impôt sur le Revenu',
  totalAmountDH: 1000,
  paymentMethod: 'cmi_card',
  paymentReference: 'CMI-****7709',
  citizenName: 'Youssef El Amrani',
  citizenCIN: 'AB748291',
  citizenCity: 'Rabat',
  allocations: [
    {
      sectorId: 'education',
      sectorTitle: 'Education',
      subSectorId: 'edu-k12',
      subSectorName: 'K-12 Public Schools',
      amountDH: 400,
    },
    {
      sectorId: 'healthcare',
      sectorTitle: 'Healthcare & Public Health',
      subSectorId: 'hc-clinics',
      subSectorName: 'Public Clinics & Primary Care',
      amountDH: 300,
    },
    {
      sectorId: 'education',
      sectorTitle: 'Education',
      subSectorId: 'edu-univ',
      subSectorName: 'Universities & Higher Education',
      amountDH: 100,
    },
    {
      sectorId: 'utilities',
      sectorTitle: 'Utilities & Basic Services',
      subSectorId: 'ut-water',
      subSectorName: 'Clean Water & Sanitation',
      amountDH: 200,
    },
  ],
};

test('sanitizePdfLatinText normalizes smart punctuation while preserving French accents', () => {
  assert.equal(
    sanitizePdfLatinText('IR — Impôt sur le Revenu · ★ Émise à 1\u202f000 DH'),
    'IR - Impôt sur le Revenu | * Émise à 1 000 DH'
  );
  assert.equal(
    sanitizePdfLatinText('L’éducation & l’eau “propre”…'),
    'L\'éducation & l\'eau "propre"...'
  );
});

test('computeReceiptVerificationCode is deterministic and follows MA-TGR format', () => {
  const code1 = computeReceiptVerificationCode(SAMPLE_RECEIPT);
  const code2 = computeReceiptVerificationCode({ ...SAMPLE_RECEIPT });
  assert.equal(code1, code2);
  assert.match(code1, /^MA-TGR-[0-9A-F]{4}-[0-9A-F]{4}$/);

  const different = computeReceiptVerificationCode({
    ...SAMPLE_RECEIPT,
    totalAmountDH: 2500,
  });
  assert.notEqual(code1, different);
});

test('buildReceiptPdfData aggregates parent sectors, sorts rows, and localizes across en/fr/ar', () => {
  const enData = buildReceiptPdfData(SAMPLE_RECEIPT, 'en');
  assert.equal(enData.filename, 'Daribati-Receipt-DAR-2026-MA-482910.pdf');
  assert.equal(enData.totalAmountText, '1,000 DH');
  assert.equal(enData.rows.length, 4);
  assert.equal(enData.rows[0].subSectorId, 'edu-k12');
  assert.equal(enData.rows[0].shareText, '40.0%');
  assert.equal(enData.sectorBreakdown.length, 3);
  assert.equal(enData.sectorBreakdown[0].sectorId, 'education');
  assert.equal(enData.sectorBreakdown[0].amountDH, 500);
  assert.equal(enData.sectorBreakdown[0].shareText, '50.0%');

  const frData = buildReceiptPdfData(SAMPLE_RECEIPT, 'fr');
  assert.equal(frData.totalAmountText, '1 000 DH');
  assert.equal(frData.sectorBreakdown[0].sectorTitle, 'Éducation et Formation');

  const arData = buildReceiptPdfData(SAMPLE_RECEIPT, 'ar');
  assert.equal(arData.totalAmountText, '1,000 د.م');
  assert.equal(arData.labels.docTitle, 'إيصال ضريبي تشاركي رسمي');
});

test('createReceiptPdfDocument outputs valid PDF binary containing receipt metadata', () => {
  const doc = createReceiptPdfDocument(SAMPLE_RECEIPT, 'en');
  assert.equal(doc.getNumberOfPages(), 1);

  const bytes = new Uint8Array(doc.output('arraybuffer'));
  assert.ok(bytes.byteLength > 1500, 'Expected non-trivial formatted PDF output');

  const rawText = new TextDecoder('latin1').decode(bytes);
  assert.ok(rawText.startsWith('%PDF-'), 'Output must begin with valid %PDF- header');
  assert.ok(rawText.trimEnd().endsWith('%%EOF'), 'Output must end with %%EOF trailer');
});

test('createReceiptPdfDocument automatically paginates receipts with many allocated sub-sectors', () => {
  const manyAllocations = INITIAL_SECTORS.flatMap((sector) =>
    sector.subSectors.map((sub) => ({
      sectorId: sector.id,
      sectorTitle: sector.title,
      subSectorId: sub.id,
      subSectorName: sub.name,
      amountDH: 100,
    }))
  );

  const bigReceipt: TaxReceipt = {
    ...SAMPLE_RECEIPT,
    id: 'DAR-2026-MA-999999',
    totalAmountDH: manyAllocations.length * 100,
    allocations: manyAllocations,
  };

  const doc = createReceiptPdfDocument(bigReceipt, 'fr');
  assert.ok(
    doc.getNumberOfPages() >= 2,
    `Expected multi-page pagination for ${manyAllocations.length} rows, got ${doc.getNumberOfPages()}`
  );
});
