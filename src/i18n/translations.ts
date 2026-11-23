import { PaymentMethod, TaxCategory } from '../types/daribati';

export type Locale = 'en' | 'fr' | 'ar';

export const SUPPORTED_LOCALES: { code: Locale; label: string; shortLabel: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', shortLabel: 'EN', nativeName: 'English' },
  { code: 'fr', label: 'FR', shortLabel: 'FR', nativeName: 'Français' },
  { code: 'ar', label: 'العربية', shortLabel: 'ع', nativeName: 'العربية' },
];

export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function getCurrencyUnit(locale: Locale): string {
  return locale === 'ar' ? 'د.م' : 'DH';
}

export function formatLocalizedDH(amount: number, locale: Locale): string {
  const rounded = Math.round(amount);
  const formatted =
    locale === 'fr'
      ? rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')
      : rounded.toLocaleString('en-US');
  return `${formatted} ${getCurrencyUnit(locale)}`;
}

export function formatLocalizedCompactDH(amount: number, locale: Locale): string {
  const unit = getCurrencyUnit(locale);
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const numStr = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2);
    const suffix = locale === 'ar' ? 'مليون' : 'M';
    return locale === 'ar' ? `${numStr} ${suffix} ${unit}` : `${numStr}${suffix} ${unit}`;
  }
  if (amount >= 1_000) {
    const kStr = (amount / 1_000).toFixed(1);
    const suffix = locale === 'ar' ? 'ألف' : 'K';
    return locale === 'ar' ? `${kStr} ${suffix} ${unit}` : `${kStr}${suffix} ${unit}`;
  }
  return `${Math.round(amount)} ${unit}`;
}

export interface UIStrings {
  pageTitle: string;
  brandName: string;
  brandHomeAria: string;
  languageSelectorAria: string;
  navPrimaryAria: string;
  navMobileAria: string;
  navAllocator: string;
  navAllocatorShort: string;
  navTenders: string;
  navTendersShort: string;
  navProfile: string;
  navProfileShort: string;
  statusVerifiedFull: string;
  statusVerifiedShort: string;
  statusStandard: string;
  statusStandardShort: string;
  statusVerifiedTitle: string;
  statusStandardTitle: string;

  // Footer
  footerTitle: string;
  footerSubtitle: string;

  // Toasts
  toastVoteRecorded: (companyName: string) => string;
  toastProfileUpdated: string;
  toastPdfDownloaded: (filename: string) => string;

  // Tax Allocator Hero
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  civicPoolFundedLabel: string;
  overallProgressLabel: string;

  // Tax Assessment Control Bar
  taxAssessmentAria: string;
  taxDeclarationTypeLabel: string;
  totalTaxDueLabel: string;
  presetsLabel: string;
  remainingToAllocateLabel: string;
  allocatedLabel: string;
  ready100Label: string;
  allocate100Prompt: string;
  sampleSplitBtn: string;
  distributeEvenlyBtn: string;
  resetBtn: string;
  proceedToPayBtn: (formattedAmount: string) => string;
  ctaReadyVerifiedHint: string;
  ctaReadyStandardHint: string;
  ctaAllocateMoreHint: (formattedRemaining: string) => string;

  // 9 Public Service Tanks
  sectorsSectionAria: string;
  sectorsSectionTitle: string;
  sectorsSectionSubtitle: string;
  collapseSubSectorsBtn: string;
  subSectorsCount: (count: number) => string;
  yourTaxBadge: (formattedAmount: string) => string;
  collectedTargetLabel: string;
  fundedPercentLabel: (pct: string) => string;
  hideSubSectorsAction: string;
  allocateSubSectorsAction: string;
  subSectorBreakdownKicker: (sectorNum: number) => string;
  yourAllocationInSectorLabel: string;
  remainingTaxBillLabel: string;
  closeSubSectorPanelAria: string;
  yourContributionLabel: string;
  allocateSliderAria: (subName: string) => string;
  maxBtn: string;
  tankTargetLabel: string;
  tankAriaLabel: (pct: string, target: string) => string;

  // Allocation Breakdown Ledger
  breakdownAria: string;
  breakdownTitle: string;
  breakdownSubtitle: (formattedBill: string) => string;
  noAllocationsTitle: string;
  noAllocationsSubtitle: string;
  removeAllocationAria: (subName: string) => string;

  // Public Tenders View
  tendersKicker: string;
  tendersTitle: string;
  tendersSubtitle: string;
  activeTendersLabel: string;
  openCountLabel: (count: number) => string;
  yourVerifiedVotesLabel: string;
  scoringFormulaAria: string;
  scoringFormulaKicker: string;
  scoringFormulaHeadline: string;
  scoringFormulaDesc: string;
  ptsUnit: string;
  techPriceShort: string;
  citizenBonusShort: string;
  winningScoreShort: string;
  votingLockedAria: string;
  votingLockedTitle: string;
  votingLockedDesc: string;
  goToTaxAllocatorBtn: string;
  votingActiveAria: string;
  votingActiveBanner: string;
  projectsVotedCount: (voted: number, total: number) => string;
  projectNumberLabel: (num: number) => string;
  votingClosesLabel: (date: string) => string;
  publicBudgetLabel: string;
  competingBidsLabel: string;
  competingBidsRatio: string;
  totalCitizenVotesLabel: string;
  votesUnit: string;
  currentLeaderLabel: string;
  liveCompetingBidsTitle: string;
  yourVerifiedVoteCounted: string;
  leadingLabel: string;
  rankLabel: string;
  estYearLabel: (year: number) => string;
  offerLabel: string;
  techPriceLabel: string;
  citizenBonusLabel: string;
  citizenVotesShare: (votes: string, share: string) => string;
  hideOfferBtn: string;
  inspectOfferBtn: string;
  payTaxToVoteBtn: string;
  verifiedVoteCastBtn: string;
  switchVoteHereBtn: string;
  castVerifiedVoteBtn: string;
  bidOfferPriceLabel: string;
  deliveryTimelineLabel: string;
  deliveryMonthsValue: (months: number) => string;
  ecoRatingLabel: string;
  gradeLabel: (grade: string) => string;
  localJobsCreatedLabel: string;
  regionalJobsValue: (jobs: number) => string;
  credentialsLabel: string;

  // Citizen Profile View
  profileKicker: string;
  profileTitle: string;
  profileSubtitle: string;
  newTaxAllocationBtn: string;
  registeredTaxpayerLabel: string;
  cinLabel: string;
  fiscalIdLabel: string;
  cancelBtn: string;
  editDetailsBtn: string;
  fullNameLabel: string;
  nationalIdCinLabel: string;
  cityRegionLabel: string;
  saveProfileBtn: string;
  totalTaxPaidLabel: string;
  receiptsIssuedLabel: string;
  sectorsFundedLabel: string;
  tenderVotesLabel: string;
  cumulativeFundingLabel: string;
  statusPremiumActiveTag: string;
  statusStandardTag: string;
  verifiedTaxpayerCardTitle: string;
  standardCitizenCardTitle: string;
  verifiedTaxpayerCardDesc: string;
  standardCitizenCardDesc: string;
  openTendersVotingBtn: string;
  allocateAndPayToUnlockBtn: string;
  receiptHistoryTitle: string;
  downloadPdfBtn: string;
  pdfDownloadedLabel: string;
  downloadTxtBtn: string;
  printReceiptBtn: string;
  noReceiptsTitle: string;
  noReceiptsDesc: string;
  startTaxAllocationBtn: string;
  receiptSubSectorsCount: (count: number) => string;
  receiptOrgKicker: string;
  receiptOfficialTitle: string;
  receiptReferenceLabel: string;
  verifiedTaxpayerReceiptTag: string;
  paidOnLabel: (formattedDate: string) => string;
  taxpayerNameLabel: string;
  taxCategoryLabel: string;
  paymentChannelLabel: string;
  colSubSector: string;
  colParentSector: string;
  colShare: string;
  colAllocated: string;
  totalParticipatoryAllocationRow: string;
  yourTenderVotesTitle: string;

  // Payment Modal
  checkoutConfirmedTitle: string;
  checkoutTitle: string;
  closeCheckoutAria: string;
  allocatedAcrossSubSectors: (count: number) => string;
  totalAmountDueLabel: string;
  selectPaymentChannelLabel: string;
  methodCmiLabel: string;
  methodCmiSub: string;
  methodFatouratiLabel: string;
  methodFatouratiSub: string;
  methodBankLabel: string;
  methodBankSub: string;
  cardNumberLabel: string;
  expiryDateLabel: string;
  cvvLabel: string;
  fatouratiPhoneLabel: string;
  fatouratiTokenLabel: string;
  beneficiaryLabel: string;
  beneficiaryValue: string;
  moroccanRibLabel: string;
  transferRefLabel: string;
  immediatelyFundLabel: string;
  confirmAndPayBtn: (formattedAmount: string) => string;
  verifyingTitle: string;
  verifyingDesc: (formattedAmount: string) => string;
  premiumStatusActiveBadge: string;
  thankYouAllocatedTitle: (formattedAmount: string) => string;
  badgeUnlockedDesc: string;
  officialDigitalReceiptLabel: string;
  taxpayerLabel: string;
  cinCityLabel: string;
  itemizedDistributionLabel: string;
  totalPaidVerifiedLabel: string;
  downloadReceiptBtn: string;
  voteOnTendersNowBtn: string;
}

export const UI_STRINGS: Record<Locale, UIStrings> = {
  en: {
    pageTitle: 'Daribati — Participatory Tax & Civic Portal (Morocco)',
    brandName: 'Daribati',
    brandHomeAria: 'Daribati Home',
    languageSelectorAria: 'Select website language',
    navPrimaryAria: 'Primary Navigation',
    navMobileAria: 'Mobile Navigation',
    navAllocator: 'Tax Allocator',
    navAllocatorShort: 'Allocator',
    navTenders: 'Public Tenders',
    navTendersShort: 'Tenders',
    navProfile: 'Profile & Receipt',
    navProfileShort: 'Profile',
    statusVerifiedFull: '★ Verified Taxpayer (Premium)',
    statusVerifiedShort: '★ Verified',
    statusStandard: 'Standard Citizen',
    statusStandardShort: 'Standard',
    statusVerifiedTitle: 'Verified Taxpayer Premium Status Active — View Profile & Receipts',
    statusStandardTitle: 'Complete a tax payment to unlock Verified Taxpayer Premium voting rights',

    footerTitle: 'Daribati — Participatory Tax & Civic Portal (Morocco)',
    footerSubtitle:
      'Transparent Moroccan Dirham (DH) public budget allocation & merit-based SME tender participation',

    toastVoteRecorded: (companyName) =>
      `Verified vote recorded for ${companyName}. Leaderboard updated.`,
    toastProfileUpdated: 'Citizen profile details updated.',
    toastPdfDownloaded: (filename) => `Formatted PDF tax receipt saved (${filename}).`,

    heroKicker: 'Kingdom of Morocco · Participatory Tax Portal',
    heroTitle: 'Direct your Moroccan tax contribution to the public services you value most',
    heroSubtitle:
      'Click any of the 9 public service liquid tanks below to expand its sub-sectors and allocate 100% of your tax bill in Dirhams (DH). Completing payment unlocks your Verified Taxpayer voting rights for public tenders.',
    civicPoolFundedLabel: '2026 Civic Pool Funded',
    overallProgressLabel: 'Overall Progress',

    taxAssessmentAria: 'Tax Assessment Summary',
    taxDeclarationTypeLabel: 'Tax Declaration Type',
    totalTaxDueLabel: 'Total Tax Due (DH)',
    presetsLabel: 'Presets:',
    remainingToAllocateLabel: 'Remaining to Allocate',
    allocatedLabel: 'Allocated',
    ready100Label: '100% Ready',
    allocate100Prompt: 'Allocate 100% to pay',
    sampleSplitBtn: 'Sample Split',
    distributeEvenlyBtn: 'Distribute Evenly',
    resetBtn: 'Reset',
    proceedToPayBtn: (amt) => `Proceed to Pay Tax (${amt})`,
    ctaReadyVerifiedHint: 'Verified Taxpayer status active · Receipt issued immediately',
    ctaReadyStandardHint: 'Unlocks Verified Taxpayer Badge & Tender Voting',
    ctaAllocateMoreHint: (rem) => `Allocate ${rem} more across sub-sectors below`,

    sectorsSectionAria: 'Public Service Sectors',
    sectorsSectionTitle: '9 Public Service Funding Tanks',
    sectorsSectionSubtitle:
      'Click any 3D liquid tank to open its sub-sector branch and adjust your exact DH contribution.',
    collapseSubSectorsBtn: 'Collapse Sub-Sectors',
    subSectorsCount: (c) => `${c} sub-sectors`,
    yourTaxBadge: (amt) => `+${amt} Your Tax`,
    collectedTargetLabel: 'Collected / Target',
    fundedPercentLabel: (pct) => `${pct}% funded`,
    hideSubSectorsAction: 'Hide Sub-Sectors',
    allocateSubSectorsAction: 'Allocate Sub-Sectors',
    subSectorBreakdownKicker: (num) => `Sub-Sector Breakdown · Sector 0${num}`,
    yourAllocationInSectorLabel: 'Your Allocation in This Sector',
    remainingTaxBillLabel: 'Remaining Tax Bill',
    closeSubSectorPanelAria: 'Close sub-sector panel',
    yourContributionLabel: 'Your Contribution',
    allocateSliderAria: (name) => `Allocate Dirhams to ${name}`,
    maxBtn: 'Max',
    tankTargetLabel: 'TARGET',
    tankAriaLabel: (pct, target) => `Funding tank at ${pct}% of ${target} target`,

    breakdownAria: 'Current Allocation Breakdown',
    breakdownTitle: 'Your Allocation Breakdown',
    breakdownSubtitle: (bill) =>
      `Exact distribution of your ${bill} tax declaration before payment.`,
    noAllocationsTitle: 'No sub-sectors allocated yet.',
    noAllocationsSubtitle:
      'Click any of the 9 liquid tanks above to allocate DH, or apply a quick sample split to preview.',
    removeAllocationAria: (name) => `Remove allocation for ${name}`,

    tendersKicker: "Appels d'Offres Publics · Fair SME Competition",
    tendersTitle: 'Public Tenders & Weighted Citizen Voting',
    tendersSubtitle:
      'Inspect government construction tenders funded by your Dirhams and cast your verified citizen vote to reward transparent, eco-efficient Moroccan SMEs competing against corporate incumbents.',
    activeTendersLabel: 'Active Public Tenders',
    openCountLabel: (c) => `${c} Open`,
    yourVerifiedVotesLabel: 'Your Verified Votes',
    scoringFormulaAria: 'Transparent Contract Award Scoring Formula',
    scoringFormulaKicker: 'Transparent Public Contract Award Formula',
    scoringFormulaHeadline:
      'Total Score (100 pts) = Technical & Price Offer (Max 85 pts) + Citizen Vote Bonus (Up to 15 pts)',
    scoringFormulaDesc:
      'Large corporations often score slightly higher on capital scale and historical bonding capacity, while agile local SMEs deliver stronger eco-ratings, fair pricing, and local Moroccan jobs. The 15-point Citizen Vote Bonus (weighted directly by % of verified taxpayer votes) gives deserving SMEs a fair, merit-based path to win public contracts.',
    ptsUnit: 'pts',
    techPriceShort: 'Technical & Price',
    citizenBonusShort: 'Citizen Vote Bonus',
    winningScoreShort: 'Winning Score',
    votingLockedAria: 'Voting Locked Notice',
    votingLockedTitle: 'Read-Only Preview · Citizen Voting Locked',
    votingLockedDesc:
      'Pay your tax to unlock your Verified Citizen Badge and vote on public contracts. You can inspect all competing offers and live scores below right now.',
    goToTaxAllocatorBtn: 'Go to Tax Allocator',
    votingActiveAria: 'Verified Taxpayer Voting Active',
    votingActiveBanner:
      '★ Verified Taxpayer Premium Badge Active — Cast 1 verified vote per tender project below to update live rankings.',
    projectsVotedCount: (v, t) => `${v} of ${t} projects voted`,
    projectNumberLabel: (n) => `Project #${n}`,
    votingClosesLabel: (d) => `Voting closes ${d}`,
    publicBudgetLabel: 'Public Budget',
    competingBidsLabel: 'Competing Bids',
    competingBidsRatio: '1 Corp · 2 SMEs',
    totalCitizenVotesLabel: 'Total Citizen Votes',
    votesUnit: 'votes',
    currentLeaderLabel: 'Current Leader',
    liveCompetingBidsTitle: 'Live Competing Enterprise Bids (Sorted by Total Score)',
    yourVerifiedVoteCounted: 'Your verified vote is counted',
    leadingLabel: 'Leading',
    rankLabel: 'Rank',
    estYearLabel: (y) => `Est. ${y}`,
    offerLabel: 'Offer',
    techPriceLabel: 'Tech/Price:',
    citizenBonusLabel: 'Citizen Bonus:',
    citizenVotesShare: (votes, share) => `${votes} citizen votes (${share}% share)`,
    hideOfferBtn: 'Hide Offer',
    inspectOfferBtn: 'Inspect Offer',
    payTaxToVoteBtn: 'Pay Tax to Vote',
    verifiedVoteCastBtn: 'Verified Vote Cast',
    switchVoteHereBtn: 'Switch Vote Here',
    castVerifiedVoteBtn: 'Cast Verified Vote',
    bidOfferPriceLabel: 'Bid Offer Price',
    deliveryTimelineLabel: 'Delivery Timeline',
    deliveryMonthsValue: (m) => `${m} months`,
    ecoRatingLabel: 'Eco-Rating',
    gradeLabel: (g) => `Grade ${g}`,
    localJobsCreatedLabel: 'Local Jobs Created',
    regionalJobsValue: (j) => `${j} regional jobs`,
    credentialsLabel: 'Credentials:',

    profileKicker: 'Personal Civic Ledger · Morocco',
    profileTitle: 'Citizen Profile & Digital Tax Receipts',
    profileSubtitle:
      'Review your Verified Taxpayer Premium Badge, printable official receipts, and public tender voting record.',
    newTaxAllocationBtn: 'New Tax Allocation',
    registeredTaxpayerLabel: 'Registered Taxpayer',
    cinLabel: 'CIN',
    fiscalIdLabel: 'Fiscal ID',
    cancelBtn: 'Cancel',
    editDetailsBtn: 'Edit Details',
    fullNameLabel: 'Full Name',
    nationalIdCinLabel: 'National ID (CIN)',
    cityRegionLabel: 'City / Region',
    saveProfileBtn: 'Save Profile',
    totalTaxPaidLabel: 'Total Tax Paid',
    receiptsIssuedLabel: 'Receipts Issued',
    sectorsFundedLabel: 'Sectors Funded',
    tenderVotesLabel: 'Tender Votes',
    cumulativeFundingLabel: 'Cumulative Funding by Public Sector',
    statusPremiumActiveTag: 'STATUS: PREMIUM ACTIVE',
    statusStandardTag: 'STATUS: STANDARD',
    verifiedTaxpayerCardTitle: '★ Verified Taxpayer (Premium Unlocked)',
    standardCitizenCardTitle: 'Standard Citizen Account',
    verifiedTaxpayerCardDesc:
      'Your fiscal contribution is verified on the Daribati ledger. You hold full voting rights across all active Moroccan public tenders to champion transparent SMEs.',
    standardCitizenCardDesc:
      'Complete your first participatory tax allocation and payment to earn the Verified Taxpayer Premium Badge and unlock weighted voting on public tenders.',
    openTendersVotingBtn: 'Open Public Tenders Voting',
    allocateAndPayToUnlockBtn: 'Allocate & Pay Tax to Unlock',
    receiptHistoryTitle: 'Tax Payment History & Official Digital Receipts',
    downloadPdfBtn: 'Download PDF',
    pdfDownloadedLabel: 'PDF Saved',
    downloadTxtBtn: 'Download .txt',
    printReceiptBtn: 'Print Receipt',
    noReceiptsTitle: 'No tax receipts issued yet',
    noReceiptsDesc:
      "Once you allocate 100% of your tax bill across Morocco's public service sectors and complete payment, your official digital tax receipt will appear here.",
    startTaxAllocationBtn: 'Start Tax Allocation',
    receiptSubSectorsCount: (c) => `${c} sub-sectors`,
    receiptOrgKicker: 'Kingdom of Morocco · Daribati Civic Portal',
    receiptOfficialTitle: 'Quittance Fiscale Participative',
    receiptReferenceLabel: 'Receipt Reference:',
    verifiedTaxpayerReceiptTag: '★ Verified Taxpayer Receipt',
    paidOnLabel: (d) => `Paid on ${d}`,
    taxpayerNameLabel: 'Taxpayer Name',
    taxCategoryLabel: 'Tax Category',
    paymentChannelLabel: 'Payment Channel',
    colSubSector: 'Public Sub-Sector',
    colParentSector: 'Parent Sector',
    colShare: 'Share',
    colAllocated: 'Allocated (DH)',
    totalParticipatoryAllocationRow: 'Total Participatory Tax Allocation',
    yourTenderVotesTitle: 'Your Verified Public Tender Votes',

    checkoutConfirmedTitle: 'Tax Payment Confirmed · Premium Citizen Badge Unlocked',
    checkoutTitle: 'Daribati Secure Tax Checkout',
    closeCheckoutAria: 'Close checkout dialog',
    allocatedAcrossSubSectors: (c) =>
      `Allocated across ${c} public sub-sector${c === 1 ? '' : 's'} (100% matched)`,
    totalAmountDueLabel: 'Total Amount Due',
    selectPaymentChannelLabel: 'Select Moroccan Payment Channel',
    methodCmiLabel: 'Bank Card (CMI)',
    methodCmiSub: 'Visa / Mastercard / CMI',
    methodFatouratiLabel: 'Fatourati (MTC)',
    methodFatouratiSub: 'PayDirect Mobile Token',
    methodBankLabel: 'Bank Transfer',
    methodBankSub: 'TGR Treasury RIB',
    cardNumberLabel: 'Card Number (Simulated CMI Gateway)',
    expiryDateLabel: 'Expiry Date',
    cvvLabel: 'Security Code (CVV)',
    fatouratiPhoneLabel: 'Mobile Number Linked to Fatourati',
    fatouratiTokenLabel: 'Fatourati / MTC Reference Token',
    beneficiaryLabel: 'Beneficiary',
    beneficiaryValue: 'Trésorerie Générale du Royaume (TGR — Daribati Pool)',
    moroccanRibLabel: 'Moroccan RIB (24 digits)',
    transferRefLabel: 'Your Transfer Reference',
    immediatelyFundLabel: 'Your Tax Will Immediately Fund:',
    confirmAndPayBtn: (amt) => `Confirm & Pay ${amt}`,
    verifyingTitle: 'Verifying Transaction with Moroccan Treasury Gateway',
    verifyingDesc: (amt) =>
      `Allocating ${amt} across your chosen public services and issuing your digital tax receipt...`,
    premiumStatusActiveBadge: '★ Verified Taxpayer · Premium Status Active',
    thankYouAllocatedTitle: (amt) => `Thank you! Your ${amt} tax is allocated.`,
    badgeUnlockedDesc:
      'Your Verified Citizen Badge is now unlocked. You can cast verified votes on active Moroccan public tenders immediately.',
    officialDigitalReceiptLabel: 'Official Digital Tax Receipt (Quittance Fiscale)',
    taxpayerLabel: 'Taxpayer',
    cinCityLabel: 'CIN / City',
    itemizedDistributionLabel: 'Itemized Public Service Distribution',
    totalPaidVerifiedLabel: 'Total Paid & Verified',
    downloadReceiptBtn: 'Download Receipt',
    voteOnTendersNowBtn: 'Vote on Public Tenders Now',
  },

  fr: {
    pageTitle: 'Daribati — Portail Fiscal Participatif & Civique (Maroc)',
    brandName: 'Daribati',
    brandHomeAria: 'Accueil Daribati',
    languageSelectorAria: 'Choisir la langue du site',
    navPrimaryAria: 'Navigation principale',
    navMobileAria: 'Navigation mobile',
    navAllocator: 'Répartition Fiscale',
    navAllocatorShort: 'Répartition',
    navTenders: "Appels d'Offres",
    navTendersShort: "Appels d'Offres",
    navProfile: 'Profil & Quittance',
    navProfileShort: 'Profil',
    statusVerifiedFull: '★ Contribuable Vérifié (Premium)',
    statusVerifiedShort: '★ Vérifié',
    statusStandard: 'Citoyen Standard',
    statusStandardShort: 'Standard',
    statusVerifiedTitle: 'Statut Contribuable Vérifié actif — Voir le profil et les quittances',
    statusStandardTitle:
      'Effectuez un paiement fiscal pour débloquer vos droits de vote Contribuable Vérifié',

    footerTitle: 'Daribati — Portail Fiscal Participatif & Civique (Maroc)',
    footerSubtitle:
      'Allocation transparente du budget public en Dirhams (DH) et participation équitable des PME aux marchés publics',

    toastVoteRecorded: (companyName) =>
      `Vote vérifié enregistré pour ${companyName}. Classement mis à jour.`,
    toastProfileUpdated: 'Informations du profil citoyen mises à jour.',
    toastPdfDownloaded: (filename) => `Quittance fiscale PDF téléchargée (${filename}).`,

    heroKicker: 'Royaume du Maroc · Portail Fiscal Participatif',
    heroTitle: 'Orientez votre contribution fiscale vers les services publics prioritaires',
    heroSubtitle:
      'Cliquez sur chacun des 9 réservoirs de services publics ci-dessous pour ouvrir ses sous-secteurs et répartir 100 % de votre impôt en Dirhams (DH). Le paiement débloque votre droit de vote vérifié sur les marchés publics.',
    civicPoolFundedLabel: 'Fonds Civique 2026 Collecté',
    overallProgressLabel: 'Avancement Global',

    taxAssessmentAria: "Résumé de l'avis d'imposition",
    taxDeclarationTypeLabel: 'Type de Déclaration Fiscale',
    totalTaxDueLabel: 'Montant Total Dû (DH)',
    presetsLabel: 'Montants rapides :',
    remainingToAllocateLabel: 'Reste à Répartir',
    allocatedLabel: 'Réparti',
    ready100Label: 'Prêt à 100 %',
    allocate100Prompt: 'Répartissez 100 % pour payer',
    sampleSplitBtn: 'Répartition Exemple',
    distributeEvenlyBtn: 'Répartir Équitablement',
    resetBtn: 'Réinitialiser',
    proceedToPayBtn: (amt) => `Payer l'Impôt (${amt})`,
    ctaReadyVerifiedHint: 'Statut Contribuable Vérifié actif · Quittance immédiate',
    ctaReadyStandardHint: 'Débloque le badge Contribuable Vérifié et le vote citoyen',
    ctaAllocateMoreHint: (rem) => `Répartissez encore ${rem} dans les sous-secteurs ci-dessous`,

    sectorsSectionAria: 'Secteurs de services publics',
    sectorsSectionTitle: '9 Réservoirs de Financement des Services Publics',
    sectorsSectionSubtitle:
      'Cliquez sur un réservoir 3D pour afficher ses sous-secteurs et ajuster votre contribution exacte en DH.',
    collapseSubSectorsBtn: 'Réduire les sous-secteurs',
    subSectorsCount: (c) => `${c} sous-secteurs`,
    yourTaxBadge: (amt) => `+${amt} Votre Impôt`,
    collectedTargetLabel: 'Collecté / Objectif',
    fundedPercentLabel: (pct) => `${pct} % financé`,
    hideSubSectorsAction: 'Masquer les sous-secteurs',
    allocateSubSectorsAction: 'Répartir par sous-secteur',
    subSectorBreakdownKicker: (num) => `Détail des Sous-Secteurs · Secteur 0${num}`,
    yourAllocationInSectorLabel: 'Votre Allocation dans ce Secteur',
    remainingTaxBillLabel: 'Solde Fiscal Restant',
    closeSubSectorPanelAria: 'Fermer le panneau des sous-secteurs',
    yourContributionLabel: 'Votre Contribution',
    allocateSliderAria: (name) => `Allouer des Dirhams à ${name}`,
    maxBtn: 'Max',
    tankTargetLabel: 'OBJECTIF',
    tankAriaLabel: (pct, target) => `Réservoir financé à ${pct} % sur un objectif de ${target}`,

    breakdownAria: 'Détail de votre répartition actuelle',
    breakdownTitle: 'Détail de Votre Répartition',
    breakdownSubtitle: (bill) =>
      `Distribution exacte de votre déclaration fiscale de ${bill} avant paiement.`,
    noAllocationsTitle: 'Aucun sous-secteur sélectionné pour le moment.',
    noAllocationsSubtitle:
      'Cliquez sur un réservoir ci-dessus pour allouer des DH, ou appliquez une répartition exemple.',
    removeAllocationAria: (name) => `Retirer l'allocation pour ${name}`,

    tendersKicker: "Appels d'Offres Publics · Concurrence Équitable des PME",
    tendersTitle: "Appels d'Offres Publics & Vote Citoyen Pondéré",
    tendersSubtitle:
      'Consultez les marchés publics financés par vos Dirhams et exprimez votre vote vérifié pour encourager les PME marocaines transparentes et éco-responsables face aux grands groupes.',
    activeTendersLabel: 'Marchés Publics Actifs',
    openCountLabel: (c) => `${c} Ouverts`,
    yourVerifiedVotesLabel: 'Vos Votes Vérifiés',
    scoringFormulaAria: "Formule transparente d'attribution des marchés",
    scoringFormulaKicker: "Formule Transparente d'Attribution des Marchés Publics",
    scoringFormulaHeadline:
      'Score Total (100 pts) = Offre Technique & Financière (Max 85 pts) + Bonus Vote Citoyen (Jusqu’à 15 pts)',
    scoringFormulaDesc:
      'Les grandes entreprises disposent souvent de capacités financières historiques supérieures, tandis que les PME locales proposent une meilleure performance écologique, des prix justes et des emplois régionaux. Le bonus de 15 points issu du vote citoyen rétablit une concurrence fondée sur le mérite.',
    ptsUnit: 'pts',
    techPriceShort: 'Technique & Prix',
    citizenBonusShort: 'Bonus Citoyen',
    winningScoreShort: 'Score Final',
    votingLockedAria: 'Avis de verrouillage du vote',
    votingLockedTitle: 'Aperçu en Lecture Seule · Vote Citoyen Verrouillé',
    votingLockedDesc:
      'Réglez votre impôt pour activer votre badge Contribuable Vérifié et voter sur les marchés publics. Vous pouvez déjà examiner toutes les offres et notes en direct ci-dessous.',
    goToTaxAllocatorBtn: 'Aller au Répartiteur Fiscal',
    votingActiveAria: 'Vote Contribuable Vérifié actif',
    votingActiveBanner:
      '★ Badge Contribuable Vérifié Actif — Exprimez 1 vote vérifié par appel d’offres ci-dessous pour actualiser le classement en direct.',
    projectsVotedCount: (v, t) => `${v} sur ${t} projets votés`,
    projectNumberLabel: (n) => `Projet n°${n}`,
    votingClosesLabel: (d) => `Clôture du vote le ${d}`,
    publicBudgetLabel: 'Budget Public',
    competingBidsLabel: 'Offres en Lice',
    competingBidsRatio: '1 Groupe · 2 PME',
    totalCitizenVotesLabel: 'Votes Citoyens',
    votesUnit: 'votes',
    currentLeaderLabel: 'Offre en Tête',
    liveCompetingBidsTitle: 'Offres Concurrentes en Direct (Classées par Score Total)',
    yourVerifiedVoteCounted: 'Votre vote vérifié est pris en compte',
    leadingLabel: 'En tête',
    rankLabel: 'Rang',
    estYearLabel: (y) => `Fondée en ${y}`,
    offerLabel: 'Offre',
    techPriceLabel: 'Tech/Prix :',
    citizenBonusLabel: 'Bonus Citoyen :',
    citizenVotesShare: (votes, share) => `${votes} votes citoyens (${share} % des voix)`,
    hideOfferBtn: "Masquer l'offre",
    inspectOfferBtn: "Inspecter l'offre",
    payTaxToVoteBtn: 'Payer pour Voter',
    verifiedVoteCastBtn: 'Vote Vérifié Enregistré',
    switchVoteHereBtn: 'Transférer mon Vote',
    castVerifiedVoteBtn: 'Voter (Vérifié)',
    bidOfferPriceLabel: "Montant de l'Offre",
    deliveryTimelineLabel: 'Délai de Livraison',
    deliveryMonthsValue: (m) => `${m} mois`,
    ecoRatingLabel: 'Note Écologique',
    gradeLabel: (g) => `Note ${g}`,
    localJobsCreatedLabel: 'Emplois Locaux Créés',
    regionalJobsValue: (j) => `${j} emplois régionaux`,
    credentialsLabel: 'Certifications :',

    profileKicker: 'Registre Civique Personnel · Maroc',
    profileTitle: 'Profil Citoyen & Quittances Fiscales Numériques',
    profileSubtitle:
      'Consultez votre badge Contribuable Vérifié, vos quittances officielles imprimables et votre historique de votes sur les marchés publics.',
    newTaxAllocationBtn: 'Nouvelle Répartition',
    registeredTaxpayerLabel: 'Contribuable Enregistré',
    cinLabel: 'CIN',
    fiscalIdLabel: 'Identifiant Fiscal',
    cancelBtn: 'Annuler',
    editDetailsBtn: 'Modifier',
    fullNameLabel: 'Nom Complet',
    nationalIdCinLabel: 'Carte Nationale (CIN)',
    cityRegionLabel: 'Ville / Région',
    saveProfileBtn: 'Enregistrer',
    totalTaxPaidLabel: 'Total Impôts Payés',
    receiptsIssuedLabel: 'Quittances Émises',
    sectorsFundedLabel: 'Secteurs Financés',
    tenderVotesLabel: 'Votes Marchés',
    cumulativeFundingLabel: 'Financement Cumulé par Secteur Public',
    statusPremiumActiveTag: 'STATUT : PREMIUM ACTIF',
    statusStandardTag: 'STATUT : STANDARD',
    verifiedTaxpayerCardTitle: '★ Contribuable Vérifié (Premium Actif)',
    standardCitizenCardTitle: 'Compte Citoyen Standard',
    verifiedTaxpayerCardDesc:
      'Votre contribution fiscale est certifiée sur le registre Daribati. Vous disposez du plein droit de vote sur les appels d’offres publics marocains.',
    standardCitizenCardDesc:
      'Complétez votre première répartition et paiement fiscal pour obtenir le badge Contribuable Vérifié et voter sur les marchés publics.',
    openTendersVotingBtn: "Accéder aux Votes d'Appels d'Offres",
    allocateAndPayToUnlockBtn: 'Répartir & Payer pour Débloquer',
    receiptHistoryTitle: 'Historique des Paiements & Quittances Officielles',
    downloadPdfBtn: 'Télécharger PDF',
    pdfDownloadedLabel: 'PDF Enregistré',
    downloadTxtBtn: 'Télécharger .txt',
    printReceiptBtn: 'Imprimer',
    noReceiptsTitle: 'Aucune quittance fiscale émise',
    noReceiptsDesc:
      'Une fois 100 % de votre impôt réparti dans les secteurs publics et le paiement validé, votre quittance officielle apparaîtra ici.',
    startTaxAllocationBtn: 'Commencer la Répartition',
    receiptSubSectorsCount: (c) => `${c} sous-secteurs`,
    receiptOrgKicker: 'Royaume du Maroc · Portail Civique Daribati',
    receiptOfficialTitle: 'Quittance Fiscale Participative',
    receiptReferenceLabel: 'Référence de Quittance :',
    verifiedTaxpayerReceiptTag: '★ Quittance Contribuable Vérifié',
    paidOnLabel: (d) => `Payée le ${d}`,
    taxpayerNameLabel: 'Nom du Contribuable',
    taxCategoryLabel: 'Catégorie Fiscale',
    paymentChannelLabel: 'Canal de Paiement',
    colSubSector: 'Sous-Secteur Public',
    colParentSector: 'Secteur Principal',
    colShare: 'Part',
    colAllocated: 'Alloué (DH)',
    totalParticipatoryAllocationRow: 'Total de la Répartition Fiscale Participative',
    yourTenderVotesTitle: "Vos Votes Vérifiés sur les Appels d'Offres",

    checkoutConfirmedTitle: 'Paiement Confirmé · Badge Contribuable Vérifié Activé',
    checkoutTitle: 'Paiement Fiscal Sécurisé Daribati',
    closeCheckoutAria: 'Fermer la fenêtre de paiement',
    allocatedAcrossSubSectors: (c) =>
      `Réparti sur ${c} sous-secteur${c > 1 ? 's' : ''} public${c > 1 ? 's' : ''} (100 % équilibré)`,
    totalAmountDueLabel: 'Montant Total à Payer',
    selectPaymentChannelLabel: 'Choisissez un Canal de Paiement Marocain',
    methodCmiLabel: 'Carte Bancaire (CMI)',
    methodCmiSub: 'Visa / Mastercard / CMI',
    methodFatouratiLabel: 'Fatourati (MTC)',
    methodFatouratiSub: 'Code Mobile PayDirect',
    methodBankLabel: 'Virement Bancaire',
    methodBankSub: 'RIB Trésorerie (TGR)',
    cardNumberLabel: 'Numéro de Carte (Passerelle CMI Simulée)',
    expiryDateLabel: "Date d'Expiration",
    cvvLabel: 'Code de Sécurité (CVV)',
    fatouratiPhoneLabel: 'Numéro Mobile Lié à Fatourati',
    fatouratiTokenLabel: 'Référence Fatourati / MTC',
    beneficiaryLabel: 'Bénéficiaire',
    beneficiaryValue: 'Trésorerie Générale du Royaume (TGR — Fonds Daribati)',
    moroccanRibLabel: 'RIB Marocain (24 chiffres)',
    transferRefLabel: 'Référence de votre Virement',
    immediatelyFundLabel: 'Votre Impôt Financera Immédiatement :',
    confirmAndPayBtn: (amt) => `Confirmer & Payer ${amt}`,
    verifyingTitle: 'Vérification auprès de la Trésorerie Générale du Royaume',
    verifyingDesc: (amt) =>
      `Allocation de ${amt} vers vos services publics choisis et émission de votre quittance numérique...`,
    premiumStatusActiveBadge: '★ Contribuable Vérifié · Statut Premium Actif',
    thankYouAllocatedTitle: (amt) => `Merci ! Votre impôt de ${amt} a été réparti.`,
    badgeUnlockedDesc:
      'Votre badge Contribuable Vérifié est désormais actif. Vous pouvez voter immédiatement sur les marchés publics marocains.',
    officialDigitalReceiptLabel: 'Quittance Fiscale Numérique Officielle',
    taxpayerLabel: 'Contribuable',
    cinCityLabel: 'CIN / Ville',
    itemizedDistributionLabel: 'Répartition Détaillée par Service Public',
    totalPaidVerifiedLabel: 'Total Payé & Certifié',
    downloadReceiptBtn: 'Télécharger la Quittance',
    voteOnTendersNowBtn: "Voter sur les Appels d'Offres",
  },

  ar: {
    pageTitle: 'ضريبتي — البوابة التشاركية للضرائب والمواطنة (المغرب)',
    brandName: 'ضريبتي',
    brandHomeAria: 'الصفحة الرئيسية لضريبتي',
    languageSelectorAria: 'اختيار لغة الموقع',
    navPrimaryAria: 'القائمة الرئيسية',
    navMobileAria: 'قائمة الهاتف',
    navAllocator: 'توزيع الضريبة',
    navAllocatorShort: 'توزيع الضريبة',
    navTenders: 'الصفقات العمومية',
    navTendersShort: 'الصفقات',
    navProfile: 'الملف والإيصال',
    navProfileShort: 'الملف',
    statusVerifiedFull: '★ دافع ضرائب موثّق (مميز)',
    statusVerifiedShort: '★ موثّق',
    statusStandard: 'مواطن عادي',
    statusStandardShort: 'عادي',
    statusVerifiedTitle: 'شارة دافع الضرائب الموثّق مفعّلة — عرض الملف والإيصالات',
    statusStandardTitle: 'أكمل أداء ضريبتك لتفعيل شارة دافع الضرائب الموثّق والتصويت على الصفقات',

    footerTitle: 'ضريبتي — البوابة التشاركية للضرائب والمواطنة (المغرب)',
    footerSubtitle:
      'توزيع شفاف للميزانية العمومية بالدرهم المغربي ومشاركة عادلة للمقاولات الصغرى والمتوسطة في الصفقات العمومية',

    toastVoteRecorded: (companyName) =>
      `تم تسجيل تصويتك الموثّق لصالح ${companyName}. تم تحديث الترتيب.`,
    toastProfileUpdated: 'تم تحديث بيانات ملف المواطن بنجاح.',
    toastPdfDownloaded: (filename) => `تم تحميل الإيصال الضريبي بصيغة PDF (${filename}).`,

    heroKicker: 'المملكة المغربية · البوابة التشاركية للضرائب',
    heroTitle: 'وجّه مساهمتك الضريبية نحو الخدمات العمومية الأكثر أولوية بالنسبة لك',
    heroSubtitle:
      'انقر على أي خزان من خزانات الخدمات العمومية التسعة أدناه لفتح قطاعاته الفرعية وتوزيع 100% من ضريبتك بالدرهم. إتمام الأداء يفتح لك حق التصويت الموثّق على الصفقات العمومية.',
    civicPoolFundedLabel: 'الصندوق المدني المموّل 2026',
    overallProgressLabel: 'نسبة التقدم الإجمالي',

    taxAssessmentAria: 'ملخص الواجب الضريبي',
    taxDeclarationTypeLabel: 'نوع التصريح الضريبي',
    totalTaxDueLabel: 'إجمالي الضريبة المستحقة (د.م)',
    presetsLabel: 'مبالغ سريعة:',
    remainingToAllocateLabel: 'المتبقي للتوزيع',
    allocatedLabel: 'الموزّع',
    ready100Label: 'جاهز 100%',
    allocate100Prompt: 'وزّع 100% لإتمام الأداء',
    sampleSplitBtn: 'توزيع مقترح',
    distributeEvenlyBtn: 'توزيع متساوٍ',
    resetBtn: 'إعادة ضبط',
    proceedToPayBtn: (amt) => `المتابعة لأداء الضريبة (${amt})`,
    ctaReadyVerifiedHint: 'شارة دافع الضرائب الموثّق مفعّلة · يصدر الإيصال فوراً',
    ctaReadyStandardHint: 'يفعّل شارة دافع الضرائب الموثّق وحق التصويت على الصفقات',
    ctaAllocateMoreHint: (rem) => `وزّع ${rem} إضافية على القطاعات الفرعية أدناه`,

    sectorsSectionAria: 'قطاعات الخدمات العمومية',
    sectorsSectionTitle: '9 خزانات لتمويل الخدمات العمومية',
    sectorsSectionSubtitle:
      'انقر على أي خزان ثلاثي الأبعاد لفتح قطاعاته الفرعية وتحديد مساهمتك الدقيقة بالدرهم.',
    collapseSubSectorsBtn: 'إغلاق القطاعات الفرعية',
    subSectorsCount: (c) => `${c} قطاعات فرعية`,
    yourTaxBadge: (amt) => `+${amt} مساهمتك`,
    collectedTargetLabel: 'المحصّل / الهدف',
    fundedPercentLabel: (pct) => `تمويل ${pct}%`,
    hideSubSectorsAction: 'إخفاء الفروع',
    allocateSubSectorsAction: 'توزيع الفروع',
    subSectorBreakdownKicker: (num) => `تفاصيل القطاعات الفرعية · القطاع 0${num}`,
    yourAllocationInSectorLabel: 'توزيعك في هذا القطاع',
    remainingTaxBillLabel: 'المتبقي من الضريبة',
    closeSubSectorPanelAria: 'إغلاق لوحة القطاعات الفرعية',
    yourContributionLabel: 'مساهمتك',
    allocateSliderAria: (name) => `تخصيص الدراهم لصالح ${name}`,
    maxBtn: 'الأقصى',
    tankTargetLabel: 'الهدف',
    tankAriaLabel: (pct, target) => `خزان التمويل بنسبة ${pct}% من الهدف ${target}`,

    breakdownAria: 'تفاصيل التوزيع الحالي',
    breakdownTitle: 'ملخص توزيع ضريبتك',
    breakdownSubtitle: (bill) => `التوزيع الدقيق لتصريحك الضريبي بقيمة ${bill} قبل الأداء.`,
    noAllocationsTitle: 'لم يتم توزيع أي قطاع فرعي بعد.',
    noAllocationsSubtitle:
      'انقر على أي من الخزانات التسعة أعلاه لتخصيص الدراهم، أو جرّب التوزيع المقترح.',
    removeAllocationAria: (name) => `إزالة التخصيص عن ${name}`,

    tendersKicker: 'الصفقات العمومية · منافسة عادلة للمقاولات الصغرى والمتوسطة',
    tendersTitle: 'الصفقات العمومية والتصويت المواطن الموزون',
    tendersSubtitle:
      'اطّلع على صفقات البناء العمومية المموّلة بضرائبك وأدلِ بصوتك الموثّق لدعم المقاولات المغربية الشفافة والصديقة للبيئة في منافستها مع الشركات الكبرى.',
    activeTendersLabel: 'الصفقات العمومية المفتوحة',
    openCountLabel: (c) => `${c} مفتوحة`,
    yourVerifiedVotesLabel: 'أصواتك الموثّقة',
    scoringFormulaAria: 'معادلة التقييم الشفاف لمنح الصفقات',
    scoringFormulaKicker: 'معادلة التقييم الشفاف لمنح الصفقات العمومية',
    scoringFormulaHeadline:
      'النقطة الإجمالية (100 نقطة) = العرض التقني والمالي (حد أقصى 85) + مكافأة تصويت المواطنين (حتى 15)',
    scoringFormulaDesc:
      'غالباً ما تحصل الشركات الكبرى على نقاط أعلى في الحجم المالي والضمانات، بينما تقدم المقاولات المحلية الصغرى والمتوسطة حلولاً بيئية أفضل وأسعاراً عادلة وفرص شغل محلية. تمنح مكافأة تصويت المواطنين (15 نقطة) مساراً عادلاً ومستحقاً للمقاولات الجادة.',
    ptsUnit: 'نقطة',
    techPriceShort: 'التقني والمالي',
    citizenBonusShort: 'مكافأة المواطنين',
    winningScoreShort: 'النقطة النهائية',
    votingLockedAria: 'تنبيه قفل التصويت',
    votingLockedTitle: 'معاينة للقراءة فقط · التصويت مقفل حالياً',
    votingLockedDesc:
      'أدِّ ضريبتك لتفعيل شارة المواطن الموثّق والتصويت على الصفقات العمومية. يمكنك تصفح جميع العروض والنتائج المباشرة أدناه الآن.',
    goToTaxAllocatorBtn: 'الذهاب إلى توزيع الضريبة',
    votingActiveAria: 'التصويت الموثّق مفعّل',
    votingActiveBanner:
      '★ شارة دافع الضرائب الموثّق مفعّلة — أدلِ بصوت موثّق واحد لكل صفقة عمومية أدناه لتحديث الترتيب المباشر.',
    projectsVotedCount: (v, t) => `تم التصويت في ${v} من ${t} مشاريع`,
    projectNumberLabel: (n) => `المشروع رقم ${n}`,
    votingClosesLabel: (d) => `يغلق التصويت في ${d}`,
    publicBudgetLabel: 'الميزانية العمومية',
    competingBidsLabel: 'العروض المتنافسة',
    competingBidsRatio: '1 كبرى · 2 مقاولات صغرى',
    totalCitizenVotesLabel: 'مجموع أصوات المواطنين',
    votesUnit: 'صوت',
    currentLeaderLabel: 'المتصدر حالياً',
    liveCompetingBidsTitle: 'العروض المتنافسة مباشرة (مرتّبة حسب النقطة الإجمالية)',
    yourVerifiedVoteCounted: 'تم احتساب صوتك الموثّق',
    leadingLabel: 'المتصدر',
    rankLabel: 'المرتبة',
    estYearLabel: (y) => `تأسست ${y}`,
    offerLabel: 'العرض',
    techPriceLabel: 'التقني/المالي:',
    citizenBonusLabel: 'مكافأة المواطنين:',
    citizenVotesShare: (votes, share) => `${votes} صوتاً مواطناً (${share}% من الأصوات)`,
    hideOfferBtn: 'إخفاء التفاصيل',
    inspectOfferBtn: 'فحص العرض',
    payTaxToVoteBtn: 'أدِّ الضريبة للتصويت',
    verifiedVoteCastBtn: 'تم تسجيل صوتك الموثّق',
    switchVoteHereBtn: 'تحويل صوتي هنا',
    castVerifiedVoteBtn: 'تصويت موثّق',
    bidOfferPriceLabel: 'قيمة العرض المالي',
    deliveryTimelineLabel: 'مدة الإنجاز',
    deliveryMonthsValue: (m) => `${m} شهراً`,
    ecoRatingLabel: 'التصنيف البيئي',
    gradeLabel: (g) => `فئة ${g}`,
    localJobsCreatedLabel: 'مناصب الشغل المحلية',
    regionalJobsValue: (j) => `${j} منصباً جهوياً`,
    credentialsLabel: 'الشهادات والاعتمادات:',

    profileKicker: 'السجل المدني الشخصي · المغرب',
    profileTitle: 'ملف المواطن وإيصالات الضريبة الرقمية',
    profileSubtitle:
      'راجع شارة دافع الضرائب الموثّق، وإيصالاتك الرسمية القابلة للطباعة، وسجل تصويتك على الصفقات العمومية.',
    newTaxAllocationBtn: 'توزيع ضريبي جديد',
    registeredTaxpayerLabel: 'دافع الضرائب المسجّل',
    cinLabel: 'ب.و.ت',
    fiscalIdLabel: 'المعرّف الضريبي',
    cancelBtn: 'إلغاء',
    editDetailsBtn: 'تعديل البيانات',
    fullNameLabel: 'الاسم الكامل',
    nationalIdCinLabel: 'رقم البطاقة الوطنية (CIN)',
    cityRegionLabel: 'المدينة / الجهة',
    saveProfileBtn: 'حفظ البيانات',
    totalTaxPaidLabel: 'إجمالي الضرائب المؤداة',
    receiptsIssuedLabel: 'الإيصالات الصادرة',
    sectorsFundedLabel: 'القطاعات المموّلة',
    tenderVotesLabel: 'أصوات الصفقات',
    cumulativeFundingLabel: 'التمويل التراكمي حسب القطاع العمومي',
    statusPremiumActiveTag: 'الحالة: حساب مميز نشط',
    statusStandardTag: 'الحالة: حساب عادي',
    verifiedTaxpayerCardTitle: '★ دافع ضرائب موثّق (مميز)',
    standardCitizenCardTitle: 'حساب مواطن عادي',
    verifiedTaxpayerCardDesc:
      'مساهمتك الضريبية موثّقة في سجل ضريبتي. تملك كامل حق التصويت في الصفقات العمومية المغربية لدعم المقاولات الشفافة.',
    standardCitizenCardDesc:
      'أكمل أول عملية توزيع وأداء لضريبتك للحصول على شارة دافع الضرائب الموثّق وفتح التصويت الموزون على الصفقات العمومية.',
    openTendersVotingBtn: 'فتح التصويت على الصفقات العمومية',
    allocateAndPayToUnlockBtn: 'وزّع وأدِّ الضريبة للتفعيل',
    receiptHistoryTitle: 'سجل الأداء والإيصالات الرقمية الرسمية',
    downloadPdfBtn: 'تحميل PDF',
    pdfDownloadedLabel: 'تم حفظ PDF',
    downloadTxtBtn: 'تحميل .txt',
    printReceiptBtn: 'طباعة الإيصال',
    noReceiptsTitle: 'لم تصدر أي إيصالات ضريبية بعد',
    noReceiptsDesc:
      'فور توزيع 100% من ضريبتك على قطاعات الخدمات العمومية وإتمام الأداء، سيظهر إيصالك الضريبي الرقمي الرسمي هنا.',
    startTaxAllocationBtn: 'ابدأ توزيع الضريبة',
    receiptSubSectorsCount: (c) => `${c} قطاعات فرعية`,
    receiptOrgKicker: 'المملكة المغربية · بوابة ضريبتي المدنية',
    receiptOfficialTitle: 'إيصال ضريبي تشاركي رسمي',
    receiptReferenceLabel: 'مرجع الإيصال:',
    verifiedTaxpayerReceiptTag: '★ إيصال دافع ضرائب موثّق',
    paidOnLabel: (d) => `تم الأداء بتاريخ ${d}`,
    taxpayerNameLabel: 'اسم دافع الضرائب',
    taxCategoryLabel: 'فئة الضريبة',
    paymentChannelLabel: 'قناة الأداء',
    colSubSector: 'القطاع الفرعي العمومي',
    colParentSector: 'القطاع الرئيسي',
    colShare: 'النسبة',
    colAllocated: 'المبلغ المخصص (د.م)',
    totalParticipatoryAllocationRow: 'إجمالي التوزيع الضريبي التشاركي',
    yourTenderVotesTitle: 'أصواتك الموثّقة في الصفقات العمومية',

    checkoutConfirmedTitle: 'تم تأكيد الأداء · تم تفعيل شارة المواطن المميز',
    checkoutTitle: 'بوابة الأداء الضريبي الآمن — ضريبتي',
    closeCheckoutAria: 'إغلاق نافذة الأداء',
    allocatedAcrossSubSectors: (c) => `موزّع على ${c} قطاعات فرعية عمومية (مطابق 100%)`,
    totalAmountDueLabel: 'المبلغ الإجمالي المستحق',
    selectPaymentChannelLabel: 'اختر قناة الأداء المغربية',
    methodCmiLabel: 'البطاقة البنكية (CMI)',
    methodCmiSub: 'Visa / Mastercard / CMI',
    methodFatouratiLabel: 'فاتورتي (MTC)',
    methodFatouratiSub: 'رمز الدفع عبر الهاتف',
    methodBankLabel: 'تحويل بنكي',
    methodBankSub: 'رقم RIB للخزينة العامة',
    cardNumberLabel: 'رقم البطاقة (محاكاة بوابة CMI)',
    expiryDateLabel: 'تاريخ الانتهاء',
    cvvLabel: 'رمز الأمان (CVV)',
    fatouratiPhoneLabel: 'رقم الهاتف المرتبط بخدمة فاتورتي',
    fatouratiTokenLabel: 'مرجع فاتورتي / MTC',
    beneficiaryLabel: 'المستفيد',
    beneficiaryValue: 'الخزينة العامة للمملكة (TGR — صندوق ضريبتي)',
    moroccanRibLabel: 'رقم الحساب البنكي المغربي RIB (24 رقماً)',
    transferRefLabel: 'مرجع التحويل البنكي',
    immediatelyFundLabel: 'ستموّل ضريبتك فوراً:',
    confirmAndPayBtn: (amt) => `تأكيد وأداء ${amt}`,
    verifyingTitle: 'جارٍ التحقق من العملية مع بوابة الخزينة العامة للمملكة',
    verifyingDesc: (amt) =>
      `جارٍ تخصيص ${amt} للخدمات العمومية التي اخترتها وإصدار إيصالك الضريبي الرقمي...`,
    premiumStatusActiveBadge: '★ دافع ضرائب موثّق · الوضع المميز نشط',
    thankYouAllocatedTitle: (amt) => `شكراً لك! تم توزيع ضريبتك بقيمة ${amt}.`,
    badgeUnlockedDesc:
      'تم تفعيل شارة المواطن الموثّق بنجاح. يمكنك الآن التصويت مباشرة على الصفقات العمومية المغربية.',
    officialDigitalReceiptLabel: 'إيصال ضريبي رقمي رسمي',
    taxpayerLabel: 'دافع الضرائب',
    cinCityLabel: 'ب.و.ت / المدينة',
    itemizedDistributionLabel: 'التوزيع المفصل على الخدمات العمومية',
    totalPaidVerifiedLabel: 'الإجمالي المؤدى والموثّق',
    downloadReceiptBtn: 'تحميل الإيصال',
    voteOnTendersNowBtn: 'صوّت على الصفقات العمومية الآن',
  },
};

export const TAX_CATEGORY_TRANSLATIONS: Record<Locale, Record<TaxCategory, string>> = {
  en: {
    'IR — Impôt sur le Revenu': 'IR — Income Tax (Impôt sur le Revenu)',
    "Taxe d'Habitation": "Housing Tax (Taxe d'Habitation)",
    'Taxe Professionnelle': 'Professional Tax (Taxe Professionnelle)',
    'Combined Annual Civic Tax': 'Combined Annual Civic Tax',
  },
  fr: {
    'IR — Impôt sur le Revenu': 'IR — Impôt sur le Revenu',
    "Taxe d'Habitation": "Taxe d'Habitation",
    'Taxe Professionnelle': 'Taxe Professionnelle',
    'Combined Annual Civic Tax': 'Contribution Civique Annuelle Combinée',
  },
  ar: {
    'IR — Impôt sur le Revenu': 'الضريبة على الدخل (IR)',
    "Taxe d'Habitation": 'رسم السكن',
    'Taxe Professionnelle': 'الرسم المهني',
    'Combined Annual Civic Tax': 'الضريبة المدنية السنوية الموحّدة',
  },
};

export const PAYMENT_METHOD_TRANSLATIONS: Record<Locale, Record<PaymentMethod, string>> = {
  en: {
    cmi_card: 'Moroccan Bank Card (CMI)',
    fatourati: 'Fatourati (MTC PayDirect)',
    bank_transfer: 'Moroccan Bank Transfer (TGR RIB)',
  },
  fr: {
    cmi_card: 'Carte Bancaire Marocaine (CMI)',
    fatourati: 'Fatourati (MTC PayDirect)',
    bank_transfer: 'Virement Bancaire Marocain (RIB TGR)',
  },
  ar: {
    cmi_card: 'البطاقة البنكية المغربية (CMI)',
    fatourati: 'فاتورتي (MTC PayDirect)',
    bank_transfer: 'تحويل بنكي مغربي (RIB الخزينة العامة)',
  },
};

export const SECTOR_TRANSLATIONS: Record<
  Locale,
  Record<string, { title: string; shortTitle: string }>
> = {
  en: {
    'public-safety': { title: 'Public Safety and Emergency Services', shortTitle: 'Public Safety' },
    healthcare: { title: 'Healthcare and Public Health', shortTitle: 'Healthcare' },
    education: { title: 'Education and Training', shortTitle: 'Education' },
    'social-services': { title: 'Social Services and Welfare', shortTitle: 'Social Services' },
    transportation: { title: 'Transportation and Infrastructure', shortTitle: 'Transportation' },
    utilities: { title: 'Utilities and Environmental Services', shortTitle: 'Utilities & Env.' },
    governance: { title: 'Governance, Legal, & Civic Services', shortTitle: 'Governance & Legal' },
    'community-culture': { title: 'Community and Cultural Services', shortTitle: 'Community & Culture' },
    'economic-dev': { title: 'Economic and Development Services', shortTitle: 'Economic Dev.' },
  },
  fr: {
    'public-safety': { title: "Sécurité Publique et Services d'Urgence", shortTitle: 'Sécurité Publique' },
    healthcare: { title: 'Santé et Santé Publique', shortTitle: 'Santé' },
    education: { title: 'Éducation et Formation', shortTitle: 'Éducation' },
    'social-services': { title: 'Services Sociaux et Solidarité', shortTitle: 'Services Sociaux' },
    transportation: { title: 'Transports et Infrastructures', shortTitle: 'Transports' },
    utilities: { title: 'Services Publics et Environnement', shortTitle: 'Eau & Environnement' },
    governance: { title: 'Gouvernance, Justice et Services Civiques', shortTitle: 'Gouvernance & Justice' },
    'community-culture': { title: 'Services Communautaires et Culture', shortTitle: 'Culture & Loisirs' },
    'economic-dev': { title: 'Développement Économique et Urbain', shortTitle: 'Dév. Économique' },
  },
  ar: {
    'public-safety': { title: 'الأمن العمومي وخدمات الطوارئ', shortTitle: 'الأمن والطوارئ' },
    healthcare: { title: 'الصحة والرعاية الصحية العمومية', shortTitle: 'الصحة العمومية' },
    education: { title: 'التعليم والتكوين', shortTitle: 'التعليم والتكوين' },
    'social-services': { title: 'الخدمات الاجتماعية والتضامن', shortTitle: 'الخدمات الاجتماعية' },
    transportation: { title: 'النقل والبنية التحتية', shortTitle: 'النقل والبنية التحتية' },
    utilities: { title: 'المرافق العمومية والبيئة', shortTitle: 'المرافق والبيئة' },
    governance: { title: 'الحكامة والعدالة والخدمات المدنية', shortTitle: 'الحكامة والعدالة' },
    'community-culture': { title: 'الخدمات المجتمعية والثقافية', shortTitle: 'الثقافة والمجتمع' },
    'economic-dev': { title: 'التنمية الاقتصادية والتعمير', shortTitle: 'التنمية الاقتصادية' },
  },
};

export const SUB_SECTOR_TRANSLATIONS: Record<
  Locale,
  Record<string, { name: string; description: string }>
> = {
  en: {
    'ps-police': { name: 'Police and law enforcement', description: 'Community policing, urban patrol stations, and modern dispatch centers.' },
    'ps-fire': { name: 'Firefighting services', description: 'Protection Civile fire trucks, forest wildfire rapid-response gear.' },
    'ps-ems': { name: 'Emergency medical services (EMS) and paramedics', description: 'Equipped SAMU ambulances, paramedic units, and rural air-rescue.' },
    'ps-disaster': { name: 'Disaster relief and emergency shelters', description: 'Seismic preparedness, flood response depots, and emergency shelters.' },
    'hc-hospitals': { name: 'Public hospitals and clinics', description: 'CHU regional hospital equipment, maternity wards, and local clinics.' },
    'hc-vaccination': { name: 'Vaccination programs', description: 'National childhood immunization campaigns and cold-chain logistics.' },
    'hc-mental': { name: 'Mental health & addiction services', description: 'Outpatient counseling centers, youth support, and rehabilitation care.' },
    'hc-sanitation': { name: 'Public health & sanitation', description: 'Preventive medicine, rural hygiene infrastructure, and disease screening.' },
    'ed-k12': { name: 'Public schools (K–12)', description: 'Modern classrooms, rural school transport, and digital learning labs.' },
    'ed-univ': { name: 'Public universities & colleges', description: 'Campus research laboratories, student dormitories, and STEM faculties.' },
    'ed-vocational': { name: 'Vocational & adult education', description: 'OFPPT technical workshops, industrial apprenticeships, and literacy.' },
    'ss-housing': { name: 'Housing & retirement homes', description: 'Social housing subsidies and dignified senior care residences.' },
    'ss-youth': { name: 'Unemployment & youth jobs', description: 'First-job placement stipends and regional youth employment hubs.' },
    'ss-family': { name: 'Child & family services', description: 'Early childhood nurseries, family protection, and maternal assistance.' },
    'ss-food': { name: 'Food assistance & social security', description: 'Direct household solidarity transfers and nutritional support funds.' },
    'tr-roads': { name: 'Roads, bridges & traffic', description: 'Rural road paving, highway resurfacing, bridges, and smart signaling.' },
    'tr-transit': { name: 'Public transit (buses/trains)', description: 'Electric municipal bus fleets, urban tramways, and regional rail links.' },
    'tr-airports': { name: 'Airports & maintenance', description: 'Regional terminal upgrades, runway safety, and cargo modernization.' },
    'ut-water': { name: 'Water supply & sewer systems', description: 'Desalination interconnects, leak reduction, and rural drinking water.' },
    'ut-waste': { name: 'Waste & recycling services', description: 'Sorting plants, clean municipal collection fleets, and composting.' },
    'ut-cleanup': { name: 'Environmental cleanup', description: 'Coastal preservation, oued restoration, and urban reforestation.' },
    'ut-electricity': { name: 'Electricity & public utilities', description: 'LED street lighting, rural solar microgrids, and grid resilience.' },
    'gv-courts': { name: 'Courts & legal aid', description: 'Digitized court dockets, free citizen legal aid, and mediation centers.' },
    'gv-policy': { name: 'Public policy & accountability', description: 'Independent budget audits, open-data portals, and tender oversight.' },
    'gv-elections': { name: 'Elections & civic participation', description: 'Municipal town halls, participatory budgeting, and voter registry tools.' },
    'gv-cyber': { name: 'Cybersecurity & data protection', description: 'National e-gov infrastructure defense and citizen privacy compliance.' },
    'cc-libraries': { name: 'Libraries & museums', description: 'Public media libraries, heritage conservation, and national museums.' },
    'cc-parks': { name: 'Parks & nature reserves', description: 'Neighborhood green parks, botanical gardens, and Atlas eco-reserves.' },
    'cc-broadcast': { name: 'Public broadcasting', description: 'Educational documentaries, Amazigh & Arabic cultural programming.' },
    'ec-urban': { name: 'Community & urban planning', description: 'Sustainable zoning, pedestrian boulevards, and medina rehabilitation.' },
    'ec-employment': { name: 'Employment & vocational programs', description: 'SME innovation incubators, artisan cooperatives, and export grants.' },
    'ec-regulatory': { name: 'Monetary & regulatory bodies', description: 'Fair competition monitoring, consumer safety, and market standards.' },
  },
  fr: {
    'ps-police': { name: 'Police et maintien de l’ordre', description: 'Police de proximité, commissariats urbains et centres de commandement modernes.' },
    'ps-fire': { name: 'Services de lutte contre l’incendie', description: 'Camions de la Protection Civile et équipements d’intervention rapide contre les feux.' },
    'ps-ems': { name: 'Secours médicaux d’urgence (SAMU)', description: 'Ambulances SAMU équipées, unités paramédicales et secours héliportés ruraux.' },
    'ps-disaster': { name: 'Gestion des catastrophes et abris', description: 'Prévention sismique, dépôts anti-inondations et centres d’hébergement d’urgence.' },
    'hc-hospitals': { name: 'Hôpitaux publics et cliniques', description: 'Équipements des CHU régionaux, maternités et centres de santé de proximité.' },
    'hc-vaccination': { name: 'Programmes de vaccination', description: 'Campagnes nationales de vaccination infantile et logistique de la chaîne du froid.' },
    'hc-mental': { name: 'Santé mentale et addictologie', description: 'Centres d’écoute ambulatoires, soutien aux jeunes et soins de réhabilitation.' },
    'hc-sanitation': { name: 'Santé publique et assainissement', description: 'Médecine préventive, hygiène en milieu rural et dépistage sanitaire.' },
    'ed-k12': { name: 'Écoles publiques (Primaire au Lycée)', description: 'Classes modernes, transport scolaire rural et laboratoires numériques.' },
    'ed-univ': { name: 'Universités et facultés publiques', description: 'Laboratoires de recherche, cités universitaires et pôles scientifiques.' },
    'ed-vocational': { name: 'Formation professionnelle (OFPPT)', description: 'Ateliers techniques OFPPT, apprentissage industriel et alphabétisation.' },
    'ss-housing': { name: 'Logement social et maisons de retraite', description: 'Aides au logement social et résidences dignes pour personnes âgées.' },
    'ss-youth': { name: 'Emploi des jeunes et insertion', description: 'Bourses premier emploi et pôles régionaux d’accompagnement des jeunes.' },
    'ss-family': { name: 'Protection de l’enfance et famille', description: 'Crèches publiques, protection familiale et accompagnement maternel.' },
    'ss-food': { name: 'Aide alimentaire et protection sociale', description: 'Transferts directs de solidarité aux ménages et fonds de soutien nutritionnel.' },
    'tr-roads': { name: 'Routes, ponts et circulation', description: 'Désenclavement rural, revêtement routier, ponts et signalisation intelligente.' },
    'tr-transit': { name: 'Transports en commun (bus/trains)', description: 'Bus municipaux électriques, tramways urbains et liaisons ferroviaires régionales.' },
    'tr-airports': { name: 'Aéroports et maintenance', description: 'Modernisation des terminaux régionaux, sécurité des pistes et fret.' },
    'ut-water': { name: 'Eau potable et assainissement', description: 'Interconnexions de dessalement, réduction des fuites et eau potable rurale.' },
    'ut-waste': { name: 'Gestion des déchets et recyclage', description: 'Centres de tri, flottes municipales propres et unités de compostage.' },
    'ut-cleanup': { name: 'Dépollution et environnement', description: 'Protection du littoral, réhabilitation des oueds et reboisement urbain.' },
    'ut-electricity': { name: 'Électricité et éclairage public', description: 'Éclairage public LED, micro-réseaux solaires ruraux et résilience électrique.' },
    'gv-courts': { name: 'Tribunaux et aide juridictionnelle', description: 'Dossiers judiciaires numérisés, aide juridique gratuite et médiation.' },
    'gv-policy': { name: 'Politiques publiques et reddition de comptes', description: 'Audits budgétaires indépendants, données ouvertes et suivi des marchés.' },
    'gv-elections': { name: 'Élections et participation citoyenne', description: 'Assemblées municipales, budgets participatifs et registres électoraux.' },
    'gv-cyber': { name: 'Cybersécurité et protection des données', description: 'Défense des infrastructures e-gov nationales et protection de la vie privée.' },
    'cc-libraries': { name: 'Bibliothèques et musées', description: 'Médiathèques publiques, sauvegarde du patrimoine et musées nationaux.' },
    'cc-parks': { name: 'Parcs et réserves naturelles', description: 'Parcs urbains de quartier, jardins botaniques et réserves de l’Atlas.' },
    'cc-broadcast': { name: 'Audiovisuel public culturel', description: 'Documentaires éducatifs et programmes culturels arabes et amazighs.' },
    'ec-urban': { name: 'Urbanisme et aménagement', description: 'Zonage durable, boulevards piétons et réhabilitation des médinas.' },
    'ec-employment': { name: 'Emploi et appui aux PME', description: 'Incubateurs d’innovation PME, coopératives artisanales et aides à l’export.' },
    'ec-regulatory': { name: 'Régulation et concurrence', description: 'Contrôle de la concurrence loyale, sécurité des consommateurs et normes.' },
  },
  ar: {
    'ps-police': { name: 'الشرطة وإنفاذ القانون', description: 'شرطة القرب، مراكز الدوريات الحضرية، ومراكز القيادة والتوجيه الحديثة.' },
    'ps-fire': { name: 'خدمات الوقاية المدنية والإطفاء', description: 'شاحنات الإطفاء وتجهيزات التدخل السريع لمكافحة حرائق الغابات.' },
    'ps-ems': { name: 'الإسعاف الطبي الاستعجالي (SAMU)', description: 'سيارات إسعاف مجهزة، وحدات مسعفين، وخدمات الإنقاذ الجوي القروي.' },
    'ps-disaster': { name: 'الإغاثة من الكوارث ومراكز الإيواء', description: 'الاستعداد للزلازل، مستودعات مواجهة الفيضانات، ومراكز الإيواء الاستعجالي.' },
    'hc-hospitals': { name: 'المستشفيات العمومية والمراكز الصحية', description: 'تجهيز المستشفيات الجامعية والجهوية وأقسام الولادة والعيادات المحلية.' },
    'hc-vaccination': { name: 'برامج التلقيح الوطنية', description: 'حملات تلقيح الأطفال الوطنية ولوجستيك سلسلة التبريد.' },
    'hc-mental': { name: 'الصحة النفسية ومحاربة الإدمان', description: 'مراكز الاستشارة النفسية، دعم الشباب، وبرامج التأهيل العلاجي.' },
    'hc-sanitation': { name: 'الصحة الوقائية والنظافة العمومية', description: 'الطب الوقائي، البنية الصحية القروية، وبرامج الكشف المبكر.' },
    'ed-k12': { name: 'المدارس العمومية (الابتدائي إلى الثانوي)', description: 'حجرات دراسية حديثة، النقل المدرسي القروي، ومختبرات التعلم الرقمي.' },
    'ed-univ': { name: 'الجامعات والكليات العمومية', description: 'مختبرات البحث الجامعي، الأحياء الجامعية، وكليات العلوم والهندسة.' },
    'ed-vocational': { name: 'التكوين المهني وتعليم الكبار', description: 'ورشات التكوين المهني (OFPPT)، التدرج الصناعي، ومحاربة الأمية.' },
    'ss-housing': { name: 'السكن الاجتماعي ودور المسنين', description: 'دعم السكن الاجتماعي ومؤسسات رعاية كريمة لكبار السن.' },
    'ss-youth': { name: 'تشغيل الشباب ومحاربة البطالة', description: 'منح الإدماج المهني الأول ومراكز تشغيل الشباب بالجهات.' },
    'ss-family': { name: 'خدمات الطفولة والأسرة', description: 'حضانات الطفولة المبكرة، حماية الأسرة، ودعم الأمهات.' },
    'ss-food': { name: 'الدعم الغذائي والحماية الاجتماعية', description: 'التحويلات التضامنية المباشرة للأسر وصناديق الدعم الغذائي.' },
    'tr-roads': { name: 'الطرق والقناطر وحركة المرور', description: 'فك العزلة القروية، صيانة الطرق السيارة والقناطر، والإشارات الذكية.' },
    'tr-transit': { name: 'النقل العمومي (الحافلات والقطارات)', description: 'أساطيل حافلات كهربائية، الترامواي الحضري، والربط السككي الجهوي.' },
    'tr-airports': { name: 'المطارات وصيانتها', description: 'تحديث المحطات الجوية الجهوية، سلامة المدارج، وتطوير الشحن الجوي.' },
    'ut-water': { name: 'الماء الصالح للشرب والتطهير', description: 'ربط محطات تحلية المياه، تقليص التسربات، وتزويد القرى بالماء الشروب.' },
    'ut-waste': { name: 'النفايات وإعادة التدوير', description: 'محطات الفرز، أساطيل جمع نظيفة، ووحدات التسميد العضوي.' },
    'ut-cleanup': { name: 'التطهير البيئي وحماية السواحل', description: 'حماية الشواطئ، تأهيل الأودية، والتشجير الحضري.' },
    'ut-electricity': { name: 'الكهرباء والإنارة العمومية', description: 'الإنارة العمومية بتقنية LED، الشبكات الشمسية القروية، وتعزيز الشبكة.' },
    'gv-courts': { name: 'المحاكم والمساعدة القضائية', description: 'رقمنة الملفات القضائية، المساعدة القانونية المجانية، ومراكز الوساطة.' },
    'gv-policy': { name: 'السياسات العمومية والمساءلة', description: 'افتحاص الميزانيات المستقل، بوابات البيانات المفتوحة، ومراقبة الصفقات.' },
    'gv-elections': { name: 'الانتخابات والمشاركة المواطنة', description: 'اللقاءات التشاورية المحلية، الميزانيات التشاركية، وأدوات التسجيل.' },
    'gv-cyber': { name: 'الأمن السيبراني وحماية المعطيات', description: 'حماية البنية التحتية الرقمية الوطنية وضمان خصوصية بيانات المواطنين.' },
    'cc-libraries': { name: 'المكتبات العمومية والمتاحف', description: 'الوسائطيات العمومية، حفظ التراث الوطني، والمتاحف.' },
    'cc-parks': { name: 'الحدائق والمحميات الطبيعية', description: 'المنتزهات الحضرية، الحدائق النباتية، ومحميات الأطلس البيئية.' },
    'cc-broadcast': { name: 'الإعلام العمومي والثقافي', description: 'الوثائقيات التربوية والبرامج الثقافية بالعربية والأمازيغية.' },
    'ec-urban': { name: 'التعمير والتخطيط الحضري', description: 'التهيئة المستدامة، الشوارع المخصصة للراجلين، وتأهيل المدن العتيقة.' },
    'ec-employment': { name: 'برامج التشغيل ودعم المقاولات', description: 'حاضنات ابتكار المقاولات الصغرى، التعاونيات الحرفية، ومنح التصدير.' },
    'ec-regulatory': { name: 'الهيئات التنظيمية والمنافسة', description: 'مراقبة المنافسة النزيهة، سلامة المستهلك، ومعايير السوق.' },
  },
};

export const TENDER_TRANSLATIONS: Record<
  Locale,
  Record<
    string,
    { title: string; region: string; sectorTitle: string; deadlineDate: string; summary: string }
  >
> = {
  en: {
    'tender-fes-highschool': {
      title: 'Construction of a Modern Public High School in Fès-Meknès',
      region: 'Fès-Meknès',
      sectorTitle: 'Education and Training',
      deadlineDate: '15 Dec 2026',
      summary:
        '24-classroom bioclimatic public lycée with science laboratories, digital media library, solar rooftop shading, and accessible sports courtyard serving 1,100 students.',
    },
    'tender-solar-clinic': {
      title: 'Solar-Powered Rural Clinic Upgrade (Drâa-Tafilalet)',
      region: 'Drâa-Tafilalet',
      sectorTitle: 'Healthcare and Public Health',
      deadlineDate: '22 Dec 2026',
      summary:
        'Complete modernization of a primary maternity and emergency clinic with 100% off-grid solar storage, vaccine cold-chain autonomy, and telemedicine consultation room.',
    },
    'tender-water-network': {
      title: 'Smart Water Distribution & Leak-Detection Network (Souss-Massa)',
      region: 'Souss-Massa',
      sectorTitle: 'Utilities and Environmental Services',
      deadlineDate: '08 Jan 2027',
      summary:
        'Rehabilitation of 18 km of municipal potable water piping with acoustic IoT pressure sensors designed to cut network water losses by 34% across peri-urban communes.',
    },
  },
  fr: {
    'tender-fes-highschool': {
      title: 'Construction d’un Lycée Public Moderne à Fès-Meknès',
      region: 'Fès-Meknès',
      sectorTitle: 'Éducation et Formation',
      deadlineDate: '15 déc. 2026',
      summary:
        'Lycée public bioclimatique de 24 salles avec laboratoires scientifiques, médiathèque numérique, ombrières solaires et cour sportive accessible pour 1 100 élèves.',
    },
    'tender-solar-clinic': {
      title: 'Modernisation Solaire d’un Dispensaire Rural (Drâa-Tafilalet)',
      region: 'Drâa-Tafilalet',
      sectorTitle: 'Santé et Santé Publique',
      deadlineDate: '22 déc. 2026',
      summary:
        'Mise à niveau complète d’un centre de maternité et d’urgences avec autonomie solaire hors réseau à 100 %, chaîne du froid vaccinale et salle de télémédecine.',
    },
    'tender-water-network': {
      title: 'Réseau Intelligent d’Eau Potable et Détection de Fuites (Souss-Massa)',
      region: 'Souss-Massa',
      sectorTitle: 'Services Publics et Environnement',
      deadlineDate: '08 janv. 2027',
      summary:
        'Réhabilitation de 18 km de conduites d’eau potable avec capteurs acoustiques IoT afin de réduire de 34 % les pertes hydriques dans les communes périurbaines.',
    },
  },
  ar: {
    'tender-fes-highschool': {
      title: 'بناء ثانوية تأهيلية عمومية حديثة بجهة فاس-مكناس',
      region: 'فاس-مكناس',
      sectorTitle: 'التعليم والتكوين',
      deadlineDate: '15 دجنبر 2026',
      summary:
        'ثانوية عمومية بيومناخية تضم 24 قاعة دراسية، مختبرات علمية، مكتبة رقمية، مظلات شمسية فوق السطح، وساحة رياضية مهيأة لـ 1,100 تلميذ وتلميذة.',
    },
    'tender-solar-clinic': {
      title: 'تأهيل مستوصف قروي بالطاقة الشمسية (درعة-تافيلالت)',
      region: 'درعة-تافيلالت',
      sectorTitle: 'الصحة والرعاية الصحية العمومية',
      deadlineDate: '22 دجنبر 2026',
      summary:
        'تحديث شامل لمركز الولادة والمستعجلات القروي مع استقلالية شمسية كاملة وتخزين للطاقة، سلسلة تبريد للقاحات، وقاعة للاستشارة الطبية عن بُعد.',
    },
    'tender-water-network': {
      title: 'شبكة ذكية لتوزيع الماء وكشف التسربات (سوس-ماسة)',
      region: 'سوس-ماسة',
      sectorTitle: 'المرافق العمومية والبيئة',
      deadlineDate: '08 يناير 2027',
      summary:
        'إعادة تأهيل 18 كلم من قنوات الماء الصالح للشرب وتزويدها بمستشعرات ضغط صوتية ذكية لتقليص ضياع المياه بنسبة 34% بالجماعات شبه الحضرية.',
    },
  },
};

export const BID_TRANSLATIONS: Record<
  Locale,
  Record<
    string,
    { enterpriseType: string; city: string; certifications: string; summary: string }
  >
> = {
  en: {
    'bid-atlas-megabuild': {
      enterpriseType: 'Large Corporate',
      city: 'Casablanca',
      certifications: 'ISO 9001 · Class 1 BTP',
      summary:
        'Standardized turnkey concrete school model backed by nationwide procurement fleets. Highest financial capitalization, with majority outsourced sub-contracting.',
    },
    'bid-fes-greenbuild': {
      enterpriseType: 'Local SME',
      city: 'Fès',
      certifications: 'HQE Maroc · PME Engagée',
      summary:
        'Regional eco-construction SME using passive thermal limestone insulation, rainwater harvesting for olive courtyards, and 90% local Fès-Meknès craftspeople.',
    },
    'bid-alomrane-youth': {
      enterpriseType: 'Local SME',
      city: 'Meknès',
      certifications: 'ISO 14001 · Young Engineers Coop',
      summary:
        'Civil engineering SME founded by ENSAM Meknès graduates offering modular smart classrooms, open public site cameras, and an apprentice training quota.',
    },
    'bid-maghreb-infragroup': {
      enterpriseType: 'Large Corporate',
      city: 'Rabat',
      certifications: 'ISO 9001 · National Medical BTP',
      summary:
        'Large infrastructure group with strong supply-chain warranties and standardized clinic fit-out package imported through central Casablanca logistics.',
    },
    'bid-ouarzazate-sunmed': {
      enterpriseType: 'Local SME',
      city: 'Ouarzazate',
      certifications: 'MASEN Solar Certified · Local SME',
      summary:
        'Specialist desert-climate solar & medical SME providing 72-hour lithium battery autonomy, sandstone thermal walls, and 5-year free on-site technician maintenance.',
    },
    'bid-tafilalet-ecohealth': {
      enterpriseType: 'Local SME',
      city: 'Errachidia',
      certifications: 'Green Building SME · CNSS Compliant',
      summary:
        'Errachidia-based engineering team prioritizing shaded patient waiting gardens, locally quarried stone masonry, and rapid 9-month phased delivery with zero clinic downtime.',
    },
    'bid-omnium-hydromaroc': {
      enterpriseType: 'Large Corporate',
      city: 'Casablanca',
      certifications: 'ISO 9001 · Class 1 Hydraulics',
      summary:
        'Established multinational hydraulic contractor offering proprietary SCADA monitoring and extensive corporate bonding capacity.',
    },
    'bid-agadir-aquatech': {
      enterpriseType: 'Local SME',
      city: 'Agadir',
      certifications: 'Open-Data Hydro · PME Innovante',
      summary:
        'Souss-Massa hydraulic SME deploying open-standard leak telemetry visible on municipal dashboards, cutting maintenance lock-in costs by 40% while hiring local engineers.',
    },
    'bid-argania-civil': {
      enterpriseType: 'Local SME',
      city: 'Taroudant',
      certifications: 'ISO 14001 · Regional SME',
      summary:
        'Taroudant civil engineering cooperative specializing in trenchless pipe replacement to minimize road disruptions for local merchants and rural water associations.',
    },
  },
  fr: {
    'bid-atlas-megabuild': {
      enterpriseType: 'Grande Entreprise',
      city: 'Casablanca',
      certifications: 'ISO 9001 · BTP Classe 1',
      summary:
        'Modèle scolaire béton clé en main standardisé soutenu par une flotte nationale. Forte capitalisation financière avec sous-traitance majoritaire.',
    },
    'bid-fes-greenbuild': {
      enterpriseType: 'PME Locale',
      city: 'Fès',
      certifications: 'HQE Maroc · PME Engagée',
      summary:
        'PME régionale d’éco-construction utilisant une isolation thermique en pierre calcaire, récupération des eaux pluviales et 90 % d’artisans de Fès-Meknès.',
    },
    'bid-alomrane-youth': {
      enterpriseType: 'PME Locale',
      city: 'Meknès',
      certifications: 'ISO 14001 · Coopérative Jeunes Ingénieurs',
      summary:
        'PME de génie civil fondée par des lauréats de l’ENSAM Meknès proposant des classes modulaires intelligentes, caméras de chantier publiques et quotas d’apprentis.',
    },
    'bid-maghreb-infragroup': {
      enterpriseType: 'Grande Entreprise',
      city: 'Rabat',
      certifications: 'ISO 9001 · BTP Médical National',
      summary:
        'Grand groupe d’infrastructures offrant des garanties fournisseurs solides et un aménagement médical standardisé importé via Casablanca.',
    },
    'bid-ouarzazate-sunmed': {
      enterpriseType: 'PME Locale',
      city: 'Ouarzazate',
      certifications: 'Certifiée Solaire MASEN · PME Locale',
      summary:
        'PME spécialisée en énergie solaire désertique garantissant 72 h d’autonomie lithium, murs thermiques en grès et 5 ans de maintenance gratuite sur site.',
    },
    'bid-tafilalet-ecohealth': {
      enterpriseType: 'PME Locale',
      city: 'Errachidia',
      certifications: 'PME Bâtiment Vert · Conforme CNSS',
      summary:
        'Équipe d’ingénierie basée à Errachidia privilégiant des jardins d’attente ombragés, de la pierre locale et une livraison phasée en 9 mois sans interruption des soins.',
    },
    'bid-omnium-hydromaroc': {
      enterpriseType: 'Grande Entreprise',
      city: 'Casablanca',
      certifications: 'ISO 9001 · Hydraulique Classe 1',
      summary:
        'Opérateur hydraulique multinational proposant une supervision SCADA propriétaire et une très large capacité de cautionnement.',
    },
    'bid-agadir-aquatech': {
      enterpriseType: 'PME Locale',
      city: 'Agadir',
      certifications: 'Hydro Open-Data · PME Innovante',
      summary:
        'PME hydraulique de Souss-Massa déployant une télémétrie ouverte de détection des fuites visible sur les tableaux municipaux, réduisant de 40 % les coûts de maintenance.',
    },
    'bid-argania-civil': {
      enterpriseType: 'PME Locale',
      city: 'Taroudant',
      certifications: 'ISO 14001 · PME Régionale',
      summary:
        'Coopérative de génie civil de Taroudant spécialisée dans le renouvellement sans tranchée afin de limiter l’impact sur les commerçants et associations rurales.',
    },
  },
  ar: {
    'bid-atlas-megabuild': {
      enterpriseType: 'شركة كبرى',
      city: 'الدار البيضاء',
      certifications: 'ISO 9001 · البناء الفئة 1',
      summary:
        'نموذج مدرسي خرساني جاهز مدعوم بأسطول توريد وطني وقدرة مالية مرتفعة، مع اعتماد كبير على المناولة الخارجية.',
    },
    'bid-fes-greenbuild': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'فاس',
      certifications: 'HQE المغرب · مقاولة ملتزمة',
      summary:
        'مقاولة جهوية للبناء الإيكولوجي تعتمد العزل الحراري الطبيعي بالحجر الجيري وتجميع مياه الأمطار وتشغيل 90% من حرفيي فاس-مكناس.',
    },
    'bid-alomrane-youth': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'مكناس',
      certifications: 'ISO 14001 · تعاونية مهندسين شباب',
      summary:
        'مقاولة للهندسة المدنية أسسها خريجو ENSAM مكناس توفر قاعات ذكية مرنة وكاميرات شفافة لمتابعة الورش وحصة لتدريب المتدربين.',
    },
    'bid-maghreb-infragroup': {
      enterpriseType: 'شركة كبرى',
      city: 'الرباط',
      certifications: 'ISO 9001 · البناء الطبي الوطني',
      summary:
        'مجموعة كبرى للبنية التحتية توفر ضمانات توريد قوية وتجهيزات طبية قياسية عبر اللوجستيك المركزي بالدار البيضاء.',
    },
    'bid-ouarzazate-sunmed': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'ورزازات',
      certifications: 'معتمدة طاقياً MASEN · مقاولة محلية',
      summary:
        'مقاولة متخصصة في الطاقة الشمسية الصحراوية والتجهيز الطبي توفر استقلالية بطاريات لمدة 72 ساعة وجدراناً عازلة وصيانة مجانية لـ 5 سنوات.',
    },
    'bid-tafilalet-ecohealth': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'الرشيدية',
      certifications: 'مقاولة البناء الأخضر · معتمدة CNSS',
      summary:
        'فريق هندسي من الرشيدية يركز على فضاءات انتظار مظللة وبناء بالحجر المحلي وإنجاز مرحلي خلال 9 أشهر دون توقف خدمات المستوصف.',
    },
    'bid-omnium-hydromaroc': {
      enterpriseType: 'شركة كبرى',
      city: 'الدار البيضاء',
      certifications: 'ISO 9001 · الهيدروليك الفئة 1',
      summary:
        'شركة هيدروليكية متعددة الفروع توفر نظام مراقبة SCADA مملوكاً لها وقدرة ضمان مالي عالية.',
    },
    'bid-agadir-aquatech': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'أكادير',
      certifications: 'بيانات مائية مفتوحة · مقاولة مبتكرة',
      summary:
        'مقاولة مائية بسوس-ماسة تنشر منظومة مفتوحة لكشف التسربات متاحة للبلديات، مما يخفض كلفة الصيانة بـ 40% مع توظيف مهندسين محليين.',
    },
    'bid-argania-civil': {
      enterpriseType: 'مقاولة محلية صغرى',
      city: 'تارودانت',
      certifications: 'ISO 14001 · مقاولة جهوية',
      summary:
        'تعاونية للهندسة المدنية بتارودانت متخصصة في تجديد القنوات دون حفر واسع لتفادي عرقلة حركة التجار وجمعيات الماء القروية.',
    },
  },
};
