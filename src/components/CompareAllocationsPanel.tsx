import React, { useMemo } from 'react';
import {
  ArrowLeftRight,
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { Sector } from '../types/daribati';
import {
  allocationsMatch,
  buildScenarioComparison,
  COMPARE_ALLOCATIONS_UI,
  formatSignedDH,
  formatSignedUnits,
  SavedScenariosMap,
  ScenarioSlot,
  sumAllocations,
} from '../utils/allocationComparison';
import { ImpactScope } from '../utils/expectedImpact';

interface CompareAllocationsPanelProps {
  sectors: Sector[];
  currentAllocations: Record<string, number>;
  currentTaxBillDH: number;
  savedScenarios: SavedScenariosMap;
  impactScope: ImpactScope;
  onSaveScenario: (slot: ScenarioSlot) => void;
  onRenameScenario: (slot: ScenarioSlot, nextName: string) => void;
  onApplyScenario: (slot: ScenarioSlot) => void;
  onClearScenario: (slot: ScenarioSlot) => void;
  onLoadDemoPair: () => void;
  onSelectSector: (sectorId: string) => void;
}

const SCENARIO_A_COLOR = '#1D3FD8'; // Royal Cobalt
const SCENARIO_B_COLOR = '#087E83'; // Moroccan Teal

export const CompareAllocationsPanel: React.FC<CompareAllocationsPanelProps> = ({
  sectors,
  currentAllocations,
  currentTaxBillDH,
  savedScenarios,
  impactScope,
  onSaveScenario,
  onRenameScenario,
  onApplyScenario,
  onClearScenario,
  onLoadDemoPair,
  onSelectSector,
}) => {
  const { locale, formatMoney, getSectorCopy, getSubSectorCopy } = useLanguage();
  const ui = COMPARE_ALLOCATIONS_UI[locale];

  const currentTotalDH = useMemo(
    () => sumAllocations(currentAllocations),
    [currentAllocations]
  );

  const activeSlot: ScenarioSlot | null = useMemo(() => {
    if (
      savedScenarios.A &&
      savedScenarios.A.taxBillDH === currentTaxBillDH &&
      allocationsMatch(savedScenarios.A.allocations, currentAllocations)
    ) {
      return 'A';
    }
    if (
      savedScenarios.B &&
      savedScenarios.B.taxBillDH === currentTaxBillDH &&
      allocationsMatch(savedScenarios.B.allocations, currentAllocations)
    ) {
      return 'B';
    }
    return null;
  }, [savedScenarios, currentAllocations, currentTaxBillDH]);

  const comparison = useMemo(
    () =>
      buildScenarioComparison(
        sectors,
        savedScenarios.A,
        savedScenarios.B,
        impactScope,
        locale
      ),
    [sectors, savedScenarios.A, savedScenarios.B, impactScope, locale]
  );

  const chartData = useMemo(
    () =>
      comparison.sectorRows.map((row) => {
        const copy = getSectorCopy(row.sectorId, row.fallbackTitle, row.fallbackShortTitle);
        return {
          sectorId: row.sectorId,
          shortName: copy.shortTitle,
          fullName: copy.title,
          amountA: row.amountA,
          amountB: row.amountB,
          deltaDH: row.deltaDH,
        };
      }),
    [comparison.sectorRows, getSectorCopy]
  );

  const labelA = savedScenarios.A?.name || ui.slotLabel('A');
  const labelB = savedScenarios.B?.name || ui.slotLabel('B');

  return (
    <section
      id="compare-allocations"
      aria-label={ui.sectionAria}
      data-testid="compare-allocations-panel"
      data-ready={comparison.isReadyToCompare ? 'true' : 'false'}
      data-active-slot={activeSlot ?? 'custom'}
      className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_26px_rgba(10,18,56,0.05)] overflow-hidden"
    >
      {/* Section Header + Live Scenario A / B Toggle */}
      <div className="px-5 py-5 sm:px-6 border-b border-[#E4EBF7] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D3FD8]">
            <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
            <span>{ui.kicker}</span>
          </div>
          <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0A1238] mt-0.5">
            {ui.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#546482] mt-1 max-w-2xl">
            {ui.subtitle}
          </p>
        </div>

        {/* Live Toggle Switch between Scenario A and Scenario B */}
        {savedScenarios.A && savedScenarios.B && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span className="text-xs font-semibold text-[#546482]">
              {ui.togglePromptLabel}
            </span>
            <div
              role="group"
              aria-label={ui.togglePromptLabel}
              className="inline-flex items-center p-1 rounded-xl bg-[#EEF2FA] border border-[#DCE4F2]"
            >
              <button
                type="button"
                aria-pressed={activeSlot === 'A'}
                onClick={() => onApplyScenario('A')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSlot === 'A'
                    ? 'bg-[#1D3FD8] text-white shadow-sm'
                    : 'text-[#475878] hover:text-[#0A1238]'
                }`}
              >
                {ui.viewA}
              </button>
              <button
                type="button"
                aria-pressed={activeSlot === 'B'}
                onClick={() => onApplyScenario('B')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSlot === 'B'
                    ? 'bg-[#087E83] text-white shadow-sm'
                    : 'text-[#475878] hover:text-[#0A1238]'
                }`}
              >
                {ui.viewB}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Scenario Slot Controls (A & B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-[#E4EBF7] border-b border-[#E4EBF7]">
        {(['A', 'B'] as ScenarioSlot[]).map((slot) => {
          const saved = savedScenarios[slot];
          const isActive = activeSlot === slot;
          const accent = slot === 'A' ? SCENARIO_A_COLOR : SCENARIO_B_COLOR;
          const savedTotal = saved ? sumAllocations(saved.allocations) : 0;
          const fundedCount = saved
            ? sectors.filter((sec) =>
                sec.subSectors.some((sub) => (saved.allocations[sub.id] || 0) > 0)
              ).length
            : 0;

          return (
            <div
              key={slot}
              data-testid={`scenario-slot-${slot}`}
              className={`p-5 sm:px-6 transition-colors ${
                isActive ? 'bg-[#F4F8FF]/80' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="w-7 h-7 rounded-lg font-mono text-xs font-extrabold text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    {slot}
                  </span>
                  {saved ? (
                    <input
                      type="text"
                      aria-label={ui.renameAria(slot)}
                      value={saved.name}
                      onChange={(e) => onRenameScenario(slot, e.target.value)}
                      className="w-full min-w-0 bg-transparent font-display text-sm font-bold text-[#0A1238] border-b border-transparent hover:border-[#CFD9EC] focus:border-[#1D3FD8] focus:outline-none py-0.5 truncate"
                    />
                  ) : (
                    <span className="font-display text-sm font-bold text-[#475878]">
                      {ui.slotLabel(slot)}
                    </span>
                  )}
                </div>

                {saved && (
                  <button
                    type="button"
                    onClick={() => onClearScenario(slot)}
                    aria-label={ui.clearSlotAria(slot)}
                    className="p-1.5 rounded-lg text-[#7D8EAD] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {saved ? (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                    <span className="font-mono text-base font-bold text-[#0A1238] tabular-nums">
                      {formatMoney(savedTotal)}
                    </span>
                    <span className="text-[#546482]">
                      {ui.fundedSectorsCount(fundedCount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onApplyScenario(slot)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-white'
                          : 'bg-[#EEF2FA] text-[#0A1238] hover:bg-[#DCE4F2]'
                      }`}
                      style={isActive ? { backgroundColor: accent } : undefined}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{ui.activeInTanksTag}</span>
                        </>
                      ) : (
                        <span>{ui.loadIntoTanksBtn}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={currentTotalDH === 0}
                      onClick={() => onSaveScenario(slot)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475878] bg-white border border-[#CFD9EC] hover:border-[#0A1238] hover:text-[#0A1238] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{ui.overwriteWithDraftBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-[#5E7091]">
                    {currentTotalDH === 0 ? ui.allocateFirstHint : ui.emptySlotHint}
                  </p>
                  <button
                    type="button"
                    disabled={currentTotalDH === 0}
                    onClick={() => onSaveScenario(slot)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{ backgroundColor: accent }}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{ui.saveCurrentDraftBtn}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison Body: Empty Guidance vs. Full Side-by-Side Visualization */}
      {!comparison.isReadyToCompare ? (
        <div className="px-6 py-9 text-center space-y-3">
          <p className="font-display text-base font-bold text-[#0A1238]">
            {ui.needTwoTitle}
          </p>
          <p className="text-xs sm:text-sm text-[#546482] max-w-xl mx-auto leading-relaxed">
            {ui.needTwoDesc}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onLoadDemoPair}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1A52] to-[#1D3FD8] text-white text-xs sm:text-sm font-bold hover:brightness-110 shadow-[0_6px_18px_rgba(29,63,216,0.22)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{ui.loadDemoPairBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 space-y-7">
          {/* 3-Column Comparison Headline Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-5 border-b border-[#EAEFF8]">
            <div>
              <p className="text-xs font-semibold text-[#546482]">{ui.kpiStrongerInA}</p>
              {comparison.biggestGainInA ? (
                <p className="font-display text-sm sm:text-base font-extrabold text-[#1D3FD8] mt-1">
                  {
                    getSectorCopy(
                      comparison.biggestGainInA.sectorId,
                      comparison.biggestGainInA.fallbackTitle,
                      comparison.biggestGainInA.fallbackShortTitle
                    ).shortTitle
                  }{' '}
                  <span
                    dir="ltr"
                    className="inline-block font-mono text-xs font-bold tabular-nums text-[#0A1238]"
                  >
                    ({formatSignedDH(-comparison.biggestGainInA.deltaDH, locale)})
                  </span>
                </p>
              ) : (
                <p className="text-sm font-semibold text-[#647B92] mt-1">{ui.kpiNoShift}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#546482]">{ui.kpiStrongerInB}</p>
              {comparison.biggestGainInB ? (
                <p className="font-display text-sm sm:text-base font-extrabold text-[#087E83] mt-1">
                  {
                    getSectorCopy(
                      comparison.biggestGainInB.sectorId,
                      comparison.biggestGainInB.fallbackTitle,
                      comparison.biggestGainInB.fallbackShortTitle
                    ).shortTitle
                  }{' '}
                  <span
                    dir="ltr"
                    className="inline-block font-mono text-xs font-bold tabular-nums text-[#0A1238]"
                  >
                    ({formatSignedDH(comparison.biggestGainInB.deltaDH, locale)})
                  </span>
                </p>
              ) : (
                <p className="text-sm font-semibold text-[#647B92] mt-1">{ui.kpiNoShift}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#546482]">{ui.kpiSectorsShifted}</p>
              <p className="font-mono text-lg font-extrabold text-[#0A1238] tabular-nums mt-0.5">
                {comparison.changedSectorCount}{' '}
                <span className="text-xs font-sans font-medium text-[#546482]">
                  / {comparison.sectorRows.length}
                </span>
              </p>
            </div>
          </div>

          {/* Side-by-Side Recharts Grouped Bar Chart + Sector Impact Difference Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Grouped Bar Chart */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-sm font-bold text-[#0A1238]">
                    {ui.chartTitle}
                  </h3>
                  <p className="text-xs text-[#5E7091]">{ui.chartSubtitle}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-[#475878]">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ backgroundColor: SCENARIO_A_COLOR }}
                    />
                    {ui.viewA}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ backgroundColor: SCENARIO_B_COLOR }}
                    />
                    {ui.viewB}
                  </span>
                </div>
              </div>

              <div dir="ltr" className="w-full h-[290px]" data-testid="compare-chart-canvas">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 12, left: 4, bottom: 34 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5ECF5" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 10.5, fill: '#475878' }}
                      tickLine={false}
                      axisLine={{ stroke: '#DCE4F2' }}
                      interval={0}
                      angle={chartData.length > 5 ? -34 : 0}
                      textAnchor={chartData.length > 5 ? 'end' : 'middle'}
                      height={66}
                      tickFormatter={(val: string) =>
                        val.length > 13 ? `${val.slice(0, 12).trim()}…` : val
                      }
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#5E7091' }}
                      tickLine={false}
                      axisLine={false}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ fill: '#F4F7FC' }}
                      contentStyle={{
                        backgroundColor: '#0A1238',
                        border: '1px solid #2B50E8',
                        borderRadius: '12px',
                        color: '#FFFFFF',
                        fontSize: '12px',
                      }}
                      formatter={(value, name) => [
                        formatMoney(Number(value) || 0),
                        name === 'amountA' ? labelA : labelB,
                      ]}
                      labelFormatter={(_label, payload) =>
                        payload?.[0]?.payload?.fullName ?? ''
                      }
                    />
                    <Bar
                      dataKey="amountA"
                      name="amountA"
                      fill={SCENARIO_A_COLOR}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                      isAnimationActive={false}
                      onClick={(_entry, index) => {
                        const row = chartData[index];
                        if (row) onSelectSector(row.sectorId);
                      }}
                      className="cursor-pointer"
                    />
                    <Bar
                      dataKey="amountB"
                      name="amountB"
                      fill={SCENARIO_B_COLOR}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                      isAnimationActive={false}
                      onClick={(_entry, index) => {
                        const row = chartData[index];
                        if (row) onSelectSector(row.sectorId);
                      }}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sector Funding Difference Table */}
            <div className="lg:col-span-6 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#0A1238]">
                {ui.tableTitle}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE4F2] text-[11px] font-semibold text-[#546482]">
                      <th className="py-2 pe-2 text-start">{ui.colSector}</th>
                      <th className="py-2 px-2 text-end">{ui.colScenarioA}</th>
                      <th className="py-2 px-2 text-end">{ui.colScenarioB}</th>
                      <th className="py-2 ps-2 text-end">{ui.colDifference}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3F8] text-xs">
                    {comparison.sectorRows.map((row) => {
                      const copy = getSectorCopy(
                        row.sectorId,
                        row.fallbackTitle,
                        row.fallbackShortTitle
                      );
                      const deltaClass =
                        row.deltaDH > 0
                          ? 'text-[#087E83]'
                          : row.deltaDH < 0
                          ? 'text-[#1D3FD8]'
                          : 'text-[#647B92]';

                      return (
                        <tr key={row.sectorId} className="hover:bg-[#F8FAFE]">
                          <td className="py-2.5 pe-2">
                            <button
                              type="button"
                              onClick={() => onSelectSector(row.sectorId)}
                              className="font-semibold text-[#0A1238] hover:text-[#1D3FD8] text-start transition-colors cursor-pointer"
                            >
                              {copy.shortTitle}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 text-end font-mono text-[#475878] tabular-nums whitespace-nowrap">
                            {formatMoney(row.amountA)}
                          </td>
                          <td className="py-2.5 px-2 text-end font-mono text-[#475878] tabular-nums whitespace-nowrap">
                            {formatMoney(row.amountB)}
                          </td>
                          <td
                            className={`py-2.5 ps-2 text-end font-mono font-bold tabular-nums whitespace-nowrap ${deltaClass}`}
                          >
                            <span dir="ltr" className="inline-block">
                              {formatSignedDH(row.deltaDH, locale)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Public Service Benchmark Impact Diffs */}
          {comparison.benchmarkDiffs.length > 0 && (
            <div className="pt-5 border-t border-[#EAEFF8] space-y-3">
              <div>
                <h3 className="font-display text-sm font-bold text-[#0A1238]">
                  {ui.benchmarkDiffTitle}
                </h3>
                <p className="text-xs text-[#5E7091]">{ui.benchmarkDiffSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {comparison.benchmarkDiffs.slice(0, 6).map((diff) => {
                  const subCopy = getSubSectorCopy(diff.subSectorId, diff.subSectorId, '');
                  const signedUnits = formatSignedUnits(diff.deltaUnits);
                  const isGainB = diff.deltaUnits > 0.05;
                  const isGainA = diff.deltaUnits < -0.05;

                  return (
                    <div
                      key={diff.subSectorId}
                      className="rounded-xl border border-[#E2EAF5] bg-[#F8FAFE] p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-[#0A1238] leading-snug">
                          {subCopy.name}
                        </p>
                        <span
                          dir="ltr"
                          className={`inline-block font-mono text-xs font-extrabold tabular-nums shrink-0 ${
                            isGainB
                              ? 'text-[#087E83]'
                              : isGainA
                              ? 'text-[#1D3FD8]'
                              : 'text-[#647B92]'
                          }`}
                        >
                          {signedUnits}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11.5px] text-[#475878]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#1D3FD8]">{ui.viewA}</span>
                          <span className="text-end truncate">{diff.outcomeA}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#087E83]">{ui.viewB}</span>
                          <span className="text-end truncate">{diff.outcomeB}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
