import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, Sparkles } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLanguage } from '../i18n/LanguageContext';
import { Sector } from '../types/daribati';
import {
  buildSessionSectorDistribution,
  SectorDistributionPoint,
  SESSION_CHART_UI,
} from '../utils/allocationDistribution';

type ChartMode = 'donut' | 'bar';

interface EnrichedChartPoint extends SectorDistributionPoint {
  localizedTitle: string;
  localizedShort: string;
}

interface SessionAllocationChartProps {
  sectors: Sector[];
  allocations: Record<string, number>;
  sessionPaidBySubSector: Record<string, number>;
  onSelectSector: (sectorId: string) => void;
  onApplySampleSplit: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload?: EnrichedChartPoint }[];
  formatMoney: (n: number) => string;
  ui: (typeof SESSION_CHART_UI)['en'];
  hasBothPaidAndDraft: boolean;
}

const ChartTooltipContent: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  formatMoney,
  ui,
  hasBothPaidAndDraft,
}) => {
  if (!active || !payload || !payload.length || !payload[0].payload) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl bg-[#0A1238] text-white px-3.5 py-2.5 shadow-[0_12px_28px_rgba(7,12,38,0.34)] border border-white/15 text-xs space-y-1 max-w-[240px]">
      <div className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-xs shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-display font-bold text-white leading-tight">
          {item.localizedTitle}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-4 pt-1 border-t border-white/15">
        <span className="font-mono font-bold text-[#7EE8E2] tabular-nums">
          {formatMoney(item.totalDH)}
        </span>
        <span className="font-mono text-[#C6D5F5] tabular-nums">
          {item.sharePct.toFixed(1)}%
        </span>
      </div>
      {hasBothPaidAndDraft && (
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#C6D5F5] pt-0.5">
          <span>
            {ui.paidTag}: <strong className="font-mono text-white tabular-nums">{formatMoney(item.paidDH)}</strong>
          </span>
          <span>
            {ui.draftTag}: <strong className="font-mono text-white tabular-nums">{formatMoney(item.draftDH)}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export const SessionAllocationChart: React.FC<SessionAllocationChartProps> = ({
  sectors,
  allocations,
  sessionPaidBySubSector,
  onSelectSector,
  onApplySampleSplit,
}) => {
  const { locale, formatMoney, getSectorCopy } = useLanguage();
  const [chartMode, setChartMode] = useState<ChartMode>('donut');
  const ui = SESSION_CHART_UI[locale];

  const distribution = useMemo(
    () => buildSessionSectorDistribution(sectors, allocations, sessionPaidBySubSector),
    [sectors, allocations, sessionPaidBySubSector]
  );

  const chartData: EnrichedChartPoint[] = useMemo(
    () =>
      distribution.points.map((point) => {
        const copy = getSectorCopy(
          point.sectorId,
          point.fallbackTitle,
          point.fallbackShortTitle
        );
        return {
          ...point,
          localizedTitle: copy.title,
          localizedShort: copy.shortTitle,
        };
      }),
    [distribution.points, getSectorCopy]
  );

  const topSectorCopy = distribution.topSector
    ? getSectorCopy(
        distribution.topSector.sectorId,
        distribution.topSector.fallbackTitle,
        distribution.topSector.fallbackShortTitle
      )
    : null;

  const hasBothPaidAndDraft =
    distribution.paidTotalDH > 0 && distribution.draftTotalDH > 0;

  return (
    <section
      aria-label={ui.sectionAria}
      className="bg-white/96 rounded-2xl border border-[#DCE4F2] shadow-[0_6px_26px_rgba(10,18,56,0.05)] overflow-hidden"
    >
      {/* Header + Donut / Bar Mode Segmented Toggle */}
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4EBF7]">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-[#1D3FD8] mb-1">{ui.kicker}</p>
          <h2 className="font-display text-xl font-bold text-[#0A1238]">
            {ui.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#546482] mt-1">{ui.subtitle}</p>
        </div>

        <div
          role="group"
          aria-label={ui.viewToggleAria}
          className="self-start lg:self-auto inline-flex items-center p-1 rounded-xl bg-[#EEF2FA] border border-[#DCE4F2] shrink-0"
        >
          <button
            type="button"
            aria-pressed={chartMode === 'donut'}
            onClick={() => setChartMode('donut')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              chartMode === 'donut'
                ? 'bg-[#0A1238] text-white shadow-xs'
                : 'text-[#475878] hover:text-[#0A1238]'
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            <span>{ui.donutBtn}</span>
          </button>
          <button
            type="button"
            aria-pressed={chartMode === 'bar'}
            onClick={() => setChartMode('bar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              chartMode === 'bar'
                ? 'bg-[#0A1238] text-white shadow-xs'
                : 'text-[#475878] hover:text-[#0A1238]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{ui.barBtn}</span>
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        /* Empty State */
        <div className="px-6 py-10 text-center space-y-3">
          <p className="font-display text-base font-bold text-[#0A1238]">
            {ui.emptyTitle}
          </p>
          <p className="text-xs sm:text-sm text-[#546482] max-w-lg mx-auto leading-relaxed">
            {ui.emptyDesc}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onApplySampleSplit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1238] text-white text-xs sm:text-sm font-bold hover:bg-[#1D3FD8] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-[#7EE8E2]" />
              <span>{ui.previewSampleBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* 4-Column Session KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#E4EBF7] bg-[#F8FAFE]">
            <div className="p-4 sm:px-6 border-b lg:border-b-0 border-e border-[#E4EBF7]">
              <p className="text-[11px] font-semibold text-[#546482]">
                {ui.totalSessionLabel}
              </p>
              <p className="font-mono text-lg font-extrabold text-[#0A1238] tabular-nums mt-0.5">
                {formatMoney(distribution.grandTotalDH)}
              </p>
            </div>
            <div className="p-4 sm:px-6 border-b lg:border-b-0 lg:border-e border-[#E4EBF7]">
              <p className="text-[11px] font-semibold text-[#546482]">
                {ui.activeDraftLabel}
              </p>
              <p className="font-mono text-lg font-bold text-[#1D3FD8] tabular-nums mt-0.5">
                {formatMoney(distribution.draftTotalDH)}
              </p>
            </div>
            <div className="p-4 sm:px-6 border-e border-[#E4EBF7]">
              <p className="text-[11px] font-semibold text-[#546482]">
                {ui.paidSessionLabel}
              </p>
              <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums mt-0.5">
                {formatMoney(distribution.paidTotalDH)}
              </p>
            </div>
            <div className="p-4 sm:px-6">
              <p className="text-[11px] font-semibold text-[#546482]">
                {ui.topSectorLabel}
              </p>
              <p className="font-display text-sm sm:text-base font-bold text-[#0A1238] truncate mt-0.5">
                {topSectorCopy?.shortTitle}{' '}
                <span className="font-mono text-xs font-semibold text-[#087E83] tabular-nums">
                  ({distribution.topSector?.sharePct.toFixed(0)}%)
                </span>
              </p>
            </div>
          </div>

          {/* 2-Column Split: Recharts Canvas + Interactive Sector Distribution Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Recharts Visualization Canvas */}
            <div className="lg:col-span-6 p-5 sm:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-e border-[#E4EBF7]">
              <div
                className="relative w-full h-[290px]"
                dir="ltr"
                data-testid="session-allocation-chart-canvas"
              >
                {chartMode === 'donut' ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="totalDH"
                          nameKey="localizedShort"
                          cx="50%"
                          cy="50%"
                          innerRadius={74}
                          outerRadius={118}
                          paddingAngle={chartData.length > 1 ? 2.5 : 0}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          isAnimationActive={false}
                          onClick={(_entry, index) => {
                            const clicked = chartData[index];
                            if (clicked) {
                              onSelectSector(clicked.sectorId);
                            }
                          }}
                        >
                          {chartData.map((entry) => (
                            <Cell
                              key={entry.sectorId}
                              fill={entry.color}
                              className="cursor-pointer outline-none"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={
                            <ChartTooltipContent
                              formatMoney={formatMoney}
                              ui={ui}
                              hasBothPaidAndDraft={hasBothPaidAndDraft}
                            />
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Donut Readout */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                      <span className="text-[11px] font-semibold text-[#546482]">
                        {ui.centerTotalLabel}
                      </span>
                      <span className="font-mono text-lg sm:text-xl font-extrabold text-[#0A1238] tabular-nums mt-0.5">
                        {formatMoney(distribution.grandTotalDH)}
                      </span>
                      <span className="text-[11px] text-[#087E83] font-semibold mt-0.5">
                        {ui.sectorsFundedCount(distribution.fundedSectorCount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#E4EBF7"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#546482', fontFamily: 'IBM Plex Mono' }}
                        axisLine={{ stroke: '#DCE4F2' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="localizedShort"
                        width={118}
                        tick={{ fontSize: 11.5, fill: '#0A1238', fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#F2F6FF' }}
                        content={
                          <ChartTooltipContent
                            formatMoney={formatMoney}
                            ui={ui}
                            hasBothPaidAndDraft={hasBothPaidAndDraft}
                          />
                        }
                      />
                      <Bar
                        dataKey="totalDH"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={28}
                        isAnimationActive={false}
                        onClick={(_entry, index) => {
                          const clicked = chartData[index];
                          if (clicked) {
                            onSelectSector(clicked.sectorId);
                          }
                        }}
                      >
                        {chartData.map((entry) => (
                          <Cell
                            key={entry.sectorId}
                            fill={entry.color}
                            className="cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <p className="text-[11px] text-center text-[#5E7091] mt-2">
                {ui.clickToInspectHint}
              </p>
            </div>

            {/* Interactive Sector Distribution Ledger */}
            <div className="lg:col-span-6 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4EBF7]">
                  <h3 className="font-display text-sm font-bold text-[#0A1238]">
                    {ui.sectorLedgerTitle}
                  </h3>
                  <span className="text-xs text-[#546482] font-mono tabular-nums">
                    {ui.sectorsFundedCount(distribution.fundedSectorCount)}
                  </span>
                </div>

                <div className="divide-y divide-[#EEF2FA] mt-1">
                  {chartData.map((item) => (
                    <button
                      key={item.sectorId}
                      type="button"
                      onClick={() => onSelectSector(item.sectorId)}
                      className="w-full py-3 flex items-center justify-between gap-3 text-start hover:bg-[#F7F9FE] transition-colors rounded-lg px-2 -mx-2 cursor-pointer group"
                    >
                      <div className="min-w-0 flex items-start gap-2.5">
                        <span
                          className="w-3 h-3 rounded-xs mt-1 shrink-0"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0A1238] group-hover:text-[#1D3FD8] transition-colors truncate">
                            {item.localizedTitle}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-[#5E7091] mt-0.5">
                            <span className="font-mono tabular-nums">
                              0{item.sectorNumber}
                            </span>
                            {hasBothPaidAndDraft && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {ui.paidTag}: {formatMoney(item.paidDH)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  {ui.draftTag}: {formatMoney(item.draftDH)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <p className="font-mono text-sm font-bold text-[#0A1238] tabular-nums">
                          {formatMoney(item.totalDH)}
                        </p>
                        <p className="font-mono text-xs font-semibold text-[#087E83] tabular-nums">
                          {item.sharePct.toFixed(1)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
