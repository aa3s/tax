import React, { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  ArrowRight,
  BookmarkPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { SAMPLE_ALLOCATION_FOR_1000 } from '../data/daribatiData';
import { useLanguage } from '../i18n/LanguageContext';
import { Sector, TaxCategory } from '../types/daribati';
import {
  allocationsMatch,
  COMPARE_ALLOCATIONS_UI,
  SavedScenariosMap,
  ScenarioSlot,
} from '../utils/allocationComparison';
import {
  calculateSectorExpectedImpacts,
  EXPECTED_IMPACT_UI,
  ImpactScope,
} from '../utils/expectedImpact';
import { CompareAllocationsPanel } from './CompareAllocationsPanel';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';
import { ExpectedImpactPanel } from './ExpectedImpactPanel';
import { LiquidTank3D } from './LiquidTank3D';
import { SessionAllocationChart } from './SessionAllocationChart';

interface TaxAllocatorViewProps {
  sectors: Sector[];
  taxBillDH: number;
  onChangeTaxBill: (amount: number) => void;
  taxCategory: TaxCategory;
  onChangeTaxCategory: (cat: TaxCategory) => void;
  allocations: Record<string, number>;
  sessionPaidBySubSector: Record<string, number>;
  savedScenarios: SavedScenariosMap;
  onUpdateSubSectorAllocation: (subSectorId: string, amount: number) => void;
  onApplyPresetAllocation: (preset: Record<string, number>) => void;
  onClearAllocations: () => void;
  onOpenPaymentModal: () => void;
  onSaveScenario: (slot: ScenarioSlot) => void;
  onRenameScenario: (slot: ScenarioSlot, nextName: string) => void;
  onApplyScenario: (slot: ScenarioSlot) => void;
  onClearScenario: (slot: ScenarioSlot) => void;
  onLoadDemoComparison: () => void;
  isPremiumUnlocked: boolean;
}

const TAX_CATEGORIES: TaxCategory[] = [
  'IR — Impôt sur le Revenu',
  "Taxe d'Habitation",
  'Taxe Professionnelle',
  'Combined Annual Civic Tax',
];

const QUICK_TAX_AMOUNTS = [500, 1000, 2500, 5000];

export const TaxAllocatorView: React.FC<TaxAllocatorViewProps> = ({
  sectors,
  taxBillDH,
  onChangeTaxBill,
  taxCategory,
  onChangeTaxCategory,
  allocations,
  sessionPaidBySubSector,
  savedScenarios,
  onUpdateSubSectorAllocation,
  onApplyPresetAllocation,
  onClearAllocations,
  onOpenPaymentModal,
  onSaveScenario,
  onRenameScenario,
  onApplyScenario,
  onClearScenario,
  onLoadDemoComparison,
  isPremiumUnlocked,
}) => {
  const {
    t,
    locale,
    dir,
    currencyUnit,
    formatMoney,
    formatCompactMoney,
    getTaxCategoryLabel,
    getSectorCopy,
    getSubSectorCopy,
  } = useLanguage();
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);
  const [impactScope, setImpactScope] = useState<ImpactScope>('collective');
  const impactUi = EXPECTED_IMPACT_UI[locale];
  const compareUi = COMPARE_ALLOCATIONS_UI[locale];

  const savedScenarioCount = (savedScenarios.A ? 1 : 0) + (savedScenarios.B ? 1 : 0);
  const activeScenarioSlot: ScenarioSlot | null = useMemo(() => {
    if (
      savedScenarios.A &&
      savedScenarios.A.taxBillDH === taxBillDH &&
      allocationsMatch(savedScenarios.A.allocations, allocations)
    ) {
      return 'A';
    }
    if (
      savedScenarios.B &&
      savedScenarios.B.taxBillDH === taxBillDH &&
      allocationsMatch(savedScenarios.B.allocations, allocations)
    ) {
      return 'B';
    }
    return null;
  }, [savedScenarios, allocations, taxBillDH]);

  const handleJumpToComparison = () => {
    const el = document.getElementById('compare-allocations');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalAllocatedDH = useMemo(
    () => Object.values(allocations).reduce((sum, val) => sum + val, 0),
    [allocations]
  );

  const remainingDH = Math.max(0, taxBillDH - totalAllocatedDH);
  const allocationProgress =
    taxBillDH > 0 ? Math.min(100, (totalAllocatedDH / taxBillDH) * 100) : 0;
  const isReadyToPay = taxBillDH > 0 && remainingDH === 0 && totalAllocatedDH === taxBillDH;

  // Group sectors into rows of 3 for desktop aligned hierarchical tree expansion
  const sectorRows = useMemo(() => {
    const rows: Sector[][] = [];
    for (let i = 0; i < sectors.length; i += 3) {
      rows.push(sectors.slice(i, i + 3));
    }
    return rows;
  }, [sectors]);

  const getSectorAllocatedDH = (sector: Sector) =>
    sector.subSectors.reduce((sum, sub) => sum + (allocations[sub.id] || 0), 0);

  const getSectorCurrentDH = (sector: Sector) =>
    sector.subSectors.reduce((sum, sub) => sum + sub.currentDH, 0);

  const handleToggleSector = (sectorId: string) => {
    setExpandedSectorId((prev) => (prev === sectorId ? null : sectorId));
  };

  const handleApplySampleSplit = () => {
    const scaled: Record<string, number> = {};
    let runningTotal = 0;
    const entries = Object.entries(SAMPLE_ALLOCATION_FOR_1000);
    entries.forEach(([subId, baseAmt], idx) => {
      if (idx === entries.length - 1) {
        scaled[subId] = Math.max(0, taxBillDH - runningTotal);
      } else {
        const val = Math.round((baseAmt / 1000) * taxBillDH);
        scaled[subId] = val;
        runningTotal += val;
      }
    });
    onApplyPresetAllocation(scaled);
    setExpandedSectorId('healthcare');
  };

  const handleDistributeEvenly = () => {
    // Distribute evenly across the 9 primary sub-sectors (first sub-sector of each sector)
    const even: Record<string, number> = {};
    const count = sectors.length;
    const base = Math.floor(taxBillDH / count);
    let remainder = taxBillDH - base * count;
    sectors.forEach((sec) => {
      const subId = sec.subSectors[0].id;
      const amt = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      even[subId] = amt;
    });
    onApplyPresetAllocation(even);
  };

  const activeAllocationsList = useMemo(() => {
    const list: {
      sectorId: string;
      sectorTitle: string;
      subId: string;
      subName: string;
      amountDH: number;
    }[] = [];
    sectors.forEach((sec) => {
      const secCopy = getSectorCopy(sec.id, sec.title, sec.shortTitle);
      sec.subSectors.forEach((sub) => {
        const amt = allocations[sub.id] || 0;
        if (amt > 0) {
          const subCopy = getSubSectorCopy(sub.id, sub.name, sub.description);
          list.push({
            sectorId: sec.id,
            sectorTitle: secCopy.shortTitle,
            subId: sub.id,
            subName: subCopy.name,
            amountDH: amt,
          });
        }
      });
    });
    return list;
  }, [sectors, allocations, getSectorCopy, getSubSectorCopy]);

  const nationalCollectedDH = useMemo(
    () =>
      sectors.reduce((sum, sec) => sum + getSectorCurrentDH(sec), 0) +
      totalAllocatedDH,
    [sectors, totalAllocatedDH]
  );

  const nationalTargetDH = useMemo(
    () => sectors.reduce((sum, sec) => sum + sec.targetDH, 0),
    [sectors]
  );

  const nationalPct = (nationalCollectedDH / nationalTargetDH) * 100;

  return (
    <div className="space-y-8">
      {/* Sculptural Dark-Blue Gradient Noise Civic Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1E3385]/35 shadow-[0_16px_42px_rgba(10,18,56,0.14)] px-6 py-7 sm:px-8 sm:py-9 text-white">
        <DarkBlueNoiseBackdrop variant="dark-card" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-7">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#9AC0FF] mb-2">
              {t.heroKicker}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-white leading-[1.18] tracking-tight [text-wrap:balance]">
              {t.heroTitle}
            </h1>
            <p className="mt-3 text-sm sm:text-[15px] text-[#D1DDF5] leading-relaxed max-w-xl">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Frosted Dark-Glass National Progress Telemetry */}
          <div className="lg:min-w-[310px] rounded-xl bg-[#070D2B]/55 border border-white/18 px-5 py-4 shrink-0 space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-xs text-[#C6D5F5]">{t.civicPoolFundedLabel}</p>
                <p className="font-mono text-lg font-bold text-white tabular-nums mt-0.5">
                  {formatCompactMoney(nationalCollectedDH)}{' '}
                  <span className="text-xs font-normal text-[#C0D0F0]">
                    / {formatCompactMoney(nationalTargetDH)}
                  </span>
                </p>
              </div>
              <div className="h-9 w-px bg-white/18" />
              <div className="text-end">
                <p className="text-xs text-[#C6D5F5]">{t.overallProgressLabel}</p>
                <p className="font-mono text-lg font-bold text-[#7EE8E2] tabular-nums mt-0.5">
                  {nationalPct.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/18 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5F8BFF] to-[#32D4CC] transition-all duration-500"
                style={{ width: `${Math.min(100, nationalPct)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tax Assessment & Live Allocation Control Bar */}
      <section
        aria-label={t.taxAssessmentAria}
        className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_26px_rgba(10,18,56,0.05)] p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Tax Category & Tax Due Input */}
          <div className="lg:col-span-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="tax-category"
                  className="block text-xs font-semibold text-[#475878] mb-1.5"
                >
                  {t.taxDeclarationTypeLabel}
                </label>
                <select
                  id="tax-category"
                  value={taxCategory}
                  onChange={(e) => onChangeTaxCategory(e.target.value as TaxCategory)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F7F9FD] border border-[#CFD9EC] text-sm font-medium text-[#0A1238] focus:outline-none focus:border-[#1D3FD8] focus:ring-2 focus:ring-[#1D3FD8]/18"
                >
                  {TAX_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getTaxCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tax-bill-input"
                  className="block text-xs font-semibold text-[#475878] mb-1.5"
                >
                  {t.totalTaxDueLabel}
                </label>
                <div className="relative">
                  <input
                    id="tax-bill-input"
                    type="number"
                    min={100}
                    max={500000}
                    step={50}
                    value={taxBillDH || ''}
                    onChange={(e) => {
                      const parsed = Math.max(0, Math.min(500000, Number(e.target.value) || 0));
                      onChangeTaxBill(parsed);
                    }}
                    className="w-full h-10 ps-3 pe-12 rounded-lg bg-[#F7F9FD] border border-[#CFD9EC] font-mono text-sm font-semibold text-[#0A1238] tabular-nums focus:outline-none focus:border-[#1D3FD8] focus:ring-2 focus:ring-[#1D3FD8]/18"
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-[#546482]">
                    {currencyUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#5E7091] me-1">{t.presetsLabel}</span>
              {QUICK_TAX_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChangeTaxBill(amt)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    taxBillDH === amt
                      ? 'bg-[#0A1238] text-white'
                      : 'bg-[#EEF2FA] text-[#475878] hover:bg-[#DFE7F6] hover:text-[#0A1238]'
                  }`}
                >
                  {formatMoney(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Remaining to Allocate Meter */}
          <div className="lg:col-span-4 space-y-2.5 lg:border-x lg:border-[#E4EBF7] lg:px-6">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-[#475878]">
                {t.remainingToAllocateLabel}
              </span>
              <span
                className={`font-mono text-xl font-bold tabular-nums ${
                  isReadyToPay ? 'text-[#087E83]' : 'text-[#0A1238]'
                }`}
              >
                {formatMoney(remainingDH)}
              </span>
            </div>

            <div className="h-2.5 w-full bg-[#E5ECF7] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isReadyToPay
                    ? 'bg-gradient-to-r from-[#1D3FD8] to-[#087E83]'
                    : 'bg-gradient-to-r from-[#0A1238] to-[#1D3FD8]'
                }`}
                style={{
                  width: `${allocationProgress}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#546482] gap-2">
              <span className="font-mono tabular-nums">
                {t.allocatedLabel}: {formatMoney(totalAllocatedDH)} ({allocationProgress.toFixed(0)}%)
              </span>
              {isReadyToPay ? (
                <span className="inline-flex items-center gap-1 font-semibold text-[#087E83] whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.ready100Label}
                </span>
              ) : (
                <span className="whitespace-nowrap">{t.allocate100Prompt}</span>
              )}
            </div>

            {/* Utility Split Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplySampleSplit}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D3FD8] hover:text-[#0A1238] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.sampleSplitBtn}
              </button>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={handleDistributeEvenly}
                className="text-xs font-semibold text-[#475878] hover:text-[#0A1238] transition-colors cursor-pointer"
              >
                {t.distributeEvenlyBtn}
              </button>
              {totalAllocatedDH > 0 && (
                <>
                  <span className="text-[#CBD5E1]" aria-hidden="true">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={onClearAllocations}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#7A4A4A] hover:text-[#B91C1C] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.resetBtn}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Primary Payment CTA */}
          <div className="lg:col-span-3 flex flex-col items-stretch justify-center gap-2">
            <button
              type="button"
              disabled={!isReadyToPay}
              onClick={onOpenPaymentModal}
              className={`w-full py-3.5 px-4 rounded-xl font-display text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap ${
                isReadyToPay
                  ? 'bg-gradient-to-r from-[#0D1A52] via-[#1A38C4] to-[#1D3FD8] text-white hover:brightness-110 shadow-[0_8px_22px_rgba(29,63,216,0.32)] cursor-pointer active:scale-[0.99]'
                  : 'bg-[#E7EDF7] text-[#7D8EAD] cursor-not-allowed'
              }`}
            >
              <span>{t.proceedToPayBtn(formatMoney(taxBillDH))}</span>
              <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180" />
            </button>
            <p className="text-[11.5px] text-center text-[#546482]">
              {isReadyToPay
                ? isPremiumUnlocked
                  ? t.ctaReadyVerifiedHint
                  : t.ctaReadyStandardHint
                : t.ctaAllocateMoreHint(formatMoney(remainingDH))}
            </p>
          </div>
        </div>

        {/* Hairline-Separated Scenario Save & Live Tank Toggle Dock */}
        <div className="mt-5 pt-4 border-t border-[#EAEFF8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1238] me-1">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#1D3FD8]" />
              {compareUi.dockLabel}
            </span>
            <button
              type="button"
              disabled={totalAllocatedDH === 0}
              onClick={() => onSaveScenario('A')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1D3FD8] bg-[#EEF3FF] hover:bg-[#DCE7FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedScenarios.A ? compareUi.updateA : compareUi.saveAsA}</span>
            </button>
            <button
              type="button"
              disabled={totalAllocatedDH === 0}
              onClick={() => onSaveScenario('B')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#087E83] bg-[#E8F7F7] hover:bg-[#D2EFEF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>{savedScenarios.B ? compareUi.updateB : compareUi.saveAsB}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {savedScenarioCount > 0 && (
              <div
                role="group"
                aria-label={compareUi.togglePromptLabel}
                className="inline-flex items-center p-0.5 rounded-lg bg-[#EEF2FA] border border-[#DCE4F2]"
              >
                <button
                  type="button"
                  disabled={!savedScenarios.A}
                  aria-pressed={activeScenarioSlot === 'A'}
                  onClick={() => onApplyScenario('A')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                    activeScenarioSlot === 'A'
                      ? 'bg-[#1D3FD8] text-white'
                      : 'text-[#475878] hover:text-[#0A1238] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed'
                  }`}
                >
                  {compareUi.viewA}
                </button>
                <button
                  type="button"
                  disabled={!savedScenarios.B}
                  aria-pressed={activeScenarioSlot === 'B'}
                  onClick={() => onApplyScenario('B')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors whitespace-nowrap ${
                    activeScenarioSlot === 'B'
                      ? 'bg-[#087E83] text-white'
                      : 'text-[#475878] hover:text-[#0A1238] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed'
                  }`}
                >
                  {compareUi.viewB}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleJumpToComparison}
              className="text-xs font-semibold text-[#475878] hover:text-[#1D3FD8] transition-colors cursor-pointer whitespace-nowrap"
            >
              {compareUi.compareJumpBtn(savedScenarioCount)}
            </button>
          </div>
        </div>
      </section>

      {/* Section Header for the 9 Public Service Sectors */}
      <section aria-label={t.sectorsSectionAria}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0A1238]">
              {t.sectorsSectionTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#546482]">
              {t.sectorsSectionSubtitle}
            </p>
          </div>
          {expandedSectorId && (
            <button
              type="button"
              onClick={() => setExpandedSectorId(null)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475878] bg-white/95 border border-[#DCE4F2] hover:border-[#0A1238] hover:text-[#0A1238] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              {t.collapseSubSectorsBtn}
            </button>
          )}
        </div>

        {/* 3-Column Row-Grouped Grid so Expanded Hierarchical Tree Appears Cleanly Underneath */}
        <div className="space-y-6">
          {sectorRows.map((row, rowIndex) => {
            const expandedInRow = row.find((s) => s.id === expandedSectorId) || null;
            const expandedColIdx = expandedInRow
              ? row.findIndex((s) => s.id === expandedInRow.id)
              : -1;
            const visualColIdx =
              expandedColIdx >= 0
                ? dir === 'rtl'
                  ? 2 - expandedColIdx
                  : expandedColIdx
                : -1;
            const expandedSectorCopy = expandedInRow
              ? getSectorCopy(expandedInRow.id, expandedInRow.title, expandedInRow.shortTitle)
              : null;

            return (
              <div key={rowIndex} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {row.map((sector) => {
                    const isExpanded = expandedSectorId === sector.id;
                    const sectorBaseCurrentDH = getSectorCurrentDH(sector);
                    const sectorPersonalDH = getSectorAllocatedDH(sector);
                    const sectorCombinedDH = sectorBaseCurrentDH + sectorPersonalDH;
                    const sectorPercent = (sectorCombinedDH / sector.targetDH) * 100;
                    const sectorCopy = getSectorCopy(sector.id, sector.title, sector.shortTitle);

                    return (
                      <article
                        key={sector.id}
                        className={`group bg-white/95 rounded-2xl border transition-all duration-200 flex flex-col ${
                          isExpanded
                            ? 'border-[#1D3FD8] ring-2 ring-[#1D3FD8]/18 shadow-[0_10px_28px_rgba(29,63,216,0.12)]'
                            : sectorPersonalDH > 0
                            ? 'border-[#1D3FD8]/50 shadow-[0_4px_16px_rgba(10,18,56,0.06)] hover:border-[#1D3FD8]'
                            : 'border-[#DCE4F2] hover:border-[#9EB0D4] hover:shadow-[0_6px_20px_rgba(10,18,56,0.07)]'
                        }`}
                      >
                        {/* Clickable Card Body & 3D Tank */}
                        <button
                          type="button"
                          onClick={() => handleToggleSector(sector.id)}
                          aria-expanded={isExpanded}
                          className="w-full text-start p-5 flex-1 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1D3FD8] rounded-2xl"
                        >
                          {/* Top Row: Editorial Number + Allocation Status */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="font-mono text-xs font-semibold text-[#546482]">
                              0{sector.number}
                            </span>
                            {sectorPersonalDH > 0 ? (
                              <span className="font-mono text-xs font-bold text-[#1D3FD8] tabular-nums">
                                {t.yourTaxBadge(formatMoney(sectorPersonalDH))}
                              </span>
                            ) : (
                              <span className="text-xs text-[#647594]">
                                {t.subSectorsCount(sector.subSectors.length)}
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-base font-bold text-[#0A1238] leading-snug min-h-[2.75rem]">
                            {sectorCopy.title}
                          </h3>

                          {/* 3D Cylindrical Glass Liquid Tank */}
                          <div className="my-3 flex justify-center">
                            <LiquidTank3D
                              currentDH={sectorBaseCurrentDH}
                              targetDH={sector.targetDH}
                              personalAllocatedDH={sectorPersonalDH}
                              totalTaxBillDH={taxBillDH}
                              accentTop={sector.accentTop}
                              accentBottom={sector.accentBottom}
                              accentLight={sector.accentLight}
                              size="main"
                              isActive={isExpanded || sectorPersonalDH > 0}
                            />
                          </div>

                          {/* Exact DH Figures & Target */}
                          <div className="mt-auto pt-3 border-t border-[#EAEFF8] space-y-2">
                            <div className="flex items-baseline justify-between text-xs gap-2">
                              <span className="text-[#546482]">{t.collectedTargetLabel}</span>
                              <span className="font-mono font-semibold text-[#0A1238] tabular-nums">
                                {formatCompactMoney(sectorCombinedDH)} /{' '}
                                {formatCompactMoney(sector.targetDH)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs gap-2">
                              <span className="font-mono font-semibold text-[#087E83] tabular-nums">
                                {t.fundedPercentLabel(sectorPercent.toFixed(2))}
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#0A1238] group-hover:text-[#1D3FD8] transition-colors">
                                {isExpanded ? (
                                  <>
                                    {t.hideSubSectorsAction}
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    {t.allocateSubSectorsAction}
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>

                {/* Hierarchical Tree Sub-Sector Drawer Directly Underneath Row */}
                {expandedInRow && expandedSectorCopy && (
                  <div className="relative pt-4">
                    {/* Desktop Organizational Connector Stem from Clicked Card (RTL-aware) */}
                    <div
                      className="hidden lg:block absolute top-0 left-0 right-0 h-5 pointer-events-none"
                      aria-hidden="true"
                    >
                      {/* Vertical stem from parent card center */}
                      <div
                        className="absolute top-0 w-[2px] h-5 bg-[#1D3FD8]"
                        style={{
                          left:
                            visualColIdx === 0
                              ? '16.666%'
                              : visualColIdx === 1
                              ? '50%'
                              : '83.333%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                      {/* Horizontal crossbar connecting to drawer */}
                      <div
                        className="absolute top-2.5 h-[2px] bg-[#1D3FD8]/45"
                        style={{
                          left: visualColIdx === 0 ? '16.666%' : '50%',
                          right: visualColIdx === 2 ? '16.666%' : '50%',
                        }}
                      />
                      <div
                        className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#1D3FD8] border-2 border-white"
                        style={{
                          left:
                            visualColIdx === 0
                              ? '16.666%'
                              : visualColIdx === 1
                              ? '50%'
                              : '83.333%',
                          transform: 'translate(-50%, -4px)',
                        }}
                      />
                    </div>

                    {/* Expanded Sub-Sector Panel */}
                    <div className="bg-white rounded-2xl border-2 border-[#1D3FD8]/45 shadow-[0_14px_36px_rgba(10,18,56,0.09)] p-5 sm:p-6">
                      {/* Panel Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E4EBF7]">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D3FD8]">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>
                              {t.subSectorBreakdownKicker(expandedInRow.number)}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-[#0A1238] mt-0.5">
                            {expandedSectorCopy.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-start sm:text-end">
                            <p className="text-[11px] text-[#546482]">
                              {t.yourAllocationInSectorLabel}
                            </p>
                            <p className="font-mono text-sm font-bold text-[#1D3FD8] tabular-nums">
                              {formatMoney(getSectorAllocatedDH(expandedInRow))}
                            </p>
                          </div>
                          <div className="h-7 w-px bg-[#DCE4F2] hidden sm:block" />
                          <div className="text-start sm:text-end">
                            <p className="text-[11px] text-[#546482]">
                              {t.remainingTaxBillLabel}
                            </p>
                            <p className="font-mono text-sm font-bold text-[#0A1238] tabular-nums">
                              {formatMoney(remainingDH)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedSectorId(null)}
                            className="p-2 rounded-lg text-[#546482] hover:text-[#0A1238] hover:bg-[#EEF2FA] transition-colors cursor-pointer"
                            aria-label={t.closeSubSectorPanelAria}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Organizational Branch Header Line (Desktop) */}
                      <div className="hidden lg:block relative h-4 mb-2" aria-hidden="true">
                        <div className="absolute left-[12%] right-[12%] top-0 h-[1.5px] bg-[#C8D7E5]" />
                        <div
                          className="grid gap-4 h-full"
                          style={{
                            gridTemplateColumns: `repeat(${expandedInRow.subSectors.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {expandedInRow.subSectors.map((sub) => (
                            <div key={sub.id} className="flex justify-center">
                              <div className="w-[1.5px] h-full bg-[#C8D7E5]" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-Sector Mini Water Tank Cards */}
                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                          expandedInRow.subSectors.length === 4
                            ? 'lg:grid-cols-4'
                            : 'lg:grid-cols-3'
                        }`}
                      >
                        {expandedInRow.subSectors.map((sub) => {
                          const userAmt = allocations[sub.id] || 0;
                          const maxAllowedForSub = userAmt + remainingDH;
                          const subCombinedDH = sub.currentDH + userAmt;
                          const subPct = (subCombinedDH / sub.targetDH) * 100;
                          const subCopy = getSubSectorCopy(sub.id, sub.name, sub.description);

                          return (
                            <div
                              key={sub.id}
                              className={`rounded-xl border p-4 flex flex-col transition-colors ${
                                userAmt > 0
                                  ? 'bg-[#F2F6FF] border-[#1D3FD8]/55'
                                  : 'bg-[#F8FAFE] border-[#DCE4F2]'
                              }`}
                            >
                              <h4 className="font-display text-sm font-bold text-[#0A1238] leading-snug min-h-[2.5rem]">
                                {subCopy.name}
                              </h4>
                              <p className="text-[11.5px] text-[#546482] leading-relaxed mt-1 min-h-[2.6rem]">
                                {subCopy.description}
                              </p>

                              {/* Mini 3D Cylindrical Liquid Tank */}
                              <div className="my-2 flex justify-center">
                                <LiquidTank3D
                                  currentDH={sub.currentDH}
                                  targetDH={sub.targetDH}
                                  personalAllocatedDH={userAmt}
                                  totalTaxBillDH={taxBillDH}
                                  accentTop={expandedInRow.accentTop}
                                  accentBottom={expandedInRow.accentBottom}
                                  accentLight={expandedInRow.accentLight}
                                  size="mini"
                                  isActive={userAmt > 0}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11.5px] text-[#475878] mb-3 gap-2">
                                <span className="font-mono tabular-nums">
                                  {formatCompactMoney(subCombinedDH)} /{' '}
                                  {formatCompactMoney(sub.targetDH)}
                                </span>
                                <span className="font-mono font-semibold text-[#087E83] tabular-nums">
                                  {subPct.toFixed(1)}%
                                </span>
                              </div>

                              {/* DH Allocation Slider + Direct Numeric Input */}
                              <div className="mt-auto space-y-2.5 pt-2.5 border-t border-[#DCE4F2]">
                                <div className="flex items-center justify-between gap-2">
                                  <label
                                    htmlFor={`input-${sub.id}`}
                                    className="text-[11px] font-semibold text-[#475878]"
                                  >
                                    {t.yourContributionLabel}
                                  </label>
                                  <div className="relative w-24">
                                    <input
                                      id={`input-${sub.id}`}
                                      type="number"
                                      min={0}
                                      max={maxAllowedForSub}
                                      step={10}
                                      value={userAmt || ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const raw = Math.max(0, Number(e.target.value) || 0);
                                        const clamped = Math.min(maxAllowedForSub, raw);
                                        onUpdateSubSectorAllocation(sub.id, clamped);
                                      }}
                                      className="w-full h-8 ps-2 pe-8 rounded-md bg-white border border-[#C6D2E8] font-mono text-xs font-bold text-[#0A1238] tabular-nums text-end focus:outline-none focus:border-[#1D3FD8]"
                                    />
                                    <span className="absolute end-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold text-[#5E7091]">
                                      {currencyUnit}
                                    </span>
                                  </div>
                                </div>

                                <input
                                  type="range"
                                  aria-label={t.allocateSliderAria(subCopy.name)}
                                  min={0}
                                  max={Math.max(10, maxAllowedForSub)}
                                  step={10}
                                  disabled={maxAllowedForSub === 0}
                                  value={userAmt}
                                  onChange={(e) => {
                                    const val = Math.min(
                                      maxAllowedForSub,
                                      Number(e.target.value) || 0
                                    );
                                    onUpdateSubSectorAllocation(sub.id, val);
                                  }}
                                  className="w-full daribati-slider disabled:opacity-40"
                                />

                                {/* Quick Increment Buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={remainingDH < 50}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(
                                        sub.id,
                                        userAmt + Math.min(50, remainingDH)
                                      )
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-mono font-semibold bg-white border border-[#CFD9EC] text-[#0A1238] hover:border-[#1D3FD8] hover:text-[#1D3FD8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    +50
                                  </button>
                                  <button
                                    type="button"
                                    disabled={remainingDH < 100}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(
                                        sub.id,
                                        userAmt + Math.min(100, remainingDH)
                                      )
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-mono font-semibold bg-white border border-[#CFD9EC] text-[#0A1238] hover:border-[#1D3FD8] hover:text-[#1D3FD8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    +100
                                  </button>
                                  <button
                                    type="button"
                                    disabled={remainingDH === 0}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(sub.id, userAmt + remainingDH)
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-semibold bg-[#0A1238] text-white hover:bg-[#1D3FD8] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    {t.maxBtn}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Inline Expected Impact Strip Directly Below the Sector's Sliders */}
                      {(() => {
                        const sectorImpacts = calculateSectorExpectedImpacts(
                          allocations,
                          expandedInRow,
                          impactScope,
                          locale
                        );
                        return (
                          <div className="mt-5 pt-4 border-t border-[#E4EBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-[#1D3FD8]">
                                {impactUi.inlineSectorKicker} ·{' '}
                                <span className="text-[#546482] font-medium">
                                  {impactScope === 'collective'
                                    ? impactUi.scopeCollectiveBtn
                                    : impactUi.scopePersonalBtn}
                                </span>
                              </p>
                              {sectorImpacts.length === 0 ? (
                                <p className="text-xs text-[#546482] mt-1">
                                  {impactUi.inlineSectorEmpty}
                                </p>
                              ) : (
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                  {sectorImpacts.map((imp) => (
                                    <span
                                      key={imp.subSectorId}
                                      className="text-xs sm:text-sm font-semibold text-[#0A1238]"
                                    >
                                      {imp.statement}
                                      <span className="font-mono text-[11px] font-medium text-[#546482] ms-1.5">
                                        ({imp.benchmarkNote})
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Expected Impact on Public Service Benchmarks Section Below Allocator Sliders */}
      <ExpectedImpactPanel
        sectors={sectors}
        allocations={allocations}
        scope={impactScope}
        onChangeScope={setImpactScope}
        onSelectSector={(sectorId) => setExpandedSectorId(sectorId)}
        onApplySampleSplit={handleApplySampleSplit}
      />

      {/* Compare Two Saved Allocation Scenarios Side-by-Side */}
      <CompareAllocationsPanel
        sectors={sectors}
        currentAllocations={allocations}
        currentTaxBillDH={taxBillDH}
        savedScenarios={savedScenarios}
        impactScope={impactScope}
        onSaveScenario={onSaveScenario}
        onRenameScenario={onRenameScenario}
        onApplyScenario={onApplyScenario}
        onClearScenario={onClearScenario}
        onLoadDemoPair={onLoadDemoComparison}
        onSelectSector={(sectorId) => setExpandedSectorId(sectorId)}
      />

      {/* Recharts Session Tax Allocation Distribution Summary Chart */}
      <SessionAllocationChart
        sectors={sectors}
        allocations={allocations}
        sessionPaidBySubSector={sessionPaidBySubSector}
        onSelectSector={(sectorId) => setExpandedSectorId(sectorId)}
        onApplySampleSplit={handleApplySampleSplit}
      />

      {/* Live Personal Allocation Summary Ledger */}
      <section
        aria-label={t.breakdownAria}
        className="bg-white/95 rounded-2xl border border-[#DCE4F2] p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4EBF7]">
          <div>
            <h2 className="font-display text-base font-bold text-[#0A1238]">
              {t.breakdownTitle}
            </h2>
            <p className="text-xs text-[#546482]">
              {t.breakdownSubtitle(formatMoney(taxBillDH))}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#0A1238] tabular-nums">
              {formatMoney(totalAllocatedDH)} / {formatMoney(taxBillDH)}
            </span>
            <button
              type="button"
              disabled={!isReadyToPay}
              onClick={onOpenPaymentModal}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isReadyToPay
                  ? 'bg-[#1D3FD8] text-white hover:bg-[#1532B5] cursor-pointer'
                  : 'bg-[#E7EDF7] text-[#7D8EAD] cursor-not-allowed'
              }`}
            >
              {t.proceedToPayBtn(formatMoney(taxBillDH))}
            </button>
          </div>
        </div>

        {activeAllocationsList.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-[#475878]">
              {t.noAllocationsTitle}
            </p>
            <p className="text-xs text-[#647594] mt-1">
              {t.noAllocationsSubtitle}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF2FA] mt-2">
            {activeAllocationsList.map((item) => {
              const sharePct = taxBillDH > 0 ? (item.amountDH / taxBillDH) * 100 : 0;
              return (
                <div
                  key={item.subId}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setExpandedSectorId(item.sectorId)}
                      className="font-semibold text-[#0A1238] hover:text-[#1D3FD8] transition-colors text-start cursor-pointer"
                    >
                      {item.subName}
                    </button>
                    <p className="text-xs text-[#5E7091]">{item.sectorTitle}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono text-xs text-[#546482] tabular-nums">
                      {sharePct.toFixed(1)}%
                    </span>
                    <span className="font-mono text-sm font-bold text-[#1D3FD8] tabular-nums w-24 text-end">
                      {formatMoney(item.amountDH)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSubSectorAllocation(item.subId, 0)}
                      className="p-1 text-[#7D8EAD] hover:text-[#B91C1C] transition-colors cursor-pointer"
                      aria-label={t.removeAllocationAria(item.subName)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
