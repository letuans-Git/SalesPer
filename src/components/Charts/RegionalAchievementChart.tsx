import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { RegionPerformance } from '../../types';
import { useLanguage } from '../../services/i18n';

interface Props {
  data: RegionPerformance[];
}

export const RegionalAchievementChart: React.FC<Props> = ({ data }) => {
  const { language, t } = useLanguage();

  const chartData = data.map((d) => ({
    ...d,
    localizedRegionName: t(d.regionId as any, d.regionName),
    achievementRate: +d.achievement.toFixed(1),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 8: {t('chartRegionalAchvTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'vi'
              ? 'Mức độ đạt kế hoạch từng khu vực kinh doanh so với đường chuẩn 100%'
              : 'Quota achievement rate by regional territory against 100% benchmark line'}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="localizedRegionName"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}%`}
              domain={[60, 130]}
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
                        <span>{language === 'vi' ? 'Hoàn thành chỉ tiêu:' : 'Quota Achievement:'}</span>
                        <span className="font-bold tabular-nums">{item.achievement.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400">
                        <span>{t('kpiYoYGrowth')}:</span>
                        <span className="tabular-nums">{item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-400">
                        <span>{t('kpiGrossMargin')}:</span>
                        <span className="tabular-nums">{item.margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={100}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: language === 'vi' ? 'Kế hoạch 100%' : '100% Target',
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Bar
              dataKey="achievementRate"
              name={language === 'vi' ? 'Tỷ lệ đạt kế hoạch (%)' : 'Plan Achievement (%)'}
              radius={[4, 4, 0, 0]}
              barSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.achievementRate >= 100
                      ? '#10b981'
                      : entry.achievementRate >= 80
                      ? '#f59e0b'
                      : '#f43f5e'
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
