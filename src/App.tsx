import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CitizenProfileView } from './components/CitizenProfileView';
import { DarkBlueNoiseBackdrop } from './components/DarkBlueNoiseBackdrop';
import { Header } from './components/Header';
import { PaymentModal } from './components/PaymentModal';
import { PublicTendersView } from './components/PublicTendersView';
import { TaxAllocatorView } from './components/TaxAllocatorView';
import { useLanguage } from './i18n/LanguageContext';
import {
  DEFAULT_CITIZEN_PROFILE,
  INITIAL_SECTORS,
  INITIAL_TENDERS,
  SAMPLE_ALLOCATION_FOR_1000,
} from './data/daribatiData';
import {
  ActiveTab,
  AllocationItem,
  CitizenProfile,
  PaymentMethod,
  Sector,
  TaxCategory,
  TaxReceipt,
} from './types/daribati';
import {
  COMPARE_ALLOCATIONS_UI,
  SavedScenariosMap,
  ScenarioSlot,
  sumAllocations,
} from './utils/allocationComparison';
import { calculateCivicRank } from './utils/civicRank';

const STORAGE_KEY = 'daribati_portal_state_v1';

interface PersistedState {
  profile: CitizenProfile;
  receipts: TaxReceipt[];
  userVotes: Record<string, string>;
  paidPoolBySubSector: Record<string, number>;
  savedScenarios?: SavedScenariosMap;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export default function App() {
  const { t, locale, dir } = useLanguage();
  const persisted = useMemo(() => loadPersistedState(), []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('allocator');
  const [taxBillDH, setTaxBillDH] = useState<number>(1000);
  const [taxCategory, setTaxCategory] = useState<TaxCategory>(
    'IR — Impôt sur le Revenu'
  );
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [sessionPaidBySubSector, setSessionPaidBySubSector] = useState<Record<string, number>>({});
  const [paidPoolBySubSector, setPaidPoolBySubSector] = useState<Record<string, number>>(
    persisted?.paidPoolBySubSector ?? {}
  );
  const [savedScenarios, setSavedScenarios] = useState<SavedScenariosMap>(
    persisted?.savedScenarios ?? { A: null, B: null }
  );
  const [profile, setProfile] = useState<CitizenProfile>(
    persisted?.profile ?? DEFAULT_CITIZEN_PROFILE
  );
  const [receipts, setReceipts] = useState<TaxReceipt[]>(persisted?.receipts ?? []);
  const [userVotes, setUserVotes] = useState<Record<string, string>>(
    persisted?.userVotes ?? {}
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPremiumUnlocked = receipts.length > 0;
  const civicRank = useMemo(() => calculateCivicRank(receipts), [receipts]);

  // Persist completed payments, votes, saved scenarios, and citizen profile locally
  useEffect(() => {
    try {
      const payload: PersistedState = {
        profile,
        receipts,
        userVotes,
        paidPoolBySubSector,
        savedScenarios,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in private preview modes
    }
  }, [profile, receipts, userVotes, paidPoolBySubSector, savedScenarios]);

  // Auto-dismiss transient toast feedback
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Combine initial national funding pool with any completed payments by this user
  const liveSectors: Sector[] = useMemo(() => {
    return INITIAL_SECTORS.map((sector) => ({
      ...sector,
      subSectors: sector.subSectors.map((sub) => ({
        ...sub,
        currentDH: sub.currentDH + (paidPoolBySubSector[sub.id] || 0),
      })),
    }));
  }, [paidPoolBySubSector]);

  const handleChangeTaxBill = (nextAmount: number) => {
    setTaxBillDH(nextAmount);
    // If current allocations exceed the new tax bill, proportionally scale or clamp them
    const currentSum = Object.values(allocations).reduce((s, v) => s + v, 0);
    if (currentSum > nextAmount) {
      if (nextAmount === 0) {
        setAllocations({});
      } else {
        const ratio = nextAmount / currentSum;
        const scaled: Record<string, number> = {};
        let running = 0;
        const entries = Object.entries(allocations).filter(([, v]) => v > 0);
        entries.forEach(([subId, val], idx) => {
          if (idx === entries.length - 1) {
            scaled[subId] = Math.max(0, nextAmount - running);
          } else {
            const nextVal = Math.floor(val * ratio);
            scaled[subId] = nextVal;
            running += nextVal;
          }
        });
        setAllocations(scaled);
      }
    }
  };

  const handleUpdateSubSectorAllocation = (subSectorId: string, amount: number) => {
    setAllocations((prev) => {
      const otherSum = Object.entries(prev).reduce(
        (sum, [key, val]) => (key === subSectorId ? sum : sum + val),
        0
      );
      const maxAllowed = Math.max(0, taxBillDH - otherSum);
      const clamped = Math.max(0, Math.min(maxAllowed, Math.round(amount)));
      if (clamped === 0) {
        const next = { ...prev };
        delete next[subSectorId];
        return next;
      }
      return { ...prev, [subSectorId]: clamped };
    });
  };

  const currentAllocationItems: AllocationItem[] = useMemo(() => {
    const items: AllocationItem[] = [];
    liveSectors.forEach((sec) => {
      sec.subSectors.forEach((sub) => {
        const amt = allocations[sub.id] || 0;
        if (amt > 0) {
          items.push({
            sectorId: sec.id,
            sectorTitle: sec.title,
            subSectorId: sub.id,
            subSectorName: sub.name,
            amountDH: amt,
          });
        }
      });
    });
    return items;
  }, [liveSectors, allocations]);

  const handleConfirmPayment = (
    method: PaymentMethod,
    paymentReference: string
  ): TaxReceipt => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const receipt: TaxReceipt = {
      id: `DAR-2026-MA-${randomSuffix}`,
      paidAt: new Date().toISOString(),
      taxCategory,
      totalAmountDH: taxBillDH,
      paymentMethod: method,
      paymentReference,
      citizenName: profile.fullName,
      citizenCIN: profile.cin,
      citizenCity: profile.city,
      allocations: currentAllocationItems,
    };

    // Permanently credit the paid amounts to the live national sector tanks
    setPaidPoolBySubSector((prev) => {
      const next = { ...prev };
      currentAllocationItems.forEach((item) => {
        next[item.subSectorId] = (next[item.subSectorId] || 0) + item.amountDH;
      });
      return next;
    });

    // Track completed payments in the current user session for the session summary chart
    setSessionPaidBySubSector((prev) => {
      const next = { ...prev };
      currentAllocationItems.forEach((item) => {
        next[item.subSectorId] = (next[item.subSectorId] || 0) + item.amountDH;
      });
      return next;
    });

    setReceipts((prev) => [receipt, ...prev]);
    setAllocations({});
    return receipt;
  };

  const handleCastVote = (tenderId: string, bidId: string) => {
    if (!isPremiumUnlocked) return;
    setUserVotes((prev) => ({ ...prev, [tenderId]: bidId }));
    const tender = INITIAL_TENDERS.find((tItem) => tItem.id === tenderId);
    const bid = tender?.bids.find((b) => b.id === bidId);
    if (bid) {
      setToastMessage(t.toastVoteRecorded(bid.companyName));
    }
  };

  const handleUpdateProfile = (next: CitizenProfile) => {
    setProfile(next);
    setToastMessage(t.toastProfileUpdated);
  };

  const scaleSplitToBill = (
    baseFor1000: Record<string, number>,
    billDH: number
  ): Record<string, number> => {
    const scaled: Record<string, number> = {};
    const entries = Object.entries(baseFor1000);
    let running = 0;
    entries.forEach(([subId, baseAmt], idx) => {
      if (idx === entries.length - 1) {
        scaled[subId] = Math.max(0, billDH - running);
      } else {
        const val = Math.round((baseAmt / 1000) * billDH);
        scaled[subId] = val;
        running += val;
      }
    });
    return scaled;
  };

  const handleSaveScenario = (slot: ScenarioSlot) => {
    if (sumAllocations(allocations) <= 0) return;
    const compareUi = COMPARE_ALLOCATIONS_UI[locale];
    setSavedScenarios((prev) => {
      const existing = prev[slot];
      const defaultName =
        slot === 'A' ? compareUi.slotLabel('A') : compareUi.slotLabel('B');
      return {
        ...prev,
        [slot]: {
          slot,
          name: existing?.name || defaultName,
          taxBillDH,
          allocations: { ...allocations },
          savedAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleRenameScenario = (slot: ScenarioSlot, nextName: string) => {
    setSavedScenarios((prev) => {
      const existing = prev[slot];
      if (!existing) return prev;
      return {
        ...prev,
        [slot]: { ...existing, name: nextName },
      };
    });
  };

  const handleApplyScenario = (slot: ScenarioSlot) => {
    const scenario = savedScenarios[slot];
    if (!scenario) return;
    setTaxBillDH(scenario.taxBillDH);
    setAllocations({ ...scenario.allocations });
  };

  const handleClearScenario = (slot: ScenarioSlot) => {
    setSavedScenarios((prev) => ({ ...prev, [slot]: null }));
  };

  const handleLoadDemoComparison = () => {
    const compareUi = COMPARE_ALLOCATIONS_UI[locale];
    const bill = taxBillDH > 0 ? taxBillDH : 1000;
    const allocA = scaleSplitToBill(SAMPLE_ALLOCATION_FOR_1000, bill);
    const allocB = scaleSplitToBill(
      {
        'tr-roads': 300,
        'ut-water': 250,
        'ec-employment': 200,
        'hc-hospitals': 150,
        'ps-ems': 100,
      },
      bill
    );
    const now = new Date().toISOString();
    setSavedScenarios({
      A: {
        slot: 'A',
        name: compareUi.defaultNameA,
        taxBillDH: bill,
        allocations: allocA,
        savedAt: now,
      },
      B: {
        slot: 'B',
        name: compareUi.defaultNameB,
        taxBillDH: bill,
        allocations: allocB,
        savedAt: now,
      },
    });
    setTaxBillDH(bill);
    setAllocations(allocA);
  };

  return (
    <div className="relative isolate min-h-screen flex flex-col bg-[#F6F8FC] text-[#0A1238]">
      <DarkBlueNoiseBackdrop variant="canvas" />

      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isPremiumUnlocked={isPremiumUnlocked}
        receiptCount={receipts.length}
      />

      <main className="relative z-10 flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        {activeTab === 'allocator' && (
          <TaxAllocatorView
            sectors={liveSectors}
            taxBillDH={taxBillDH}
            onChangeTaxBill={handleChangeTaxBill}
            taxCategory={taxCategory}
            onChangeTaxCategory={setTaxCategory}
            allocations={allocations}
            sessionPaidBySubSector={sessionPaidBySubSector}
            savedScenarios={savedScenarios}
            onUpdateSubSectorAllocation={handleUpdateSubSectorAllocation}
            onApplyPresetAllocation={setAllocations}
            onClearAllocations={() => setAllocations({})}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            onSaveScenario={handleSaveScenario}
            onRenameScenario={handleRenameScenario}
            onApplyScenario={handleApplyScenario}
            onClearScenario={handleClearScenario}
            onLoadDemoComparison={handleLoadDemoComparison}
            isPremiumUnlocked={isPremiumUnlocked}
          />
        )}

        {activeTab === 'tenders' && (
          <PublicTendersView
            tenders={INITIAL_TENDERS}
            isPremiumUnlocked={isPremiumUnlocked}
            userVotes={userVotes}
            onCastVote={handleCastVote}
            onGoToAllocator={() => setActiveTab('allocator')}
          />
        )}

        {activeTab === 'profile' && (
          <CitizenProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            receipts={receipts}
            isPremiumUnlocked={isPremiumUnlocked}
            userVotes={userVotes}
            tenders={INITIAL_TENDERS}
            onGoToAllocator={() => setActiveTab('allocator')}
            onGoToTenders={() => setActiveTab('tenders')}
            onReceiptPdfDownloaded={(filename) =>
              setToastMessage(t.toastPdfDownloaded(filename))
            }
          />
        )}
      </main>

      {/* Quiet Civic Footer */}
      <footer className="no-print relative z-10 border-t border-[#DCE4F2] bg-white/80 backdrop-blur-md mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#546482]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 shrink-0 rounded-[6px] bg-gradient-to-br from-[#080E30] via-[#122476] to-[#1D3FD8] p-0.5 shadow-xs flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}assets/aistudio/Code_Generated_Image__3__59e44276.png`}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-contain"
              />
            </span>
            <p className="font-semibold text-[#0A1238]">{t.footerTitle}</p>
          </div>
          <p>{t.footerSubtitle}</p>
        </div>
      </footer>

      {/* Checkout & Celebratory Receipt Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        taxBillDH={taxBillDH}
        taxCategory={taxCategory}
        allocationItems={currentAllocationItems}
        citizenProfile={profile}
        onConfirmPayment={handleConfirmPayment}
        onGoToTenders={() => setActiveTab('tenders')}
        onReceiptPdfDownloaded={(filename) =>
          setToastMessage(t.toastPdfDownloaded(filename))
        }
        civicRank={civicRank}
      />

      {/* Transient Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`no-print fixed bottom-5 ${
            dir === 'rtl' ? 'left-5' : 'right-5'
          } z-50 max-w-sm bg-[#0A1238] text-white px-4 py-3 rounded-xl shadow-[0_12px_32px_rgba(10,18,56,0.28)] border border-[#2B50E8]/60 flex items-center gap-2.5 text-xs sm:text-sm font-medium`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#6EA0FF] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
