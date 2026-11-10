import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, User, ExternalLink } from 'lucide-react';
import { SalesRepLeaderboardItem } from '../types';
import { formatPercent } from '../utils/formatters';
import { useLanguage } from '../services/i18n';

interface Props {
  leaderboard: SalesRepLeaderboardItem[];
  onSelectRep: (repId: string) => void;
}

type SortField =
  | 'rank'
  | 'salesRepName'
  | 'regionName'
  | 'revenue'
  | 'target'
  | 'achievement'
  | 'growth'
  | 'grossProfit'
  | 'grossMargin'
  | 'orders';

export const SalesRepsTable: React.FC<Props> = ({ leaderboard, onSelectRep }) => {
  const { language, t, formatCurrencyVND, formatNumber } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'salesRepName' || field === 'regionName' ? 'asc' : 'desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    return leaderboard
      .filter((item) => {
        const matchesSearch =
          item.salesRepName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.regionName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || item.statusBadge === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB as string)
            : (valB as string).localeCompare(valA);
        }
        return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
      });
  }, [leaderboard, searchTerm, statusFilter, sortField, sortOrder]);

  return (
    <section id="reps-section" className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400 shrink-0" />
            {t('repsTableTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {t('repsTableSub')}
          </p>
        </div>

        {/* Controls: Search & Status Filter */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full sm:w-auto">
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchRepsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded border border-slate-700 text-xs overflow-x-auto max-w-full pb-0.5 sm:pb-0 scrollbar-none">
            {['ALL', 'Excellent', 'Good', 'Warning', 'Below Target'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded font-medium transition-colors shrink-0 whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? (language === 'vi' ? 'Tất cả' : 'All')
                  : st === 'Excellent'
                  ? (language === 'vi' ? 'Xuất sắc' : 'Outstanding')
                  : st === 'Good'
                  ? (language === 'vi' ? 'Đạt' : 'On Track')
                  : st === 'Warning'
                  ? (language === 'vi' ? 'Cảnh báo' : 'Warning')
                  : (language === 'vi' ? 'Dưới chỉ tiêu' : 'Below Target')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sm:hidden text-[10px] text-slate-500 mb-1 flex items-center justify-end">
        <span>{language === 'vi' ? '← Vuốt ngang để xem đủ chỉ số →' : '← Scroll horizontally for more metrics →'}</span>
      </div>

      {/* High-density table */}
      <div
        className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0 touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full text-left text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold tracking-wider uppercase text-[11px]">
              <th
                onClick={() => handleSort('rank')}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>{t('colRank')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('salesRepName')}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>{t('colRepName')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('regionName')}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>{t('colRegion')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('revenue')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('colRevenue')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('target')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('colTarget')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('achievement')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('colAchievement')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('growth')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>YoY</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossProfit')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('kpiGrossProfit')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grossMargin')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('colMargin')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('orders')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>{t('colOrders')}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">{t('colStatus')}</th>
              <th className="py-2.5 px-2 text-center">{language === 'vi' ? 'Chi tiết' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredAndSorted.map((item, idx) => {
              return (
                <tr
                  key={item.salesRepId}
                  onClick={() => onSelectRep(item.salesRepId)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <td className="py-2 px-3 font-mono text-slate-400 font-medium">
                    <span
                      className={`inline-block w-5 h-5 rounded text-center leading-5 text-[11px] ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : idx === 1
                          ? 'bg-slate-300/20 text-slate-200 font-bold'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-400 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-medium text-white group-hover:text-blue-400 transition-colors">
                    {item.salesRepName}
                  </td>
                  <td className="py-2 px-3 text-slate-400">{item.regionName}</td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-slate-200 tabular-nums">
                    {formatCurrencyVND(item.revenue, true)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400 tabular-nums">
                    {formatCurrencyVND(item.target, true)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                    <span
                      className={
                        item.achievement >= 120
                          ? 'text-emerald-400'
                          : item.achievement >= 100
                          ? 'text-blue-400'
                          : item.achievement >= 80
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {formatPercent(item.achievement)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">
                    <span className={item.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatPercent(item.growth, true)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatCurrencyVND(item.grossProfit, true)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatPercent(item.grossMargin)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {item.orders}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide ${
                        item.statusBadge === 'Excellent'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.statusBadge === 'Good'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : item.statusBadge === 'Warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.statusBadge}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-slate-500 group-hover:text-blue-400">
                    <ExternalLink className="w-3.5 h-3.5 inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
