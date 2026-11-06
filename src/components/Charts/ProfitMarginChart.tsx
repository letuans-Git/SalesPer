import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MonthlyTrendData } from '../../types';
import { formatCurrencyVND } from '../../utils/formatters';

interface Props {
  data: MonthlyTrendData[];
  year: number;
}

export const ProfitMarginChart: React.FC<Props> = ({ data, year }) => {
  const chartData = data.map((d) => ({
    ...d,
    profitBillions: +(d.profit2026 / 1e9).toFixed(2),
    marginPercent: +d.margin2026.toFixed(1),
    marginPrevPercent: +d.margin2025.toFixed(1),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 7: LỢI NHUẬN GỘP & BIÊN LỢI NHUẬN (PROFIT & MARGIN)
          </h3>
          <p className="text-xs text-slate-400">
            Lợi nhuận gộp (Cột, Tỷ VNĐ) và Biên lợi nhuận gộp (Đường, %) so sánh với cùng kỳ
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="monthName"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}B`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}%`}
              domain={[15, 40]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MonthlyTrendData;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        Tháng {item.month} / {year}
                      </p>
                      <div className="flex justify-between gap-4 text-cyan-400">
                        <span>Lợi nhuận gộp {year}:</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.profit2026, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400">
                        <span>Biên lợi nhuận gộp:</span>
                        <span className="font-bold tabular-nums">{item.margin2026.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-400">
                        <span>Biên lợi nhuận {year - 1}:</span>
                        <span className="tabular-nums">{item.margin2025.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              yAxisId="left"
              dataKey="profitBillions"
              name={`Lợi nhuận gộp ${year}`}
              fill="#06b6d4"
              radius={[3, 3, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="marginPercent"
              name={`Biên LN % ${year}`}
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="marginPrevPercent"
              name={`Biên LN % ${year - 1}`}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
