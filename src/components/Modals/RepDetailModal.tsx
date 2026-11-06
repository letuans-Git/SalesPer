import React from 'react';
import { X, User, MapPin, Calendar, Award, DollarSign, Target, ShoppingBag } from 'lucide-react';
import { DatabaseState, FilterState } from '../../types';
import { formatCurrencyVND, formatPercent, formatNumber } from '../../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  repId: string | null;
  onClose: () => void;
  db: DatabaseState;
  filters: FilterState;
}

export const RepDetailModal: React.FC<Props> = ({ repId, onClose, db, filters }) => {
  if (!repId) return null;

  const rep = db.salesReps.find((r) => r.Sales_Rep_ID === repId);
  const region = db.regions.find((reg) => reg.Region_ID === rep?.Region_ID);

  if (!rep) return null;

  // Rep transactions for active year and period
  const repTxns = db.transactions.filter(
    (t) =>
      t.Sales_Rep_ID === repId &&
      parseInt(t.Order_Date.substring(0, 4), 10) === filters.year &&
      parseInt(t.Order_Date.substring(5, 7), 10) >= filters.startMonth &&
      parseInt(t.Order_Date.substring(5, 7), 10) <= filters.endMonth &&
      t.Order_Status !== 'Cancelled'
  );

  const repTargets = db.targets.filter(
    (t) =>
      t.Sales_Rep_ID === repId &&
      t.Year === filters.year &&
      t.Month >= filters.startMonth &&
      t.Month <= filters.endMonth
  );

  const revenue = repTxns.reduce((s, t) => s + t.Net_Revenue, 0);
  const target = repTargets.reduce((s, t) => s + t.Revenue_Target, 0);
  const profit = repTxns.reduce((s, t) => s + t.Gross_Profit, 0);
  const orders = new Set(repTxns.map((t) => t.Order_ID)).size;
  const achievement = target > 0 ? (revenue / target) * 100 : 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Monthly breakdown for this rep
  const monthlyData = [];
  for (let m = filters.startMonth; m <= filters.endMonth; m++) {
    const mTxns = repTxns.filter((t) => parseInt(t.Order_Date.substring(5, 7), 10) === m);
    const mTargets = repTargets.filter((t) => t.Month === m);
    const mRev = mTxns.reduce((s, t) => s + t.Net_Revenue, 0);
    const mTgt = mTargets.reduce((s, t) => s + t.Revenue_Target, 0);

    monthlyData.push({
      month: `T${m}`,
      revBillions: +(mRev / 1e9).toFixed(2),
      targetBillions: +(mTgt / 1e9).toFixed(2),
      rawRev: mRev,
      rawTarget: mTgt,
    });
  }

  // Top products sold by this rep
  const productSalesMap = new Map<string, { name: string; revenue: number; qty: number }>();
  const productCatalogMap = new Map(db.products.map((p) => [p.Product_ID, p.Product_Name]));

  repTxns.forEach((t) => {
    const current = productSalesMap.get(t.Product_ID) || {
      name: productCatalogMap.get(t.Product_ID) || t.Product_ID,
      revenue: 0,
      qty: 0,
    };
    current.revenue += t.Net_Revenue;
    current.qty += t.Quantity;
    productSalesMap.set(t.Product_ID, current);
  });

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{rep.Sales_Rep_Name}</h3>
              <p className="text-xs text-slate-400">
                {rep.Department} · Khu vực {region?.Region_Name || rep.Region_ID} · Ngày vào:{' '}
                {rep.Join_Date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Doanh thu thuần</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
                {formatCurrencyVND(revenue, true)}
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Chỉ tiêu kế hoạch</span>
              <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5 tabular-nums">
                {formatCurrencyVND(target, true)}
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Tỷ lệ hoàn thành</span>
              <div
                className={`text-lg font-bold font-mono mt-0.5 tabular-nums ${
                  achievement >= 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {formatPercent(achievement)}
              </div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Biên lợi nhuận gộp</span>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5 tabular-nums">
                {formatPercent(margin)}
              </div>
            </div>
          </div>

          {/* Monthly Performance Chart */}
          <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tiến độ Doanh thu vs Chỉ tiêu theo tháng
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}B`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-2 text-xs font-mono rounded">
                            <p className="text-slate-300 font-bold mb-1">{item.month}</p>
                            <p className="text-blue-400">Doanh thu: {formatCurrencyVND(item.rawRev, true)}</p>
                            <p className="text-indigo-400">Chỉ tiêu: {formatCurrencyVND(item.rawTarget, true)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revBillions" name="Doanh thu" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={14} />
                  <Bar dataKey="targetBillions" name="Chỉ tiêu" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
              Sản phẩm bán chạy nhất của nhân viên
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="py-2 px-3">Tên sản phẩm</th>
                    <th className="py-2 px-3 text-right">Sản lượng (Tấn)</th>
                    <th className="py-2 px-3 text-right">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {topProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-medium text-slate-200">{p.name}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300 tabular-nums">
                        {formatNumber(p.qty)} Tấn
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-blue-400 font-medium tabular-nums">
                        {formatCurrencyVND(p.revenue, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Đóng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};
