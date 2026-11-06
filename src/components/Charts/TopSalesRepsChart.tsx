import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SalesRepLeaderboardItem } from '../../types';
import { formatCurrencyVND } from '../../utils/formatters';

interface Props {
  data: SalesRepLeaderboardItem[];
  onSelectRep?: (repId: string) => void;
}

export const TopSalesRepsChart: React.FC<Props> = ({ data, onSelectRep }) => {
  const top10 = data.slice(0, 10).map((r) => ({
    ...r,
    revBillions: +(r.revenue / 1e9).toFixed(2),
    targetBillions: +(r.target / 1e9).toFixed(2),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 6: TOP 10 NHÂN VIÊN XUẤT SẮC (TOP 10 SALES REPS)
          </h3>
          <p className="text-xs text-slate-400">
            Xếp hạng theo Doanh thu thuần thực tế vs Chỉ tiêu kế hoạch (Nhấp chọn để xem hồ sơ)
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
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
              dataKey="salesRepName"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              width={120}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SalesRepLeaderboardItem;
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        #{item.rank} - {item.salesRepName} ({item.regionName})
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>Doanh thu:</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.revenue, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>Chỉ tiêu:</span>
                        <span className="tabular-nums">{formatCurrencyVND(item.target, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-emerald-400">
                        <span>Tỷ lệ hoàn thành:</span>
                        <span className="font-bold tabular-nums">{item.achievement.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>Đánh giá:</span>
                        <span className="font-bold">{item.statusBadge}</span>
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
              dataKey="revBillions"
              name="Doanh thu thực tế"
              fill="#2563eb"
              radius={[0, 3, 3, 0]}
              barSize={12}
              cursor="pointer"
              onClick={(e: any) => onSelectRep && onSelectRep(e?.salesRepId || e?.payload?.salesRepId)}
            />
            <Bar
              dataKey="targetBillions"
              name="Chỉ tiêu"
              fill="#4338ca"
              radius={[0, 3, 3, 0]}
              barSize={12}
              cursor="pointer"
              onClick={(e: any) => onSelectRep && onSelectRep(e?.salesRepId || e?.payload?.salesRepId)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
