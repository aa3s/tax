import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Leaf,
  Lock,
  MapPin,
  Trophy,
  Users,
  Vote,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { EnterpriseBid, PublicTender } from '../types/daribati';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';

interface PublicTendersViewProps {
  tenders: PublicTender[];
  isPremiumUnlocked: boolean;
  userVotes: Record<string, string>; // tenderId -> bidId
  onCastVote: (tenderId: string, bidId: string) => void;
  onGoToAllocator: () => void;
}

interface RankedBid {
  bid: EnterpriseBid;
  votes: number;
  voteSharePct: number;
  citizenBonusPts: number;
  totalScore: number;
  rank: number;
}

export const PublicTendersView: React.FC<PublicTendersViewProps> = ({
  tenders,
  isPremiumUnlocked,
  userVotes,
  onCastVote,
  onGoToAllocator,
}) => {
  const { t, locale, formatMoney, getTenderCopy, getBidCopy } = useLanguage();
  const [expandedBidIds, setExpandedBidIds] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const formatVoteCount = (count: number) =>
    locale === 'fr'
      ? count.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')
      : count.toLocaleString('en-US');

  const toggleInspectBid = (bidId: string) => {
    setExpandedBidIds((prev) => ({ ...prev, [bidId]: !prev[bidId] }));
  };

  const getRankedBids = (tender: PublicTender): { ranked: RankedBid[]; totalVotes: number } => {
    const selectedBidId = userVotes[tender.id];
    const bidsWithVotes = tender.bids.map((bid) => ({
      bid,
      votes: bid.initialCitizenVotes + (selectedBidId === bid.id ? 1 : 0),
    }));

    const totalVotes = bidsWithVotes.reduce((sum, item) => sum + item.votes, 0);

    const scored = bidsWithVotes.map(({ bid, votes }) => {
      const voteSharePct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      const citizenBonusPts = (voteSharePct / 100) * 15;
      const totalScore = bid.technicalPriceScore + citizenBonusPts;
      return {
        bid,
        votes,
        voteSharePct,
        citizenBonusPts,
        totalScore,
        rank: 1,
      };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    scored.forEach((item, index) => {
      item.rank = index + 1;
    });

    return { ranked: scored, totalVotes };
  };

  const totalVotesCastByUser = Object.keys(userVotes).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#1D3FD8] mb-1.5">
            {t.tendersKicker}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0A1238] leading-tight [text-wrap:balance]">
            {t.tendersTitle}
          </h1>
          <p className="mt-2.5 text-sm sm:text-[15px] text-[#475878] leading-relaxed">
            {t.tendersSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#DCE4F2]">
          <div>
            <p className="text-xs text-[#546482]">{t.activeTendersLabel}</p>
            <p className="font-mono text-lg font-bold text-[#0A1238] tabular-nums">
              {t.openCountLabel(tenders.length)}
            </p>
          </div>
          <div className="h-8 w-px bg-[#DCE4F2]" />
          <div>
            <p className="text-xs text-[#546482]">{t.yourVerifiedVotesLabel}</p>
            <p className="font-mono text-lg font-bold text-[#1D3FD8] tabular-nums">
              {totalVotesCastByUser} / {tenders.length}
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Scoring Formula Banner */}
      <section
        aria-label={t.scoringFormulaAria}
        className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_24px_rgba(10,18,56,0.04)] p-5 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D3FD8]">
              <Info className="w-4 h-4 shrink-0" />
              <span>{t.scoringFormulaKicker}</span>
            </div>
            <p className="font-display text-base sm:text-lg font-bold text-[#0A1238]">
              {t.scoringFormulaHeadline}
            </p>
            <p className="text-xs sm:text-sm text-[#475878] leading-relaxed">
              {t.scoringFormulaDesc}
            </p>
          </div>

          {/* Formula Visual Breakdown */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F4F7FE] border border-[#DCE4F2] shrink-0">
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#0A1238] tabular-nums">
                85 {t.ptsUnit}
              </p>
              <p className="text-[11px] text-[#546482]">{t.techPriceShort}</p>
            </div>
            <span className="font-mono text-lg font-bold text-[#7D8EAD]">+</span>
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums">
                15 {t.ptsUnit}
              </p>
              <p className="text-[11px] text-[#546482]">{t.citizenBonusShort}</p>
            </div>
            <span className="font-mono text-lg font-bold text-[#7D8EAD]">=</span>
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#A6831B] tabular-nums">
                100 {t.ptsUnit}
              </p>
              <p className="text-[11px] text-[#546482]">{t.winningScoreShort}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control Banner: Sculptural Dark-Blue Gradient Noise Focal Surface */}
      {!isPremiumUnlocked ? (
        <section
          aria-label={t.votingLockedAria}
          className="relative overflow-hidden rounded-2xl text-white p-5 sm:p-6 border border-[#1E3385]/45 shadow-[0_14px_34px_rgba(10,18,56,0.14)]"
        >
          <DarkBlueNoiseBackdrop variant="dark-card" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5 text-[#F4DF8F]" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-white">
                  {t.votingLockedTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#D1DDF5] mt-1">
                  {t.votingLockedDesc}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToAllocator}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A1238] font-display text-sm font-bold hover:bg-[#E2C155] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.goToTaxAllocatorBtn}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </section>
      ) : (
        <section
          aria-label={t.votingActiveAria}
          className="relative overflow-hidden rounded-2xl text-white p-4 sm:px-6 border border-[#D4AF37]/50 shadow-[0_12px_30px_rgba(10,18,56,0.14)]"
        >
          <DarkBlueNoiseBackdrop variant="dark-card" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-[#F4DF8F] shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-white">
                {t.votingActiveBanner}
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#7EE8E2] tabular-nums whitespace-nowrap">
              {t.projectsVotedCount(totalVotesCastByUser, tenders.length)}
            </span>
          </div>
        </section>
      )}

      {/* Public Tender Project Cards */}
      <div className="space-y-8">
        {tenders.map((tender, tenderIdx) => {
          const { ranked, totalVotes } = getRankedBids(tender);
          const userVotedBidId = userVotes[tender.id];
          const leadingBid = ranked[0];
          const tenderCopy = getTenderCopy(tender.id, {
            title: tender.title,
            region: tender.region,
            sectorTitle: tender.sectorTitle,
            deadlineDate: tender.deadlineDate,
            summary: tender.summary,
          });

          return (
            <article
              key={tender.id}
              className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_4px_20px_rgba(10,18,56,0.05)] overflow-hidden"
            >
              {/* Project Hero Split Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#E4EBF7]">
                {/* Architectural Photography with Zero-Broken-Image Fallback */}
                <div className="lg:col-span-4 relative min-h-[210px] bg-[#0F2942] overflow-hidden">
                  {!failedImages[tender.id] ? (
                    <img
                      src={tender.imageUrl}
                      alt={tenderCopy.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [tender.id]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0F2942] to-[#087E83] text-white">
                      <Building2 className="w-10 h-10 mb-2 text-[#D4AF37]" />
                      <p className="font-display text-sm font-bold">{tenderCopy.title}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/80 via-[#0F2942]/20 to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold" dir="ltr">
                      {tender.code}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4DF8F]" />
                      {tenderCopy.region}
                    </span>
                  </div>
                </div>

                {/* Tender Meta & Summary */}
                <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A7188] mb-1.5">
                      <span className="font-semibold text-[#087E83]">
                        {t.projectNumberLabel(tenderIdx + 1)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tenderCopy.sectorTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span>{t.votingClosesLabel(tenderCopy.deadlineDate)}</span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F2942] leading-snug">
                      {tenderCopy.title}
                    </h2>
                    <p className="text-sm text-[#4A6178] mt-2 leading-relaxed">
                      {tenderCopy.summary}
                    </p>
                  </div>

                  {/* Key Project Figures */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EDF2F7]">
                    <div>
                      <p className="text-[11px] text-[#647B92]">{t.publicBudgetLabel}</p>
                      <p className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        {formatMoney(tender.budgetDH)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">{t.competingBidsLabel}</p>
                      <p className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        {t.competingBidsRatio}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">{t.totalCitizenVotesLabel}</p>
                      <p className="font-mono text-sm font-bold text-[#087E83] tabular-nums">
                        {formatVoteCount(totalVotes)} {t.votesUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">{t.currentLeaderLabel}</p>
                      <p className="text-xs font-bold text-[#A6831B] truncate">
                        {leadingBid.bid.companyName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Competing Enterprise Bids Leaderboard */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-[#0F2942]">
                    {t.liveCompetingBidsTitle}
                  </h3>
                  {userVotedBidId && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#087E83]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.yourVerifiedVoteCounted}
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {ranked.map((entry) => {
                    const { bid, votes, voteSharePct, citizenBonusPts, totalScore, rank } =
                      entry;
                    const isVotedByUser = userVotedBidId === bid.id;
                    const isInspected = !!expandedBidIds[bid.id];
                    const isLeading = rank === 1;
                    const isSME = bid.enterpriseType === 'Local SME';
                    const bidCopy = getBidCopy(bid.id, {
                      enterpriseType: bid.enterpriseType,
                      city: bid.city,
                      certifications: bid.certifications,
                      summary: bid.summary,
                    });

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-xl border transition-all duration-200 ${
                          isVotedByUser
                            ? 'bg-[#F2F6FF] border-[#1D3FD8] ring-1 ring-[#1D3FD8]/28'
                            : isLeading
                            ? 'bg-[#FCFBF6] border-[#D4AF37]/75'
                            : 'bg-[#F9FBFE] border-[#DCE4F2]'
                        }`}
                      >
                        <div className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Rank & Enterprise Name */}
                            <div className="lg:col-span-4 space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span
                                  className={`font-mono font-bold ${
                                    isLeading ? 'text-[#A6831B]' : 'text-[#546482]'
                                  }`}
                                >
                                  #{rank} {isLeading ? t.leadingLabel : t.rankLabel}
                                </span>
                                {isLeading && (
                                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                                )}
                                <span className="text-[#CBD5E1]" aria-hidden="true">
                                  ·
                                </span>
                                <span
                                  className={`font-semibold ${
                                    isSME ? 'text-[#087E83]' : 'text-[#475878]'
                                  }`}
                                >
                                  {bidCopy.enterpriseType}
                                </span>
                              </div>

                              <h4 className="font-display text-base font-bold text-[#0A1238]">
                                {bid.companyName}
                              </h4>

                              <p className="text-xs text-[#5E7091]">
                                {bidCopy.city} · {t.estYearLabel(bid.foundedYear)} · {t.offerLabel}{' '}
                                <span className="font-mono font-semibold text-[#0A1238] tabular-nums">
                                  {formatMoney(bid.bidPriceDH)}
                                </span>
                              </p>
                            </div>

                            {/* Dual-Segment Score Bar & Exact Breakdown */}
                            <div className="lg:col-span-5 space-y-2">
                              <div className="flex items-baseline justify-between text-xs gap-2">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="text-[#475878]">
                                    {t.techPriceLabel}{' '}
                                    <strong className="font-mono text-[#0A1238] tabular-nums" dir="ltr">
                                      {bid.technicalPriceScore}/85
                                    </strong>
                                  </span>
                                  <span className="text-[#475878]">
                                    {t.citizenBonusLabel}{' '}
                                    <strong className="font-mono text-[#087E83] tabular-nums" dir="ltr">
                                      +{citizenBonusPts.toFixed(2)}/15
                                    </strong>
                                  </span>
                                </div>
                                <span className="font-mono text-base font-extrabold text-[#0A1238] tabular-nums shrink-0" dir="ltr">
                                  {totalScore.toFixed(2)}
                                  <span className="text-[11px] font-medium text-[#5E7091]">
                                    /100
                                  </span>
                                </span>
                              </div>

                              {/* Segmented Score Bar */}
                              <div className="h-3 w-full bg-[#E4EBF7] rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-gradient-to-r from-[#0A1238] to-[#1D3FD8] transition-all duration-300"
                                  style={{ width: `${bid.technicalPriceScore}%` }}
                                  title={`${t.techPriceShort}: ${bid.technicalPriceScore} ${t.ptsUnit}`}
                                />
                                <div
                                  className="h-full bg-[#087E83] transition-all duration-300"
                                  style={{ width: `${citizenBonusPts}%` }}
                                  title={`${t.citizenBonusShort}: +${citizenBonusPts.toFixed(2)} ${t.ptsUnit}`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11.5px] text-[#546482] gap-2">
                                <span className="font-mono tabular-nums">
                                  {t.citizenVotesShare(
                                    formatVoteCount(votes),
                                    voteSharePct.toFixed(1)
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleInspectBid(bid.id)}
                                  className="inline-flex items-center gap-1 font-semibold text-[#0A1238] hover:text-[#1D3FD8] transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <span>{isInspected ? t.hideOfferBtn : t.inspectOfferBtn}</span>
                                  {isInspected ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Action Button: Verified Vote or Locked */}
                            <div className="lg:col-span-3 flex lg:justify-end">
                              {!isPremiumUnlocked ? (
                                <button
                                  type="button"
                                  onClick={onGoToAllocator}
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF2FA] text-[#546482] border border-[#DCE4F2] hover:border-[#0A1238] hover:text-[#0A1238] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>{t.payTaxToVoteBtn}</span>
                                </button>
                              ) : isVotedByUser ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1238] text-[#F4DF8F] border border-[#D4AF37] text-xs font-bold whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                                  <span>{t.verifiedVoteCastBtn}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onCastVote(tender.id, bid.id)}
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D3FD8] text-white hover:bg-[#1532B5] text-xs font-bold shadow-[0_4px_14px_rgba(29,63,216,0.25)] transition-all cursor-pointer whitespace-nowrap active:scale-[0.99]"
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  <span>
                                    {userVotedBidId
                                      ? t.switchVoteHereBtn
                                      : t.castVerifiedVoteBtn}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Detailed Offer Specifications */}
                          {isInspected && (
                            <div className="mt-4 pt-4 border-t border-[#DCE5EE] space-y-3">
                              <p className="text-xs sm:text-sm text-[#3B5268] leading-relaxed">
                                {bidCopy.summary}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92]">
                                    {t.bidOfferPriceLabel}
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {formatMoney(bid.bidPriceDH)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {t.deliveryTimelineLabel}
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {t.deliveryMonthsValue(bid.deliveryMonths)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Leaf className="w-3 h-3 text-[#087E83]" />
                                    {t.ecoRatingLabel}
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#087E83] mt-0.5">
                                    {t.gradeLabel(bid.ecoRating)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {t.localJobsCreatedLabel}
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {t.regionalJobsValue(bid.localJobsCreated)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-[#5A7188]">
                                {t.credentialsLabel}{' '}
                                <span className="font-medium text-[#0F2942]">
                                  {bidCopy.certifications}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
