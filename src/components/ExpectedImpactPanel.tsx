import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Sector } from '../types/daribati';
import {
  calculateExpectedImpacts,
  COLLECTIVE_TAXPAYER_MULTIPLIER,
  EXPECTED_IMPACT_UI,
  ImpactScope,
  summarizeExpectedImpactHeadline,
} from '../utils/expectedImpact';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';

interface ExpectedImpactPanelProps {
  sectors: Sector[];
  allocations: Record<string, number>;
  scope: ImpactScope;
  onChangeScope: (next: ImpactScope) => void;
  onSelectSector: (sectorId: string) => void;
  onApplySampleSplit: () => void;
}

export const ExpectedImpactPanel: React.FC<ExpectedImpactPanelProps> = ({
  sectors,
  allocations,
  scope,
  onChangeScope,
  onSelectSector,
  onApplySampleSplit,
}) => {
  const { locale, formatMoney, formatCompactMoney, getSectorCopy, getSubSectorCopy } =
    useLanguage();
  const ui = EXPECTED_IMPACT_UI[locale];

  const impacts = useMemo(
    () => calculateExpectedImpacts(allocations, sectors, scope, locale),
    [allocations, sectors, scope, locale]
  );

  const summaryHeadline = useMemo(
    () => summarizeExpectedImpactHeadline(impacts, locale),
    [impacts, locale]
  );

  const totalAllocatedDH = useMemo(
    () => impacts.reduce((sum, item) => sum + item.allocatedDH, 0),
    [impacts]
  );

  const totalEffectivePoolDH =
    scope === 'collective'
      ? totalAllocatedDH * COLLECTIVE_TAXPAYER_MULTIPLIER
      : totalAllocatedDH;

  // Lookup map for sector/sub-sector names
  const sectorMetaMap = useMemo(() => {
    const map: Record<
      string,
      { sectorShort: string; subName: string; accentTop: string }
    > = {};
    sectors.forEach((sec) => {
      const secCopy = getSectorCopy(sec.id, sec.title, sec.shortTitle);
      sec.subSectors.forEach((sub) => {
        const subCopy = getSubSectorCopy(sub.id, sub.name, sub.description);
        map[sub.id] = {
          sectorShort: secCopy.shortTitle,
          subName: subCopy.name,
          accentTop: sec.accentTop,
        };
      });
    });
    return map;
  }, [sectors, getSectorCopy, getSubSectorCopy]);

  return (
    <section
      aria-label={ui.sectionAria}
      className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_26px_rgba(10,18,56,0.05)] overflow-hidden"
    >
      {/* Top Header + Scope Segmented Control */}
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4EBF7]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#1D3FD8] mb-1">{ui.kicker}</p>
          <h2 className="font-display text-xl font-bold text-[#0A1238]">
            {ui.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#546482] mt-1">
            {scope === 'collective' ? ui.subtitleCollective : ui.subtitlePersonal}
          </p>
        </div>

        {/* Clean Interactive Scope Toggle */}
        <div
          role="group"
          aria-label={ui.scopeToggleAria}
          className="self-start lg:self-auto inline-flex items-center p-1 rounded-xl bg-[#EEF2FA] border border-[#DCE4F2] shrink-0"
        >
          <button
            type="button"
            aria-pressed={scope === 'collective'}
            onClick={() => onChangeScope('collective')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              scope === 'collective'
                ? 'bg-[#0A1238] text-white shadow-xs'
                : 'text-[#475878] hover:text-[#0A1238]'
            }`}
          >
            {ui.scopeCollectiveBtn}
          </button>
          <button
            type="button"
            aria-pressed={scope === 'personal'}
            onClick={() => onChangeScope('personal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              scope === 'personal'
                ? 'bg-[#0A1238] text-white shadow-xs'
                : 'text-[#475878] hover:text-[#0A1238]'
            }`}
          >
            {ui.scopePersonalBtn}
          </button>
        </div>
      </div>

      {impacts.length === 0 ? (
        /* Empty State */
        <div className="px-6 py-10 text-center space-y-3">
          <p className="font-display text-base font-bold text-[#0A1238]">
            {ui.emptyTitle}
          </p>
          <p className="text-xs sm:text-sm text-[#546482] max-w-lg mx-auto leading-relaxed">
            {ui.emptyDesc}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onApplySampleSplit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1238] text-white text-xs sm:text-sm font-bold hover:bg-[#1D3FD8] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#7EE8E2]" />
              <span>{ui.previewSampleBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Dark-Blue Gradient Noise Narrative Summary Strip */}
          <div className="relative overflow-hidden px-5 py-5 sm:px-6 text-white">
            <DarkBlueNoiseBackdrop variant="dark-card" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <p className="font-display text-base sm:text-lg font-bold text-white leading-snug max-w-2xl [text-wrap:balance]">
                {summaryHeadline}
              </p>

              <div className="flex items-center gap-5 shrink-0">
                <div>
                  <p className="text-[11px] text-[#C6D5F5]">{ui.projectedPoolLabel}</p>
                  <p className="font-mono text-base font-bold text-[#7EE8E2] tabular-nums">
                    {scope === 'collective'
                      ? formatCompactMoney(totalEffectivePoolDH)
                      : formatMoney(totalEffectivePoolDH)}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <p className="text-[11px] text-[#C6D5F5]">{ui.benchmarksFundedLabel}</p>
                  <p className="font-mono text-base font-bold text-white tabular-nums">
                    {impacts.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hairline-Divided Public Service Benchmark Grid (Single Elevation, Zero Nested Boxes) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 bg-white">
            {impacts.map((item) => {
              const meta = sectorMetaMap[item.subSectorId];
              return (
                <div
                  key={item.subSectorId}
                  className="bg-white p-5 flex flex-col justify-between gap-4 border-b border-e border-[#E4EBF7]"
                >
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2 text-xs text-[#546482]">
                      <button
                        type="button"
                        onClick={() => onSelectSector(item.sectorId)}
                        className="font-semibold text-[#1D3FD8] hover:text-[#0A1238] transition-colors text-start cursor-pointer truncate"
                      >
                        {meta?.sectorShort}
                      </button>
                      <span className="font-mono font-semibold text-[#0A1238] tabular-nums shrink-0">
                        {formatMoney(item.allocatedDH)}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono text-2xl sm:text-[28px] font-extrabold text-[#0A1238] tabular-nums leading-none">
                        {item.displayQuantity}
                      </span>
                      <span className="text-xs font-medium text-[#546482] truncate">
                        {meta?.subName}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-[#0A1238] leading-snug">
                      {item.statement}
                    </p>
                  </div>

                  {/* Transparent Benchmark Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-[#EEF2FA]">
                    <div className="h-1.5 w-full rounded-full bg-[#E6EEF7] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.progressToNextUnitPct}%`,
                          backgroundColor: meta?.accentTop || '#087E83',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#5E7091]">
                      <span className={locale === 'ar' ? 'tabular-nums' : 'font-mono tabular-nums'}>
                        {item.benchmarkNote}
                      </span>
                      <span className="font-mono tabular-nums text-[#087E83] font-semibold shrink-0">
                        {item.isPartialUnit
                          ? ui.nextMilestoneLabel(item.progressToNextUnitPct)
                          : scope === 'collective'
                          ? formatCompactMoney(item.effectivePoolDH)
                          : formatMoney(item.effectivePoolDH)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
