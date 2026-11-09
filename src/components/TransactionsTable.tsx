import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Transaction, Product, SalesRep, Region, Channel } from '../types';
import { exportFilteredToCsv } from '../services/storage';
import { useLanguage } from '../services/i18n';

interface Props {
  transactions: Transaction[];
  products: Product[];
  salesReps: SalesRep[];
  regions: Region[];
  channels: Channel[];
}

export const TransactionsTable: React.FC<Props> = ({
  transactions,
  products,
  salesReps,
  regions,
  channels,
}) => {
  const { language, t, formatCurrencyVND, formatNumber } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const productMap = useMemo(() => new Map(products.map((p) => [p.Product_ID, p.Product_Name])), [products]);
  const repMap = useMemo(() => new Map(salesReps.map((r) => [r.Sales_Rep_ID, r.Sales_Rep_Name])), [salesReps]);
  const regionMap = useMemo(() => new Map(regions.map((r) => [r.Region_ID, r.Region_Name])), [regions]);
  const channelMap = useMemo(() => new Map(channels.map((c) => [c.Channel_ID, c.Channel_Name])), [channels]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchStatus = statusFilter === 'ALL' || t.Order_Status === statusFilter;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        t.Order_ID.toLowerCase().includes(search) ||
        t.Customer_Name.toLowerCase().includes(search) ||
        (productMap.get(t.Product_ID) || '').toLowerCase().includes(search) ||
        (repMap.get(t.Sales_Rep_ID) || '').toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });
  }, [transactions, statusFilter, searchTerm, productMap, repMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleExportCsv = () => {
    const exportData = filtered.map((t) => ({
      Mã_Giao_Dịch: t.Transaction_ID,
      Mã_Đơn_Hàng: t.Order_ID,
      Ngày_Bán: t.Order_Date,
      Khách_Hàng: t.Customer_Name,
      Khu_Vực: regionMap.get(t.Region_ID) || t.Region_ID,
      Nhân_Viên: repMap.get(t.Sales_Rep_ID) || t.Sales_Rep_ID,
      Sản_Phẩm: productMap.get(t.Product_ID) || t.Product_ID,
      Kênh_Bán: channelMap.get(t.Channel_ID) || t.Channel_ID,
      Số_Lượng_Tấn: t.Quantity,
      Đơn_Giá: t.Unit_Price,
      Doanh_Thu_Gộp: t.Gross_Revenue,
      Chiết_Khấu: t.Discount,
      Doanh_Thu_Thuần: t.Net_Revenue,
      Giá_Vốn: t.Cost_Amount,
      Lợi_Nhuận_Gộp: t.Gross_Profit,
      Trạng_Thái_Đơn: t.Order_Status,
      Trạng_Thái_Thanh_Toán: t.Payment_Status,
    }));
    exportFilteredToCsv(exportData, `CHINFON_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <section id="transactions-section" className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            {t('txnsTableTitle')}
          </h3>
          <p className="text-xs text-slate-400">
            {t('showingTxns')} {filtered.length.toLocaleString()}{' '}
            {language === 'vi' ? 'dòng giao dịch thỏa mãn bộ lọc hiện hành' : 'transactions matching active filters'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchTxnsPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded border border-slate-700 text-xs overflow-x-auto max-w-full pb-0.5 sm:pb-0 scrollbar-none">
            {['ALL', 'Completed', 'Delivered', 'Pending', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-1 rounded font-medium transition-colors shrink-0 whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL'
                  ? language === 'vi' ? 'Tất cả' : 'All'
                  : st === 'Completed'
                  ? t('statusCompleted')
                  : st === 'Delivered'
                  ? language === 'vi' ? 'Đã giao' : 'Delivered'
                  : st === 'Pending'
                  ? t('statusPending')
                  : t('statusCancelled')}
              </button>
            ))}
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
            title={language === 'vi' ? 'Xuất bảng này ra file CSV' : 'Export this table to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>{language === 'vi' ? 'Tải CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div className="sm:hidden text-[10px] text-slate-500 mb-1 flex items-center justify-end">
        <span>{language === 'vi' ? '← Vuốt ngang để xem đủ cột giao dịch →' : '← Swipe horizontally to view all columns →'}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-3.5 sm:mx-0 px-3.5 sm:px-0">
        <table className="w-full text-left text-xs border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold tracking-wider uppercase text-[11px]">
              <th className="py-2.5 px-3">{language === 'vi' ? 'Mã Đơn / Ngày' : 'Order ID / Date'}</th>
              <th className="py-2.5 px-3">{t('colCustomer')}</th>
              <th className="py-2.5 px-3">{t('colProduct')}</th>
              <th className="py-2.5 px-3">{language === 'vi' ? 'Khu vực / Sales' : 'Region / Rep'}</th>
              <th className="py-2.5 px-3 text-right">{t('colQty')}</th>
              <th className="py-2.5 px-3 text-right">{t('colNetRev')}</th>
              <th className="py-2.5 px-3 text-right">{t('colProfit')}</th>
              <th className="py-2.5 px-3 text-center">{t('colOrderStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {currentRows.map((tRow) => (
              <tr key={tRow.Transaction_ID} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-2 px-3 font-mono">
                  <div className="text-white font-medium">{tRow.Order_ID}</div>
                  <div className="text-[11px] text-slate-400">{tRow.Order_Date}</div>
                </td>
                <td className="py-2 px-3 font-medium text-slate-200 max-w-[200px] truncate" title={tRow.Customer_Name}>
                  {tRow.Customer_Name}
                </td>
                <td className="py-2 px-3 text-slate-300 max-w-[200px] truncate" title={productMap.get(tRow.Product_ID)}>
                  {t(productMap.get(tRow.Product_ID) as any, productMap.get(tRow.Product_ID) || tRow.Product_ID)}
                </td>
                <td className="py-2 px-3 text-slate-400">
                  <div>{t(tRow.Region_ID as any, regionMap.get(tRow.Region_ID) || tRow.Region_ID)}</div>
                  <div className="text-[11px] text-slate-300">{repMap.get(tRow.Sales_Rep_ID)}</div>
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-200 tabular-nums">
                  {formatNumber(tRow.Quantity)} {t('tonUnit')}
                </td>
                <td className="py-2 px-3 text-right font-mono font-medium text-slate-100 tabular-nums">
                  {formatCurrencyVND(tRow.Net_Revenue, true)}
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-400 tabular-nums">
                  {formatCurrencyVND(tRow.Gross_Profit, true)}
                </td>
                <td className="py-2 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                      tRow.Order_Status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : tRow.Order_Status === 'Delivered'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : tRow.Order_Status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {tRow.Order_Status === 'Completed'
                      ? t('statusCompleted')
                      : tRow.Order_Status === 'Delivered'
                      ? language === 'vi' ? 'Đã giao' : 'Delivered'
                      : tRow.Order_Status === 'Pending'
                      ? t('statusPending')
                      : t('statusCancelled')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          {language === 'vi' ? 'Trang' : 'Page'} <span className="font-mono text-white font-medium">{page}</span> /{' '}
          <span className="font-mono text-white font-medium">{totalPages}</span> ({language === 'vi' ? 'Tổng' : 'Total'}{' '}
          {filtered.length.toLocaleString()} {language === 'vi' ? 'dòng' : 'records'})
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-300" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </section>
  );
};
