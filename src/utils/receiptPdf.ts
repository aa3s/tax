import { jsPDF } from 'jspdf';
import {
  formatLocalizedDH,
  Locale,
  PAYMENT_METHOD_TRANSLATIONS,
  SECTOR_TRANSLATIONS,
  SUB_SECTOR_TRANSLATIONS,
  TAX_CATEGORY_TRANSLATIONS,
  UI_STRINGS,
} from '../i18n/translations';
import { TaxReceipt } from '../types/daribati';
import { SECTOR_CHART_COLORS } from './allocationDistribution';

export interface ReceiptPdfRow {
  index: number;
  subSectorId: string;
  subSectorName: string;
  sectorId: string;
  sectorTitle: string;
  amountDH: number;
  amountText: string;
  sharePct: number;
  shareText: string;
}

export interface ReceiptPdfSectorSummary {
  sectorId: string;
  sectorTitle: string;
  color: string;
  amountDH: number;
  amountText: string;
  sharePct: number;
  shareText: string;
}

export interface ReceiptPdfLabels {
  orgKicker: string;
  docTitle: string;
  verifiedSeal: string;
  receiptRefLabel: string;
  totalPaidLabel: string;
  taxpayerSection: string;
  declarationSection: string;
  paymentSection: string;
  cinPrefix: string;
  issuedPrefix: string;
  verifyCodePrefix: string;
  sectorMixHeading: string;
  itemizedHeading: string;
  colIndex: string;
  colSubSector: string;
  colParentSector: string;
  colShare: string;
  colAllocated: string;
  totalRowLabel: string;
  verificationBoxTitle: string;
  verificationBoxBody: string;
  sealStampLine1: string;
  sealStampLine2: string;
  footerLeft: string;
  pageCounter: (page: number, total: number) => string;
}

export interface ReceiptPdfData {
  locale: Locale;
  filename: string;
  receiptId: string;
  verificationCode: string;
  issuedDateText: string;
  taxCategoryLabel: string;
  paymentChannelLabel: string;
  paymentReference: string;
  citizenName: string;
  citizenCIN: string;
  citizenCity: string;
  totalAmountDH: number;
  totalAmountText: string;
  sectorBreakdown: ReceiptPdfSectorSummary[];
  rows: ReceiptPdfRow[];
  labels: ReceiptPdfLabels;
}

const PDF_LABELS: Record<Locale, ReceiptPdfLabels> = {
  en: {
    orgKicker: 'KINGDOM OF MOROCCO  |  DARIBATI PARTICIPATORY TAX PORTAL',
    docTitle: 'Official Participatory Tax Receipt',
    verifiedSeal: 'VERIFIED TAXPAYER RECEIPT',
    receiptRefLabel: 'Receipt Reference',
    totalPaidLabel: 'TOTAL PAID & VERIFIED',
    taxpayerSection: 'TAXPAYER DETAILS',
    declarationSection: 'TAX DECLARATION',
    paymentSection: 'PAYMENT VERIFICATION',
    cinPrefix: 'CIN',
    issuedPrefix: 'Issued',
    verifyCodePrefix: 'Verify ID',
    sectorMixHeading: 'Funding Distribution by Public Sector',
    itemizedHeading: 'Itemized Public Service Allocation Ledger',
    colIndex: '#',
    colSubSector: 'Public Sub-Sector',
    colParentSector: 'Parent Sector',
    colShare: 'Share',
    colAllocated: 'Allocated (DH)',
    totalRowLabel: 'Total Participatory Tax Allocation',
    verificationBoxTitle: 'Digital Verification & Civic Voting Eligibility',
    verificationBoxBody:
      'This receipt certifies that the taxpayer has allocated 100% of their declared contribution across Morocco public service sectors. Verified Taxpayer status is active for weighted citizen voting on public tenders.',
    sealStampLine1: 'TGR / DARIBATI',
    sealStampLine2: 'VERIFIED LEDGER',
    footerLeft: 'Daribati Participatory Tax & Civic Portal (Morocco) - Official Digital Quittance',
    pageCounter: (page, total) => `Page ${page} of ${total}`,
  },
  fr: {
    orgKicker: 'ROYAUME DU MAROC  |  PORTAIL FISCAL PARTICIPATIF DARIBATI',
    docTitle: 'Quittance Fiscale Participative Officielle',
    verifiedSeal: 'QUITTANCE CONTRIBUABLE VERIFIE',
    receiptRefLabel: 'Référence de Quittance',
    totalPaidLabel: 'TOTAL PAYE & CERTIFIE',
    taxpayerSection: 'CONTRIBUABLE',
    declarationSection: 'DECLARATION FISCALE',
    paymentSection: 'CANAL DE PAIEMENT',
    cinPrefix: 'CIN',
    issuedPrefix: 'Émise le',
    verifyCodePrefix: 'Code Vérif.',
    sectorMixHeading: 'Répartition par Secteur Public',
    itemizedHeading: 'Détail de la Répartition par Service Public',
    colIndex: 'N°',
    colSubSector: 'Sous-Secteur Public',
    colParentSector: 'Secteur Principal',
    colShare: 'Part',
    colAllocated: 'Alloué (DH)',
    totalRowLabel: 'Total de la Répartition Fiscale Participative',
    verificationBoxTitle: 'Certification Numérique & Droit de Vote Civique',
    verificationBoxBody:
      'Cette quittance atteste que le contribuable a orienté 100 % de sa contribution vers les services publics marocains. Le statut Contribuable Vérifié est actif pour voter sur les appels d\'offres publics.',
    sealStampLine1: 'TGR / DARIBATI',
    sealStampLine2: 'REGISTRE CERTIFIE',
    footerLeft: 'Daribati - Portail Fiscal Participatif & Civique (Maroc) - Quittance Officielle',
    pageCounter: (page, total) => `Page ${page} sur ${total}`,
  },
  ar: {
    orgKicker: 'المملكة المغربية  ·  البوابة التشاركية للضرائب — ضريبتي',
    docTitle: 'إيصال ضريبي تشاركي رسمي',
    verifiedSeal: '★ إيصال دافع ضرائب موثّق',
    receiptRefLabel: 'مرجع الإيصال',
    totalPaidLabel: 'الإجمالي المؤدى والموثّق',
    taxpayerSection: 'بيانات دافع الضرائب',
    declarationSection: 'التصريح الضريبي',
    paymentSection: 'تأكيد الأداء',
    cinPrefix: 'ب.و.ت',
    issuedPrefix: 'تاريخ الإصدار',
    verifyCodePrefix: 'رمز التحقق',
    sectorMixHeading: 'توزيع التمويل حسب القطاع العمومي',
    itemizedHeading: 'التوزيع المفصل على الخدمات العمومية',
    colIndex: '#',
    colSubSector: 'القطاع الفرعي العمومي',
    colParentSector: 'القطاع الرئيسي',
    colShare: 'النسبة',
    colAllocated: 'المبلغ المخصص (د.م)',
    totalRowLabel: 'إجمالي التوزيع الضريبي التشاركي',
    verificationBoxTitle: 'التحقق الرقمي وأهلية التصويت المواطن',
    verificationBoxBody:
      'يشهد هذا الإيصال بتوجيه 100% من المساهمة الضريبية المصرّح بها نحو قطاعات الخدمات العمومية المغربية. شارة دافع الضرائب الموثّق مفعّلة للتصويت على الصفقات العمومية.',
    sealStampLine1: 'الخزينة العامة / ضريبتي',
    sealStampLine2: 'سجل رقمي موثّق',
    footerLeft: 'ضريبتي — البوابة التشاركية للضرائب والمواطنة (المغرب) · إيصال رقمي رسمي',
    pageCounter: (page, total) => `صفحة ${page} من ${total}`,
  },
};

/**
 * Normalizes typographic Unicode punctuation to Latin-1-safe characters for
 * built-in jsPDF Helvetica/Courier fonts so EN and FR accents render cleanly
 * without missing-glyph artifacts.
 */
export function sanitizePdfLatinText(input: string): string {
  return input
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/\u2605/g, '*')
    .replace(/\u00B7/g, '|')
    .replace(/[^\x20-\x7E\xA1-\xFF]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Computes a deterministic verification fingerprint from receipt attributes.
 */
export function computeReceiptVerificationCode(receipt: TaxReceipt): string {
  const seed = `${receipt.id}|${receipt.citizenCIN}|${receipt.totalAmountDH}|${receipt.paidAt}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < seed.length; i += 1) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ (c + i * 31), 0x85ebca6b) >>> 0;
  }
  const partA = h1.toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  const partB = h2.toString(16).toUpperCase().padStart(8, '0').slice(0, 4);
  return `MA-TGR-${partA}-${partB}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const full =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : cleaned;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return [29, 63, 216];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function buildReceiptPdfData(
  receipt: TaxReceipt,
  locale: Locale = 'en'
): ReceiptPdfData {
  const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-MA' : 'en-GB';
  const safeId = receipt.id.replace(/[^A-Za-z0-9_-]/g, '_');
  const denom = Math.max(1, receipt.totalAmountDH);

  const sortedAllocations = [...receipt.allocations].sort(
    (a, b) => b.amountDH - a.amountDH || a.subSectorName.localeCompare(b.subSectorName)
  );

  const rows: ReceiptPdfRow[] = sortedAllocations.map((item, idx) => {
    const sharePct = (item.amountDH / denom) * 100;
    const subSectorName =
      SUB_SECTOR_TRANSLATIONS[locale][item.subSectorId]?.name ?? item.subSectorName;
    const sectorTitle =
      SECTOR_TRANSLATIONS[locale][item.sectorId]?.title ?? item.sectorTitle;
    return {
      index: idx + 1,
      subSectorId: item.subSectorId,
      subSectorName,
      sectorId: item.sectorId,
      sectorTitle,
      amountDH: item.amountDH,
      amountText: formatLocalizedDH(item.amountDH, locale),
      sharePct,
      shareText: `${sharePct.toFixed(1)}%`,
    };
  });

  const sectorMap = new Map<string, ReceiptPdfSectorSummary>();
  for (const row of rows) {
    const existing = sectorMap.get(row.sectorId);
    if (existing) {
      existing.amountDH += row.amountDH;
    } else {
      sectorMap.set(row.sectorId, {
        sectorId: row.sectorId,
        sectorTitle: row.sectorTitle,
        color: SECTOR_CHART_COLORS[row.sectorId] ?? '#1D3FD8',
        amountDH: row.amountDH,
        amountText: '',
        sharePct: 0,
        shareText: '',
      });
    }
  }

  const sectorBreakdown = Array.from(sectorMap.values())
    .sort((a, b) => b.amountDH - a.amountDH || a.sectorTitle.localeCompare(b.sectorTitle))
    .map((entry) => {
      const sharePct = (entry.amountDH / denom) * 100;
      return {
        ...entry,
        amountText: formatLocalizedDH(entry.amountDH, locale),
        sharePct,
        shareText: `${sharePct.toFixed(1)}%`,
      };
    });

  const parsedDate = new Date(receipt.paidAt);
  const issuedDateText = Number.isNaN(parsedDate.getTime())
    ? receipt.paidAt
    : parsedDate.toLocaleString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

  return {
    locale,
    filename: `Daribati-Receipt-${safeId}.pdf`,
    receiptId: receipt.id,
    verificationCode: computeReceiptVerificationCode(receipt),
    issuedDateText,
    taxCategoryLabel:
      TAX_CATEGORY_TRANSLATIONS[locale][receipt.taxCategory] ?? receipt.taxCategory,
    paymentChannelLabel:
      PAYMENT_METHOD_TRANSLATIONS[locale][receipt.paymentMethod] ??
      PAYMENT_METHOD_TRANSLATIONS.en[receipt.paymentMethod],
    paymentReference: receipt.paymentReference,
    citizenName: receipt.citizenName,
    citizenCIN: receipt.citizenCIN,
    citizenCity: receipt.citizenCity,
    totalAmountDH: receipt.totalAmountDH,
    totalAmountText: formatLocalizedDH(receipt.totalAmountDH, locale),
    sectorBreakdown,
    rows,
    labels: PDF_LABELS[locale],
  };
}

/**
 * Renders a crisp high-DPI Arabic RTL receipt page onto an HTML5 Canvas so that
 * Arabic ligatures and RTL layout appear cleanly inside the generated jsPDF file.
 */
function renderArabicReceiptToPdf(doc: jsPDF, data: ReceiptPdfData): void {
  const pageWidthPx = 1240;
  const pageHeightPx = 1754;
  const marginX = 76;
  const contentWidth = pageWidthPx - marginX * 2;

  const firstPageMaxRows = 12;
  const continuationMaxRows = 22;

  const rowChunks: ReceiptPdfRow[][] = [];
  if (data.rows.length <= firstPageMaxRows) {
    rowChunks.push(data.rows);
  } else {
    rowChunks.push(data.rows.slice(0, firstPageMaxRows));
    for (let i = firstPageMaxRows; i < data.rows.length; i += continuationMaxRows) {
      rowChunks.push(data.rows.slice(i, i + continuationMaxRows));
    }
  }

  const totalPages = Math.max(1, rowChunks.length);
  const fontStack = '"Public Sans", "Segoe UI", Tahoma, Arial, sans-serif';

  rowChunks.forEach((chunk, pageIndex) => {
    const canvas = document.createElement('canvas');
    canvas.width = pageWidthPx;
    canvas.height = pageHeightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, pageWidthPx, pageHeightPx);
    ctx.direction = 'rtl';

    let y = 0;

    if (pageIndex === 0) {
      // Dark-blue civic header banner
      const grad = ctx.createLinearGradient(0, 0, pageWidthPx, 225);
      grad.addColorStop(0, '#070C26');
      grad.addColorStop(0.55, '#0D1A52');
      grad.addColorStop(1, '#1D3FD8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, pageWidthPx, 225);

      // Gold top rule
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(0, 0, pageWidthPx, 9);

      // Right-aligned Arabic header copy
      ctx.textAlign = 'right';
      ctx.fillStyle = '#A8C4FF';
      ctx.font = `600 18px ${fontStack}`;
      ctx.fillText(data.labels.orgKicker, pageWidthPx - marginX, 62);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `800 38px ${fontStack}`;
      ctx.fillText(data.labels.docTitle, pageWidthPx - marginX, 118);

      // Gold verified badge
      ctx.fillStyle = 'rgba(212, 175, 55, 0.16)';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pageWidthPx - marginX - 300, 146, 300, 42, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F4DF8F';
      ctx.font = `700 18px ${fontStack}`;
      ctx.textAlign = 'center';
      ctx.fillText(data.labels.verifiedSeal, pageWidthPx - marginX - 150, 173);

      // Left-side total paid card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(marginX, 42, 340, 144, 14);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#D1DDF5';
      ctx.font = `600 17px ${fontStack}`;
      ctx.fillText(data.labels.totalPaidLabel, marginX + 170, 78);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `800 38px ${fontStack}`;
      ctx.fillText(data.totalAmountText, marginX + 170, 130);

      ctx.fillStyle = '#A8C4FF';
      ctx.font = `600 16px "IBM Plex Mono", monospace`;
      ctx.direction = 'ltr';
      ctx.fillText(data.receiptId, marginX + 170, 166);
      ctx.direction = 'rtl';

      y = 264;

      // Metadata 3-column card
      ctx.fillStyle = '#F6F8FC';
      ctx.strokeStyle = '#DCE4F2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(marginX, y, contentWidth, 164, 14);
      ctx.fill();
      ctx.stroke();

      const colW = contentWidth / 3;
      const metaCols = [
        {
          title: data.labels.taxpayerSection,
          line1: data.citizenName,
          line2: `${data.labels.cinPrefix}: ${data.citizenCIN}`,
          line3: data.citizenCity,
        },
        {
          title: data.labels.declarationSection,
          line1: data.taxCategoryLabel,
          line2: `${data.labels.issuedPrefix}: ${data.issuedDateText}`,
          line3: `${data.labels.receiptRefLabel}: ${data.receiptId}`,
        },
        {
          title: data.labels.paymentSection,
          line1: data.paymentChannelLabel,
          line2: data.paymentReference,
          line3: `${data.labels.verifyCodePrefix}: ${data.verificationCode}`,
        },
      ];

      metaCols.forEach((col, i) => {
        const rightX = pageWidthPx - marginX - i * colW - 24;
        if (i > 0) {
          ctx.strokeStyle = '#DCE4F2';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(pageWidthPx - marginX - i * colW, y + 22);
          ctx.lineTo(pageWidthPx - marginX - i * colW, y + 142);
          ctx.stroke();
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = '#087E83';
        ctx.font = `700 16px ${fontStack}`;
        ctx.fillText(col.title, rightX, y + 40);

        ctx.fillStyle = '#0A1238';
        ctx.font = `700 21px ${fontStack}`;
        ctx.fillText(col.line1, rightX, y + 78, colW - 44);

        ctx.fillStyle = '#475878';
        ctx.font = `500 17px ${fontStack}`;
        ctx.fillText(col.line2, rightX, y + 112, colW - 44);
        ctx.fillText(col.line3, rightX, y + 142, colW - 44);
      });

      y += 206;

      // Sector Distribution Bars
      ctx.fillStyle = '#1D3FD8';
      ctx.fillRect(pageWidthPx - marginX - 8, y - 22, 8, 28);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#0A1238';
      ctx.font = `800 24px ${fontStack}`;
      ctx.fillText(data.labels.sectorMixHeading, pageWidthPx - marginX - 22, y);
      y += 26;

      const sectorsToShow = data.sectorBreakdown.slice(0, 6);
      const barColW = (contentWidth - 36) / 2;
      sectorsToShow.forEach((sec, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);
        const boxRight = pageWidthPx - marginX - colIdx * (barColW + 36);
        const boxLeft = boxRight - barColW;
        const rowY = y + rowIdx * 58;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0A1238';
        ctx.font = `700 18px ${fontStack}`;
        ctx.fillText(sec.sectorTitle, boxRight, rowY + 20, barColW - 150);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#087E83';
        ctx.font = `700 17px ${fontStack}`;
        ctx.fillText(`${sec.amountText} (${sec.shareText})`, boxLeft, rowY + 20);

        ctx.fillStyle = '#E6EEF5';
        ctx.beginPath();
        ctx.roundRect(boxLeft, rowY + 32, barColW, 12, 6);
        ctx.fill();

        const fillW = Math.max(12, (barColW * Math.min(100, sec.sharePct)) / 100);
        ctx.fillStyle = sec.color;
        ctx.beginPath();
        ctx.roundRect(boxRight - fillW, rowY + 32, fillW, 12, 6);
        ctx.fill();
      });

      y += Math.ceil(sectorsToShow.length / 2) * 58 + 42;
    } else {
      // Continuation page compact header
      ctx.fillStyle = '#0A1238';
      ctx.fillRect(0, 0, pageWidthPx, 92);
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(0, 0, pageWidthPx, 6);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `700 24px ${fontStack}`;
      ctx.fillText(data.labels.docTitle, pageWidthPx - marginX, 58);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#A8C4FF';
      ctx.font = `600 18px "IBM Plex Mono", monospace`;
      ctx.fillText(data.receiptId, marginX, 58);
      y = 140;
    }

    // Itemized Table Heading
    ctx.fillStyle = '#087E83';
    ctx.fillRect(pageWidthPx - marginX - 8, y - 22, 8, 28);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0A1238';
    ctx.font = `800 24px ${fontStack}`;
    ctx.fillText(data.labels.itemizedHeading, pageWidthPx - marginX - 22, y);
    y += 24;

    // Table Header Bar
    ctx.fillStyle = '#0F2942';
    ctx.beginPath();
    ctx.roundRect(marginX, y, contentWidth, 48, 8);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 17px ${fontStack}`;
    ctx.textAlign = 'right';
    ctx.fillText(data.labels.colIndex, pageWidthPx - marginX - 18, y + 31);
    ctx.fillText(data.labels.colSubSector, pageWidthPx - marginX - 74, y + 31);
    ctx.fillText(data.labels.colParentSector, pageWidthPx - marginX - 500, y + 31);
    ctx.textAlign = 'left';
    ctx.fillText(data.labels.colShare, marginX + 210, y + 31);
    ctx.fillText(data.labels.colAllocated, marginX + 22, y + 31);

    y += 52;

    chunk.forEach((row, idx) => {
      if (idx % 2 === 1) {
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(marginX, y, contentWidth, 50);
      }
      ctx.strokeStyle = '#E6EEF5';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(marginX, y + 50);
      ctx.lineTo(pageWidthPx - marginX, y + 50);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.fillStyle = '#647B92';
      ctx.font = `600 17px ${fontStack}`;
      ctx.fillText(String(row.index).padStart(2, '0'), pageWidthPx - marginX - 18, y + 32);

      ctx.fillStyle = '#0A1238';
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillText(row.subSectorName, pageWidthPx - marginX - 74, y + 32, 400);

      ctx.fillStyle = '#546482';
      ctx.font = `500 17px ${fontStack}`;
      ctx.fillText(row.sectorTitle, pageWidthPx - marginX - 500, y + 32, 300);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#546482';
      ctx.font = `600 17px ${fontStack}`;
      ctx.fillText(row.shareText, marginX + 210, y + 32);

      ctx.fillStyle = '#087E83';
      ctx.font = `700 18px ${fontStack}`;
      ctx.fillText(row.amountText, marginX + 22, y + 32);

      y += 50;
    });

    // Totals Row & Verification Box on last page
    if (pageIndex === totalPages - 1) {
      ctx.fillStyle = '#EDF4FA';
      ctx.fillRect(marginX, y, contentWidth, 56);
      ctx.fillStyle = '#0F2942';
      ctx.fillRect(marginX, y, contentWidth, 3);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0A1238';
      ctx.font = `800 20px ${fontStack}`;
      ctx.fillText(data.labels.totalRowLabel, pageWidthPx - marginX - 24, y + 36);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F2942';
      ctx.font = `800 20px ${fontStack}`;
      ctx.fillText('100.0%', marginX + 210, y + 36);
      ctx.fillText(data.totalAmountText, marginX + 22, y + 36);

      y += 88;

      if (y < pageHeightPx - 250) {
        ctx.fillStyle = '#F0FAFB';
        ctx.strokeStyle = '#9CD8D9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(marginX, y, contentWidth, 134, 14);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'right';
        ctx.fillStyle = '#087E83';
        ctx.font = `800 20px ${fontStack}`;
        ctx.fillText(data.labels.verificationBoxTitle, pageWidthPx - marginX - 28, y + 40);

        ctx.fillStyle = '#334E68';
        ctx.font = `500 17px ${fontStack}`;
        ctx.fillText(data.labels.verificationBoxBody, pageWidthPx - marginX - 28, y + 78, contentWidth - 290);

        // Seal Stamp on Left
        ctx.fillStyle = '#0A1238';
        ctx.beginPath();
        ctx.roundRect(marginX + 22, y + 22, 224, 90, 10);
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#F4DF8F';
        ctx.font = `700 15px ${fontStack}`;
        ctx.fillText(data.labels.sealStampLine1, marginX + 134, y + 52);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 16px "IBM Plex Mono", monospace`;
        ctx.direction = 'ltr';
        ctx.fillText(data.verificationCode, marginX + 134, y + 84);
        ctx.direction = 'rtl';
      }
    }

    // Running Footer
    ctx.strokeStyle = '#DCE4F2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, pageHeightPx - 86);
    ctx.lineTo(pageWidthPx - marginX, pageHeightPx - 86);
    ctx.stroke();

    ctx.textAlign = 'right';
    ctx.fillStyle = '#647B92';
    ctx.font = `500 16px ${fontStack}`;
    ctx.fillText(data.labels.footerLeft, pageWidthPx - marginX, pageHeightPx - 52);

    ctx.textAlign = 'left';
    ctx.fillText(data.labels.pageCounter(pageIndex + 1, totalPages), marginX, pageHeightPx - 52);

    if (pageIndex > 0) {
      doc.addPage('a4', 'portrait');
    }
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  });
}

/**
 * Generates a formatted A4 jsPDF Tax Receipt document.
 * - EN & FR: crisp native vector typography & shapes (selectable text, multi-page).
 * - AR (browser): high-DPI RTL Canvas embedded in jsPDF for genuine Arabic glyph shaping.
 * - AR (non-DOM fallback, e.g. Node unit tests): falls back cleanly to French/Latin vector layout.
 */
export function createReceiptPdfDocument(
  receipt: TaxReceipt,
  locale: Locale = 'en'
): jsPDF {
  const canRenderArabicCanvas =
    locale === 'ar' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function';

  const effectiveVectorLocale: Locale = locale === 'ar' && !canRenderArabicCanvas ? 'fr' : locale;
  const data = buildReceiptPdfData(receipt, effectiveVectorLocale);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  doc.setProperties({
    title: sanitizePdfLatinText(`${data.labels.docTitle} - ${data.receiptId}`),
    subject: sanitizePdfLatinText(`Daribati Participatory Tax Receipt (${data.receiptId})`),
    author: 'Daribati Participatory Tax & Civic Portal (Morocco)',
    creator: 'Daribati Civic Portal',
  });

  if (canRenderArabicCanvas) {
    renderArabicReceiptToPdf(doc, data);
    return doc;
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const safe = sanitizePdfLatinText;

  // 1. Top Civic Header Banner (0..40mm)
  doc.setFillColor(10, 18, 56); // Deep Daribati midnight navy (#0A1238)
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Royal cobalt right accent geometry
  doc.setFillColor(29, 63, 216); // #1D3FD8
  doc.rect(142, 0, pageWidth - 142, 40, 'F');

  // Moroccan gold top accent rule
  doc.setFillColor(212, 175, 55); // #D4AF37
  doc.rect(0, 0, pageWidth, 1.8, 'F');

  // Header Left: Organization Kicker + Document Title + Gold Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(168, 196, 255);
  doc.text(safe(data.labels.orgKicker), margin, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15.5);
  doc.setTextColor(255, 255, 255);
  doc.text(safe(data.labels.docTitle), margin, 20.5);

  // Gold Verified Taxpayer Badge
  doc.setDrawColor(212, 175, 55);
  doc.setFillColor(35, 39, 72);
  doc.roundedRect(margin, 25.5, 54, 7.5, 1.8, 1.8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(244, 223, 143);
  doc.text(safe(data.labels.verifiedSeal), margin + 27, 30.3, { align: 'center' });

  // Header Right: Total Paid Hero Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(210, 224, 255);
  doc.text(safe(data.labels.totalPaidLabel), pageWidth - margin, 11.5, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text(safe(data.totalAmountText), pageWidth - margin, 21.5, { align: 'right' });

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(224, 234, 255);
  doc.text(safe(data.receiptId), pageWidth - margin, 30.5, { align: 'right' });

  // 2. Taxpayer, Declaration & Payment Metadata Card
  let y = 47;
  doc.setFillColor(246, 248, 252);
  doc.setDrawColor(220, 228, 242);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentWidth, 27, 2.5, 2.5, 'FD');

  const colW = contentWidth / 3;
  // Vertical dividers inside metadata card
  doc.line(margin + colW, y + 4, margin + colW, y + 23);
  doc.line(margin + colW * 2, y + 4, margin + colW * 2, y + 23);

  const metaColumns = [
    {
      heading: data.labels.taxpayerSection,
      primary: data.citizenName,
      secondary: `${data.labels.cinPrefix}: ${data.citizenCIN}`,
      tertiary: data.citizenCity,
    },
    {
      heading: data.labels.declarationSection,
      primary: data.taxCategoryLabel,
      secondary: `${data.labels.issuedPrefix}: ${data.issuedDateText}`,
      tertiary: `${data.labels.receiptRefLabel}: ${data.receiptId}`,
    },
    {
      heading: data.labels.paymentSection,
      primary: data.paymentChannelLabel,
      secondary: data.paymentReference,
      tertiary: `${data.labels.verifyCodePrefix}: ${data.verificationCode}`,
    },
  ];

  metaColumns.forEach((col, i) => {
    const cx = margin + i * colW + 4;
    const maxW = colW - 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(8, 126, 131); // Moroccan Teal
    doc.text(safe(col.heading), cx, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(10, 18, 56);
    const primaryLine = doc.splitTextToSize(safe(col.primary), maxW)[0] ?? '';
    doc.text(primaryLine, cx, y + 12.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 88, 120);
    const secondaryLine = doc.splitTextToSize(safe(col.secondary), maxW)[0] ?? '';
    doc.text(secondaryLine, cx, y + 18);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(90, 113, 136);
    const tertiaryLine = doc.splitTextToSize(safe(col.tertiary), maxW)[0] ?? '';
    doc.text(tertiaryLine, cx, y + 23);
  });

  y += 35;

  // 3. Parent Sector Distribution Visual Overview
  if (data.sectorBreakdown.length > 0) {
    doc.setFillColor(29, 63, 216);
    doc.rect(margin, y - 3.8, 1.8, 4.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 18, 56);
    doc.text(safe(data.labels.sectorMixHeading), margin + 4, y);
    y += 5.5;

    const gap = 8;
    const barColW = (contentWidth - gap) / 2;

    data.sectorBreakdown.forEach((sector, idx) => {
      const colIdx = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      const bx = margin + colIdx * (barColW + gap);
      const by = y + rowIdx * 10.5;

      const [r, g, b] = hexToRgb(sector.color);

      // Color swatch dot
      doc.setFillColor(r, g, b);
      doc.circle(bx + 1.5, by + 1.2, 1.3, 'F');

      // Sector name & value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 41, 66);
      const titleTrunc = doc.splitTextToSize(safe(sector.sectorTitle), barColW - 34)[0] ?? '';
      doc.text(titleTrunc, bx + 4.5, by + 2.2);

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.6);
      doc.setTextColor(8, 126, 131);
      doc.text(
        safe(`${sector.amountText} (${sector.shareText})`),
        bx + barColW,
        by + 2.2,
        { align: 'right' }
      );

      // Track + Filled Bar
      doc.setFillColor(230, 238, 245);
      doc.roundedRect(bx, by + 4.3, barColW, 2.3, 1, 1, 'F');

      const fillWidth = Math.max(2, (barColW * Math.min(100, sector.sharePct)) / 100);
      doc.setFillColor(r, g, b);
      doc.roundedRect(bx, by + 4.3, fillWidth, 2.3, 1, 1, 'F');
    });

    y += Math.ceil(data.sectorBreakdown.length / 2) * 10.5 + 8;
  }

  // 4. Itemized Public Service Allocation Table
  const drawTableSectionHeader = (yPos: number): number => {
    doc.setFillColor(8, 126, 131);
    doc.rect(margin, yPos - 3.8, 1.8, 4.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 18, 56);
    doc.text(safe(data.labels.itemizedHeading), margin + 4, yPos);

    const headerY = yPos + 4;
    doc.setFillColor(15, 41, 66); // #0F2942
    doc.roundedRect(margin, headerY, contentWidth, 8, 1.2, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.setTextColor(255, 255, 255);
    doc.text(safe(data.labels.colIndex), margin + 3, headerY + 5.3);
    doc.text(safe(data.labels.colSubSector), margin + 12, headerY + 5.3);
    doc.text(safe(data.labels.colParentSector), margin + 88, headerY + 5.3);
    doc.text(safe(data.labels.colShare), margin + 148, headerY + 5.3, { align: 'right' });
    doc.text(safe(data.labels.colAllocated), margin + contentWidth - 3, headerY + 5.3, {
      align: 'right',
    });

    return headerY + 9;
  };

  const startContinuationPage = (): number => {
    doc.addPage('a4', 'portrait');
    doc.setFillColor(10, 18, 56);
    doc.rect(0, 0, pageWidth, 16, 'F');
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 0, pageWidth, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(safe(data.labels.docTitle), margin, 10.5);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(168, 196, 255);
    doc.text(safe(data.receiptId), pageWidth - margin, 10.5, { align: 'right' });

    return drawTableSectionHeader(26);
  };

  if (y > 245) {
    y = startContinuationPage();
  } else {
    y = drawTableSectionHeader(y);
  }

  data.rows.forEach((row, idx) => {
    const subLines = doc.splitTextToSize(safe(row.subSectorName), 72) as string[];
    const secLines = doc.splitTextToSize(safe(row.sectorTitle), 44) as string[];
    const maxLines = Math.max(1, subLines.length, secLines.length);
    const rowHeight = Math.max(7.8, maxLines * 4.2 + 3.4);

    if (y + rowHeight > pageHeight - 28) {
      y = startContinuationPage();
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(235, 240, 246);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    const textY = y + 5;
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 123, 146);
    doc.text(String(row.index).padStart(2, '0'), margin + 3, textY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 41, 66);
    doc.text(subLines, margin + 12, textY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(84, 100, 130);
    doc.text(secLines, margin + 88, textY);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(84, 100, 130);
    doc.text(safe(row.shareText), margin + 148, textY, { align: 'right' });

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(8, 126, 131);
    doc.text(safe(row.amountText), margin + contentWidth - 3, textY, { align: 'right' });

    y += rowHeight;
  });

  // Totals Summary Row
  if (y + 14 > pageHeight - 24) {
    y = startContinuationPage();
  }
  doc.setFillColor(238, 244, 251);
  doc.rect(margin, y, contentWidth, 9.5, 'F');
  doc.setDrawColor(15, 41, 66);
  doc.setLineWidth(0.6);
  doc.line(margin, y, margin + contentWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(10, 18, 56);
  doc.text(safe(data.labels.totalRowLabel), margin + 3, y + 6.2);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.8);
  doc.text('100.0%', margin + 148, y + 6.2, { align: 'right' });
  doc.text(safe(data.totalAmountText), margin + contentWidth - 3, y + 6.2, {
    align: 'right',
  });

  y += 17;

  // 5. Official Verification & Civic Voting Eligibility Box
  if (y + 28 > pageHeight - 18) {
    doc.addPage('a4', 'portrait');
    y = 22;
  }

  doc.setFillColor(240, 250, 251);
  doc.setDrawColor(156, 216, 217);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentWidth, 24, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(8, 126, 131);
  doc.text(safe(data.labels.verificationBoxTitle), margin + 4.5, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(51, 78, 104);
  const verifyLines = doc.splitTextToSize(safe(data.labels.verificationBoxBody), contentWidth - 54);
  doc.text(verifyLines, margin + 4.5, y + 11.8);

  // Civic Verification Seal Stamp on right side
  const stampX = margin + contentWidth - 44;
  doc.setFillColor(10, 18, 56);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.45);
  doc.roundedRect(stampX, y + 3.5, 40.5, 17, 1.8, 1.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(244, 223, 143);
  doc.text(safe(data.labels.sealStampLine1), stampX + 20.25, y + 8.5, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text(safe(data.verificationCode), stampX + 20.25, y + 13.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(168, 196, 255);
  doc.text(safe(data.labels.sealStampLine2), stampX + 20.25, y + 18, { align: 'center' });

  // 6. Running Page Footers on Every Page
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(220, 228, 242);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 123, 146);
    doc.text(
      safe(`${data.labels.footerLeft} | ${data.receiptId}`),
      margin,
      pageHeight - 9
    );
    doc.text(
      safe(data.labels.pageCounter(p, totalPages)),
      pageWidth - margin,
      pageHeight - 9,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Generates and downloads a formatted PDF tax receipt via jsPDF.
 */
export function downloadReceiptPdf(
  receipt: TaxReceipt,
  locale: Locale = 'en'
): { filename: string; pageCount: number } {
  const data = buildReceiptPdfData(receipt, locale);
  const doc = createReceiptPdfDocument(receipt, locale);
  doc.save(data.filename);
  return {
    filename: data.filename,
    pageCount: doc.getNumberOfPages(),
  };
}

/**
 * Returns the localized user-facing label for the PDF download button.
 */
export function getPdfDownloadActionLabel(locale: Locale = 'en'): string {
  return UI_STRINGS[locale].downloadPdfBtn;
}
