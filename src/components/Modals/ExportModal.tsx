import React from 'react';
import { X, FileSpreadsheet, Download, Printer, FileText } from 'lucide-react';
import { DatabaseState, FilterState, KPIResult } from '../../types';
import { exportDatabaseToExcel, exportFilteredToCsv } from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseState;
  filters: FilterState;
  kpis: KPIResult;
  onPrint: () => void;
}

export const ExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  db,
  filters,
  kpis,
  onPrint,
}) => {
  if (!isOpen) return null;

  const handleExportFullExcel = () => {
    exportDatabaseToExcel(db, `CHINFON_Sales_Performance_All8Sheets_${Date.now()}.xlsx`);
    onClose();
  };

  const handleExportTransactionsCsv = () => {
    const csvRows = db.transactions.map((t) => ({
      Transaction_ID: t.Transaction_ID,
      Order_ID: t.Order_ID,
      Order_Date: t.Order_Date,
      Customer_ID: t.Customer_ID,
      Customer_Name: t.Customer_Name,
      Region_ID: t.Region_ID,
      Sales_Rep_ID: t.Sales_Rep_ID,
      Product_ID: t.Product_ID,
      Channel_ID: t.Channel_ID,
      Quantity: t.Quantity,
      Unit_Price: t.Unit_Price,
      Gross_Revenue: t.Gross_Revenue,
      Discount: t.Discount,
      Net_Revenue: t.Net_Revenue,
      Cost_Amount: t.Cost_Amount,
      Gross_Profit: t.Gross_Profit,
      Order_Status: t.Order_Status,
      Payment_Status: t.Payment_Status,
    }));
    exportFilteredToCsv(csvRows, `CHINFON_All_Transactions_${Date.now()}.csv`);
    onClose();
  };

  const handleTriggerPrint = () => {
    onClose();
    setTimeout(() => {
      onPrint();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">XUẤT BÁO CÁO KINH DOANH</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3.5 text-xs">
          {/* Option 1: Full Excel Workbook */}
          <div
            onClick={handleExportFullExcel}
            className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-blue-500 hover:bg-blue-950/20 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                1. Xuất Toàn bộ Database Google Sheets (.xlsx)
              </h4>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Tạo file Excel chứa trọn vẹn 8 sheets: Giao dịch chi tiết, Chỉ tiêu phân bổ, Danh mục sản phẩm,
                Nhân viên, Khu vực, Kênh bán, Thiết lập và Nhật ký log.
              </p>
            </div>
          </div>

          {/* Option 2: Print / PDF Executive Report */}
          <div
            onClick={handleTriggerPrint}
            className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-blue-500 hover:bg-blue-950/20 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                2. Xuất Báo cáo Điều hành PDF / In ấn
              </h4>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Mở giao diện In ấn tối ưu chuẩn trang A4/Executive với đầy đủ 8 chỉ số KPI, các biểu đồ phân tích,
                xếp hạng nhân sự và nhận định điều hành.
              </p>
            </div>
          </div>

          {/* Option 3: Raw CSV */}
          <div
            onClick={handleExportTransactionsCsv}
            className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-blue-500 hover:bg-blue-950/20 transition-all cursor-pointer group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">
                3. Xuất Dữ liệu Giao dịch Thô (.csv)
              </h4>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Tải file CSV danh sách giao dịch bán hàng để đối chiếu nhanh trên các phần mềm phân tích thống kê khác.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
