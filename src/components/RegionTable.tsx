import React from 'react';
import { MapPin } from 'lucide-react';
import { RegionPerformance } from '../types';
import { formatCurrencyVND, formatPercent } from '../utils/formatters';

interface Props {
  regions: RegionPerformance[];
  onSelectRegion?: (regionId: string) => void;
  selectedRegionId?: string;
}

export const RegionTable: React.FC<Props> = ({
  regions,
  onSelectRegion,
  selectedRegionId,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            BẢNG PHÂN TÍCH HIỆU QUẢ THEO KHU VỰC ĐỊA BÀN
          </h3>
          <p className="text-xs text-slate-400">
            Tổng hợp quy mô kinh doanh, tỷ lệ hoàn thành kế hoạch, biên lợi nhuận và quân số từng vùng
          </p>
        </div>
      </div>

      <div className="sm:hidden text-[10px] text-slate-500 mb-1 flex items-center justify-end">
        <span>← Vuốt ngang để xem đủ chỉ số vùng →</span>
      </div>

      <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
        <table className="w-full text-left text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold tracking-wider uppercase text-[11px]">
              <th className="py-2.5 px-3">Khu vực</th>
              <th className="py-2.5 px-3">Giám đốc vùng</th>
              <th className="py-2.5 px-3 text-right">Doanh thu</th>
              <th className="py-2.5 px-3 text-right">Chỉ tiêu</th>
              <th className="py-2.5 px-3 text-right">Hoàn thành</th>
              <th className="py-2.5 px-3 text-right">Tăng trưởng</th>
              <th className="py-2.5 px-3 text-right">Lợi nhuận gộp</th>
              <th className="py-2.5 px-3 text-right">Biên LN</th>
              <th className="py-2.5 px-3 text-right">Số đơn</th>
              <th className="py-2.5 px-3 text-right">Quân số</th>
              <th className="py-2.5 px-3 text-right">Tỷ trọng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {regions.map((reg) => {
              const isSelected = selectedRegionId === reg.regionId;
              return (
                <tr
                  key={reg.regionId}
                  onClick={() => onSelectRegion && onSelectRegion(reg.regionId)}
                  className={`hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-white">
                    {reg.regionName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{reg.manager}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-200 tabular-nums">
                    {formatCurrencyVND(reg.revenue, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400 tabular-nums">
                    {formatCurrencyVND(reg.target, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    <span
                      className={
                        reg.achievement >= 100
                          ? 'text-emerald-400'
                          : reg.achievement >= 80
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {formatPercent(reg.achievement)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium tabular-nums">
                    <span className={reg.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {formatPercent(reg.growth, true)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatCurrencyVND(reg.profit, true)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {formatPercent(reg.margin)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {reg.orders}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300 tabular-nums">
                    {reg.repsCount} người
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-400 tabular-nums">
                    {reg.share.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
