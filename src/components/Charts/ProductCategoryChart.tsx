import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { CategoryPerformance } from '../../types';
import { useLanguage } from '../../services/i18n';

interface Props {
  data: CategoryPerformance[];
}

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ProductCategoryChart: React.FC<Props> = ({ data }) => {
  const { language, t, formatCurrencyVND } = useLanguage();

  const chartData = data.map((d) => ({
    name: t(d.category as any, d.category),
    value: Math.round(d.revenue / 1e6), // in Millions
    rawRevenue: d.revenue,
    margin: d.margin,
    share: d.share,
    quantity: d.quantity,
    growth: d.growth,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 4: {t('chartCategoryTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'vi'
              ? 'Tỷ trọng doanh số & biên lợi nhuận gộp theo từng dòng xi măng'
              : 'Revenue share & gross profit margin across cement product lines'}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        {item.name}
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>{language === 'vi' ? 'Doanh thu:' : 'Revenue:'}</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.rawRevenue, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>{language === 'vi' ? 'Tỷ trọng doanh số:' : 'Revenue Share:'}</span>
                        <span className="font-bold tabular-nums">{item.share.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-amber-400">
                        <span>{t('kpiGrossMargin')}:</span>
                        <span className="tabular-nums">{item.margin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400">
                        <span>{t('kpiYoYGrowth')}:</span>
                        <span className="tabular-nums">{item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
