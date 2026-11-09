import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Percent,
  ShoppingCart,
  Receipt,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { KPIResult, FilterState } from '../types';
import { formatPercent } from '../utils/formatters';
import { useLanguage } from '../services/i18n';

interface KpiGridProps {
  kpis: KPIResult;
  filters: FilterState;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis, filters }) => {
  const { language, t, formatCurrencyVND, formatNumber } = useLanguage();
  const prevYear = filters.year - 1;

  return (
    <section id="kpi-section" className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* KPI 1: TOTAL NET REVENUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiNetRevenue')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="SUM(Net_Revenue) after discounts, excluding cancelled">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrencyVND(kpis.netRevenue, true)}
            </span>
            <div
              className={`flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-mono tabular-nums ${
                kpis.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.revenueGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{formatPercent(kpis.revenueGrowth, true)}</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? `Cùng kỳ ${prevYear}:` : `Prior Year ${prevYear}:`}</span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              {formatCurrencyVND(kpis.prevNetRevenue, true)}
            </span>
          </div>
        </div>

        {/* KPI 2: REVENUE TARGET */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiTarget')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="SUM(Revenue_Target) plan quota">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrencyVND(kpis.revenueTarget, true)}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
              {kpis.netRevenue >= kpis.revenueTarget ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {language === 'vi' ? 'Đạt' : 'Met'}
                </span>
              ) : (
                <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> -
                  {formatCurrencyVND(kpis.revenueTarget - kpis.netRevenue, true)}
                </span>
              )}
            </span>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? 'Chênh lệch:' : 'Variance:'}</span>
            <span
              className={`font-mono font-medium tabular-nums shrink-0 ${
                kpis.netRevenue - kpis.revenueTarget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.netRevenue - kpis.revenueTarget >= 0 ? '+' : ''}
              {formatCurrencyVND(kpis.netRevenue - kpis.revenueTarget, true)}
            </span>
          </div>
        </div>

        {/* KPI 3: TARGET ACHIEVEMENT */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiAchievementRate')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="Actual Revenue / Target * 100%">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span
              className={`text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight tabular-nums ${
                kpis.achievementRate >= 100
                  ? 'text-emerald-400'
                  : kpis.achievementRate >= 80
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {formatPercent(kpis.achievementRate)}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
              {language === 'vi' ? 'Chuẩn: ' : 'Target: '}<span className="text-slate-200 font-medium">100%</span>
            </span>
          </div>

          {/* Miniature visual progress bar */}
          <div className="mt-2.5 sm:mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                kpis.achievementRate >= 100
                  ? 'bg-emerald-500'
                  : kpis.achievementRate >= 80
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, kpis.achievementRate))}%` }}
            />
          </div>
        </div>

        {/* KPI 4: REVENUE GROWTH */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiYoYGrowth')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="(Current Revenue - Prior Revenue) / Prior * 100%">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span
              className={`text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight tabular-nums ${
                kpis.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPercent(kpis.revenueGrowth, true)}
            </span>
            <span className="text-[10px] sm:text-xs font-mono text-slate-400">
              vs {prevYear}
            </span>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? 'Tăng tuyệt đối:' : 'Abs Growth:'}</span>
            <span className="font-mono text-slate-200 tabular-nums shrink-0">
              {kpis.netRevenue - kpis.prevNetRevenue >= 0 ? '+' : ''}
              {formatCurrencyVND(kpis.netRevenue - kpis.prevNetRevenue, true)}
            </span>
          </div>
        </div>

        {/* KPI 5: GROSS PROFIT */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiGrossProfit')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="SUM(Gross_Profit) = Net Revenue - COGS">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrencyVND(kpis.grossProfit, true)}
            </span>
            <div
              className={`flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-mono tabular-nums ${
                kpis.profitGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.profitGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{formatPercent(kpis.profitGrowth, true)}</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? `Cùng kỳ ${prevYear}:` : `Prior Year ${prevYear}:`}</span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              {formatCurrencyVND(kpis.prevGrossProfit, true)}
            </span>
          </div>
        </div>

        {/* KPI 6: GROSS MARGIN */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <Percent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiGrossMargin')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="Gross Profit / Net Revenue * 100%">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatPercent(kpis.grossMargin)}
            </span>
            <span
              className={`text-[10px] sm:text-xs font-semibold font-mono tabular-nums ${
                kpis.grossMarginDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.grossMarginDiff >= 0 ? '+' : ''}
              {kpis.grossMarginDiff.toFixed(1)} % pts
            </span>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? `Cùng kỳ ${prevYear}:` : `Prior Year ${prevYear}:`}</span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              {formatPercent(kpis.prevGrossMargin)}
            </span>
          </div>
        </div>

        {/* KPI 7: TOTAL ORDERS */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiTotalOrders')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="Distinct Order_ID count">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatNumber(kpis.totalOrders)}
              <span className="text-[10px] sm:text-xs font-normal text-slate-400 ml-1">
                {language === 'vi' ? 'đơn' : 'orders'}
              </span>
            </span>
            <div
              className={`flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-mono tabular-nums ${
                kpis.ordersGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.ordersGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{formatPercent(kpis.ordersGrowth, true)}</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? 'Sản lượng:' : 'Volume:'}</span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              {formatNumber(kpis.totalQuantity)} {language === 'vi' ? 'Tấn' : 'Tons'}
            </span>
          </div>
        </div>

        {/* KPI 8: AVERAGE ORDER VALUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1 sm:mb-1.5">
            <div className="flex items-center gap-1 sm:gap-1.5 font-medium truncate">
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="truncate uppercase font-bold">{t('kpiAOV')}</span>
            </div>
            <div className="group relative cursor-pointer shrink-0" title="Total Net Revenue / Total Valid Orders">
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 hover:text-slate-300" />
            </div>
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-1 mt-0.5 sm:mt-1">
            <span className="text-base sm:text-xl md:text-2xl font-bold font-mono tracking-tight text-white tabular-nums">
              {formatCurrencyVND(kpis.avgOrderValue, true)}
            </span>
            <div
              className={`flex items-center gap-0.5 text-[11px] sm:text-xs font-semibold font-mono tabular-nums ${
                kpis.aovGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {kpis.aovGrowth >= 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
              <span>{formatPercent(kpis.aovGrowth, true)}</span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
            <span className="truncate">{language === 'vi' ? `Cùng kỳ ${prevYear}:` : `Prior Year ${prevYear}:`}</span>
            <span className="font-mono text-slate-300 tabular-nums shrink-0">
              {formatCurrencyVND(kpis.prevAvgOrderValue, true)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
