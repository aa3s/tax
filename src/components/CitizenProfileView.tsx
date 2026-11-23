import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Download,
  Edit3,
  FileDown,
  FileText,
  Printer,
  ShieldCheck,
  Vote,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { CitizenProfile, PublicTender, TaxReceipt } from '../types/daribati';
import { calculateCivicRank, CIVIC_RANK_TIERS, CIVIC_RANK_UI } from '../utils/civicRank';
import { downloadReceiptFile, downloadReceiptPdf } from '../utils/receiptExport';
import { CivicRankEmblem, CivicRankSection } from './CivicRankSection';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';

interface CitizenProfileViewProps {
  profile: CitizenProfile;
  onUpdateProfile: (next: CitizenProfile) => void;
  receipts: TaxReceipt[];
  isPremiumUnlocked: boolean;
  userVotes: Record<string, string>;
  tenders: PublicTender[];
  onGoToAllocator: () => void;
  onGoToTenders: () => void;
  onReceiptPdfDownloaded?: (filename: string) => void;
}

export const CitizenProfileView: React.FC<CitizenProfileViewProps> = ({
  profile,
  onUpdateProfile,
  receipts,
  isPremiumUnlocked,
  userVotes,
  tenders,
  onGoToAllocator,
  onGoToTenders,
  onReceiptPdfDownloaded,
}) => {
  const {
    t,
    locale,
    formatMoney,
    getTaxCategoryLabel,
    getPaymentMethodLabel,
    getSectorCopy,
    getSubSectorCopy,
    getTenderCopy,
    getBidCopy,
  } = useLanguage();

  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    receipts[0]?.id ?? null
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<CitizenProfile>(profile);
  const [pdfSavedReceiptId, setPdfSavedReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfSavedReceiptId) return;
    const timer = window.setTimeout(() => setPdfSavedReceiptId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [pdfSavedReceiptId]);

  const handleDownloadPdf = (receipt: TaxReceipt) => {
    const result = downloadReceiptPdf(receipt, locale);
    setPdfSavedReceiptId(receipt.id);
    onReceiptPdfDownloaded?.(result.filename);
  };

  const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-MA' : 'en-GB';

  const activeReceipt =
    receipts.find((r) => r.id === selectedReceiptId) || receipts[0] || null;

  const totalPaidLifetimeDH = useMemo(
    () => receipts.reduce((sum, r) => sum + r.totalAmountDH, 0),
    [receipts]
  );

  const civicRank = useMemo(() => calculateCivicRank(receipts), [receipts]);
  const rankUi = CIVIC_RANK_UI[locale];
  const currentRankCopy = rankUi.tiers[civicRank.currentTier.id];

  // Aggregate lifetime contribution per sectorId so titles dynamically translate across locales
  const lifetimeSectorTotals = useMemo(() => {
    const map: Record<string, { sectorId: string; fallbackTitle: string; amountDH: number }> = {};
    receipts.forEach((receipt) => {
      receipt.allocations.forEach((item) => {
        if (!map[item.sectorId]) {
          map[item.sectorId] = {
            sectorId: item.sectorId,
            fallbackTitle: item.sectorTitle,
            amountDH: 0,
          };
        }
        map[item.sectorId].amountDH += item.amountDH;
      });
    });
    return Object.values(map).sort((a, b) => b.amountDH - a.amountDH);
  }, [receipts]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(draftProfile);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <section className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#1D3FD8] mb-1.5">
            {t.profileKicker}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0A1238]">
            {t.profileTitle}
          </h1>
          <p className="text-sm text-[#475878] mt-1">
            {t.profileSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToAllocator}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1A52] to-[#1D3FD8] text-white font-display text-xs sm:text-sm font-bold hover:brightness-110 shadow-[0_6px_18px_rgba(29,63,216,0.24)] transition-all cursor-pointer whitespace-nowrap"
        >
          <span>{t.newTaxAllocationBtn}</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </section>

      {/* Top Two-Column Split: Citizen Identity & Premium Badge Status */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Citizen Identity Card */}
        <div className="lg:col-span-7 bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_24px_rgba(10,18,56,0.04)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAEFF8]">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#546482]">
                  {t.registeredTaxpayerLabel}
                </p>
                <h2 className="font-display text-xl font-bold text-[#0A1238] mt-0.5">
                  {profile.fullName}
                </h2>
                <p className="text-xs text-[#647B92] mt-0.5">
                  {t.cinLabel}{' '}
                  <span className="font-mono font-semibold text-[#0F2942]" dir="ltr">
                    {profile.cin}
                  </span>{' '}
                  · {profile.city} · {t.fiscalIdLabel}{' '}
                  <span className="font-mono font-semibold text-[#0F2942]" dir="ltr">
                    {profile.taxIdIF}
                  </span>
                </p>

                {/* Civic Rank Profile Badge Lockup */}
                <div
                  data-testid="profile-civic-rank-badge"
                  className="mt-3.5 pt-3.5 border-t border-[#F0F4FA] flex items-center gap-3"
                >
                  <CivicRankEmblem rankId={civicRank.currentTier.id} size="sm" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#5A7188]">
                      {rankUi.badgeLabel} ·{' '}
                      <span className="font-mono tabular-nums">
                        {rankUi.rankOfTotal(
                          civicRank.currentTier.level,
                          CIVIC_RANK_TIERS.length
                        )}
                      </span>
                    </p>
                    <p
                      className="font-display text-sm font-extrabold leading-tight mt-0.5"
                      style={{ color: civicRank.currentTier.accentHex }}
                    >
                      {currentRankCopy.title}
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
                  setIsEditingProfile((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A6178] bg-[#F4F7FA] border border-[#DCE5EE] hover:border-[#0F2942] hover:text-[#0F2942] transition-colors cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingProfile ? t.cancelBtn : t.editDetailsBtn}
              </button>
            </div>

            {isEditingProfile ? (
              <form
                onSubmit={handleSaveProfile}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={draftProfile.fullName}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, fullName: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.nationalIdCinLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={draftProfile.cin}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, cin: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.cityRegionLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={draftProfile.city}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, city: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-[#087E83] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#06676B] cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {t.saveProfileBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                <div>
                  <p className="text-xs text-[#647B92]">{t.totalTaxPaidLabel}</p>
                  <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {formatMoney(totalPaidLifetimeDH)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">{t.receiptsIssuedLabel}</p>
                  <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {receipts.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">{t.sectorsFundedLabel}</p>
                  <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums mt-0.5">
                    {lifetimeSectorTotals.length} / 9
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">{t.tenderVotesLabel}</p>
                  <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums mt-0.5">
                    {Object.keys(userVotes).length} / {tenders.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {lifetimeSectorTotals.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#EDF2F7]">
              <p className="text-xs font-semibold text-[#4A6178] mb-2.5">
                {t.cumulativeFundingLabel}
              </p>
              <div className="space-y-2">
                {lifetimeSectorTotals.slice(0, 5).map((entry) => {
                  const pct =
                    totalPaidLifetimeDH > 0
                      ? (entry.amountDH / totalPaidLifetimeDH) * 100
                      : 0;
                  const sectorCopy = getSectorCopy(
                    entry.sectorId,
                    entry.fallbackTitle,
                    entry.fallbackTitle
                  );
                  return (
                    <div key={entry.sectorId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="font-medium text-[#0F2942]">{sectorCopy.title}</span>
                        <span className="font-mono text-[#087E83] font-semibold tabular-nums shrink-0">
                          {formatMoney(entry.amountDH)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#E6EEF5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#087E83] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Premium Citizen Badge Credential Card with Dark-Blue Gradient Noise Texture */}
        <div
          className={`relative overflow-hidden lg:col-span-5 rounded-2xl p-6 flex flex-col justify-between shadow-[0_14px_36px_rgba(10,18,56,0.14)] ${
            isPremiumUnlocked
              ? 'text-white border border-[#D4AF37]/80'
              : 'text-white border border-[#1E3385]/45'
          }`}
        >
          <DarkBlueNoiseBackdrop variant="dark-card" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isPremiumUnlocked
                    ? 'bg-[#D4AF37]/20 border border-[#D4AF37]'
                    : 'bg-white/12 border border-white/20'
                }`}
              >
                {isPremiumUnlocked ? (
                  <Award className="w-6 h-6 text-[#F4DF8F]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#A8C4FF]" />
                )}
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  isPremiumUnlocked ? 'text-[#F4DF8F]' : 'text-[#A8C4FF]'
                }`}
              >
                {isPremiumUnlocked ? t.statusPremiumActiveTag : t.statusStandardTag}
              </span>
            </div>

            <h2 className="font-display text-xl font-extrabold text-white mt-4">
              {isPremiumUnlocked
                ? t.verifiedTaxpayerCardTitle
                : t.standardCitizenCardTitle}
            </h2>
            <p className="text-sm mt-2 leading-relaxed text-[#D1DDF5]">
              {isPremiumUnlocked
                ? t.verifiedTaxpayerCardDesc
                : t.standardCitizenCardDesc}
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
            {isPremiumUnlocked ? (
              <button
                type="button"
                onClick={onGoToTenders}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0A1238] font-display text-sm font-bold hover:bg-[#E3C258] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                <span>{t.openTendersVotingBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToAllocator}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-[#0A1238] font-display text-sm font-bold hover:bg-[#EEF4FF] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.allocateAndPayToUnlockBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Civic Rank & Contribution Milestones */}
      <CivicRankSection evaluation={civicRank} />

      {/* Official Tax Receipts & Payment History */}
      <section aria-label={t.receiptHistoryTitle} className="space-y-4">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-[#0F2942]">
            {t.receiptHistoryTitle}
          </h2>
          {activeReceipt && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(activeReceipt)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D1A52] to-[#1D3FD8] hover:brightness-110 shadow-[0_4px_12px_rgba(29,63,216,0.22)] transition-all cursor-pointer"
              >
                {pdfSavedReceiptId === activeReceipt.id ? (
                  <Check className="w-3.5 h-3.5 text-[#7EE8E2]" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {pdfSavedReceiptId === activeReceipt.id
                    ? t.pdfDownloadedLabel
                    : t.downloadPdfBtn}
                </span>
              </button>
              <button
                type="button"
                onClick={() => downloadReceiptFile(activeReceipt, locale)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F2942] bg-white border border-[#CFDCE8] hover:border-[#0F2942] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {t.downloadTxtBtn}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F2942] bg-white border border-[#CFDCE8] hover:border-[#0F2942] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                {t.printReceiptBtn}
              </button>
            </div>
          )}
        </div>

        {receipts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D8E2EC] p-10 text-center space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[#9EB5CA]" />
            <h3 className="font-display text-lg font-bold text-[#0F2942]">
              {t.noReceiptsTitle}
            </h3>
            <p className="text-sm text-[#5A7188] max-w-md mx-auto">
              {t.noReceiptsDesc}
            </p>
            <button
              type="button"
              onClick={onGoToAllocator}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-sm font-bold hover:bg-[#06676B] transition-colors cursor-pointer"
            >
              <span>{t.startTaxAllocationBtn}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Receipt History List */}
            <div className="no-print lg:col-span-4 bg-white rounded-2xl border border-[#D8E2EC] divide-y divide-[#EDF2F7] overflow-hidden">
              {receipts.map((receipt) => {
                const isSelected = activeReceipt?.id === receipt.id;
                return (
                  <button
                    key={receipt.id}
                    type="button"
                    onClick={() => setSelectedReceiptId(receipt.id)}
                    className={`w-full text-start p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F0FAFB]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#087E83]" dir="ltr">
                        {receipt.id}
                      </span>
                      <span className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        {formatMoney(receipt.totalAmountDH)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#0F2942] mt-1">
                      {getTaxCategoryLabel(receipt.taxCategory)}
                    </p>
                    <p className="text-[11px] text-[#647B92] mt-0.5">
                      {new Date(receipt.paidAt).toLocaleString(dateLocale)} ·{' '}
                      {t.receiptSubSectorsCount(receipt.allocations.length)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Active Printable Receipt Document */}
            {activeReceipt && (
              <div className="print-only-receipt lg:col-span-8 bg-white rounded-2xl border border-[#D8E2EC] p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#DCE5EE]">
                  <div>
                    <p className="text-xs font-bold text-[#087E83]">
                      {t.receiptOrgKicker}
                    </p>
                    <h3 className="font-display text-xl font-extrabold text-[#0F2942] mt-0.5">
                      {t.receiptOfficialTitle}
                    </h3>
                    <p className="font-mono text-xs text-[#5A7188] mt-1">
                      {t.receiptReferenceLabel}{' '}
                      <span dir="ltr">{activeReceipt.id}</span>
                    </p>
                  </div>
                  <div className="text-start sm:text-end">
                    <p className="text-xs font-semibold text-[#A6831B]">
                      {t.verifiedTaxpayerReceiptTag}
                    </p>
                    <p className="font-mono text-2xl font-extrabold text-[#0F2942] tabular-nums mt-0.5">
                      {formatMoney(activeReceipt.totalAmountDH)}
                    </p>
                    <p className="text-xs text-[#647B92]">
                      {t.paidOnLabel(new Date(activeReceipt.paidAt).toLocaleString(dateLocale))}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#F7FAFC] p-4 rounded-xl border border-[#E5ECF3]">
                  <div>
                    <p className="text-[#647B92]">{t.taxpayerNameLabel}</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">{activeReceipt.citizenName}</p>
                    <p className="font-mono text-[#5A7188]">
                      {t.cinLabel}: <span dir="ltr">{activeReceipt.citizenCIN}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[#647B92]">{t.taxCategoryLabel}</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">
                      {getTaxCategoryLabel(activeReceipt.taxCategory)}
                    </p>
                    <p className="text-[#5A7188]">{activeReceipt.citizenCity}</p>
                  </div>
                  <div>
                    <p className="text-[#647B92]">{t.paymentChannelLabel}</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">
                      {getPaymentMethodLabel(activeReceipt.paymentMethod)}
                    </p>
                    <p className="font-mono text-[#5A7188]" dir="ltr">
                      {activeReceipt.paymentReference}
                    </p>
                  </div>
                </div>

                {/* Allocation Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE5EE] text-[11px] font-semibold text-[#5A7188]">
                        <th className="py-2.5 pe-3 text-start">{t.colSubSector}</th>
                        <th className="py-2.5 px-3 text-start">{t.colParentSector}</th>
                        <th className="py-2.5 px-3 text-end">{t.colShare}</th>
                        <th className="py-2.5 ps-3 text-end">{t.colAllocated}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF3F8] text-xs sm:text-sm">
                      {activeReceipt.allocations.map((item) => {
                        const pct = (
                          (item.amountDH / Math.max(1, activeReceipt.totalAmountDH)) *
                          100
                        ).toFixed(1);
                        const secCopy = getSectorCopy(
                          item.sectorId,
                          item.sectorTitle,
                          item.sectorTitle
                        );
                        const subCopy = getSubSectorCopy(
                          item.subSectorId,
                          item.subSectorName,
                          ''
                        );
                        return (
                          <tr key={item.subSectorId}>
                            <td className="py-3 pe-3 font-semibold text-[#0F2942]">
                              {subCopy.name}
                            </td>
                            <td className="py-3 px-3 text-[#5A7188]">{secCopy.title}</td>
                            <td className="py-3 px-3 text-end font-mono text-[#5A7188] tabular-nums">
                              {pct}%
                            </td>
                            <td className="py-3 ps-3 text-end font-mono font-bold text-[#087E83] tabular-nums">
                              {formatMoney(item.amountDH)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#0F2942] text-sm font-bold text-[#0F2942]">
                        <td colSpan={2} className="py-3 pe-3">
                          {t.totalParticipatoryAllocationRow}
                        </td>
                        <td className="py-3 px-3 text-end font-mono tabular-nums">100.0%</td>
                        <td className="py-3 ps-3 text-end font-mono tabular-nums">
                          {formatMoney(activeReceipt.totalAmountDH)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Citizen Public Tender Voting Log */}
      {Object.keys(userVotes).length > 0 && (
        <section className="no-print bg-white rounded-2xl border border-[#D8E2EC] p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F2942]">
            {t.yourTenderVotesTitle}
          </h2>
          <div className="divide-y divide-[#EDF2F7]">
            {Object.entries(userVotes).map(([tenderId, bidId]) => {
              const tender = tenders.find((item) => item.id === tenderId);
              const bid = tender?.bids.find((b) => b.id === bidId);
              if (!tender || !bid) return null;
              const tenderCopy = getTenderCopy(tender.id, {
                title: tender.title,
                region: tender.region,
                sectorTitle: tender.sectorTitle,
                deadlineDate: tender.deadlineDate,
                summary: tender.summary,
              });
              const bidCopy = getBidCopy(bid.id, {
                enterpriseType: bid.enterpriseType,
                city: bid.city,
                certifications: bid.certifications,
                summary: bid.summary,
              });
              return (
                <div
                  key={tenderId}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#0F2942]">{tenderCopy.title}</p>
                    <p className="text-xs text-[#647B92]">
                      <span dir="ltr">{tender.code}</span> · {tenderCopy.region}
                    </p>
                  </div>
                  <div className="sm:text-end">
                    <p className="font-semibold text-[#087E83]">{bid.companyName}</p>
                    <p className="text-xs text-[#647B92]">{bidCopy.enterpriseType}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
