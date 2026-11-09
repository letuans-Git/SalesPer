import React from 'react';
import {
  RotateCcw,
  Download,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Printer,
  Globe,
  RefreshCw,
  Sun,
  Moon,
} from 'lucide-react';
import { ThemeMode } from '../services/theme';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  dashboardTitle?: string;
  companyName?: string;
  lastUpdated: string;
  isPublishedConnected: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenPublishedModal: () => void;
  onOpenExportModal: () => void;
  onOpenGasModal: () => void;
  onOpenTestModal: () => void;
  onOpenGenerateModal: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  dashboardTitle,
  companyName,
  lastUpdated,
  isPublishedConnected,
  isSyncing,
  onRefresh,
  onOpenPublishedModal,
  onOpenExportModal,
  onOpenGasModal,
  onOpenTestModal,
  onOpenGenerateModal,
  onPrint,
}) => {
  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(lastUpdated);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' + d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return lastUpdated;
    }
  }, [lastUpdated]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Executive Top Row */}
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Brand & Identity */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded overflow-hidden flex items-center justify-center shrink-0 border border-blue-500/30 shadow-sm bg-[#0a1931]">
              <img
                src="/assets/aistudio/Hoadao_f7556621.jpg"
                alt="Xi măng Chinfon Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white truncate max-w-[200px] sm:max-w-none">
                  {companyName || 'CHINFON CEMENT Corp.'}
                </span>
                {isPublishedConnected ? (
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    LIVE GOOGLE SHEETS
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                    DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide truncate sm:whitespace-normal">
                {dashboardTitle || 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION'}
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-slate-800 shrink-0">
            <span>Cập nhật:</span>
            <span className="font-mono text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (hidden on mobile, visible on desktop/laptop) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-medium text-slate-300">
          <a href="#kpi-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Chỉ số KPI
          </a>
          <a href="#trend-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Xu hướng & Chỉ tiêu
          </a>
          <a href="#mix-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Cơ cấu Kinh doanh
          </a>
          <a href="#reps-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Xếp hạng Nhân viên
          </a>
          <a href="#insights-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Nhận định Điều hành
          </a>
          <a href="#transactions-section" className="hover:text-blue-400 transition-colors whitespace-nowrap">
            Giao dịch Chi tiết
          </a>
        </nav>

        {/* Zone 3: Executive Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
          {/* Published Google Sheet Auto-Sync Button */}
          <button
            disabled
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded border opacity-50 cursor-not-allowed shadow-sm select-none shrink-0 ${
              isPublishedConnected
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-600/70'
                : 'bg-blue-600/60 text-white/80 border-blue-400/30'
            }`}
            title="Đồng bộ Sheet Web (Đã vô hiệu hóa)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="hidden md:inline">{isPublishedConnected ? 'Sheet Web: Đang liên kết' : 'Đồng bộ Sheet Web'}</span>
            <span className="md:hidden">Sheet Web</span>
          </button>

          {/* Integrity Test Suite */}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 rounded border border-slate-700/60 opacity-50 cursor-not-allowed select-none shrink-0"
            title="Kiểm thử tính chính xác 12 quy tắc kinh doanh (Đã vô hiệu hóa)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
            <span className="hidden sm:inline">Kiểm tra KPI</span>
          </button>

          {/* Google Sheets / GAS Sync */}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 rounded border border-slate-700/60 opacity-50 cursor-not-allowed select-none shrink-0"
            title="Xem và tải mã Google Apps Script hoặc kết nối Google Sheets Web App (Đã vô hiệu hóa)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400/70 shrink-0" />
            <span className="hidden sm:inline">Google Sheets / GAS</span>
          </button>

          {/* Regenerate Demo Data */}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-amber-200/70 bg-amber-950/40 rounded border border-amber-800/40 opacity-50 cursor-not-allowed select-none shrink-0"
            title="Tạo lại bộ dữ liệu DEMO tự động (Đã vô hiệu hóa)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
            <span className="hidden sm:inline">Generate Data</span>
          </button>

          {/* Export Report */}
          <button
            disabled
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 rounded border border-slate-700/60 opacity-50 cursor-not-allowed select-none shrink-0"
            title="Xuất báo cáo Excel / PDF (Đã vô hiệu hóa)"
          >
            <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Xuất Báo cáo</span>
          </button>

          {/* Theme Toggle Button: Trắng - Đen */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
            title={theme === 'light' ? 'Đang dùng nền Trắng · Nhấn để chuyển sang nền Đen' : 'Đang dùng nền Đen · Nhấn để chuyển sang nền Trắng'}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-slate-200">Nền Đen</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-amber-200">Nền Trắng</span>
              </>
            )}
          </button>

          {/* Print View */}
          <button
            onClick={onPrint}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
            title="In / Xuất PDF Trang Điều hành"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
            title="Làm mới dữ liệu từ Google Sheets"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
