import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
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

export const MonthlyRevenueChart: React.FC<Props> = ({ data, year }) => {
  const chartData = data.map((d) => ({
    ...d,
    rev2026Billions: +(d.revenue2026 / 1e9).toFixed(2),
    rev2025Billions: +(d.revenue2025 / 1e9).toFixed(2),
    target2026Billions: +(d.target2026 / 1e9).toFixed(2),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 1: XU HƯỚNG DOANH THU THEO THÁNG (MONTHLY REVENUE TREND)
          </h3>
          <p className="text-xs text-slate-400">
            So sánh Doanh thu thực tế {year} vs Cùng kỳ {year - 1} vs Chỉ tiêu kế hoạch {year} (Đơn vị: Tỷ VNĐ)
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
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}B`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MonthlyTrendData;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        Tháng {item.month} / {year}
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>Doanh thu {year}:</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.revenue2026, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-400">
                        <span>Doanh thu {year - 1}:</span>
                        <span className="tabular-nums">{formatCurrencyVND(item.revenue2025, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>Chỉ tiêu {year}:</span>
                        <span className="tabular-nums">{formatCurrencyVND(item.target2026, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400 pt-1 border-t border-slate-800">
                        <span>Tăng trưởng YoY:</span>
                        <span className="font-bold tabular-nums">
                          {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                        </span>
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
              dataKey="rev2025Billions"
              name={`Năm ${year - 1}`}
              fill="#475569"
              radius={[3, 3, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="rev2026Billions"
              name={`Thực tế ${year}`}
              fill="#2563eb"
              radius={[3, 3, 0, 0]}
              barSize={16}
            />
            <Line
              type="monotone"
              dataKey="target2026Billions"
              name={`Chỉ tiêu ${year}`}
              stroke="#818cf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#818cf8' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
