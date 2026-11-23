import React, { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  FileDown,
  Lock,
  Printer,
  Smartphone,
  Vote,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  AllocationItem,
  CitizenProfile,
  PaymentMethod,
  TaxCategory,
  TaxReceipt,
} from '../types/daribati';
import { CIVIC_RANK_UI, CivicRankEvaluation } from '../utils/civicRank';
import { downloadReceiptFile, downloadReceiptPdf } from '../utils/receiptExport';
import { DarkBlueNoiseBackdrop } from './DarkBlueNoiseBackdrop';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxBillDH: number;
  taxCategory: TaxCategory;
  allocationItems: AllocationItem[];
  citizenProfile: CitizenProfile;
  onConfirmPayment: (method: PaymentMethod, paymentRef: string) => TaxReceipt;
  onGoToTenders: () => void;
  onReceiptPdfDownloaded?: (filename: string) => void;
  civicRank?: CivicRankEvaluation;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  taxBillDH,
  taxCategory,
  allocationItems,
  citizenProfile,
  onConfirmPayment,
  onGoToTenders,
  onReceiptPdfDownloaded,
  civicRank,
}) => {
  const {
    t,
    locale,
    formatMoney,
    getTaxCategoryLabel,
    getPaymentMethodLabel,
    getSectorCopy,
    getSubSectorCopy,
  } = useLanguage();

  const [method, setMethod] = useState<PaymentMethod>('cmi_card');
  const [cardNumber, setCardNumber] = useState('4532  8910  4421  7709');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('418');
  const [fatouratiPhone, setFatouratiPhone] = useState('+212 6 61 48 29 10');
  const [fatouratiCode, setFatouratiCode] = useState('MTC-849201');
  const [bankRef, setBankRef] = useState('VIR-TGR-2026-8841');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [issuedReceipt, setIssuedReceipt] = useState<TaxReceipt | null>(null);
  const [pdfSaved, setPdfSaved] = useState(false);

  const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-MA' : 'en-GB';

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setIssuedReceipt(null);
      setPdfSaved(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!pdfSaved) return;
    const timer = window.setTimeout(() => setPdfSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [pdfSaved]);

  const handleDownloadPdf = (receipt: TaxReceipt) => {
    const result = downloadReceiptPdf(receipt, locale);
    setPdfSaved(true);
    onReceiptPdfDownloaded?.(result.filename);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    const reference =
      method === 'cmi_card'
        ? `CMI-****${cardNumber.replace(/\s+/g, '').slice(-4) || '7709'}`
        : method === 'fatourati'
        ? fatouratiCode || 'MTC-849201'
        : bankRef || 'VIR-TGR-2026-8841';

    window.setTimeout(() => {
      const receipt = onConfirmPayment(method, reference);
      setIssuedReceipt(receipt);
      setStep('success');
    }, 1050);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070C26]/74 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#DCE4F2] shadow-[0_24px_60px_rgba(7,12,38,0.36)] w-full max-w-2xl my-auto overflow-hidden">
        {/* Header Bar with Dark-Blue Gradient Noise Texture */}
        <div className="relative overflow-hidden px-6 py-4 text-white flex items-center justify-between gap-4">
          <DarkBlueNoiseBackdrop variant="dark-card" />
          <div className="relative z-10 flex items-center gap-2.5">
            {step === 'success' ? (
              <Award className="w-5 h-5 text-[#F4DF8F] shrink-0" />
            ) : (
              <Lock className="w-4 h-4 text-[#8FB7FF] shrink-0" />
            )}
            <h2 id="payment-modal-title" className="font-display text-base font-bold">
              {step === 'success' ? t.checkoutConfirmedTitle : t.checkoutTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            aria-label={t.closeCheckoutAria}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Payment Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Summary Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE5EE]">
              <div>
                <p className="text-xs font-semibold text-[#5A7188]">
                  {getTaxCategoryLabel(taxCategory)}
                </p>
                <p className="text-sm font-bold text-[#0F2942] mt-0.5">
                  {citizenProfile.fullName} · {t.cinLabel}{' '}
                  <span dir="ltr">{citizenProfile.cin}</span>
                </p>
                <p className="text-xs text-[#087E83] mt-0.5">
                  {t.allocatedAcrossSubSectors(allocationItems.length)}
                </p>
              </div>
              <div className="sm:text-end shrink-0">
                <p className="text-[11px] font-semibold text-[#5A7188]">
                  {t.totalAmountDueLabel}
                </p>
                <p className="font-mono text-2xl font-bold text-[#0F2942] tabular-nums">
                  {formatMoney(taxBillDH)}
                </p>
              </div>
            </div>

            {/* Payment Rail Selector */}
            <div>
              <p className="text-xs font-semibold text-[#4A6178] mb-2.5">
                {t.selectPaymentChannelLabel}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'cmi_card' as PaymentMethod,
                    label: t.methodCmiLabel,
                    sub: t.methodCmiSub,
                    icon: CreditCard,
                  },
                  {
                    id: 'fatourati' as PaymentMethod,
                    label: t.methodFatouratiLabel,
                    sub: t.methodFatouratiSub,
                    icon: Smartphone,
                  },
                  {
                    id: 'bank_transfer' as PaymentMethod,
                    label: t.methodBankLabel,
                    sub: t.methodBankSub,
                    icon: Building2,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id)}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        active
                          ? 'bg-[#F0FAFB] border-[#087E83] ring-1 ring-[#087E83]'
                          : 'bg-white border-[#D8E2EC] hover:border-[#9EB5CA]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-1.5 ${
                          active ? 'text-[#087E83]' : 'text-[#5A7188]'
                        }`}
                      />
                      <p className="text-xs font-bold text-[#0F2942]">{opt.label}</p>
                      <p className="text-[11px] text-[#647B92] mt-0.5">{opt.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Payment Rail Fields */}
            {method === 'cmi_card' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-12">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.cardNumberLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.expiryDateLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.cvvLabel}
                  </label>
                  <input
                    type="password"
                    required
                    dir="ltr"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {method === 'fatourati' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.fatouratiPhoneLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={fatouratiPhone}
                    onChange={(e) => setFatouratiPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.fatouratiTokenLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={fatouratiCode}
                    onChange={(e) => setFatouratiCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {method === 'bank_transfer' && (
              <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE5EE]">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-[#5A7188]">{t.beneficiaryLabel}</span>
                  <span className="font-semibold text-[#0F2942]">
                    {t.beneficiaryValue}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-[#5A7188]">{t.moroccanRibLabel}</span>
                  <span className="font-mono font-semibold text-[#0F2942] tabular-nums" dir="ltr">
                    310 810 1000 02400 70123 01 44
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    {t.transferRefLabel}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#CFDCE8] font-mono text-xs text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {/* Compact Allocation Preview */}
            <div className="border-t border-[#E5ECF3] pt-4">
              <p className="text-xs font-semibold text-[#4A6178] mb-2">
                {t.immediatelyFundLabel}
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pe-1">
                {allocationItems.map((item) => {
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
                    <div
                      key={item.subSectorId}
                      className="flex items-center justify-between text-xs gap-2"
                    >
                      <span className="text-[#3B5268] truncate pe-3">
                        {subCopy.name}{' '}
                        <span className="text-[#7E93A8]">· {secCopy.shortTitle}</span>
                      </span>
                      <span className="font-mono font-semibold text-[#087E83] tabular-nums shrink-0">
                        {formatMoney(item.amountDH)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A6178] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D1A52] via-[#1A38C4] to-[#1D3FD8] text-white font-display text-sm font-bold hover:brightness-110 shadow-[0_6px_18px_rgba(29,63,216,0.3)] transition-all cursor-pointer"
              >
                {t.confirmAndPayBtn(formatMoney(taxBillDH))}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-[#DCE4F2] border-t-[#1D3FD8] animate-spin" />
            <div>
              <h3 className="font-display text-lg font-bold text-[#0A1238]">
                {t.verifyingTitle}
              </h3>
              <p className="text-sm text-[#546482] mt-1">
                {t.verifyingDesc(formatMoney(taxBillDH))}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Celebratory Confirmation & Digital Receipt */}
        {step === 'success' && issuedReceipt && (
          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {/* Premium Unlock Celebration Banner */}
            <div className="relative overflow-hidden p-5 rounded-xl text-white border border-[#D4AF37]/70">
              <DarkBlueNoiseBackdrop variant="dark-card" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-[#F4DF8F]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F4DF8F]">
                      {t.premiumStatusActiveBadge}
                    </p>
                    <h3 className="font-display text-lg font-bold mt-0.5">
                      {t.thankYouAllocatedTitle(formatMoney(issuedReceipt.totalAmountDH))}
                    </h3>
                    <p className="text-xs text-[#D1DDF5] mt-1">
                      {t.badgeUnlockedDesc}
                    </p>
                    {civicRank && (
                      <p className="text-xs font-semibold text-[#7EE8E2] mt-2">
                        {CIVIC_RANK_UI[locale].modalRankPrefix}{' '}
                        <span className="text-white font-bold">
                          {CIVIC_RANK_UI[locale].tiers[civicRank.currentTier.id].title}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-[#7EE8E2] shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* Official Digital Tax Receipt Card */}
            <div className="print-only-receipt rounded-xl border border-[#CFDCE8] bg-[#FAFBFD] p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#DCE5EE]">
                <div>
                  <p className="text-[11px] font-semibold text-[#087E83]">
                    {t.officialDigitalReceiptLabel}
                  </p>
                  <p className="font-mono text-sm font-bold text-[#0F2942] mt-0.5" dir="ltr">
                    {issuedReceipt.id}
                  </p>
                </div>
                <div className="text-start sm:text-end text-xs text-[#5A7188]">
                  <p>{new Date(issuedReceipt.paidAt).toLocaleString(dateLocale)}</p>
                  <p className="font-mono text-[#0F2942] font-medium">
                    {getPaymentMethodLabel(issuedReceipt.paymentMethod)} ·{' '}
                    <span dir="ltr">{issuedReceipt.paymentReference}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#647B92]">{t.taxpayerLabel}</span>
                  <p className="font-semibold text-[#0F2942]">{issuedReceipt.citizenName}</p>
                </div>
                <div>
                  <span className="text-[#647B92]">{t.cinCityLabel}</span>
                  <p className="font-semibold text-[#0F2942]">
                    <span dir="ltr">{issuedReceipt.citizenCIN}</span> · {issuedReceipt.citizenCity}
                  </p>
                </div>
                <div>
                  <span className="text-[#647B92]">{t.taxCategoryLabel}</span>
                  <p className="font-semibold text-[#0F2942]">
                    {getTaxCategoryLabel(issuedReceipt.taxCategory)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#DCE5EE] pt-3">
                <p className="text-xs font-semibold text-[#4A6178] mb-2">
                  {t.itemizedDistributionLabel}
                </p>
                <div className="space-y-1.5">
                  {issuedReceipt.allocations.map((item) => {
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
                      <div
                        key={item.subSectorId}
                        className="flex items-center justify-between text-xs py-1 border-b border-[#EDF2F7] last:border-b-0 gap-2"
                      >
                        <span className="text-[#0F2942] font-medium">
                          {subCopy.name}{' '}
                          <span className="text-[#647B92] font-normal">({secCopy.title})</span>
                        </span>
                        <span className="font-mono font-bold text-[#087E83] tabular-nums shrink-0">
                          {formatMoney(item.amountDH)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#CBD5E1] text-sm font-bold text-[#0F2942]">
                  <span>{t.totalPaidVerifiedLabel}</span>
                  <span className="font-mono tabular-nums">
                    {formatMoney(issuedReceipt.totalAmountDH)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(issuedReceipt)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#0D1A52] to-[#1D3FD8] hover:brightness-110 shadow-[0_4px_12px_rgba(29,63,216,0.24)] transition-all cursor-pointer"
                >
                  {pdfSaved ? (
                    <Check className="w-3.5 h-3.5 text-[#7EE8E2]" />
                  ) : (
                    <FileDown className="w-3.5 h-3.5" />
                  )}
                  <span>{pdfSaved ? t.pdfDownloadedLabel : t.downloadPdfBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadReceiptFile(issuedReceipt, locale)}
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

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToTenders();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-sm font-bold hover:bg-[#06676B] shadow-sm transition-colors cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                {t.voteOnTendersNowBtn}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
