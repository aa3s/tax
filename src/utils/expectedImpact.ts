import {
  formatLocalizedCompactDH,
  formatLocalizedDH,
  Locale,
} from '../i18n/translations';
import { Sector } from '../types/daribati';

export type ImpactScope = 'collective' | 'personal';

/**
 * Collective civic benchmark multiplier:
 * Shows the tangible public-infrastructure outcome if 10,000 verified Moroccan taxpayers
 * direct the same Dirham split toward these public services.
 */
export const COLLECTIVE_TAXPAYER_MULTIPLIER = 10_000;

interface LocalizedUnitCopy {
  singular: string;
  plural: string;
  unitNoun: string;
}

export interface SubSectorBenchmark {
  collectiveUnitCostDH: number;
  personalUnitCostDH: number;
  collective: Record<Locale, LocalizedUnitCopy>;
  personal: Record<Locale, LocalizedUnitCopy>;
}

export const SUB_SECTOR_BENCHMARKS: Record<string, SubSectorBenchmark> = {
  // 01 Public Safety
  'ps-police': {
    collectiveUnitCostDH: 500_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'neighborhood patrol vehicle', plural: 'neighborhood patrol vehicles', unitNoun: 'vehicle' },
      fr: { singular: 'véhicule de patrouille de proximité', plural: 'véhicules de patrouille de proximité', unitNoun: 'véhicule' },
      ar: { singular: 'دورية أمن قريبة', plural: 'دوريات أمن قريبة', unitNoun: 'دورية' },
    },
    personal: {
      en: { singular: 'hour of community dispatch coverage', plural: 'hours of community dispatch coverage', unitNoun: 'hour' },
      fr: { singular: 'heure de permanence de secours', plural: 'heures de permanence de secours', unitNoun: 'heure' },
      ar: { singular: 'ساعة تغطية لمركز النجدة', plural: 'ساعات تغطية لمركز النجدة', unitNoun: 'ساعة' },
    },
  },
  'ps-fire': {
    collectiveUnitCostDH: 1_250_000,
    personalUnitCostDH: 100,
    collective: {
      en: { singular: 'Protection Civile fire engine', plural: 'Protection Civile fire engines', unitNoun: 'fire engine' },
      fr: { singular: 'camion-citerne de la Protection Civile', plural: 'camions-citernes de la Protection Civile', unitNoun: 'camion' },
      ar: { singular: 'شاحنة إطفاء للوقاية المدنية', plural: 'شاحنات إطفاء للوقاية المدنية', unitNoun: 'شاحنة' },
    },
    personal: {
      en: { singular: 'wildfire protective gear kit', plural: 'wildfire protective gear kits', unitNoun: 'kit' },
      fr: { singular: 'kit de protection anti-incendie', plural: 'kits de protection anti-incendie', unitNoun: 'kit' },
      ar: { singular: 'حقيبة وقاية من حرائق الغابات', plural: 'حقائب وقاية من حرائق الغابات', unitNoun: 'حقيبة' },
    },
  },
  'ps-ems': {
    collectiveUnitCostDH: 600_000,
    personalUnitCostDH: 75,
    collective: {
      en: { singular: 'equipped SAMU ambulance', plural: 'equipped SAMU ambulances', unitNoun: 'ambulance' },
      fr: { singular: 'ambulance SAMU équipée', plural: 'ambulances SAMU équipées', unitNoun: 'ambulance' },
      ar: { singular: 'سيارة إسعاف مجهزة (SAMU)', plural: 'سيارات إسعاف مجهزة (SAMU)', unitNoun: 'سيارة إسعاف' },
    },
    personal: {
      en: { singular: 'paramedic trauma response kit', plural: 'paramedic trauma response kits', unitNoun: 'kit' },
      fr: { singular: 'trousse médicale d’urgence', plural: 'trousses médicales d’urgence', unitNoun: 'trousse' },
      ar: { singular: 'حقيبة إسعافات أولية متكاملة', plural: 'حقائب إسعافات أولية متكاملة', unitNoun: 'حقيبة' },
    },
  },
  'ps-disaster': {
    collectiveUnitCostDH: 400_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'seismic emergency shelter depot', plural: 'seismic emergency shelter depots', unitNoun: 'depot' },
      fr: { singular: 'dépôt d’abris d’urgence sismique', plural: 'dépôts d’abris d’urgence sismique', unitNoun: 'dépôt' },
      ar: { singular: 'مستودع إيواء طارئ ضد الكوارث', plural: 'مستودعات إيواء طارئ ضد الكوارث', unitNoun: 'مستودع' },
    },
    personal: {
      en: { singular: 'family emergency relief pack', plural: 'family emergency relief packs', unitNoun: 'pack' },
      fr: { singular: 'pack familial de secours d’urgence', plural: 'packs familiaux de secours d’urgence', unitNoun: 'pack' },
      ar: { singular: 'رزمة إغاثة عائلية طارئة', plural: 'رزم إغاثة عائلية طارئة', unitNoun: 'رزمة' },
    },
  },

  // 02 Healthcare
  'hc-hospitals': {
    collectiveUnitCostDH: 750_000,
    personalUnitCostDH: 75,
    collective: {
      en: { singular: 'new rural clinic', plural: 'new rural clinics', unitNoun: 'clinic' },
      fr: { singular: 'nouveau dispensaire rural', plural: 'nouveaux dispensaires ruraux', unitNoun: 'dispensaire' },
      ar: { singular: 'مستوصف قروي جديد', plural: 'مستوصفات قروية جديدة', unitNoun: 'مستوصف' },
    },
    personal: {
      en: { singular: 'primary clinic consultation kit', plural: 'primary clinic consultation kits', unitNoun: 'kit' },
      fr: { singular: 'kit de consultation médicale', plural: 'kits de consultation médicale', unitNoun: 'kit' },
      ar: { singular: 'حقيبة فحص وعلاج أولي', plural: 'حقائب فحص وعلاج أولي', unitNoun: 'حقيبة' },
    },
  },
  'hc-vaccination': {
    collectiveUnitCostDH: 25_000,
    personalUnitCostDH: 25,
    collective: {
      en: { singular: 'mobile vaccine cold-chain unit', plural: 'mobile vaccine cold-chain units', unitNoun: 'cold-chain unit' },
      fr: { singular: 'unité mobile de chaîne du froid', plural: 'unités mobiles de chaîne du froid', unitNoun: 'unité' },
      ar: { singular: 'وحدة تبريد متنقلة للتلقيح', plural: 'وحدات تبريد متنقلة للتلقيح', unitNoun: 'وحدة' },
    },
    personal: {
      en: { singular: 'pediatric vaccine dose', plural: 'pediatric vaccine doses', unitNoun: 'dose' },
      fr: { singular: 'dose de vaccin pédiatrique', plural: 'doses de vaccin pédiatrique', unitNoun: 'dose' },
      ar: { singular: 'جرعة تلقيح للأطفال', plural: 'جرعات تلقيح للأطفال', unitNoun: 'جرعة' },
    },
  },
  'hc-mental': {
    collectiveUnitCostDH: 350_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'outpatient counseling center', plural: 'outpatient counseling centers', unitNoun: 'center' },
      fr: { singular: 'centre d’écoute psychologique', plural: 'centres d’écoute psychologique', unitNoun: 'centre' },
      ar: { singular: 'مركز استشارة ومواكبة نفسية', plural: 'مراكز استشارة ومواكبة نفسية', unitNoun: 'مركز' },
    },
    personal: {
      en: { singular: 'youth mental health session', plural: 'youth mental health sessions', unitNoun: 'session' },
      fr: { singular: 'séance de soutien psychologique', plural: 'séances de soutien psychologique', unitNoun: 'séance' },
      ar: { singular: 'جلسة دعم نفسي للشباب', plural: 'جلسات دعم نفسي للشباب', unitNoun: 'جلسة' },
    },
  },
  'hc-sanitation': {
    collectiveUnitCostDH: 200_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'rural health screening mobile unit', plural: 'rural health screening mobile units', unitNoun: 'unit' },
      fr: { singular: 'unité mobile de dépistage rural', plural: 'unités mobiles de dépistage rural', unitNoun: 'unité' },
      ar: { singular: 'وحدة متنقلة للكشف المبكر', plural: 'وحدات متنقلة للكشف المبكر', unitNoun: 'وحدة' },
    },
    personal: {
      en: { singular: 'preventive health screening', plural: 'preventive health screenings', unitNoun: 'screening' },
      fr: { singular: 'dépistage sanitaire préventif', plural: 'dépistages sanitaires préventifs', unitNoun: 'dépistage' },
      ar: { singular: 'فحص وقائي مبكر', plural: 'فحوصات وقائية مبكرة', unitNoun: 'فحص' },
    },
  },

  // 03 Education
  'ed-k12': {
    collectiveUnitCostDH: 200_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'modern public classroom', plural: 'modern public classrooms', unitNoun: 'classroom' },
      fr: { singular: 'salle de classe équipée', plural: 'salles de classe équipées', unitNoun: 'salle' },
      ar: { singular: 'قاعة دراسية مجهزة', plural: 'قاعات دراسية مجهزة', unitNoun: 'قاعة' },
    },
    personal: {
      en: { singular: 'student textbook & science kit', plural: 'student textbook & science kits', unitNoun: 'kit' },
      fr: { singular: 'kit scolaire et scientifique', plural: 'kits scolaires et scientifiques', unitNoun: 'kit' },
      ar: { singular: 'حقيبة كتب ومختبر لتلميذ', plural: 'حقائب كتب ومختبر للتلاميذ', unitNoun: 'حقيبة' },
    },
  },
  'ed-univ': {
    collectiveUnitCostDH: 250_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'university STEM research lab', plural: 'university STEM research labs', unitNoun: 'research lab' },
      fr: { singular: 'laboratoire universitaire STEM', plural: 'laboratoires universitaires STEM', unitNoun: 'labo' },
      ar: { singular: 'مختبر بحث جامعي (STEM)', plural: 'مختبرات بحث جامعية (STEM)', unitNoun: 'مختبر' },
    },
    personal: {
      en: { singular: 'student research library pass', plural: 'student research library passes', unitNoun: 'pass' },
      fr: { singular: 'accès annuel de recherche étudiant', plural: 'accès annuels de recherche étudiant', unitNoun: 'accès' },
      ar: { singular: 'اشتراك بحث جامعي لطالب', plural: 'اشتراكات بحث جامعية للطلبة', unitNoun: 'اشتراك' },
    },
  },
  'ed-vocational': {
    collectiveUnitCostDH: 180_000,
    personalUnitCostDH: 60,
    collective: {
      en: { singular: 'OFPPT technical workshop bay', plural: 'OFPPT technical workshop bays', unitNoun: 'workshop' },
      fr: { singular: 'atelier technique OFPPT', plural: 'ateliers techniques OFPPT', unitNoun: 'atelier' },
      ar: { singular: 'ورشة تكوين مهني (OFPPT)', plural: 'ورشات تكوين مهني (OFPPT)', unitNoun: 'ورشة' },
    },
    personal: {
      en: { singular: 'apprentice trade toolset', plural: 'apprentice trade toolsets', unitNoun: 'toolset' },
      fr: { singular: 'coffret d’outillage d’apprenti', plural: 'coffrets d’outillage d’apprenti', unitNoun: 'coffret' },
      ar: { singular: 'عدة تطبيقية لمتدرب مهني', plural: 'عدد تطبيقية للمتدربين', unitNoun: 'عدة' },
    },
  },

  // 04 Social Services
  'ss-housing': {
    collectiveUnitCostDH: 150_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'subsidized social housing unit', plural: 'subsidized social housing units', unitNoun: 'housing unit' },
      fr: { singular: 'logement social subventionné', plural: 'logements sociaux subventionnés', unitNoun: 'logement' },
      ar: { singular: 'سكن اجتماعي مدعّم', plural: 'مساكن اجتماعية مدعّمة', unitNoun: 'سكن' },
    },
    personal: {
      en: { singular: 'senior home care day', plural: 'senior home care days', unitNoun: 'day' },
      fr: { singular: 'journée d’accueil senior', plural: 'journées d’accueil senior', unitNoun: 'journée' },
      ar: { singular: 'يوم رعاية للمسنين', plural: 'أيام رعاية للمسنين', unitNoun: 'يوم' },
    },
  },
  'ss-youth': {
    collectiveUnitCostDH: 40_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'first-job youth stipend', plural: 'first-job youth stipends', unitNoun: 'stipend' },
      fr: { singular: 'bourse premier emploi jeune', plural: 'bourses premier emploi jeune', unitNoun: 'bourse' },
      ar: { singular: 'منحة إدماج مهني أول للشباب', plural: 'منح إدماج مهني أول للشباب', unitNoun: 'منحة' },
    },
    personal: {
      en: { singular: 'career coaching workshop seat', plural: 'career coaching workshop seats', unitNoun: 'seat' },
      fr: { singular: 'place en atelier d’insertion pro', plural: 'places en atelier d’insertion pro', unitNoun: 'place' },
      ar: { singular: 'مقعد مواكبة للتشغيل', plural: 'مقاعد مواكبة للتشغيل', unitNoun: 'مقعد' },
    },
  },
  'ss-family': {
    collectiveUnitCostDH: 300_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'public early-childhood nursery', plural: 'public early-childhood nurseries', unitNoun: 'nursery' },
      fr: { singular: 'crèche publique de quartier', plural: 'crèches publiques de quartier', unitNoun: 'crèche' },
      ar: { singular: 'حضانة عمومية للطفولة المبكرة', plural: 'حضانات عمومية للطفولة المبكرة', unitNoun: 'حضانة' },
    },
    personal: {
      en: { singular: 'maternal & infant care kit', plural: 'maternal & infant care kits', unitNoun: 'kit' },
      fr: { singular: 'kit de suivi maternel et infantile', plural: 'kits de suivi maternel et infantile', unitNoun: 'kit' },
      ar: { singular: 'حقيبة رعاية للأم والطفل', plural: 'حقائب رعاية للأم والطفل', unitNoun: 'حقيبة' },
    },
  },
  'ss-food': {
    collectiveUnitCostDH: 6_000,
    personalUnitCostDH: 30,
    collective: {
      en: { singular: 'annual household solidarity grant', plural: 'annual household solidarity grants', unitNoun: 'grant' },
      fr: { singular: 'aide alimentaire annuelle familiale', plural: 'aides alimentaires annuelles familiales', unitNoun: 'aide' },
      ar: { singular: 'دعم غذائي سنوي لأسرة', plural: 'إعانات غذائية سنوية للأسر', unitNoun: 'إعانة' },
    },
    personal: {
      en: { singular: 'nutritional family food basket', plural: 'nutritional family food baskets', unitNoun: 'basket' },
      fr: { singular: 'panier alimentaire solidaire', plural: 'paniers alimentaires solidaires', unitNoun: 'panier' },
      ar: { singular: 'قفة تضامنية غذائية', plural: 'قفف تضامنية غذائية', unitNoun: 'قفة' },
    },
  },

  // 05 Transportation
  'tr-roads': {
    collectiveUnitCostDH: 200_000,
    personalUnitCostDH: 25,
    collective: {
      en: { singular: 'km of resurfaced rural road', plural: 'km of resurfaced rural roads', unitNoun: 'km' },
      fr: { singular: 'km de route rurale rénovée', plural: 'km de routes rurales rénovées', unitNoun: 'km' },
      ar: { singular: 'كلم من الطرق القروية المعبدة', plural: 'كلم من الطرق القروية المعبدة', unitNoun: 'كلم' },
    },
    personal: {
      en: { singular: 'm² of paved community road', plural: 'm² of paved community road', unitNoun: 'm²' },
      fr: { singular: 'm² de chaussée réhabilitée', plural: 'm² de chaussée réhabilitée', unitNoun: 'm²' },
      ar: { singular: 'م² من الطريق القروي المعبد', plural: 'م² من الطرق القروية المعبدة', unitNoun: 'م²' },
    },
  },
  'tr-transit': {
    collectiveUnitCostDH: 1_000_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'low-emission municipal bus', plural: 'low-emission municipal buses', unitNoun: 'bus' },
      fr: { singular: 'bus urbain propre', plural: 'bus urbains propres', unitNoun: 'bus' },
      ar: { singular: 'حافلة نقل حضري صديقة للبيئة', plural: 'حافلات نقل حضري صديقة للبيئة', unitNoun: 'حافلة' },
    },
    personal: {
      en: { singular: 'student monthly transit pass', plural: 'student monthly transit passes', unitNoun: 'pass' },
      fr: { singular: 'abonnement mensuel transport étudiant', plural: 'abonnements mensuels transport étudiant', unitNoun: 'abonnement' },
      ar: { singular: 'بطاقة نقل شهري للطلبة', plural: 'بطاقات نقل شهري للطلبة', unitNoun: 'بطاقة' },
    },
  },
  'tr-airports': {
    collectiveUnitCostDH: 500_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'regional runway safety beacon array', plural: 'regional runway safety beacon arrays', unitNoun: 'beacon array' },
      fr: { singular: 'système de balisage de piste régionale', plural: 'systèmes de balisage de piste régionale', unitNoun: 'système' },
      ar: { singular: 'منظومة سلامة لمدرج مطار جهوي', plural: 'منظومات سلامة لمدارج مطارات جهوية', unitNoun: 'منظومة' },
    },
    personal: {
      en: { singular: 'LED runway guidance lamp', plural: 'LED runway guidance lamps', unitNoun: 'lamp' },
      fr: { singular: 'balise lumineuse LED de piste', plural: 'balises lumineuses LED de piste', unitNoun: 'balise' },
      ar: { singular: 'مصباح توجيه LED لمدارج المطارات', plural: 'مصابيح توجيه LED لمدارج المطارات', unitNoun: 'مصباح' },
    },
  },

  // 06 Utilities & Environment
  'ut-water': {
    collectiveUnitCostDH: 2_500,
    personalUnitCostDH: 25,
    collective: {
      en: { singular: 'rural home connected to clean water', plural: 'rural homes connected to clean water', unitNoun: 'home' },
      fr: { singular: 'foyer rural raccordé à l’eau potable', plural: 'foyers ruraux raccordés à l’eau potable', unitNoun: 'foyer' },
      ar: { singular: 'منزل قروي مزوّد بالماء الصالح للشرب', plural: 'منازل قروية مزوّدة بالماء الصالح للشرب', unitNoun: 'منزل' },
    },
    personal: {
      en: { singular: 'smart leak-detection meter share', plural: 'smart leak-detection meter shares', unitNoun: 'sensor share' },
      fr: { singular: 'm³ d’eau potable sécurisée', plural: 'm³ d’eau potable sécurisée', unitNoun: 'm³' },
      ar: { singular: 'م³ من الماء الصالح للشرب المحمي من الضياع', plural: 'م³ من الماء الصالح للشرب المحمي من الضياع', unitNoun: 'م³' },
    },
  },
  'ut-waste': {
    collectiveUnitCostDH: 250_000,
    personalUnitCostDH: 30,
    collective: {
      en: { singular: 'municipal sorting & recycling hub', plural: 'municipal sorting & recycling hubs', unitNoun: 'hub' },
      fr: { singular: 'point de tri et recyclage communal', plural: 'points de tri et recyclage communaux', unitNoun: 'point' },
      ar: { singular: 'محطة فرز وتدوير نفايات جماعية', plural: 'محطات فرز وتدوير نفايات جماعية', unitNoun: 'محطة' },
    },
    personal: {
      en: { singular: 'neighborhood recycling bin', plural: 'neighborhood recycling bins', unitNoun: 'bin' },
      fr: { singular: 'bac de tri sélectif de quartier', plural: 'bacs de tri sélectif de quartier', unitNoun: 'bac' },
      ar: { singular: 'حاوية فرز انتقائي للحي', plural: 'حاويات فرز انتقائي للحي', unitNoun: 'حاوية' },
    },
  },
  'ut-cleanup': {
    collectiveUnitCostDH: 50_000,
    personalUnitCostDH: 20,
    collective: {
      en: { singular: 'hectare of Atlas reforestation', plural: 'hectares of Atlas reforestation', unitNoun: 'hectare' },
      fr: { singular: 'hectare de reboisement de l’Atlas', plural: 'hectares de reboisement de l’Atlas', unitNoun: 'hectare' },
      ar: { singular: 'هكتار من تشجير غابات الأطلس', plural: 'هكتارات من تشجير غابات الأطلس', unitNoun: 'هكتار' },
    },
    personal: {
      en: { singular: 'native cedar & argan sapling', plural: 'native cedar & argan saplings', unitNoun: 'sapling' },
      fr: { singular: 'plant d’arganier ou de cèdre', plural: 'plants d’arganier ou de cèdre', unitNoun: 'plant' },
      ar: { singular: 'شتلة أركان وأرز محلية', plural: 'شتلات أركان وأرز محلية', unitNoun: 'شتلة' },
    },
  },
  'ut-electricity': {
    collectiveUnitCostDH: 120_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'village solar microgrid node', plural: 'village solar microgrid nodes', unitNoun: 'microgrid' },
      fr: { singular: 'micro-réseau solaire villageois', plural: 'micro-réseaux solaires villageois', unitNoun: 'micro-réseau' },
      ar: { singular: 'شبكة طاقة شمسية قروية', plural: 'شبكات طاقة شمسية قروية', unitNoun: 'شبكة' },
    },
    personal: {
      en: { singular: 'solar LED streetlamp maintenance month', plural: 'solar LED streetlamp maintenance months', unitNoun: 'month' },
      fr: { singular: 'mois d’éclairage public solaire LED', plural: 'mois d’éclairage public solaire LED', unitNoun: 'mois' },
      ar: { singular: 'شهر إنارة عمومية بالطاقة الشمسية', plural: 'أشهر إنارة عمومية بالطاقة الشمسية', unitNoun: 'شهر' },
    },
  },

  // 07 Governance & Legal
  'gv-courts': {
    collectiveUnitCostDH: 100_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'digitized court mediation room', plural: 'digitized court mediation rooms', unitNoun: 'room' },
      fr: { singular: 'salle de médiation judiciaire numérique', plural: 'salles de médiation judiciaire numérique', unitNoun: 'salle' },
      ar: { singular: 'قاعة وساطة قضائية رقمية', plural: 'قاعات وساطة قضائية رقمية', unitNoun: 'قاعة' },
    },
    personal: {
      en: { singular: 'free citizen legal-aid consultation', plural: 'free citizen legal-aid consultations', unitNoun: 'consultation' },
      fr: { singular: 'consultation d’aide juridique gratuite', plural: 'consultations d’aide juridique gratuite', unitNoun: 'consultation' },
      ar: { singular: 'استشارة مساعدة قضائية مجانية', plural: 'استشارات مساعدة قضائية مجانية', unitNoun: 'استشارة' },
    },
  },
  'gv-policy': {
    collectiveUnitCostDH: 125_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'independent public tender audit', plural: 'independent public tender audits', unitNoun: 'audit' },
      fr: { singular: 'audit indépendant de marché public', plural: 'audits indépendants de marchés publics', unitNoun: 'audit' },
      ar: { singular: 'تدقيق مستقل لصفقة عمومية', plural: 'عمليات تدقيق مستقلة للصفقات', unitNoun: 'تدقيق' },
    },
    personal: {
      en: { singular: 'open-budget dataset publication', plural: 'open-budget dataset publications', unitNoun: 'dataset' },
      fr: { singular: 'jeu de données budgétaires ouvertes', plural: 'jeux de données budgétaires ouvertes', unitNoun: 'jeu' },
      ar: { singular: 'تقرير شفافية مفتوح للميزانية', plural: 'تقارير شفافية مفتوحة للميزانية', unitNoun: 'تقرير' },
    },
  },
  'gv-elections': {
    collectiveUnitCostDH: 80_000,
    personalUnitCostDH: 25,
    collective: {
      en: { singular: 'municipal participatory town hall', plural: 'municipal participatory town halls', unitNoun: 'town hall' },
      fr: { singular: 'forum citoyen communal', plural: 'forums citoyens communaux', unitNoun: 'forum' },
      ar: { singular: 'لقاء تشاوري جماعي مفتوح', plural: 'لقاءات تشاورية جماعية مفتوحة', unitNoun: 'لقاء' },
    },
    personal: {
      en: { singular: 'civic voter registry verification', plural: 'civic voter registry verifications', unitNoun: 'record' },
      fr: { singular: 'vérification d’inscription civique', plural: 'vérifications d’inscription civique', unitNoun: 'vérification' },
      ar: { singular: 'تحديث سجل مشاركة مواطنة', plural: 'تحديثات سجل المشاركة المواطنة', unitNoun: 'تحديث' },
    },
  },
  'gv-cyber': {
    collectiveUnitCostDH: 200_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'protected e-government service portal', plural: 'protected e-government service portals', unitNoun: 'portal' },
      fr: { singular: 'portail e-gov sécurisé', plural: 'portails e-gov sécurisés', unitNoun: 'portail' },
      ar: { singular: 'بوابة إدارية رقمية محمية سيبرانياً', plural: 'بوابات إدارية رقمية محمية سيبرانياً', unitNoun: 'بوابة' },
    },
    personal: {
      en: { singular: 'encrypted citizen ID audit check', plural: 'encrypted citizen ID audit checks', unitNoun: 'audit' },
      fr: { singular: 'contrôle de protection des données', plural: 'contrôles de protection des données', unitNoun: 'contrôle' },
      ar: { singular: 'فحص حماية بيانات مواطن', plural: 'فحوصات حماية بيانات المواطنين', unitNoun: 'فحص' },
    },
  },

  // 08 Community & Culture
  'cc-libraries': {
    collectiveUnitCostDH: 300_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'neighborhood digital media library', plural: 'neighborhood digital media libraries', unitNoun: 'library' },
      fr: { singular: 'médiathèque publique de quartier', plural: 'médiathèques publiques de quartier', unitNoun: 'médiathèque' },
      ar: { singular: 'مكتبة وسائطية عمومية بالحي', plural: 'مكتبات وسائطية عمومية بالأحياء', unitNoun: 'مكتبة' },
    },
    personal: {
      en: { singular: 'public library book acquisition', plural: 'public library book acquisitions', unitNoun: 'book' },
      fr: { singular: 'ouvrage ajouté aux bibliothèques', plural: 'ouvrages ajoutés aux bibliothèques', unitNoun: 'ouvrage' },
      ar: { singular: 'كتاب جديد للمكتبات العمومية', plural: 'كتب جديدة للمكتبات العمومية', unitNoun: 'كتاب' },
    },
  },
  'cc-parks': {
    collectiveUnitCostDH: 250_000,
    personalUnitCostDH: 30,
    collective: {
      en: { singular: 'urban green park & playground', plural: 'urban green parks & playgrounds', unitNoun: 'park' },
      fr: { singular: 'parc urbain vert et aire de jeux', plural: 'parcs urbains verts et aires de jeux', unitNoun: 'parc' },
      ar: { singular: 'حديقة حضرية وفضاء ألعاب', plural: 'حدائق حضرية وفضاءات ألعاب', unitNoun: 'حديقة' },
    },
    personal: {
      en: { singular: 'm² of shaded community parkland', plural: 'm² of shaded community parkland', unitNoun: 'm²' },
      fr: { singular: 'm² d’espace vert communal', plural: 'm² d’espaces verts communaux', unitNoun: 'm²' },
      ar: { singular: 'م² من المساحات الخضراء العمومية', plural: 'م² من المساحات الخضراء العمومية', unitNoun: 'م²' },
    },
  },
  'cc-broadcast': {
    collectiveUnitCostDH: 150_000,
    personalUnitCostDH: 35,
    collective: {
      en: { singular: 'educational cultural documentary series', plural: 'educational cultural documentary series', unitNoun: 'series' },
      fr: { singular: 'série documentaire éducative', plural: 'séries documentaires éducatives', unitNoun: 'série' },
      ar: { singular: 'سلسلة وثائقية ثقافية وتعليمية', plural: 'سلاسل وثائقية ثقافية وتعليمية', unitNoun: 'سلسلة' },
    },
    personal: {
      en: { singular: 'hour of Amazigh & Arabic educational media', plural: 'hours of Amazigh & Arabic educational media', unitNoun: 'hour' },
      fr: { singular: 'heure de programme éducatif public', plural: 'heures de programmes éducatifs publics', unitNoun: 'heure' },
      ar: { singular: 'ساعة بث تعليمي وثقافي عمومي', plural: 'ساعات بث تعليمي وثقافي عمومي', unitNoun: 'ساعة' },
    },
  },

  // 09 Economic Development
  'ec-urban': {
    collectiveUnitCostDH: 400_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'revitalized medina pedestrian square', plural: 'revitalized medina pedestrian squares', unitNoun: 'square' },
      fr: { singular: 'placette de médina réhabilitée', plural: 'placettes de médina réhabilitées', unitNoun: 'placette' },
      ar: { singular: 'ساحة مدينة عتيقة مؤهلة', plural: 'ساحات مدن عتيقة مؤهلة', unitNoun: 'ساحة' },
    },
    personal: {
      en: { singular: 'm² of pedestrian sidewalk upgrade', plural: 'm² of pedestrian sidewalk upgrades', unitNoun: 'm²' },
      fr: { singular: 'm² de trottoir piéton aménagé', plural: 'm² de trottoirs piétons aménagés', unitNoun: 'm²' },
      ar: { singular: 'م² من تهيئة الأرصفة الحضرية', plural: 'م² من تهيئة الأرصفة الحضرية', unitNoun: 'م²' },
    },
  },
  'ec-employment': {
    collectiveUnitCostDH: 100_000,
    personalUnitCostDH: 50,
    collective: {
      en: { singular: 'local SME innovation micro-grant', plural: 'local SME innovation micro-grants', unitNoun: 'SME grant' },
      fr: { singular: 'subvention d’innovation PME locale', plural: 'subventions d’innovation PME locale', unitNoun: 'subvention' },
      ar: { singular: 'منحة ابتكار لمقاولة صغرى محلية', plural: 'منح ابتكار لمقاولات صغرى محلية', unitNoun: 'منحة' },
    },
    personal: {
      en: { singular: 'artisan cooperative training hour', plural: 'artisan cooperative training hours', unitNoun: 'hour' },
      fr: { singular: 'heure de formation pour coopérative', plural: 'heures de formation pour coopératives', unitNoun: 'heure' },
      ar: { singular: 'ساعة تكوين لتعاونية حرفية', plural: 'ساعات تكوين للتعاونيات الحرفية', unitNoun: 'ساعة' },
    },
  },
  'ec-regulatory': {
    collectiveUnitCostDH: 120_000,
    personalUnitCostDH: 40,
    collective: {
      en: { singular: 'regional consumer safety lab check', plural: 'regional consumer safety lab checks', unitNoun: 'lab check' },
      fr: { singular: 'contrôle laboratoire de sécurité consommateur', plural: 'contrôles laboratoire de sécurité consommateur', unitNoun: 'contrôle' },
      ar: { singular: 'فحص مخبري جهوي لحماية المستهلك', plural: 'فحوصات مخبرية جهوية لحماية المستهلك', unitNoun: 'فحص' },
    },
    personal: {
      en: { singular: 'market price fairness inspection', plural: 'market price fairness inspections', unitNoun: 'inspection' },
      fr: { singular: 'inspection de transparence des marchés', plural: 'inspections de transparence des marchés', unitNoun: 'inspection' },
      ar: { singular: 'مراقبة لشفافية الأسعار والأسواق', plural: 'عمليات مراقبة لشفافية الأسعار', unitNoun: 'مراقبة' },
    },
  },
};

export interface ExpectedImpactItem {
  subSectorId: string;
  sectorId: string;
  allocatedDH: number;
  effectivePoolDH: number;
  unitCostDH: number;
  rawUnits: number;
  displayQuantity: string;
  isPartialUnit: boolean;
  progressToNextUnitPct: number;
  shortOutcome: string;
  statement: string;
  benchmarkNote: string;
}

export interface ExpectedImpactUI {
  sectionAria: string;
  kicker: string;
  title: string;
  subtitleCollective: string;
  subtitlePersonal: string;
  scopeToggleAria: string;
  scopeCollectiveBtn: string;
  scopePersonalBtn: string;
  projectedPoolLabel: string;
  benchmarksFundedLabel: string;
  emptyTitle: string;
  emptyDesc: string;
  previewSampleBtn: string;
  inlineSectorKicker: string;
  inlineSectorEmpty: string;
  nextMilestoneLabel: (pct: number) => string;
  fullUnitsLabel: (count: string) => string;
}

export const EXPECTED_IMPACT_UI: Record<Locale, ExpectedImpactUI> = {
  en: {
    sectionAria: 'Expected Impact on Public Service Benchmarks',
    kicker: 'Real-World Civic Benchmarks · Morocco',
    title: 'Expected Impact of Your Tax Allocation',
    subtitleCollective:
      'Projected public service benchmarks if 10,000 verified Moroccan taxpayers apply your exact allocation split.',
    subtitlePersonal:
      'Direct real-world service units funded 1-to-1 by your individual Dirham tax contribution.',
    scopeToggleAria: 'Select impact projection scale',
    scopeCollectiveBtn: 'Collective (10k Taxpayers)',
    scopePersonalBtn: 'Your Personal Bill',
    projectedPoolLabel: 'Projected Civic Pool',
    benchmarksFundedLabel: 'Active Benchmarks',
    emptyTitle: 'Move any slider above to preview your Expected Impact',
    emptyDesc:
      'Every Dirham you allocate translates into concrete Moroccan public service benchmarks — from rural clinics and classrooms to clean water connections.',
    previewSampleBtn: 'Preview Sample Split Impact',
    inlineSectorKicker: 'Expected Impact for This Sector',
    inlineSectorEmpty:
      'Adjust any slider above to see how many public service benchmarks this sector allocation supports.',
    nextMilestoneLabel: (pct) => `${pct}% toward next full unit`,
    fullUnitsLabel: (count) => `${count} benchmark units supported`,
  },
  fr: {
    sectionAria: 'Impact attendu sur les indicateurs de services publics',
    kicker: 'Indicateurs Civiques Concrets · Maroc',
    title: 'Impact Attendu de Votre Répartition Fiscale',
    subtitleCollective:
      'Projections de réalisations publiques si 10 000 contribuables marocains vérifiés choisissent exactement votre répartition.',
    subtitlePersonal:
      'Unités de services publics directement financées par votre contribution fiscale individuelle en Dirhams.',
    scopeToggleAria: "Choisir l'échelle d'impact",
    scopeCollectiveBtn: 'Collectif (10 000 contribuables)',
    scopePersonalBtn: 'Votre Impôt Seul',
    projectedPoolLabel: 'Fonds Civique Projeté',
    benchmarksFundedLabel: 'Indicateurs Actifs',
    emptyTitle: 'Déplacez un curseur ci-dessus pour estimer votre impact attendu',
    emptyDesc:
      'Chaque Dirham alloué se traduit en réalisations concrètes : dispensaires ruraux, salles de classe équipées ou raccordements à l’eau potable.',
    previewSampleBtn: 'Aperçu avec Répartition Exemple',
    inlineSectorKicker: 'Impact Attendu pour ce Secteur',
    inlineSectorEmpty:
      'Ajustez un curseur ci-dessus pour visualiser les réalisations financées dans ce secteur.',
    nextMilestoneLabel: (pct) => `${pct} % vers la prochaine unité complète`,
    fullUnitsLabel: (count) => `${count} unités de référence soutenues`,
  },
  ar: {
    sectionAria: 'الأثر المتوقع على مؤشرات الخدمات العمومية',
    kicker: 'مؤشرات الأثر المدني الملموس · المغرب',
    title: 'الأثر المتوقع لتوزيع ضريبتك',
    subtitleCollective:
      'مشاريع الخدمات العمومية المتوقعة إذا اختار 10,000 دافع ضرائب مغربي موثّق نفس نسب التوزيع الخاصة بك.',
    subtitlePersonal:
      'وحدات الخدمات العمومية المموّلة مباشرة من مساهمتك الضريبية الفردية بالدرهم.',
    scopeToggleAria: 'اختيار مقياس الأثر المتوقع',
    scopeCollectiveBtn: 'جماعي (10 آلاف مساهم)',
    scopePersonalBtn: 'مساهمتك الفردية',
    projectedPoolLabel: 'الصندوق التشاركي المتوقع',
    benchmarksFundedLabel: 'المؤشرات النشطة',
    emptyTitle: 'حرّك أي مؤشر أعلاه لمعاينة الأثر المتوقع لضريبتك',
    emptyDesc:
      'كل درهم تخصّصه يتحول إلى منجزات عمومية ملموسة في المغرب: من المستوصفات القروية والقاعات الدراسية إلى الربط بالماء الصالح للشرب.',
    previewSampleBtn: 'معاينة أثر التوزيع المقترح',
    inlineSectorKicker: 'الأثر المتوقع لهذا القطاع',
    inlineSectorEmpty:
      'عدّل أي مؤشر أعلاه لمعرفة عدد المشاريع والخدمات التي يدعمها تخصيصك في هذا القطاع.',
    nextMilestoneLabel: (pct) => `${pct}% نحو الوحدة الكاملة التالية`,
    fullUnitsLabel: (count) => `يدعم ${count} وحدة مرجعية`,
  },
};

function formatUnitsNumber(rawUnits: number, locale: Locale): string {
  const isNearInt = Math.abs(rawUnits - Math.round(rawUnits)) < 0.05;
  if (rawUnits >= 10 || isNearInt) {
    const rounded = Math.round(rawUnits);
    return locale === 'fr'
      ? rounded.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')
      : rounded.toLocaleString('en-US');
  }
  return rawUnits.toFixed(1);
}

function buildImpactItem(
  subSectorId: string,
  sectorId: string,
  allocatedDH: number,
  scope: ImpactScope,
  locale: Locale
): ExpectedImpactItem | null {
  if (allocatedDH <= 0) return null;
  const benchmark = SUB_SECTOR_BENCHMARKS[subSectorId];
  if (!benchmark) return null;

  const effectivePoolDH =
    scope === 'collective' ? allocatedDH * COLLECTIVE_TAXPAYER_MULTIPLIER : allocatedDH;
  const unitCostDH =
    scope === 'collective' ? benchmark.collectiveUnitCostDH : benchmark.personalUnitCostDH;
  const copy =
    scope === 'collective' ? benchmark.collective[locale] : benchmark.personal[locale];

  const rawUnits = effectivePoolDH / unitCostDH;
  const isPartialUnit = rawUnits < 1;

  let displayQuantity: string;
  let shortOutcome: string;
  let statement: string;
  let progressToNextUnitPct: number;

  if (isPartialUnit) {
    const pct = Math.max(1, Math.min(99, Math.round(rawUnits * 100)));
    progressToNextUnitPct = pct;
    displayQuantity = `${pct}%`;
    if (locale === 'fr') {
      shortOutcome = `${pct} % vers 1 ${copy.singular}`;
      statement = `Cette répartition finance ${pct} % d'un(e) ${copy.singular}`;
    } else if (locale === 'ar') {
      shortOutcome = `${pct}% نحو ${copy.singular}`;
      statement = `يموّل هذا التوزيع ${pct}% من تكلفة ${copy.singular}`;
    } else {
      shortOutcome = `${pct}% toward 1 ${copy.singular}`;
      statement = `This allocation funds ${pct}% toward 1 ${copy.singular}`;
    }
  } else {
    const qtyStr = formatUnitsNumber(rawUnits, locale);
    const isSingular = Math.abs(rawUnits - 1) < 0.05;
    const labelNoun = isSingular ? copy.singular : copy.plural;
    displayQuantity = qtyStr;

    const fractional = rawUnits - Math.floor(rawUnits);
    progressToNextUnitPct =
      fractional < 0.05 ? 100 : Math.min(99, Math.max(5, Math.round(fractional * 100)));

    if (locale === 'fr') {
      shortOutcome = `${qtyStr} ${labelNoun}`;
      statement = `Cette répartition soutient ${qtyStr} ${labelNoun}`;
    } else if (locale === 'ar') {
      shortOutcome = `${qtyStr} ${labelNoun}`;
      statement = `يدعم هذا التوزيع ${qtyStr} ${labelNoun}`;
    } else {
      shortOutcome = `${qtyStr} ${labelNoun}`;
      statement = `This allocation supports ${qtyStr} ${labelNoun}`;
    }
  }

  const formattedUnitCost =
    unitCostDH >= 1_000
      ? formatLocalizedCompactDH(unitCostDH, locale)
      : formatLocalizedDH(unitCostDH, locale);

  const benchmarkNote =
    locale === 'fr'
      ? `Repère : ${formattedUnitCost} / ${copy.unitNoun}`
      : locale === 'ar'
      ? `المعيار: ${formattedUnitCost} / ${copy.unitNoun}`
      : `Benchmark: ${formattedUnitCost} / ${copy.unitNoun}`;

  return {
    subSectorId,
    sectorId,
    allocatedDH,
    effectivePoolDH,
    unitCostDH,
    rawUnits,
    displayQuantity,
    isPartialUnit,
    progressToNextUnitPct,
    shortOutcome,
    statement,
    benchmarkNote,
  };
}

export function calculateExpectedImpacts(
  allocations: Record<string, number>,
  sectors: Sector[],
  scope: ImpactScope,
  locale: Locale
): ExpectedImpactItem[] {
  const results: ExpectedImpactItem[] = [];

  for (const sector of sectors) {
    for (const sub of sector.subSectors) {
      const amt = allocations[sub.id] || 0;
      if (amt > 0) {
        const item = buildImpactItem(sub.id, sector.id, amt, scope, locale);
        if (item) results.push(item);
      }
    }
  }

  results.sort((a, b) => b.allocatedDH - a.allocatedDH);
  return results;
}

export function calculateSectorExpectedImpacts(
  allocations: Record<string, number>,
  sector: Sector,
  scope: ImpactScope,
  locale: Locale
): ExpectedImpactItem[] {
  return calculateExpectedImpacts(allocations, [sector], scope, locale);
}

export function summarizeExpectedImpactHeadline(
  impacts: ExpectedImpactItem[],
  locale: Locale
): string {
  if (impacts.length === 0) return '';
  if (impacts.length === 1) return `${impacts[0].statement}.`;

  const top = impacts.slice(0, 3).map((item) => item.shortOutcome);

  if (locale === 'fr') {
    const joined =
      top.length === 2
        ? `${top[0]} et ${top[1]}`
        : `${top[0]}, ${top[1]} et ${top[2]}`;
    return `Cette répartition soutient ${joined}.`;
  }

  if (locale === 'ar') {
    const joined = top.join('، و');
    return `يدعم هذا التوزيع ${joined}.`;
  }

  const joined =
    top.length === 2
      ? `${top[0]} and ${top[1]}`
      : `${top[0]}, ${top[1]}, and ${top[2]}`;
  return `This allocation supports ${joined}.`;
}
