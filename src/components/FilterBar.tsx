import React from 'react';
import { Filter, RotateCcw, Calendar, MapPin, User, Package, Layers } from 'lucide-react';
import { FilterState, Region, Channel, SalesRep, Product } from '../types';
import { useLanguage } from '../services/i18n';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  regions: Region[];
  channels: Channel[];
  salesReps: SalesRep[];
  products: Product[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  regions,
  channels,
  salesReps,
  products,
}) => {
  const { language, t } = useLanguage();

  // Extract distinct categories
  const categories = React.useMemo(() => {
    return Array.from(new Set(products.map((p) => p.Category)));
  }, [products]);

  // Filter sales reps if a region is selected
  const availableReps = React.useMemo(() => {
    if (filters.regionId === 'ALL') return salesReps;
    return salesReps.filter((r) => r.Region_ID === filters.regionId);
  }, [salesReps, filters.regionId]);

  const handlePeriodChange = (period: FilterState['period']) => {
    if (period === '9M') {
      onChangeFilters({ ...filters, period: '9M', startMonth: 1, endMonth: 9 });
    } else if (period === 'Q1') {
      onChangeFilters({ ...filters, period: 'Q1', startMonth: 1, endMonth: 3 });
    } else if (period === 'Q2') {
      onChangeFilters({ ...filters, period: 'Q2', startMonth: 4, endMonth: 6 });
    } else if (period === 'Q3') {
      onChangeFilters({ ...filters, period: 'Q3', startMonth: 7, endMonth: 9 });
    } else {
      onChangeFilters({ ...filters, period: 'custom' });
    }
  };

  const isFiltered =
    filters.period !== '9M' ||
    filters.startMonth !== 1 ||
    filters.endMonth !== 9 ||
    filters.regionId !== 'ALL' ||
    filters.salesRepId !== 'ALL' ||
    filters.category !== 'ALL' ||
    filters.channelId !== 'ALL' ||
    filters.year !== 2026;

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/90 backdrop-blur py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 shadow-sm">
      <div className="max-w-[1720px] mx-auto flex flex-col gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Left: Filter Controls Grid */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
            {/* Filter Icon & Label */}
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[11px] pr-2 border-r border-slate-800 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xs:inline">{t('filterLabel')}</span>
            </div>

            {/* Year Selector */}
            <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, year: 2026 })}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filters.year === 2026
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2026
              </button>
              <button
                type="button"
                onClick={() => onChangeFilters({ ...filters, year: 2025 })}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filters.year === 2025
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2025
              </button>
            </div>

            {/* Period Segmented Control */}
            <div className="flex items-center bg-slate-800 rounded border border-slate-700 p-0.5">
              {(['9M', 'Q1', 'Q2', 'Q3'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePeriodChange(p)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    filters.period === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p === '9M' ? t('periodAll') : p}
                </button>
              ))}
            </div>

            {/* Month Range Selectors */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'vi' ? 'T' : 'M'}</span>
              <select
                value={filters.startMonth}
                onChange={(e) => {
                  const s = parseInt(e.target.value, 10);
                  const newEnd = Math.max(s, filters.endMonth);
                  onChangeFilters({ ...filters, startMonth: s, endMonth: newEnd, period: 'custom' });
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <span className="text-slate-500">→</span>
              <span>{language === 'vi' ? 'T' : 'M'}</span>
              <select
                value={filters.endMonth}
                onChange={(e) => {
                  const end = parseInt(e.target.value, 10);
                  const newStart = Math.min(filters.startMonth, end);
                  onChangeFilters({ ...filters, startMonth: newStart, endMonth: end, period: 'custom' });
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={filters.regionId}
                onChange={(e) => {
                  const regId = e.target.value;
                  onChangeFilters({ ...filters, regionId: regId, salesRepId: 'ALL' });
                }}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  {t('allRegions')}
                </option>
                {regions.map((r) => (
                  <option key={r.Region_ID} value={r.Region_ID} className="bg-slate-900 text-white">
                    {t(r.Region_ID as any, r.Region_Name)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sales Rep Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={filters.salesRepId}
                onChange={(e) => onChangeFilters({ ...filters, salesRepId: e.target.value })}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[140px]"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  {t('allReps')}
                </option>
                {availableReps.map((r) => (
                  <option key={r.Sales_Rep_ID} value={r.Sales_Rep_ID} className="bg-slate-900 text-white">
                    {r.Sales_Rep_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Category Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={filters.category}
                onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[140px]"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  {t('allCategories')}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {t(c as any, c)}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-slate-300">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={filters.channelId}
                onChange={(e) => onChangeFilters({ ...filters, channelId: e.target.value })}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[130px]"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  {t('allChannels')}
                </option>
                {channels.map((c) => (
                  <option key={c.Channel_ID} value={c.Channel_ID} className="bg-slate-900 text-white">
                    {t(c.Channel_ID as any, c.Channel_Name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 rounded border border-amber-800/50 transition-colors cursor-pointer shrink-0"
              title={language === 'vi' ? 'Đặt lại toàn bộ bộ lọc về mặc định' : 'Reset all filters to default'}
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>{t('resetFilters')}</span>
            </button>
          )}
        </div>

        {/* Filter Breadcrumbs Summary */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-400">
          <span className="text-slate-500">{language === 'vi' ? 'Phạm vi tính toán:' : 'Analytical Scope:'}</span>
          <span className="text-slate-200 font-medium">
            {language === 'vi' ? `Năm ${filters.year}` : `Year ${filters.year}`}
          </span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-200 font-medium">
            {language === 'vi'
              ? `Tháng ${filters.startMonth} - Tháng ${filters.endMonth} (Đối chiếu ${filters.year - 1})`
              : `Month ${filters.startMonth} - Month ${filters.endMonth} (vs ${filters.year - 1})`}
          </span>
          {filters.regionId !== 'ALL' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-blue-400 font-medium">
                {language === 'vi' ? 'Vùng: ' : 'Region: '}
                {t(filters.regionId as any, regions.find((r) => r.Region_ID === filters.regionId)?.Region_Name || '')}
              </span>
            </>
          )}
          {filters.salesRepId !== 'ALL' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-blue-400 font-medium">
                Sales Rep: {salesReps.find((r) => r.Sales_Rep_ID === filters.salesRepId)?.Sales_Rep_Name}
              </span>
            </>
          )}
          {filters.category !== 'ALL' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-blue-400 font-medium">
                {language === 'vi' ? 'Nhóm: ' : 'Category: '}
                {t(filters.category as any, filters.category)}
              </span>
            </>
          )}
          {filters.channelId !== 'ALL' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-blue-400 font-medium">
                {language === 'vi' ? 'Kênh: ' : 'Channel: '}
                {t(filters.channelId as any, channels.find((c) => c.Channel_ID === filters.channelId)?.Channel_Name || '')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
