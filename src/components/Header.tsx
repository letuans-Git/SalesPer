import React from 'react';
import {
  RotateCcw,
  Printer,
  Globe,
  Sun,
  Moon,
  Languages,
  AlertCircle,
} from 'lucide-react';
import { ThemeMode } from '../services/theme';
import { useLanguage } from '../services/i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  dashboardTitle?: string;
  companyName?: string;
  lastUpdated: string;
  isPublishedConnected: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenPublishedModal?: () => void;
  onOpenExportModal?: () => void;
  onOpenGasModal?: () => void;
  onOpenTestModal?: () => void;
  onOpenGenerateModal?: () => void;
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
  onPrint,
}) => {
  const { language, toggleLanguage, t } = useLanguage();

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(lastUpdated);
      const locale = language === 'vi' ? 'vi-VN' : 'en-US';
      return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' + d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return lastUpdated;
    }
  }, [lastUpdated, language]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-sm">
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
                  {companyName || t('defaultCompany')}
                </span>
                {isPublishedConnected ? (
                  <button
                    onClick={onOpenPublishedModal}
                    className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shrink-0 hover:bg-emerald-500/30 transition-all cursor-pointer"
                    title={language === 'vi' ? '100% Dữ liệu từ Google Sheets (Bấm để xem/đổi liên kết)' : '100% Live Google Sheets Data (Click to view/change link)'}
                  >
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>{t('liveGoogleSheets')}</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenPublishedModal}
                    className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title={language === 'vi' ? 'Bấm để kết nối bảng tính Google Sheets nạp dữ liệu' : 'Click to connect Google Sheets file'}
                  >
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span>{language === 'vi' ? 'KẾT NỐI GOOGLE SHEETS' : 'CONNECT GOOGLE SHEETS'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium tracking-wide truncate sm:whitespace-normal">
                {dashboardTitle || t('appTitle')}
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 pl-4 border-l border-slate-800 shrink-0">
            <span>{t('lastUpdatedLabel')}</span>
            <span className="font-mono text-slate-300">{formattedDate}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (always visible at top of page across all devices including mobile iOS & Android) */}
        <nav
          className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 xl:gap-6 text-[11px] sm:text-xs font-medium text-slate-300 w-full lg:w-auto order-3 lg:order-none overflow-x-auto scrollbar-none py-1.5 lg:py-0 border-t lg:border-t-0 border-slate-800/80 -mx-1 px-1 shrink-0 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <a href="#kpi-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navKpi')}
          </a>
          <a href="#trend-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navTrend')}
          </a>
          <a href="#mix-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navMix')}
          </a>
          <a href="#reps-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navReps')}
          </a>
          <a href="#insights-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navInsights')}
          </a>
          <a href="#transactions-section" className="px-2.5 py-1 rounded hover:bg-slate-800/60 hover:text-blue-400 active:bg-slate-700 transition-colors whitespace-nowrap shrink-0">
            {t('navTransactions')}
          </a>
        </nav>

        {/* Zone 3: Executive Actions (Touch-friendly on mobile, iOS & Android) */}
        <div className="flex items-center gap-1.5 sm:gap-2 max-w-full overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
          {/* PWA Mobile & Desktop Install Button */}
          <PWAInstallButton />

          {/* Language Toggle: Tiếng Anh - Tiếng Việt */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded border border-blue-500/50 bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm active:scale-95"
            title={language === 'vi' ? 'Đang dùng Tiếng Việt · Nhấn để chuyển sang Tiếng Anh (English)' : 'Currently in English · Click to switch to Vietnamese (Tiếng Việt)'}
          >
            <Languages className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="font-mono tracking-wide">{language === 'vi' ? 'EN' : 'VI'}</span>
            <span className="hidden md:inline text-[11px] font-normal text-blue-300/80">
              {language === 'vi' ? 'English' : 'Tiếng Việt'}
            </span>
          </button>

          {/* Theme Toggle Button: Trắng - Đen */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all cursor-pointer shrink-0 shadow-sm"
            title={theme === 'light' ? t('themeLightTooltip') : t('themeDarkTooltip')}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-slate-200">{t('themeDarkBtn')}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium text-amber-200">{t('themeLightBtn')}</span>
              </>
            )}
          </button>

          {/* Print View */}
          <button
            onClick={onPrint}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer shrink-0"
            title={t('printTooltip')}
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Refresh: button */}
          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className={`p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer shrink-0 ${
              isSyncing ? 'opacity-70 cursor-wait' : ''
            }`}
            title={isSyncing ? t('refreshSyncing') : t('refreshTooltip')}
          >
            <RotateCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
