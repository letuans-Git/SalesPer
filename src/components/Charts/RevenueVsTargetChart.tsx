import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { MonthlyTrendData } from '../../types';
import { formatCurrencyVND } from '../../utils/formatters';

interface Props {
  data: MonthlyTrendData[];
  year: number;
}

export const RevenueVsTargetChart: React.FC<Props> = ({ data, year }) => {
  const chartData = data.map((d) => ({
    ...d,
    revBillions: +(d.revenue2026 / 1e9).toFixed(2),
    targetBillions: +(d.target2026 / 1e9).toFixed(2),
    varianceBillions: +((d.revenue2026 - d.target2026) / 1e9).toFixed(2),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 2: THỰC TẾ SO VỚI CHỈ TIÊU (REVENUE VS TARGET)
          </h3>
          <p className="text-xs text-slate-400">
            Đối chiếu Doanh thu thực tế vs Kế hoạch và Biên độ chênh lệch từng tháng (Đơn vị: Tỷ VNĐ)
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MonthlyTrendData & { varianceBillions: number };
                  const variance = item.revenue2026 - item.target2026;
                  const rate = item.target2026 > 0 ? (item.revenue2026 / item.target2026) * 100 : 0;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        Tháng {item.month} / {year}
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>Doanh thu Thực tế:</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.revenue2026, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>Chỉ tiêu Giao:</span>
                        <span className="tabular-nums">{formatCurrencyVND(item.target2026, true)}</span>
                      </div>
                      <div
                        className={`flex justify-between gap-4 font-bold pt-1 border-t border-slate-800 ${
                          variance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <span>Chênh lệch ({rate.toFixed(1)}%):</span>
                        <span className="tabular-nums">
                          {variance >= 0 ? '+' : ''}{formatCurrencyVND(variance, true)}
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
              dataKey="targetBillions"
              name="Chỉ tiêu Kế hoạch"
              fill="#4338ca"
              radius={[3, 3, 0, 0]}
              barSize={16}
            />
            <Bar
              dataKey="revBillions"
              name="Doanh thu Thực tế"
              fill="#3b82f6"
              radius={[3, 3, 0, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
