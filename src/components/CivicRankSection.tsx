import React from 'react';
import { Check, Lock } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  CIVIC_RANK_TIERS,
  CIVIC_RANK_UI,
  CivicRankEvaluation,
  CivicRankId,
} from '../utils/civicRank';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';

interface CivicRankEmblemProps {
  rankId: CivicRankId;
  size?: 'sm' | 'lg';
}

/**
 * Custom Moroccan geometric civic crest whose visual geometry evolves
 * progressively from Rank 1 (Observer) to Rank 5 (Nation Builder).
 */
export const CivicRankEmblem: React.FC<CivicRankEmblemProps> = ({
  rankId,
  size = 'lg',
}) => {
  const tier = CIVIC_RANK_TIERS.find((t) => t.id === rankId) ?? CIVIC_RANK_TIERS[0];
  const dims = size === 'sm' ? 'w-9 h-9' : 'w-14 h-14';

  return (
    <div
      className={`${dims} shrink-0 flex items-center justify-center rounded-xl`}
      style={{
        background:
          size === 'lg'
            ? `linear-gradient(145deg, ${tier.accentHex}38, rgba(10,18,56,0.75))`
            : tier.accentSoftHex,
        border: `1.5px solid ${tier.ringHex}`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        className={size === 'sm' ? 'w-5 h-5' : 'w-8 h-8'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer civic shield / Rub el Hizb octagonal frame */}
        {rankId === 'observer' && (
          <>
            <circle
              cx="20"
              cy="20"
              r="13"
              stroke={size === 'lg' ? '#B9CCE4' : tier.accentHex}
              strokeWidth="2"
              strokeDasharray="3 2.5"
            />
            <circle
              cx="20"
              cy="20"
              r="5"
              stroke={size === 'lg' ? '#B9CCE4' : tier.accentHex}
              strokeWidth="2"
            />
          </>
        )}

        {rankId === 'contributor' && (
          <>
            <polygon
              points="20,5 33,12.5 33,27.5 20,35 7,27.5 7,12.5"
              stroke={size === 'lg' ? '#7EE8E2' : tier.accentHex}
              strokeWidth="2"
              fill={size === 'lg' ? 'rgba(126,232,226,0.14)' : 'rgba(8,126,131,0.12)'}
            />
            <path
              d="M14.5 20.5L18.2 24.2L26 16"
              stroke={size === 'lg' ? '#FFFFFF' : tier.accentHex}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {rankId === 'patron' && (
          <>
            <rect
              x="9"
              y="9"
              width="22"
              height="22"
              rx="3"
              stroke={size === 'lg' ? '#95B4FF' : tier.accentHex}
              strokeWidth="1.9"
              fill={size === 'lg' ? 'rgba(99,132,255,0.18)' : 'rgba(29,63,216,0.12)'}
            />
            <rect
              x="9"
              y="9"
              width="22"
              height="22"
              rx="3"
              transform="rotate(45 20 20)"
              stroke={size === 'lg' ? '#CFE0FF' : tier.accentHex}
              strokeWidth="1.9"
            />
            <circle cx="20" cy="20" r="3.5" fill={size === 'lg' ? '#FFFFFF' : tier.accentHex} />
          </>
        )}

        {rankId === 'civic-leader' && (
          <>
            <rect
              x="8.5"
              y="8.5"
              width="23"
              height="23"
              rx="2.5"
              stroke={size === 'lg' ? '#C7D2FE' : tier.accentHex}
              strokeWidth="1.9"
              fill={size === 'lg' ? 'rgba(129,140,248,0.22)' : 'rgba(67,56,202,0.14)'}
            />
            <rect
              x="8.5"
              y="8.5"
              width="23"
              height="23"
              rx="2.5"
              transform="rotate(45 20 20)"
              stroke={size === 'lg' ? '#F4DF8F' : tier.accentHex}
              strokeWidth="1.9"
            />
            <polygon
              points="20,12.5 22.3,17.2 27.5,17.9 23.7,21.5 24.6,26.7 20,24.2 15.4,26.7 16.3,21.5 12.5,17.9 17.7,17.2"
              fill={size === 'lg' ? '#F4DF8F' : tier.accentHex}
            />
          </>
        )}

        {rankId === 'nation-builder' && (
          <>
            {/* Moroccan Rub el Hizb double-square gold sovereign emblem */}
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              rx="2"
              stroke="#F4DF8F"
              strokeWidth="2"
              fill={size === 'lg' ? 'rgba(212,175,55,0.24)' : 'rgba(182,138,24,0.18)'}
            />
            <rect
              x="8"
              y="8"
              width="24"
              height="24"
              rx="2"
              transform="rotate(45 20 20)"
              stroke={size === 'lg' ? '#F4DF8F' : '#B68A18'}
              strokeWidth="2"
            />
            <circle
              cx="20"
              cy="20"
              r="7.2"
              stroke={size === 'lg' ? '#FFF2C2' : '#96700D'}
              strokeWidth="1.6"
              fill={size === 'lg' ? 'rgba(244,223,143,0.2)' : 'rgba(212,175,55,0.22)'}
            />
            <polygon
              points="20,13.8 21.8,17.6 26,18.2 22.9,21.1 23.7,25.3 20,23.3 16.3,25.3 17.1,21.1 14,18.2 18.2,17.6"
              fill={size === 'lg' ? '#FFF2C2' : '#96700D'}
            />
          </>
        )}
      </svg>
    </div>
  );
};

interface CivicRankSectionProps {
  evaluation: CivicRankEvaluation;
}

export const CivicRankSection: React.FC<CivicRankSectionProps> = ({ evaluation }) => {
  const { locale, formatMoney } = useLanguage();
  const ui = CIVIC_RANK_UI[locale];
  const currentCopy = ui.tiers[evaluation.currentTier.id];
  const nextCopy = evaluation.nextTier ? ui.tiers[evaluation.nextTier.id] : null;

  return (
    <section
      aria-label={ui.sectionAria}
      data-testid="civic-rank-section"
      data-civic-rank={evaluation.currentTier.id}
      className="no-print bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_24px_rgba(10,18,56,0.04)] overflow-hidden"
    >
      {/* Section Header */}
      <div className="px-6 py-5 border-b border-[#EAEFF8] flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#1D3FD8]">
            {ui.sectionKicker}
          </p>
          <h2 className="font-display text-xl font-extrabold text-[#0A1238] mt-0.5">
            {ui.sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#546482] mt-1 max-w-2xl">
            {ui.sectionSubtitle}
          </p>
        </div>
        <p className="font-mono text-xs font-semibold text-[#475878] tabular-nums shrink-0">
          {ui.rankOfTotal(evaluation.currentTier.level, CIVIC_RANK_TIERS.length)}
        </p>
      </div>

      {/* Two-Column Split: Active Civic Rank Credential + 5-Tier Milestone Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Official Civic Rank Credential Panel */}
        <div className="relative overflow-hidden lg:col-span-5 p-6 text-white flex flex-col justify-between">
          <DarkBlueNoiseBackdrop variant="dark-card" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-start gap-4">
              <CivicRankEmblem rankId={evaluation.currentTier.id} size="lg" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#A8C4FF]">
                  {ui.badgeLabel} ·{' '}
                  {ui.rankOfTotal(evaluation.currentTier.level, CIVIC_RANK_TIERS.length)}
                </p>
                <h3
                  data-testid="civic-rank-title"
                  className="font-display text-2xl font-extrabold text-white mt-0.5 leading-tight"
                >
                  {currentCopy.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#D1DDF5] mt-2 leading-relaxed">
                  {currentCopy.summary}
                </p>
              </div>
            </div>

            {/* Live Standing Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
              <div>
                <p className="text-[11px] font-medium text-[#A8C4FF]">
                  {ui.receiptsMetric(evaluation.receiptCount)}
                </p>
                <p className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
                  {evaluation.receiptCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#A8C4FF]">
                  {ui.allocatedMetric}
                </p>
                <p className="font-mono text-xl font-bold text-white tabular-nums mt-0.5">
                  {formatMoney(evaluation.totalAllocatedDH)}
                </p>
              </div>
            </div>
          </div>

          {/* Next Milestone Progress */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 space-y-2.5">
            {evaluation.nextTier && nextCopy ? (
              <>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#E8F0FF]">
                    {ui.progressToNext(nextCopy.title)}
                  </span>
                  <span
                    data-testid="civic-rank-progress"
                    className="font-mono font-bold text-[#7EE8E2] tabular-nums"
                  >
                    {evaluation.progressPct}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(evaluation.progressPct, evaluation.progressPct > 0 ? 4 : 0)}%`,
                      background: 'linear-gradient(90deg, #35B7BC 0%, #F4DF8F 100%)',
                    }}
                  />
                </div>
                <p className="text-xs text-[#C6D5F0] leading-relaxed">
                  {ui.remainingPathSummary(
                    evaluation.receiptsRemaining,
                    formatMoney(evaluation.amountRemainingDH)
                  )}
                </p>
              </>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#F4DF8F]">
                  {ui.maxRankReachedTitle}
                </p>
                <p className="text-xs text-[#D1DDF5] leading-relaxed">
                  {ui.maxRankReachedDesc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Clean Hairline-Divided 5-Tier Progression Ladder */}
        <div className="lg:col-span-7 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#EAEFF8]">
            <h3 className="font-display text-sm font-bold text-[#0A1238]">
              {ui.ladderTitle}
            </h3>
            <span className="text-xs text-[#647B92]">{ui.ladderRuleHint}</span>
          </div>

          <ol className="divide-y divide-[#EEF3F8]">
            {evaluation.tiers.map((tier) => {
              const tierCopy = ui.tiers[tier.id];
              return (
                <li
                  key={tier.id}
                  data-testid={`civic-rank-tier-${tier.id}`}
                  data-state={
                    tier.isCurrent ? 'current' : tier.unlocked ? 'unlocked' : 'locked'
                  }
                  className={`py-3.5 px-2 -mx-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                    tier.isCurrent ? 'bg-[#F4F8FF]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CivicRankEmblem rankId={tier.id} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-[#647B92] tabular-nums">
                          0{tier.level}
                        </span>
                        <span
                          className={`font-display text-sm font-bold ${
                            tier.unlocked ? 'text-[#0A1238]' : 'text-[#5A7188]'
                          }`}
                        >
                          {tierCopy.title}
                        </span>
                      </div>
                      <p className="text-xs text-[#5A7188] mt-0.5 tabular-nums">
                        {ui.requirementLabel(tier.minReceipts, tier.minAmountDH, locale)}
                      </p>
                    </div>
                  </div>

                  {/* Clean unboxed semantic state with icon + label (no pill capsules) */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0 ps-12 sm:ps-0">
                    {tier.isCurrent ? (
                      <span
                        className="inline-flex items-center gap-1.5 font-bold"
                        style={{ color: tier.accentHex }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{ui.statusCurrent}</span>
                      </span>
                    ) : tier.unlocked ? (
                      <span className="inline-flex items-center gap-1.5 text-[#087E83]">
                        <Check className="w-3.5 h-3.5" />
                        <span>{ui.statusUnlocked}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#7E93A8]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{ui.statusLocked}</span>
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
