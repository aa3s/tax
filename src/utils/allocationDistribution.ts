import { Locale } from '../i18n/translations';
import { Sector } from '../types/daribati';

/**
 * Curated, high-contrast civic chart palette harmonized with Daribati's
 * midnight-indigo, royal-cobalt, Moroccan teal, and gold visual system.
 */
export const SECTOR_CHART_COLORS: Record<string, string> = {
  'public-safety': '#1D3FD8', // Royal Cobalt
  healthcare: '#087E83', // Moroccan Teal
  education: '#0F2942', // Deep Civic Navy
  'social-services': '#2E9E8F', // Sage Emerald
  transportation: '#4B6EF5', // Cobalt Sky
  utilities: '#0EA5A8', // Aqua Ceramic
  governance: '#C89E2A', // Warm Civic Gold
  'community-culture': '#5B4FCF', // Indigo Violet
  'economic-dev': '#2563EB', // Azure Blue
};

export interface SectorDistributionPoint {
  sectorId: string;
  sectorNumber: number;
  fallbackTitle: string;
  fallbackShortTitle: string;
  color: string;
  draftDH: number;
  paidDH: number;
  totalDH: number;
  sharePct: number;
  subSectorCount: number;
}

export interface SessionDistributionSummary {
  points: SectorDistributionPoint[];
  grandTotalDH: number;
  draftTotalDH: number;
  paidTotalDH: number;
  fundedSectorCount: number;
  topSector: SectorDistributionPoint | null;
}

export function buildSessionSectorDistribution(
  sectors: Sector[],
  draftAllocations: Record<string, number>,
  sessionPaidBySubSector: Record<string, number>
): SessionDistributionSummary {
  const rawPoints: Omit<SectorDistributionPoint, 'sharePct'>[] = [];

  for (const sector of sectors) {
    let draftDH = 0;
    let paidDH = 0;
    let subSectorCount = 0;

    for (const sub of sector.subSectors) {
      const d = Math.max(0, draftAllocations[sub.id] || 0);
      const p = Math.max(0, sessionPaidBySubSector[sub.id] || 0);
      if (d > 0 || p > 0) {
        draftDH += d;
        paidDH += p;
        subSectorCount += 1;
      }
    }

    const totalDH = draftDH + paidDH;
    if (totalDH > 0) {
      rawPoints.push({
        sectorId: sector.id,
        sectorNumber: sector.number,
        fallbackTitle: sector.title,
        fallbackShortTitle: sector.shortTitle,
        color: SECTOR_CHART_COLORS[sector.id] ?? sector.accentTop,
        draftDH,
        paidDH,
        totalDH,
        subSectorCount,
      });
    }
  }

  rawPoints.sort((a, b) => {
    if (b.totalDH !== a.totalDH) return b.totalDH - a.totalDH;
    return a.sectorNumber - b.sectorNumber;
  });

  const grandTotalDH = rawPoints.reduce((sum, p) => sum + p.totalDH, 0);
  const draftTotalDH = rawPoints.reduce((sum, p) => sum + p.draftDH, 0);
  const paidTotalDH = rawPoints.reduce((sum, p) => sum + p.paidDH, 0);

  const points: SectorDistributionPoint[] = rawPoints.map((p) => ({
    ...p,
    sharePct: grandTotalDH > 0 ? (p.totalDH / grandTotalDH) * 100 : 0,
  }));

  return {
    points,
    grandTotalDH,
    draftTotalDH,
    paidTotalDH,
    fundedSectorCount: points.length,
    topSector: points[0] ?? null,
  };
}

export interface SessionChartUI {
  sectionAria: string;
  kicker: string;
  title: string;
  subtitle: string;
  viewToggleAria: string;
  donutBtn: string;
  barBtn: string;
  totalSessionLabel: string;
  activeDraftLabel: string;
  paidSessionLabel: string;
  topSectorLabel: string;
  sectorsFundedCount: (count: number) => string;
  sectorLedgerTitle: string;
  shareLabel: string;
  paidTag: string;
  draftTag: string;
  emptyTitle: string;
  emptyDesc: string;
  previewSampleBtn: string;
  centerTotalLabel: string;
  clickToInspectHint: string;
}

export const SESSION_CHART_UI: Record<Locale, SessionChartUI> = {
  en: {
    sectionAria: 'Session Tax Allocation Distribution Chart',
    kicker: 'Current Session Analytics · Sector Mix',
    title: 'Session Tax Allocation Distribution',
    subtitle:
      'Visual summary of your total Dirham distribution across public service sectors for this session (combining completed session payments and your active draft).',
    viewToggleAria: 'Select chart visualization type',
    donutBtn: 'Donut Share',
    barBtn: 'Bar Comparison',
    totalSessionLabel: 'Total Session Allocation',
    activeDraftLabel: 'Active Draft',
    paidSessionLabel: 'Paid This Session',
    topSectorLabel: 'Leading Sector',
    sectorsFundedCount: (c) => `${c} of 9 sectors`,
    sectorLedgerTitle: 'Distribution by Public Sector',
    shareLabel: 'of session total',
    paidTag: 'Paid',
    draftTag: 'Draft',
    emptyTitle: 'No session allocations to visualize yet',
    emptyDesc:
      'Allocate Dirhams to any of the 9 public service funding tanks above to inspect your live sector distribution chart.',
    previewSampleBtn: 'Load Sample Distribution',
    centerTotalLabel: 'Session Total',
    clickToInspectHint: 'Click any sector to inspect its sub-sectors',
  },
  fr: {
    sectionAria: 'Graphique de répartition fiscale de la session',
    kicker: 'Analyse de Session · Répartition Sectorielle',
    title: 'Répartition Fiscale de Votre Session',
    subtitle:
      'Synthèse visuelle de la distribution totale de vos Dirhams par secteur public au cours de cette session (paiements validés et brouillon en cours).',
    viewToggleAria: 'Choisir le type de graphique',
    donutBtn: 'Anneau (%)',
    barBtn: 'Barres (DH)',
    totalSessionLabel: 'Total de la Session',
    activeDraftLabel: 'Brouillon Actif',
    paidSessionLabel: 'Payé cette Session',
    topSectorLabel: 'Secteur Principal',
    sectorsFundedCount: (c) => `${c} sur 9 secteurs`,
    sectorLedgerTitle: 'Répartition par Secteur Public',
    shareLabel: 'du total session',
    paidTag: 'Payé',
    draftTag: 'Brouillon',
    emptyTitle: 'Aucune allocation de session à afficher',
    emptyDesc:
      'Répartissez des Dirhams dans les 9 réservoirs de services publics ci-dessus pour visualiser votre graphique sectoriel en direct.',
    previewSampleBtn: 'Charger une Répartition Exemple',
    centerTotalLabel: 'Total Session',
    clickToInspectHint: 'Cliquez sur un secteur pour ouvrir ses sous-secteurs',
  },
  ar: {
    sectionAria: 'مخطط توزيع الضريبة للجلسة الحالية',
    kicker: 'تحليلات الجلسة الحالية · التوزيع القطاعي',
    title: 'ملخص توزيع الضريبة عبر القطاعات',
    subtitle:
      'تمثيل بياني لإجمالي توزيع مساهمتك بالدرهم على قطاعات الخدمات العمومية خلال هذه الجلسة (يشمل الأداءات المؤكدة ومسودة التوزيع الحالية).',
    viewToggleAria: 'اختيار نوع المخطط البياني',
    donutBtn: 'مخطط دائري',
    barBtn: 'أعمدة مقارنة',
    totalSessionLabel: 'إجمالي الجلسة',
    activeDraftLabel: 'المسودة الحالية',
    paidSessionLabel: 'المؤدى في الجلسة',
    topSectorLabel: 'القطاع الأعلى تمويلاً',
    sectorsFundedCount: (c) => `${c} من 9 قطاعات`,
    sectorLedgerTitle: 'التوزيع حسب القطاع العمومي',
    shareLabel: 'من إجمالي الجلسة',
    paidTag: 'مؤدى',
    draftTag: 'مسودة',
    emptyTitle: 'لا توجد توزيعات لعرضها في الجلسة بعد',
    emptyDesc:
      'خصّص الدراهم لأي من خزانات الخدمات العمومية التسعة أعلاه لعرض مخطط التوزيع القطاعي مباشرة.',
    previewSampleBtn: 'عرض توزيع مقترح',
    centerTotalLabel: 'إجمالي الجلسة',
    clickToInspectHint: 'انقر على أي قطاع لعرض قطاعاته الفرعية',
  },
};
