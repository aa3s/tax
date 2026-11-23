import { formatLocalizedDH, Locale } from '../i18n/translations';
import { TaxReceipt } from '../types/daribati';

export type CivicRankId =
  | 'observer'
  | 'contributor'
  | 'patron'
  | 'civic-leader'
  | 'nation-builder';

export interface CivicRankTierDefinition {
  id: CivicRankId;
  level: number; // 1..5
  minReceipts: number;
  minAmountDH: number;
  accentHex: string;
  accentSoftHex: string;
  ringHex: string;
}

export interface CivicRankTierStatus extends CivicRankTierDefinition {
  unlocked: boolean;
  isCurrent: boolean;
}

export interface CivicRankEvaluation {
  currentTier: CivicRankTierDefinition;
  nextTier: CivicRankTierDefinition | null;
  receiptCount: number;
  totalAllocatedDH: number;
  receiptsRemaining: number;
  amountRemainingDH: number;
  receiptProgressPct: number;
  amountProgressPct: number;
  progressPct: number;
  qualifyingPath: 'none' | 'receipts' | 'amount' | 'both';
  isMaxRank: boolean;
  tiers: CivicRankTierStatus[];
}

export const CIVIC_RANK_TIERS: CivicRankTierDefinition[] = [
  {
    id: 'observer',
    level: 1,
    minReceipts: 0,
    minAmountDH: 0,
    accentHex: '#647B92',
    accentSoftHex: '#EBF1F7',
    ringHex: '#94A8BE',
  },
  {
    id: 'contributor',
    level: 2,
    minReceipts: 1,
    minAmountDH: 500,
    accentHex: '#087E83',
    accentSoftHex: '#E8F7F7',
    ringHex: '#35B7BC',
  },
  {
    id: 'patron',
    level: 3,
    minReceipts: 2,
    minAmountDH: 2500,
    accentHex: '#1D3FD8',
    accentSoftHex: '#ECF1FF',
    ringHex: '#6384FF',
  },
  {
    id: 'civic-leader',
    level: 4,
    minReceipts: 4,
    minAmountDH: 7500,
    accentHex: '#4338CA',
    accentSoftHex: '#EEF0FF',
    ringHex: '#818CF8',
  },
  {
    id: 'nation-builder',
    level: 5,
    minReceipts: 6,
    minAmountDH: 15000,
    accentHex: '#B68A18',
    accentSoftHex: '#FDF8E6',
    ringHex: '#E5C35A',
  },
];

export function calculateCivicRank(receipts: TaxReceipt[]): CivicRankEvaluation {
  const receiptCount = receipts.length;
  const totalAllocatedDH = receipts.reduce(
    (sum, receipt) => sum + Math.max(0, receipt.totalAmountDH || 0),
    0
  );

  // Highest tier unlocked via EITHER receipt count OR total Dirhams allocated
  let currentIndex = 0;
  for (let i = 1; i < CIVIC_RANK_TIERS.length; i += 1) {
    const tier = CIVIC_RANK_TIERS[i];
    if (receiptCount >= tier.minReceipts || totalAllocatedDH >= tier.minAmountDH) {
      currentIndex = i;
    }
  }

  const currentTier = CIVIC_RANK_TIERS[currentIndex];
  const nextTier =
    currentIndex < CIVIC_RANK_TIERS.length - 1
      ? CIVIC_RANK_TIERS[currentIndex + 1]
      : null;

  let qualifyingPath: 'none' | 'receipts' | 'amount' | 'both' = 'none';
  if (currentIndex > 0) {
    const byReceipts = receiptCount >= currentTier.minReceipts;
    const byAmount = totalAllocatedDH >= currentTier.minAmountDH;
    if (byReceipts && byAmount) {
      qualifyingPath = 'both';
    } else if (byReceipts) {
      qualifyingPath = 'receipts';
    } else if (byAmount) {
      qualifyingPath = 'amount';
    }
  }

  let receiptsRemaining = 0;
  let amountRemainingDH = 0;
  let receiptProgressPct = 100;
  let amountProgressPct = 100;
  let progressPct = 100;

  if (nextTier) {
    receiptsRemaining = Math.max(0, nextTier.minReceipts - receiptCount);
    amountRemainingDH = Math.max(0, nextTier.minAmountDH - totalAllocatedDH);
    receiptProgressPct =
      nextTier.minReceipts > 0
        ? Math.min(100, Math.round((receiptCount / nextTier.minReceipts) * 100))
        : 100;
    amountProgressPct =
      nextTier.minAmountDH > 0
        ? Math.min(100, Math.round((totalAllocatedDH / nextTier.minAmountDH) * 100))
        : 100;
    progressPct = Math.max(receiptProgressPct, amountProgressPct);
  }

  const tiers: CivicRankTierStatus[] = CIVIC_RANK_TIERS.map((tier, idx) => ({
    ...tier,
    unlocked: idx <= currentIndex,
    isCurrent: idx === currentIndex,
  }));

  return {
    currentTier,
    nextTier,
    receiptCount,
    totalAllocatedDH,
    receiptsRemaining,
    amountRemainingDH,
    receiptProgressPct,
    amountProgressPct,
    progressPct,
    qualifyingPath,
    isMaxRank: nextTier === null,
    tiers,
  };
}

export interface CivicRankTierCopy {
  title: string;
  summary: string;
}

export interface CivicRankUI {
  sectionAria: string;
  sectionKicker: string;
  sectionTitle: string;
  sectionSubtitle: string;
  badgeLabel: string;
  rankOfTotal: (level: number, total: number) => string;
  ladderTitle: string;
  ladderRuleHint: string;
  progressToNext: (nextTitle: string) => string;
  maxRankReachedTitle: string;
  maxRankReachedDesc: string;
  remainingPathSummary: (receiptsLeft: number, formattedAmountLeft: string) => string;
  requirementLabel: (minReceipts: number, minAmountDH: number, locale: Locale) => string;
  statusCurrent: string;
  statusUnlocked: string;
  statusLocked: string;
  receiptsMetric: (count: number) => string;
  allocatedMetric: string;
  modalRankPrefix: string;
  tiers: Record<CivicRankId, CivicRankTierCopy>;
}

export const CIVIC_RANK_UI: Record<Locale, CivicRankUI> = {
  en: {
    sectionAria: 'Citizen Civic Rank & Progression',
    sectionKicker: 'Civic Standing · Merit Recognition',
    sectionTitle: 'Civic Rank & Contribution Milestones',
    sectionSubtitle:
      'Your Civic Rank advances automatically as you issue verified tax receipts or increase your cumulative participatory allocation in Dirhams.',
    badgeLabel: 'Civic Rank',
    rankOfTotal: (level, total) => `Rank ${level} of ${total}`,
    ladderTitle: 'All 5 Civic Rank Tiers',
    ladderRuleHint: 'Unlock via either receipt count or total DH allocated',
    progressToNext: (nextTitle) => `Progress toward ${nextTitle}`,
    maxRankReachedTitle: 'Highest Civic Distinction Achieved',
    maxRankReachedDesc:
      'You have reached the Nation Builder rank through sustained participatory funding across Moroccan public services.',
    remainingPathSummary: (receiptsLeft, formattedAmountLeft) =>
      `${receiptsLeft} more receipt${receiptsLeft === 1 ? '' : 's'} or ${formattedAmountLeft} more allocated to advance`,
    requirementLabel: (minReceipts, minAmountDH, locale) =>
      minReceipts === 0
        ? 'Starting rank upon portal registration'
        : `${minReceipts} receipt${minReceipts === 1 ? '' : 's'} or ${formatLocalizedDH(minAmountDH, locale)}`,
    statusCurrent: 'Current Rank',
    statusUnlocked: 'Unlocked',
    statusLocked: 'Locked',
    receiptsMetric: (count) => `${count} receipt${count === 1 ? '' : 's'}`,
    allocatedMetric: 'total allocated',
    modalRankPrefix: 'Civic Rank:',
    tiers: {
      observer: {
        title: 'Civic Observer',
        summary: 'Registered citizen exploring Morocco’s public budget before completing a first tax allocation.',
      },
      contributor: {
        title: 'Contributor',
        summary: 'Active taxpayer who has directed their first verified contribution into public services.',
      },
      patron: {
        title: 'Public Patron',
        summary: 'Consistent civic supporter funding multi-sector infrastructure, health, and education priorities.',
      },
      'civic-leader': {
        title: 'Civic Leader',
        summary: 'High-impact participant driving transparent local development and verified tender governance.',
      },
      'nation-builder': {
        title: 'Nation Builder',
        summary: 'Top civic distinction honoring sustained leadership in Morocco’s participatory public treasury.',
      },
    },
  },
  fr: {
    sectionAria: 'Rang Civique du Citoyen et Progression',
    sectionKicker: 'Distinction Civique · Reconnaissance du Mérite',
    sectionTitle: 'Rang Civique & Paliers de Contribution',
    sectionSubtitle:
      'Votre Rang Civique progresse automatiquement selon le nombre de quittances fiscales émises ou le montant cumulé alloué en Dirhams.',
    badgeLabel: 'Rang Civique',
    rankOfTotal: (level, total) => `Rang ${level} sur ${total}`,
    ladderTitle: 'Les 5 Paliers du Rang Civique',
    ladderRuleHint: 'Déblocage par nombre de quittances ou total alloué en DH',
    progressToNext: (nextTitle) => `Progression vers ${nextTitle}`,
    maxRankReachedTitle: 'Plus Haute Distinction Civique Atteinte',
    maxRankReachedDesc:
      'Vous avez atteint le rang Bâtisseur de la Nation grâce à votre engagement durable envers les services publics marocains.',
    remainingPathSummary: (receiptsLeft, formattedAmountLeft) =>
      `${receiptsLeft} quittance${receiptsLeft > 1 ? 's' : ''} de plus ou ${formattedAmountLeft} supplémentaires pour progresser`,
    requirementLabel: (minReceipts, minAmountDH, locale) =>
      minReceipts === 0
        ? 'Rang initial dès l’inscription au portail'
        : `${minReceipts} quittance${minReceipts > 1 ? 's' : ''} ou ${formatLocalizedDH(minAmountDH, locale)}`,
    statusCurrent: 'Rang Actuel',
    statusUnlocked: 'Débloqué',
    statusLocked: 'Verrouillé',
    receiptsMetric: (count) => `${count} quittance${count > 1 ? 's' : ''}`,
    allocatedMetric: 'alloués au total',
    modalRankPrefix: 'Rang Civique :',
    tiers: {
      observer: {
        title: 'Citoyen Observateur',
        summary: 'Citoyen inscrit explorant le budget public avant sa première répartition fiscale.',
      },
      contributor: {
        title: 'Contributeur Civique',
        summary: 'Contribuable actif ayant orienté sa première contribution vérifiée vers les services publics.',
      },
      patron: {
        title: 'Mécène Public',
        summary: 'Soutien régulier finançant les priorités nationales en santé, éducation et infrastructures.',
      },
      'civic-leader': {
        title: 'Leader Civique',
        summary: 'Acteur engagé à fort impact pour la transparence budgétaire et les marchés publics.',
      },
      'nation-builder': {
        title: 'Bâtisseur de la Nation',
        summary: 'Distinction suprême saluant un engagement exemplaire dans le trésor public participatif.',
      },
    },
  },
  ar: {
    sectionAria: 'الرتبة المدنية للمواطن ومستويات التقدم',
    sectionKicker: 'المكانة المدنية · تقدير المساهمة',
    sectionTitle: 'الرتبة المدنية ومعالم المساهمة الضريبية',
    sectionSubtitle:
      'ترتقي رتبتك المدنية تلقائياً مع زيادة عدد الإيصالات الضريبية الصادرة أو إجمالي المبالغ المخصصة بالدرهم للخدمات العمومية.',
    badgeLabel: 'الرتبة المدنية',
    rankOfTotal: (level, total) => `الرتبة ${level} من ${total}`,
    ladderTitle: 'مستويات الرتب المدنية الخمس',
    ladderRuleHint: 'الترقية تتحقق بعدد الإيصالات أو بإجمالي المبلغ المخصص',
    progressToNext: (nextTitle) => `التقدم نحو رتبة ${nextTitle}`,
    maxRankReachedTitle: 'تم بلوغ أعلى وسام مدني',
    maxRankReachedDesc:
      'لقد بلغت رتبة باني الوطن تقديراً لمساهمتك المستدامة والفاعلة في تمويل الخدمات العمومية المغربية.',
    remainingPathSummary: (receiptsLeft, formattedAmountLeft) =>
      `يتبقى ${receiptsLeft} إيصال إضافي أو تخصيص ${formattedAmountLeft} إضافية للترقية`,
    requirementLabel: (minReceipts, minAmountDH, locale) =>
      minReceipts === 0
        ? 'الرتبة الابتدائية عند التسجيل في البوابة'
        : `${minReceipts} إيصال أو ${formatLocalizedDH(minAmountDH, locale)}`,
    statusCurrent: 'الرتبة الحالية',
    statusUnlocked: 'مفعّلة',
    statusLocked: 'مقفلة',
    receiptsMetric: (count) => `${count} إيصال`,
    allocatedMetric: 'إجمالي مخصص',
    modalRankPrefix: 'الرتبة المدنية:',
    tiers: {
      observer: {
        title: 'مواطن مراقب',
        summary: 'مواطن مسجّل يستكشف الميزانية العمومية قبل إتمام أول عملية توزيع ضريبي.',
      },
      contributor: {
        title: 'مساهم مواطن',
        summary: 'دافع ضرائب نشط وجّه أول مساهمة موثّقة نحو القطاعات العمومية ذات الأولوية.',
      },
      patron: {
        title: 'داعم الخدمات العمومية',
        summary: 'مساهم منتظم يموّل مشاريع الصحة والتعليم والبنية التحتية الوطنية.',
      },
      'civic-leader': {
        title: 'قائد مدني',
        summary: 'مواطن ذو أثر ملموس يدعم الشفافية وحكامة الصفقات العمومية.',
      },
      'nation-builder': {
        title: 'باني الوطن',
        summary: 'أعلى وسام مدني يكرّم الريادة المستدامة في الخزينة التشاركية للمملكة.',
      },
    },
  },
};
