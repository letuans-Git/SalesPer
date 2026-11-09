import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { RegionPerformance } from '../../types';
import { useLanguage } from '../../services/i18n';

interface Props {
  data: RegionPerformance[];
  onSelectRegion?: (regionId: string) => void;
  selectedRegionId?: string;
}

const REGION_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export const RegionPerformanceChart: React.FC<Props> = ({
  data,
  onSelectRegion,
  selectedRegionId,
}) => {
  const { language, t, formatCurrencyVND } = useLanguage();

  const chartData = data.map((d) => ({
    ...d,
    localizedRegionName: t(d.regionId as any, d.regionName),
    revBillions: +(d.revenue / 1e9).toFixed(2),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 3: {t('chartRegionTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'vi'
              ? 'Quy mô doanh thu, tỷ trọng đóng góp và tăng trưởng từng vùng địa bàn'
              : 'Revenue scale, contribution share, and growth across regional territories'}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}B`}
            />
            <YAxis
              type="category"
              dataKey="localizedRegionName"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RegionPerformance & { localizedRegionName: string };
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        {item.localizedRegionName} ({language === 'vi' ? 'QL' : 'Mgr'}: {item.manager})
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>{language === 'vi' ? 'Doanh thu:' : 'Revenue:'}</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.revenue, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>{language === 'vi' ? 'Tỷ trọng doanh thu:' : 'Revenue Share:'}</span>
                        <span className="font-bold tabular-nums">{item.share.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400">
                        <span>{t('kpiYoYGrowth')}:</span>
                        <span className="tabular-nums">{item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>{language === 'vi' ? 'Hoàn thành chỉ tiêu:' : 'Quota Achievement:'}</span>
                        <span className="tabular-nums">{item.achievement.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="revBillions"
              name={language === 'vi' ? 'Doanh thu' : 'Revenue'}
              radius={[0, 4, 4, 0]}
              barSize={20}
              cursor="pointer"
              onClick={(entry: any) => onSelectRegion && onSelectRegion(entry?.regionId || entry?.payload?.regionId)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    selectedRegionId === entry.regionId
                      ? '#f59e0b'
                      : REGION_COLORS[index % REGION_COLORS.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
