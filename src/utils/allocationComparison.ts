import { formatLocalizedDH, Locale } from '../i18n/translations';
import { Sector } from '../types/daribati';
import { SECTOR_CHART_COLORS } from './allocationDistribution';
import {
  calculateExpectedImpacts,
  ImpactScope,
  SUB_SECTOR_BENCHMARKS,
} from './expectedImpact';

export type ScenarioSlot = 'A' | 'B';

export interface SavedAllocationScenario {
  slot: ScenarioSlot;
  name: string;
  taxBillDH: number;
  allocations: Record<string, number>;
  savedAt: string;
}

export interface SavedScenariosMap {
  A: SavedAllocationScenario | null;
  B: SavedAllocationScenario | null;
}

export interface SectorComparisonRow {
  sectorId: string;
  sectorNumber: number;
  fallbackTitle: string;
  fallbackShortTitle: string;
  color: string;
  amountA: number;
  amountB: number;
  deltaDH: number; // B - A
  shareA: number;
  shareB: number;
  deltaSharePct: number; // shareB - shareA
  tankPctA: number;
  tankPctB: number;
}

export interface BenchmarkDiffRow {
  subSectorId: string;
  sectorId: string;
  amountA: number;
  amountB: number;
  deltaDH: number;
  unitsA: number;
  unitsB: number;
  deltaUnits: number;
  unitLabel: string;
  outcomeA: string;
  outcomeB: string;
}

export interface ScenarioComparisonResult {
  isReadyToCompare: boolean;
  totalA: number;
  totalB: number;
  totalDeltaDH: number;
  fundedSectorsA: number;
  fundedSectorsB: number;
  changedSectorCount: number;
  biggestGainInB: SectorComparisonRow | null;
  biggestGainInA: SectorComparisonRow | null;
  sectorRows: SectorComparisonRow[];
  benchmarkDiffs: BenchmarkDiffRow[];
}

export function sumAllocations(allocations: Record<string, number>): number {
  return Object.values(allocations).reduce((sum, val) => sum + Math.max(0, val || 0), 0);
}

export function allocationsMatch(
  a: Record<string, number>,
  b: Record<string, number>
): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] || 0) !== (b[key] || 0)) return false;
  }
  return true;
}

export function buildScenarioComparison(
  sectors: Sector[],
  scenarioA: SavedAllocationScenario | null,
  scenarioB: SavedAllocationScenario | null,
  scope: ImpactScope,
  locale: Locale
): ScenarioComparisonResult {
  if (!scenarioA || !scenarioB) {
    return {
      isReadyToCompare: false,
      totalA: scenarioA ? sumAllocations(scenarioA.allocations) : 0,
      totalB: scenarioB ? sumAllocations(scenarioB.allocations) : 0,
      totalDeltaDH: 0,
      fundedSectorsA: 0,
      fundedSectorsB: 0,
      changedSectorCount: 0,
      biggestGainInB: null,
      biggestGainInA: null,
      sectorRows: [],
      benchmarkDiffs: [],
    };
  }

  const totalA = sumAllocations(scenarioA.allocations);
  const totalB = sumAllocations(scenarioB.allocations);
  const sectorRows: SectorComparisonRow[] = [];

  let fundedSectorsA = 0;
  let fundedSectorsB = 0;

  for (const sector of sectors) {
    let amountA = 0;
    let amountB = 0;
    let baseCurrentDH = 0;

    for (const sub of sector.subSectors) {
      amountA += Math.max(0, scenarioA.allocations[sub.id] || 0);
      amountB += Math.max(0, scenarioB.allocations[sub.id] || 0);
      baseCurrentDH += sub.currentDH;
    }

    if (amountA > 0) fundedSectorsA += 1;
    if (amountB > 0) fundedSectorsB += 1;

    if (amountA > 0 || amountB > 0) {
      const shareA = totalA > 0 ? (amountA / totalA) * 100 : 0;
      const shareB = totalB > 0 ? (amountB / totalB) * 100 : 0;
      const tankPctA = ((baseCurrentDH + amountA) / Math.max(1, sector.targetDH)) * 100;
      const tankPctB = ((baseCurrentDH + amountB) / Math.max(1, sector.targetDH)) * 100;

      sectorRows.push({
        sectorId: sector.id,
        sectorNumber: sector.number,
        fallbackTitle: sector.title,
        fallbackShortTitle: sector.shortTitle,
        color: SECTOR_CHART_COLORS[sector.id] ?? sector.accentTop,
        amountA,
        amountB,
        deltaDH: amountB - amountA,
        shareA,
        shareB,
        deltaSharePct: shareB - shareA,
        tankPctA,
        tankPctB,
      });
    }
  }

  sectorRows.sort(
    (a, b) =>
      Math.abs(b.deltaDH) - Math.abs(a.deltaDH) ||
      Math.max(b.amountA, b.amountB) - Math.max(a.amountA, a.amountB) ||
      a.sectorNumber - b.sectorNumber
  );

  const changedSectorCount = sectorRows.filter((row) => row.deltaDH !== 0).length;

  const positiveDeltas = sectorRows
    .filter((row) => row.deltaDH > 0)
    .sort((a, b) => b.deltaDH - a.deltaDH);
  const negativeDeltas = sectorRows
    .filter((row) => row.deltaDH < 0)
    .sort((a, b) => a.deltaDH - b.deltaDH);

  // Build sub-sector public service benchmark impact diffs
  const impactsA = calculateExpectedImpacts(scenarioA.allocations, sectors, scope, locale);
  const impactsB = calculateExpectedImpacts(scenarioB.allocations, sectors, scope, locale);

  const mapA = new Map(impactsA.map((item) => [item.subSectorId, item]));
  const mapB = new Map(impactsB.map((item) => [item.subSectorId, item]));
  const allSubIds = new Set([...mapA.keys(), ...mapB.keys()]);

  const benchmarkDiffs: BenchmarkDiffRow[] = [];
  for (const subSectorId of allSubIds) {
    const itemA = mapA.get(subSectorId);
    const itemB = mapB.get(subSectorId);
    const benchmark = SUB_SECTOR_BENCHMARKS[subSectorId];
    if (!benchmark) continue;

    const amountA = itemA?.allocatedDH ?? 0;
    const amountB = itemB?.allocatedDH ?? 0;
    const unitsA = itemA?.rawUnits ?? 0;
    const unitsB = itemB?.rawUnits ?? 0;
    const deltaUnits = unitsB - unitsA;
    const copy =
      scope === 'collective' ? benchmark.collective[locale] : benchmark.personal[locale];

    benchmarkDiffs.push({
      subSectorId,
      sectorId: itemA?.sectorId ?? itemB?.sectorId ?? '',
      amountA,
      amountB,
      deltaDH: amountB - amountA,
      unitsA,
      unitsB,
      deltaUnits,
      unitLabel: copy.plural,
      outcomeA: itemA?.shortOutcome ?? '0',
      outcomeB: itemB?.shortOutcome ?? '0',
    });
  }

  benchmarkDiffs.sort(
    (a, b) =>
      Math.abs(b.deltaDH) - Math.abs(a.deltaDH) ||
      Math.abs(b.deltaUnits) - Math.abs(a.deltaUnits)
  );

  return {
    isReadyToCompare: true,
    totalA,
    totalB,
    totalDeltaDH: totalB - totalA,
    fundedSectorsA,
    fundedSectorsB,
    changedSectorCount,
    biggestGainInB: positiveDeltas[0] ?? null,
    biggestGainInA: negativeDeltas[0] ?? null,
    sectorRows,
    benchmarkDiffs,
  };
}

export function formatSignedDH(deltaDH: number, locale: Locale): string {
  if (deltaDH === 0) return formatLocalizedDH(0, locale);
  const prefix = deltaDH > 0 ? '+' : '-';
  return `${prefix}${formatLocalizedDH(Math.abs(deltaDH), locale)}`;
}

export function formatSignedUnits(deltaUnits: number): string {
  if (Math.abs(deltaUnits) < 0.05) return '0';
  const absVal = Math.abs(deltaUnits);
  const numStr =
    absVal >= 10 || Math.abs(absVal - Math.round(absVal)) < 0.05
      ? String(Math.round(absVal))
      : absVal.toFixed(1);
  return `${deltaUnits > 0 ? '+' : '-'}${numStr}`;
}

export interface CompareAllocationsUI {
  dockLabel: string;
  saveAsA: string;
  saveAsB: string;
  updateA: string;
  updateB: string;
  viewA: string;
  viewB: string;
  compareJumpBtn: (savedCount: number) => string;
  sectionAria: string;
  kicker: string;
  title: string;
  subtitle: string;
  defaultNameA: string;
  defaultNameB: string;
  slotLabel: (slot: ScenarioSlot) => string;
  emptySlotHint: string;
  saveCurrentDraftBtn: string;
  overwriteWithDraftBtn: string;
  loadIntoTanksBtn: string;
  activeInTanksTag: string;
  clearSlotAria: (slot: ScenarioSlot) => string;
  fundedSectorsCount: (count: number) => string;
  togglePromptLabel: string;
  loadDemoPairBtn: string;
  needTwoTitle: string;
  needTwoDesc: string;
  chartTitle: string;
  chartSubtitle: string;
  kpiStrongerInA: string;
  kpiStrongerInB: string;
  kpiSectorsShifted: string;
  kpiNoShift: string;
  tableTitle: string;
  colSector: string;
  colScenarioA: string;
  colScenarioB: string;
  colDifference: string;
  benchmarkDiffTitle: string;
  benchmarkDiffSubtitle: string;
  allocateFirstHint: string;
  renameAria: (slot: ScenarioSlot) => string;
}

export const COMPARE_ALLOCATIONS_UI: Record<Locale, CompareAllocationsUI> = {
  en: {
    dockLabel: 'Compare Scenarios',
    saveAsA: 'Save as Scenario A',
    saveAsB: 'Save as Scenario B',
    updateA: 'Update A',
    updateB: 'Update B',
    viewA: 'Scenario A',
    viewB: 'Scenario B',
    compareJumpBtn: (c) => `Compare (${c}/2)`,
    sectionAria: 'Compare Two Tax Allocation Scenarios',
    kicker: 'Scenario Comparison · Side-by-Side Impact',
    title: 'Compare Allocation Scenarios',
    subtitle:
      'Save two different tax allocation drafts as Scenario A and Scenario B, then toggle between them to watch the 3D tanks shift and compare exact funding and public service benchmark differences.',
    defaultNameA: 'Scenario A — Education & Health',
    defaultNameB: 'Scenario B — Balanced 9-Sector',
    slotLabel: (slot) => `Scenario ${slot}`,
    emptySlotHint: 'Allocate Dirhams above, then save your draft into this slot.',
    saveCurrentDraftBtn: 'Save Current Draft',
    overwriteWithDraftBtn: 'Overwrite with Current',
    loadIntoTanksBtn: 'Apply to Tanks',
    activeInTanksTag: 'Active in Tanks',
    clearSlotAria: (slot) => `Clear Scenario ${slot}`,
    fundedSectorsCount: (c) => `${c} sectors funded`,
    togglePromptLabel: 'Live Tank Preview Toggle:',
    loadDemoPairBtn: 'Load 2 Sample Scenarios to Compare',
    needTwoTitle: 'Save both Scenario A and Scenario B to unlock side-by-side comparison',
    needTwoDesc:
      'Build your first split with the sliders above and save it as Scenario A, then adjust your split and save it as Scenario B—or load two sample scenarios right away.',
    chartTitle: 'Sector Funding Comparison (DH)',
    chartSubtitle: 'Side-by-side Dirham allocation across funded public sectors.',
    kpiStrongerInA: 'Stronger in Scenario A',
    kpiStrongerInB: 'Stronger in Scenario B',
    kpiSectorsShifted: 'Sectors Shifted',
    kpiNoShift: 'Identical split',
    tableTitle: 'Sector Funding Impact Difference (B vs. A)',
    colSector: 'Public Sector',
    colScenarioA: 'Scenario A',
    colScenarioB: 'Scenario B',
    colDifference: 'Impact Shift (B − A)',
    benchmarkDiffTitle: 'Public Service Benchmark Impact Difference',
    benchmarkDiffSubtitle:
      'How real-world service outcomes change when switching from Scenario A to Scenario B.',
    allocateFirstHint: 'Allocate at least 1 DH in the sliders above before saving.',
    renameAria: (slot) => `Scenario ${slot} title`,
  },
  fr: {
    dockLabel: 'Comparer des Scénarios',
    saveAsA: 'Enregistrer Scénario A',
    saveAsB: 'Enregistrer Scénario B',
    updateA: 'Mettre à jour A',
    updateB: 'Mettre à jour B',
    viewA: 'Scénario A',
    viewB: 'Scénario B',
    compareJumpBtn: (c) => `Comparer (${c}/2)`,
    sectionAria: 'Comparer deux scénarios de répartition fiscale',
    kicker: 'Comparateur de Scénarios · Impact Côte à Côte',
    title: 'Comparer les Scénarios de Répartition',
    subtitle:
      'Enregistrez deux répartitions fiscales différentes en Scénario A et Scénario B, puis basculez entre elles pour observer les réservoirs 3D et comparer l’impact sectoriel.',
    defaultNameA: 'Scénario A — Éducation & Santé',
    defaultNameB: 'Scénario B — Équilibré 9 Secteurs',
    slotLabel: (slot) => `Scénario ${slot}`,
    emptySlotHint: 'Répartissez des Dirhams ci-dessus puis enregistrez votre brouillon ici.',
    saveCurrentDraftBtn: 'Enregistrer le Brouillon',
    overwriteWithDraftBtn: 'Remplacer par Actuel',
    loadIntoTanksBtn: 'Afficher dans les Réservoirs',
    activeInTanksTag: 'Actif dans les Réservoirs',
    clearSlotAria: (slot) => `Effacer le Scénario ${slot}`,
    fundedSectorsCount: (c) => `${c} secteurs financés`,
    togglePromptLabel: 'Aperçu Direct sur les Réservoirs :',
    loadDemoPairBtn: 'Charger 2 Scénarios Exemples',
    needTwoTitle: 'Enregistrez les Scénarios A et B pour comparer leur impact',
    needTwoDesc:
      'Composez une première répartition ci-dessus pour le Scénario A, modifiez vos curseurs pour le Scénario B, ou chargez deux scénarios exemples en un clic.',
    chartTitle: 'Comparaison du Financement par Secteur (DH)',
    chartSubtitle: 'Allocation côte à côte en Dirhams sur les secteurs financés.',
    kpiStrongerInA: 'Plus Fort en Scénario A',
    kpiStrongerInB: 'Plus Fort en Scénario B',
    kpiSectorsShifted: 'Secteurs Modifiés',
    kpiNoShift: 'Répartition identique',
    tableTitle: 'Différence d’Impact par Secteur (B vs. A)',
    colSector: 'Secteur Public',
    colScenarioA: 'Scénario A',
    colScenarioB: 'Scénario B',
    colDifference: 'Écart d’Impact (B − A)',
    benchmarkDiffTitle: 'Écart sur les Indicateurs de Services Publics',
    benchmarkDiffSubtitle:
      'Évolution concrète des réalisations publiques en passant du Scénario A au Scénario B.',
    allocateFirstHint: 'Allouez au moins 1 DH ci-dessus avant d’enregistrer.',
    renameAria: (slot) => `Nom du Scénario ${slot}`,
  },
  ar: {
    dockLabel: 'مقارنة السيناريوهات',
    saveAsA: 'حفظ كسيناريو أ',
    saveAsB: 'حفظ كسيناريو ب',
    updateA: 'تحديث أ',
    updateB: 'تحديث ب',
    viewA: 'السيناريو أ',
    viewB: 'السيناريو ب',
    compareJumpBtn: (c) => `مقارنة (${c}/2)`,
    sectionAria: 'مقارنة سيناريوهين لتوزيع الضريبة',
    kicker: 'مقارنة السيناريوهات · فرق الأثر القطاعي',
    title: 'مقارنة سيناريوهات توزيع الضريبة',
    subtitle:
      'احفظ سيناريوهين مختلفين لتوزيع ضريبتك (أ و ب)، ثم بدّل بينهما مباشرة لمشاهدة تغيّر الخزانات ثلاثية الأبعاد ومقارنة الأثر على القطاعات والخدمات العمومية.',
    defaultNameA: 'السيناريو أ — التعليم والصحة',
    defaultNameB: 'السيناريو ب — توزيع متوازن',
    slotLabel: (slot) => (slot === 'A' ? 'السيناريو أ' : 'السيناريو ب'),
    emptySlotHint: 'خصّص الدراهم أعلاه ثم احفظ مسودتك في هذه الخانة.',
    saveCurrentDraftBtn: 'حفظ المسودة الحالية',
    overwriteWithDraftBtn: 'تحديث بالحالي',
    loadIntoTanksBtn: 'تطبيق على الخزانات',
    activeInTanksTag: 'نشط في الخزانات',
    clearSlotAria: (slot) => (slot === 'A' ? 'مسح السيناريو أ' : 'مسح السيناريو ب'),
    fundedSectorsCount: (c) => `${c} قطاعات مموّلة`,
    togglePromptLabel: 'التبديل المباشر على الخزانات:',
    loadDemoPairBtn: 'تحميل سيناريوهين مقترحين للمقارنة',
    needTwoTitle: 'احفظ السيناريو أ والسيناريو ب لعرض المقارنة التفصيلية',
    needTwoDesc:
      'أنشئ التوزيع الأول أعلاه واحفظه كسيناريو أ، ثم عدّل التوزيع واحفظه كسيناريو ب، أو حمّل سيناريوهين تجريبيين فوراً.',
    chartTitle: 'مقارنة التمويل حسب القطاع (د.م)',
    chartSubtitle: 'مقارنة مباشرة للمبالغ المخصصة لكل قطاع عمومي بين السيناريوهين.',
    kpiStrongerInA: 'الأعلى في السيناريو أ',
    kpiStrongerInB: 'الأعلى في السيناريو ب',
    kpiSectorsShifted: 'القطاعات المتغيّرة',
    kpiNoShift: 'توزيع متطابق',
    tableTitle: 'فارق التمويل والأثر حسب القطاع (ب مقابل أ)',
    colSector: 'القطاع العمومي',
    colScenarioA: 'السيناريو أ',
    colScenarioB: 'السيناريو ب',
    colDifference: 'فارق الأثر (ب − أ)',
    benchmarkDiffTitle: 'فارق الأثر على مؤشرات الخدمات العمومية',
    benchmarkDiffSubtitle:
      'كيف تتغير المنجزات العمومية الملموسة عند الانتقال من السيناريو أ إلى السيناريو ب.',
    allocateFirstHint: 'خصّص درهماً واحداً على الأقل أعلاه قبل الحفظ.',
    renameAria: (slot) => (slot === 'A' ? 'اسم السيناريو أ' : 'اسم السيناريو ب'),
  },
};
