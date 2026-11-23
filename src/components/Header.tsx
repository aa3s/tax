import React from 'react';
import { Award, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LOCALES } from '../i18n/translations';
import { ActiveTab } from '../types/daribati';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isPremiumUnlocked: boolean;
  receiptCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isPremiumUnlocked,
  receiptCount,
}) => {
  const { locale, setLocale, t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; shortLabel: string }[] = [
    { id: 'allocator', label: t.navAllocator, shortLabel: t.navAllocatorShort },
    { id: 'tenders', label: t.navTenders, shortLabel: t.navTendersShort },
    { id: 'profile', label: t.navProfile, shortLabel: t.navProfileShort },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-[#F6F8FC]/86 backdrop-blur-xl border-b border-[#DCE4F2]/90">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('allocator')}
            className="flex items-center gap-2.5 text-start whitespace-nowrap shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3FD8] rounded-md py-1"
            aria-label={t.brandHomeAria}
          >
            <span className="w-9 h-9 shrink-0 rounded-[9px] bg-gradient-to-br from-[#080E30] via-[#122476] to-[#1D3FD8] p-1 shadow-[0_3px_12px_rgba(10,18,56,0.24)] ring-1 ring-[#2B50E8]/35 flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.04]">
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/Code_Generated_Image__3__59e44276.png`}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
              />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#0A1238]">
              {t.brandName}
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links (Desktop) */}
          <nav
            className="hidden md:flex items-center gap-6 lg:gap-7"
            aria-label={t.navPrimaryAria}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:text-[#1D3FD8] ${
                    isActive
                      ? 'text-[#0A1238]'
                      : 'text-[#4C5F80] hover:text-[#0A1238]'
                  }`}
                >
                  {item.label}
                  {item.id === 'profile' && receiptCount > 0 && (
                    <span className="ms-1.5 font-mono text-xs text-[#1D3FD8] tabular-nums">
                      ({receiptCount})
                    </span>
                  )}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[2.5px] rounded-t-full transition-transform duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0A1238] via-[#1D3FD8] to-[#087E83] scale-x-100'
                        : 'bg-transparent scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Switcher (EN / FR / العربية) + Citizen Status Control */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Compact Accessible Language Segmented Switcher */}
            <div
              role="group"
              aria-label={t.languageSelectorAria}
              className="inline-flex items-center p-0.5 rounded-lg bg-white/92 border border-[#CFD9EC] shrink-0"
            >
              <Globe
                className="w-3.5 h-3.5 text-[#55688B] ms-1.5 me-1 hidden sm:block shrink-0"
                aria-hidden="true"
              />
              {SUPPORTED_LOCALES.map((lang) => {
                const selected = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLocale(lang.code)}
                    aria-pressed={selected}
                    aria-label={lang.nativeName}
                    title={lang.nativeName}
                    className={`px-2 sm:px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D3FD8] ${
                      selected
                        ? 'bg-[#0A1238] text-white shadow-xs'
                        : 'text-[#475878] hover:text-[#0A1238] hover:bg-[#EEF2FA]'
                    }`}
                  >
                    <span className="hidden sm:inline">{lang.label}</span>
                    <span className="sm:hidden">{lang.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                isPremiumUnlocked
                  ? 'bg-gradient-to-r from-[#0A1238] to-[#152878] text-[#F7E39C] border border-[#D4AF37]/85 shadow-[0_4px_14px_rgba(10,18,56,0.22)] hover:brightness-110 focus-visible:ring-[#D4AF37]'
                  : 'bg-white/90 text-[#334466] border border-[#CFD9EC] hover:border-[#1D3FD8] hover:text-[#0A1238] focus-visible:ring-[#1D3FD8]'
              }`}
              title={isPremiumUnlocked ? t.statusVerifiedTitle : t.statusStandardTitle}
            >
              {isPremiumUnlocked ? (
                <>
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="hidden lg:inline">{t.statusVerifiedFull}</span>
                  <span className="lg:hidden">{t.statusVerifiedShort}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#55688B] shrink-0" />
                  <span className="hidden sm:inline">{t.statusStandard}</span>
                  <span className="sm:hidden">{t.statusStandardShort}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Compact Navigation Row */}
        <nav
          className="md:hidden flex items-center gap-1 pb-2.5 overflow-x-auto"
          aria-label={t.navMobileAria}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0A1238] text-white'
                    : 'text-[#4C5F80] hover:bg-[#E7EEF9]'
                }`}
              >
                {item.shortLabel}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
