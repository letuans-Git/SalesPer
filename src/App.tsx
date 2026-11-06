import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { DatabaseState, FilterState, SalesInsightsData } from './types';
import {
  loadDatabase,
  regenerateDemoData,
  getPublishedSheetUrl,
  getAutoSyncInterval,
  syncPublishedGoogleSheet,
} from './services/storage';
import {
  filterTransactions,
  filterTargets,
  calculateKPIs,
  computeMonthlyTrends,
  computeRegionPerformance,
  computeCategoryPerformance,
  computeChannelPerformance,
  computeSalesRepsLeaderboard,
  generateStatisticalInsights,
} from './services/analytics';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KpiGrid } from './components/KpiGrid';
import { MonthlyRevenueChart } from './components/Charts/MonthlyRevenueChart';
import { RevenueVsTargetChart } from './components/Charts/RevenueVsTargetChart';
import { RegionPerformanceChart } from './components/Charts/RegionPerformanceChart';
import { ProductCategoryChart } from './components/Charts/ProductCategoryChart';
import { ChannelPerformanceChart } from './components/Charts/ChannelPerformanceChart';
import { TopSalesRepsChart } from './components/Charts/TopSalesRepsChart';
import { ProfitMarginChart } from './components/Charts/ProfitMarginChart';
import { RegionalAchievementChart } from './components/Charts/RegionalAchievementChart';
import { SalesRepsTable } from './components/SalesRepsTable';
import { RegionTable } from './components/RegionTable';
import { SalesInsights } from './components/SalesInsights';
import { TransactionsTable } from './components/TransactionsTable';
import { RepDetailModal } from './components/Modals/RepDetailModal';
import { GasIntegrationModal } from './components/Modals/GasIntegrationModal';
import { DataVerificationModal } from './components/Modals/DataVerificationModal';
import { ExportModal } from './components/Modals/ExportModal';
import { GenerateDataConfirmModal } from './components/Modals/GenerateDataConfirmModal';
import { PublishedSheetModal } from './components/Modals/PublishedSheetModal';

import { Zap, X as CloseIcon } from 'lucide-react';
import { realtimeSheetService } from './services/realtime';

const INITIAL_FILTERS: FilterState = {
  year: 2026,
  period: '9M',
  startMonth: 1,
  endMonth: 9,
  regionId: 'ALL',
  salesRepId: 'ALL',
  category: 'ALL',
  channelId: 'ALL',
};

export default function App() {
  const [db, setDb] = useState<DatabaseState>(() => loadDatabase());
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [customInsights, setCustomInsights] = useState<SalesInsightsData | null>(null);

  // Modals state
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPublishedModalOpen, setIsPublishedModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasPublishedUrl, setHasPublishedUrl] = useState(() => !!getPublishedSheetUrl());
  const [realtimeNotice, setRealtimeNotice] = useState<{ message: string; timestamp: string } | null>(null);

  // Auto-sync effect: automatically fetch published Google Sheet on mount and on periodic intervals
  useEffect(() => {
    const pubUrl = getPublishedSheetUrl();
    if (!pubUrl) return;

    setHasPublishedUrl(true);
    let isCancelled = false;

    const performSync = async () => {
      setIsSyncing(true);
      const res = await syncPublishedGoogleSheet(pubUrl, db);
      if (!isCancelled) {
        setIsSyncing(false);
        if (res.success && res.newDb) {
          setDb(res.newDb);
        }
      }
    };

    // Initial background sync
    performSync();

    // Periodic auto-sync if configured
    const intervalSec = getAutoSyncInterval();
    if (intervalSec > 0) {
      const timer = setInterval(() => {
        performSync();
      }, intervalSec * 1000);
      return () => {
        isCancelled = true;
        clearInterval(timer);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Real-time Push Listener: Triggers immediately when Google Sheets fires onEdit/onChange Webhook
  useEffect(() => {
    const unsubscribe = realtimeSheetService.subscribe(async (event) => {
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      const pubUrl = getPublishedSheetUrl();

      if (pubUrl) {
        setRealtimeNotice({
          message: `Phát hiện thay đổi trên Google Sheet lúc ${timeStr}! Đang tự động cập nhật...`,
          timestamp: timeStr,
        });

        setIsSyncing(true);
        const res = await syncPublishedGoogleSheet(pubUrl, db);
        setIsSyncing(false);

        if (res.success && res.newDb) {
          setDb(res.newDb);
          setRealtimeNotice({
            message: `Google Sheets vừa được chỉnh sửa lúc ${timeStr} · Dashboard đã đồng bộ tức thì!`,
            timestamp: timeStr,
          });
        }
      } else {
        setRealtimeNotice({
          message: `Nhận được tín hiệu chỉnh sửa Google Sheet lúc ${timeStr}! Hãy liên kết URL file để tải số liệu.`,
          timestamp: timeStr,
        });
      }

      setTimeout(() => {
        setRealtimeNotice(null);
      }, 7000);
    });

    return () => {
      unsubscribe();
    };
  }, [db]);

  // Product category lookup
  const productCategoryMap = useMemo(() => {
    return new Map(db.products.map((p) => [p.Product_ID, p.Category]));
  }, [db.products]);

  // Filtered transactions for active year and comparison year (same months)
  const currTxns = useMemo(() => {
    return filterTransactions(db.transactions, filters, productCategoryMap, filters.year);
  }, [db.transactions, filters, productCategoryMap]);

  const prevTxns = useMemo(() => {
    return filterTransactions(db.transactions, filters, productCategoryMap, filters.year - 1);
  }, [db.transactions, filters, productCategoryMap]);

  const currTargets = useMemo(() => {
    return filterTargets(db.targets, filters, filters.year);
  }, [db.targets, filters]);

  // Executive 8 KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(currTxns, prevTxns, currTargets);
  }, [currTxns, prevTxns, currTargets]);

  // 8 Chart Analytical Datasets
  const monthlyTrends = useMemo(() => {
    return computeMonthlyTrends(db.transactions, db.targets, filters, productCategoryMap);
  }, [db.transactions, db.targets, filters, productCategoryMap]);

  const regionPerf = useMemo(() => {
    return computeRegionPerformance(db, filters, productCategoryMap);
  }, [db, filters, productCategoryMap]);

  const categoryPerf = useMemo(() => {
    return computeCategoryPerformance(db, filters, productCategoryMap);
  }, [db, filters, productCategoryMap]);

  const channelPerf = useMemo(() => {
    return computeChannelPerformance(db, filters, productCategoryMap);
  }, [db, filters, productCategoryMap]);

  const leaderboard = useMemo(() => {
    return computeSalesRepsLeaderboard(db, filters, productCategoryMap);
  }, [db, filters, productCategoryMap]);

  // Algorithmic statistical insights (or AI insights if generated)
  const statisticalInsights = useMemo(() => {
    return generateStatisticalInsights(kpis, regionPerf, categoryPerf, channelPerf, leaderboard);
  }, [kpis, regionPerf, categoryPerf, channelPerf, leaderboard]);

  const activeInsights = customInsights || statisticalInsights;

  // Actions
  const handleRefresh = useCallback(async () => {
    const pubUrl = getPublishedSheetUrl();
    if (pubUrl) {
      setIsSyncing(true);
      const res = await syncPublishedGoogleSheet(pubUrl, db);
      setIsSyncing(false);
      if (res.success && res.newDb) {
        setDb(res.newDb);
        setCustomInsights(null);
        return;
      }
    }

    const reloaded = loadDatabase();
    setDb({ ...reloaded, settings: { ...reloaded.settings, Last_Data_Refresh: new Date().toISOString() } });
    setCustomInsights(null);
  }, [db]);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCustomInsights(null);
  }, []);

  const handleRegenerateData = useCallback((seed: number) => {
    const freshDb = regenerateDemoData(seed);
    setDb(freshDb);
    setCustomInsights(null);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const periodLabel = `Năm ${filters.year} (Tháng ${filters.startMonth} - ${filters.endMonth})`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ROW 1: HEADER */}
      <Header
        dashboardTitle={db.settings.Dashboard_Title}
        companyName={db.settings.Company_Name}
        lastUpdated={db.settings.Last_Data_Refresh}
        isPublishedConnected={hasPublishedUrl}
        isSyncing={isSyncing}
        onRefresh={handleRefresh}
        onOpenPublishedModal={() => setIsPublishedModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
        onPrint={handlePrint}
      />

      {/* Real-time Change Notification Banner */}
      {realtimeNotice && (
        <div className="bg-emerald-600 border-b border-emerald-500 text-white text-xs px-4 py-2 shadow-lg flex items-center justify-between sticky top-[57px] z-30 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 max-w-[1720px] mx-auto w-full">
            <Zap className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="font-semibold">{realtimeNotice.message}</span>
          </div>
          <button
            onClick={() => setRealtimeNotice(null)}
            className="p-1 hover:bg-emerald-700 rounded text-emerald-100 cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ROW 2: FILTERS (Sticky on laptops/desktops, fluid on mobile) */}
      <div className="no-print lg:sticky lg:top-[57px] z-20">
        <FilterBar
          filters={filters}
          onChangeFilters={(newFilters) => {
            setFilters(newFilters);
            setCustomInsights(null);
          }}
          onResetFilters={handleResetFilters}
          regions={db.regions}
          channels={db.channels}
          salesReps={db.salesReps}
          products={db.products}
        />
      </div>

      {/* MAIN EXECUTIVE DASHBOARD VIEWPORT */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* ROW 3: 8 EXECUTIVE KPI CARDS */}
        <KpiGrid kpis={kpis} filters={filters} />

        {/* ROW 4: TREND ANALYSIS (Chart 1 & Chart 2) */}
        <section id="trend-section" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MonthlyRevenueChart data={monthlyTrends} year={filters.year} />
          <RevenueVsTargetChart data={monthlyTrends} year={filters.year} />
        </section>

        {/* ROW 5: BUSINESS MIX (Chart 3, Chart 4, Chart 5) */}
        <section id="mix-section" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <RegionPerformanceChart
            data={regionPerf}
            onSelectRegion={(regId) => setFilters((prev) => ({ ...prev, regionId: regId }))}
            selectedRegionId={filters.regionId}
          />
          <ProductCategoryChart data={categoryPerf} />
          <ChannelPerformanceChart
            data={channelPerf}
            onSelectChannel={(chnId) => setFilters((prev) => ({ ...prev, channelId: chnId }))}
            selectedChannelId={filters.channelId}
          />
        </section>

        {/* ROW 6: SALES PERFORMANCE (Chart 6 & Sales Reps Leaderboard Table) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <TopSalesRepsChart
              data={leaderboard}
              onSelectRep={(repId) => setSelectedRepId(repId)}
            />
          </div>
          <div className="lg:col-span-2">
            <SalesRepsTable
              leaderboard={leaderboard}
              onSelectRep={(repId) => setSelectedRepId(repId)}
            />
          </div>
        </section>

        {/* ROW 7: PROFITABILITY & REGIONAL ACHIEVEMENT (Chart 7 & Chart 8) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProfitMarginChart data={monthlyTrends} year={filters.year} />
          <RegionalAchievementChart data={regionPerf} />
        </section>

        {/* REGIONAL PERFORMANCE SUMMARY TABLE */}
        <section>
          <RegionTable
            regions={regionPerf}
            onSelectRegion={(regId) => setFilters((prev) => ({ ...prev, regionId: regId }))}
            selectedRegionId={filters.regionId}
          />
        </section>

        {/* ROW 8: SALES INSIGHTS & AI EXECUTIVE BRIEFING */}
        <SalesInsights
          insights={activeInsights}
          kpis={kpis}
          regions={regionPerf}
          leaderboard={leaderboard}
          periodText={periodLabel}
          onUpdateInsights={(newInsights) => setCustomInsights(newInsights)}
        />

        {/* ROW 9: RAW TRANSACTIONS TABLE (With Search, Pagination, CSV Export) */}
        <div className="no-print">
          <TransactionsTable
            transactions={currTxns}
            products={db.products}
            salesReps={db.salesReps}
            regions={db.regions}
            channels={db.channels}
          />
        </div>
      </main>

      {/* EXECUTIVE FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-4 text-xs text-slate-500 text-center">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">CHINFON CEMENT Corp.</span>
            <span>·</span>
            <span>Sales Performance Dashboard – Executive Edition</span>
            <span>·</span>
            <span className="font-mono text-amber-400/90 font-medium">{db.settings.Demo_Data_Version}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Google Apps Script Backend Compatible</span>
            <span>·</span>
            <span>Google Sheets Database Active</span>
          </div>
        </div>
      </footer>

      {/* DRILL-DOWN & ACTION MODALS */}
      <RepDetailModal
        repId={selectedRepId}
        onClose={() => setSelectedRepId(null)}
        db={db}
        filters={filters}
      />

      <GasIntegrationModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        db={db}
      />

      <DataVerificationModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        db={db}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        db={db}
        filters={filters}
        kpis={kpis}
        onPrint={handlePrint}
      />

      <GenerateDataConfirmModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onConfirm={handleRegenerateData}
        currentSeed={db.settings.Data_Generation_Seed}
      />

      <PublishedSheetModal
        isOpen={isPublishedModalOpen}
        onClose={() => {
          setIsPublishedModalOpen(false);
          setHasPublishedUrl(!!getPublishedSheetUrl());
        }}
        db={db}
        onDatabaseUpdated={(newDb) => {
          setDb(newDb);
          setHasPublishedUrl(true);
          setCustomInsights(null);
        }}
      />
    </div>
  );
}
