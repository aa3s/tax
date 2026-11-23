import {
  formatLocalizedDH,
  Locale,
  PAYMENT_METHOD_TRANSLATIONS,
  SECTOR_TRANSLATIONS,
  SUB_SECTOR_TRANSLATIONS,
  TAX_CATEGORY_TRANSLATIONS,
  UI_STRINGS,
} from '../i18n/translations';
import { PaymentMethod, TaxReceipt } from '../types/daribati';

export function getPaymentMethodLabel(method: PaymentMethod, locale: Locale = 'en'): string {
  return PAYMENT_METHOD_TRANSLATIONS[locale][method] ?? PAYMENT_METHOD_TRANSLATIONS.en[method];
}

export function downloadReceiptFile(receipt: TaxReceipt, locale: Locale = 'en'): void {
  const t = UI_STRINGS[locale];
  const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'ar' ? 'ar-MA' : 'en-GB';
  const catLabel = TAX_CATEGORY_TRANSLATIONS[locale][receipt.taxCategory] ?? receipt.taxCategory;

  const lines = [
    '====================================================================',
    `  ${t.receiptOrgKicker}`,
    `  ${t.receiptOfficialTitle}`,
    '====================================================================',
    '',
    `${t.receiptReferenceLabel} ${receipt.id}`,
    `${t.paidOnLabel(new Date(receipt.paidAt).toLocaleString(dateLocale))}`,
    `${t.taxCategoryLabel}: ${catLabel}`,
    `${t.totalPaidVerifiedLabel}: ${formatLocalizedDH(receipt.totalAmountDH, locale)}`,
    `${t.paymentChannelLabel}: ${getPaymentMethodLabel(receipt.paymentMethod, locale)} (${receipt.paymentReference})`,
    '',
    `--- ${t.taxpayerNameLabel} ------------------------------------------`,
    `${t.fullNameLabel}: ${receipt.citizenName}`,
    `${t.cinLabel}: ${receipt.citizenCIN}`,
    `${t.cityRegionLabel}: ${receipt.citizenCity}`,
    `${t.verifiedTaxpayerReceiptTag}`,
    '',
    `--- ${t.itemizedDistributionLabel} ---------------------------------`,
    ...receipt.allocations.map((item, index) => {
      const pct = ((item.amountDH / Math.max(1, receipt.totalAmountDH)) * 100).toFixed(1);
      const subName = SUB_SECTOR_TRANSLATIONS[locale][item.subSectorId]?.name ?? item.subSectorName;
      const secTitle = SECTOR_TRANSLATIONS[locale][item.sectorId]?.title ?? item.sectorTitle;
      return `${String(index + 1).padStart(2, '0')}. ${subName} (${secTitle})\n    ${formatLocalizedDH(item.amountDH, locale)} (${pct}%)`;
    }),
    '',
    '--------------------------------------------------------------------',
    `${t.totalParticipatoryAllocationRow}: ${formatLocalizedDH(receipt.totalAmountDH, locale)} (100.0%)`,
    '====================================================================',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${receipt.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { buildReceiptPdfData, createReceiptPdfDocument, downloadReceiptPdf } from './receiptPdf';

