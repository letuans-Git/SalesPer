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
import { ChannelPerformance } from '../../types';
import { useLanguage } from '../../services/i18n';

interface Props {
  data: ChannelPerformance[];
  onSelectChannel?: (channelId: string) => void;
  selectedChannelId?: string;
}

export const ChannelPerformanceChart: React.FC<Props> = ({
  data,
  onSelectChannel,
  selectedChannelId,
}) => {
  const { language, t, formatCurrencyVND } = useLanguage();

  const chartData = data.map((d) => ({
    ...d,
    localizedChannelName: t(d.channelId as any, d.channelName),
    revBillions: +(d.revenue / 1e9).toFixed(2),
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col h-[320px] sm:h-[350px] lg:h-[380px]">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            CHART 5: {t('chartChannelTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'vi'
              ? 'Doanh thu (Cột, Tỷ VNĐ) và Số lượng đơn hàng (Đường) theo từng kênh'
              : 'Net Revenue (Bar, Billion VND) and Order Volume (Line) by Channel'}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="localizedChannelName"
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
              stroke="#818cf8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v} ${language === 'vi' ? 'đơn' : ''}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ChannelPerformance & { localizedChannelName: string };
                  return (
                    <div className="bg-slate-950 border border-slate-700 p-3 rounded shadow-xl text-xs space-y-1.5 font-mono">
                      <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        {language === 'vi' ? 'Kênh:' : 'Channel:'} {item.localizedChannelName}
                      </p>
                      <div className="flex justify-between gap-4 text-blue-400">
                        <span>{language === 'vi' ? 'Doanh thu:' : 'Revenue:'}</span>
                        <span className="font-bold tabular-nums">{formatCurrencyVND(item.revenue, true)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-300">
                        <span>{language === 'vi' ? 'Tỷ trọng doanh thu:' : 'Revenue Share:'}</span>
                        <span className="tabular-nums">{item.share.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>{language === 'vi' ? 'Số đơn hàng:' : 'Order Count:'}</span>
                        <span className="tabular-nums">{item.orders} {language === 'vi' ? 'đơn' : 'orders'}</span>
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
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              yAxisId="left"
              dataKey="revBillions"
              name={language === 'vi' ? 'Doanh thu (Tỷ VNĐ)' : 'Revenue (Billion VND)'}
              fill="#2563eb"
              radius={[3, 3, 0, 0]}
              barSize={20}
              cursor="pointer"
              onClick={(e: any) => onSelectChannel && onSelectChannel(e?.channelId || e?.payload?.channelId)}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              name={language === 'vi' ? 'Số đơn hàng' : 'Order Count'}
              stroke="#a855f7"
              strokeWidth={2}
              dot={{ r: 3, fill: '#a855f7' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
