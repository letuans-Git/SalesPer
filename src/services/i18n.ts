import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type Language = 'vi' | 'en';

const LANG_KEY = 'CHINFON_APP_LANGUAGE';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'vi';
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'vi' || saved === 'en') {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read stored language:', e);
  }
  return 'vi';
}

export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    console.warn('Could not save language:', e);
  }
}

export const translations = {
  vi: {
    // Header & Brand
    appTitle: 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION',
    defaultCompany: 'CHINFON CEMENT Corp.',
    liveGoogleSheets: '100% DỮ LIỆU GOOGLE SHEETS',
    demoData: 'CHƯA KẾT NỐI GOOGLE SHEET (BẤM ĐỂ NẠP)',
    lastUpdatedLabel: 'Cập nhật:',

    // Header Navigation
    navKpi: 'Chỉ số KPI',
    navTrend: 'Xu hướng & Chỉ tiêu',
    navMix: 'Cơ cấu Kinh doanh',
    navReps: 'Xếp hạng Nhân viên',
    navInsights: 'Nhận định Điều hành',
    navTransactions: 'Giao dịch Chi tiết',

    // Header Actions
    themeLightBtn: 'Nền Trắng',
    themeDarkBtn: 'Nền Đen',
    themeLightTooltip: 'Đang dùng nền Trắng · Nhấn để chuyển sang nền Đen',
    themeDarkTooltip: 'Đang dùng nền Đen · Nhấn để chuyển sang nền Trắng',
    langToggleBtn: 'EN',
    langToggleTooltip: 'Chuyển sang Tiếng Anh (Switch to English)',
    printTooltip: 'In / Xuất PDF Trang Điều hành',
    refreshTooltip: 'Lập tức lấy dữ liệu từ Google Sheet, tính toán chính xác 100% rồi hiển thị ra màn hình',
    refreshSyncing: 'Đang lấy dữ liệu từ Google Sheets và tính toán...',

    // FilterBar
    filterLabel: 'Bộ lọc:',
    yearLabel: 'Năm',
    periodAll: 'Toàn kỳ (9T)',
    periodCustom: 'Tùy chỉnh',
    allRegions: 'Tất cả Khu vực',
    allReps: 'Tất cả Nhân viên',
    allCategories: 'Tất cả Nhóm SP',
    allChannels: 'Tất cả Kênh',
    resetFilters: 'Xóa bộ lọc',
    activeFiltersCount: 'bộ lọc đang áp dụng',
    periodTextPrefix: 'Năm',
    monthPrefix: 'Tháng',

    // KPI Grid
    kpiNetRevenue: 'Doanh thu thuần',
    kpiTarget: 'Chỉ tiêu Doanh thu',
    kpiAchievementRate: 'Tỷ lệ đạt chỉ tiêu',
    kpiYoYGrowth: 'Tăng trưởng YoY',
    kpiGrossProfit: 'Lợi nhuận gộp',
    kpiGrossMargin: 'Biên lợi nhuận gộp',
    kpiTotalOrders: 'Tổng số đơn hàng',
    kpiAOV: 'Giá trị TB/Đơn (AOV)',
    kpiTotalVolume: 'Tổng sản lượng',
    vsSamePeriod: 'so với cùng kỳ',
    vsTarget: 'so với chỉ tiêu',
    completedOrders: 'Đơn hoàn thành',
    cancelledCount: 'đơn đã hủy',
    targetMet: 'Vượt chỉ tiêu',
    targetLag: 'Chưa đạt',

    // Charts Titles & Labels
    chartMonthlyTrendTitle: 'XU HƯỚNG DOANH THU THUẦN THEO THÁNG',
    chartMonthlyTrendSub: 'So sánh doanh thu thực tế 2026 với cùng kỳ 2025 theo từng tháng',
    chartRevenueVsTargetTitle: 'DOANH THU THỰC TẾ SO VỚI CHỈ TIÊU',
    chartRevenueVsTargetSub: 'Theo dõi mức độ hoàn thành chỉ tiêu doanh thu lũy kế qua các tháng',
    chartRegionTitle: 'HIỆU SUẤT DOANH THU THEO KHU VỰC',
    chartRegionSub: 'Doanh thu thuần và tỷ lệ đóng góp của 5 vùng thị trường trọng điểm',
    chartCategoryTitle: 'CƠ CẤU DOANH THU THEO NHÓM SẢN PHẨM',
    chartCategorySub: 'Tỷ trọng doanh thu theo các dòng sản phẩm xi măng và clinker',
    chartChannelTitle: 'DOANH THU & ĐƠN HÀNG THEO KÊNH BÁN HÀNG',
    chartChannelSub: 'Hiệu quả phân phối trên 5 kênh bán hàng chủ lực',
    chartTopRepsTitle: 'TOP 10 NHÂN VIÊN KINH DOANH XUẤT SẮC',
    chartTopRepsSub: 'Xếp hạng nhân viên dẫn đầu về doanh số và tỷ lệ hoàn thành',
    chartMarginTitle: 'PHÂN TÍCH BIÊN LỢI NHUẬN GỘP THEO THÁNG',
    chartMarginSub: 'Diễn biến biên lợi nhuận gộp (%) qua từng tháng kinh doanh',
    chartRegionalAchvTitle: 'TỶ LỆ HOÀN THÀNH CHỈ TIÊU THEO KHU VỰC',
    chartRegionalAchvSub: 'So sánh tỷ lệ đạt chỉ tiêu (%) giữa các vùng thị trường',

    // Chart Legends & Series
    legendActual: 'Doanh thu thực tế',
    legendPriorYear: 'Cùng kỳ năm trước',
    legendTarget: 'Chỉ tiêu giao',
    legendMargin: 'Biên lợi nhuận (%)',
    legendOrders: 'Số đơn hàng',
    legendRevenue: 'Doanh thu (VNĐ)',
    legendAchievement: 'Tỷ lệ đạt (%)',

    // Leaderboard Table
    repsTableTitle: 'BẢNG XẾP HẠNG & HIỆU SUẤT NHÂN VIÊN KINH DOANH',
    repsTableSub: 'Đánh giá chi tiết doanh thu, chỉ tiêu, tỷ lệ hoàn thành và biên lợi nhuận của toàn bộ đội ngũ',
    searchRepsPlaceholder: 'Tìm kiếm nhân viên theo tên, mã hoặc khu vực...',
    colRank: 'Hạng',
    colRepName: 'Nhân viên kinh doanh',
    colRegion: 'Khu vực',
    colRevenue: 'Doanh thu thuần',
    colTarget: 'Chỉ tiêu',
    colAchievement: 'Tỷ lệ đạt',
    colOrders: 'Đơn hàng',
    colMargin: 'Biên LN',
    colStatus: 'Trạng thái',
    statusHigh: 'Xuất sắc (>100%)',
    statusMed: 'Đang theo dõi (80-100%)',
    statusLow: 'Cần cải thiện (<80%)',
    allStatuses: 'Tất cả trạng thái',

    // Region Table
    regionTableTitle: 'BẢNG TỔNG HỢP HIỆU SUẤT THEO KHU VỰC',
    regionTableSub: 'Chi tiết doanh thu, giá vốn, lợi nhuận gộp và mức độ bám sát kế hoạch từng vùng',
    colManager: 'Quản lý vùng',
    colGrossProfit: 'Lợi nhuận gộp',
    colContribution: 'Tỷ trọng',

    // Transactions Table
    txnsTableTitle: 'NHẬT KÝ GIAO DỊCH CHI TIẾT',
    txnsTableSub: 'Danh sách giao dịch chi tiết phục vụ kiểm toán và đối soát dữ liệu bán hàng',
    searchTxnsPlaceholder: 'Tìm mã giao dịch, khách hàng, sản phẩm...',
    colTxnId: 'Mã GD',
    colDate: 'Ngày bán',
    colCustomer: 'Khách hàng',
    colProduct: 'Sản phẩm',
    colQty: 'Số lượng',
    colUnitPrice: 'Đơn giá',
    colDiscount: 'Chiết khấu',
    colNetRev: 'Doanh thu',
    colProfit: 'Lợi nhuận',
    colOrderStatus: 'Đơn hàng',
    colPayStatus: 'Thanh toán',
    statusCompleted: 'Hoàn thành',
    statusCancelled: 'Đã hủy',
    statusPending: 'Đang xử lý',
    payPaid: 'Đã thanh toán',
    payUnpaid: 'Chưa thanh toán',
    showingTxns: 'Hiển thị',
    ofTotal: 'trên tổng số',
    transactionsWord: 'giao dịch',
    prevPage: 'Trước',
    nextPage: 'Sau',

    // Executive Insights
    insightsTitle: 'SALES INSIGHTS – NHẬN ĐỊNH VÀ KHUYẾN NGHỊ ĐIỀU HÀNH',
    insightsSub: 'Tổng hợp tự động từ dữ liệu Google Sheets đã kiểm định, hỗ trợ Ban Giám đốc ra quyết định',
    aiMemoBadge: 'AI Executive Memo',
    executiveSummaryTitle: 'TỔNG QUAN ĐIỀU HÀNH',
    positiveHighlightsTitle: 'ĐIỂM SÁNG KINH DOANH',
    areasOfConcernTitle: 'KHU VỰC & VẤN ĐỀ CẦN LƯU Ý',
    strategicRecommendationsTitle: 'KHUYẾN NGHỊ HÀNH ĐỘNG CHIẾN LƯỢC',

    // Units and Currency Format
    currencyUnit: 'VNĐ',
    billionUnit: 'tỷ',
    millionUnit: 'triệu',
    thousandUnit: 'nghìn',
    tonUnit: 'tấn',

    // Region names
    'REG_MB': 'Miền Bắc',
    'REG_MT': 'Miền Trung',
    'REG_MN': 'Miền Nam',
    'REG_TN': 'Tây Nguyên',
    'REG_DBSCL': 'Đồng bằng sông Cửu Long',

    // Channels
    'CHN_DIST': 'Nhà phân phối (Distributor)',
    'CHN_DIR': 'Bán hàng trực tiếp (Direct Sales)',
    'CHN_KA': 'Khách hàng lớn (Key Account)',
    'CHN_RET': 'Đại lý bán lẻ (Retail)',
    'CHN_ONL': 'Kênh trực tuyến (Online)',

    // Categories
    'Xi măng bao': 'Xi măng bao',
    'Xi măng rời': 'Xi măng rời',
    'Clinker': 'Clinker',
    'Xi măng đặc biệt': 'Xi măng đặc biệt',
    'Phụ gia xây dựng': 'Phụ gia xây dựng',
  },
  en: {
    // Header & Brand
    appTitle: 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION',
    defaultCompany: 'CHINFON CEMENT Corp.',
    liveGoogleSheets: '100% LIVE GOOGLE SHEETS',
    demoData: 'GOOGLE SHEETS NOT CONNECTED (CLICK TO CONNECT)',
    lastUpdatedLabel: 'Updated:',

    // Header Navigation
    navKpi: 'KPI Metrics',
    navTrend: 'Trends & Targets',
    navMix: 'Business Mix',
    navReps: 'Sales Reps',
    navInsights: 'Executive Insights',
    navTransactions: 'Detailed Transactions',

    // Header Actions
    themeLightBtn: 'Light Mode',
    themeDarkBtn: 'Dark Mode',
    themeLightTooltip: 'Current: Light Mode · Click to switch to Dark Mode',
    themeDarkTooltip: 'Current: Dark Mode · Click to switch to Light Mode',
    langToggleBtn: 'VI',
    langToggleTooltip: 'Chuyển sang Tiếng Việt (Switch to Vietnamese)',
    printTooltip: 'Print / Export PDF Executive Report',
    refreshTooltip: 'Instantly fetch Google Sheets, recalculate 100% accurate metrics and display on screen',
    refreshSyncing: 'Fetching data from Google Sheets & calculating...',

    // FilterBar
    filterLabel: 'Filters:',
    yearLabel: 'Year',
    periodAll: 'Full Period (9M)',
    periodCustom: 'Custom',
    allRegions: 'All Regions',
    allReps: 'All Sales Reps',
    allCategories: 'All Categories',
    allChannels: 'All Channels',
    resetFilters: 'Reset Filters',
    activeFiltersCount: 'active filters applied',
    periodTextPrefix: 'Year',
    monthPrefix: 'Month',

    // KPI Grid
    kpiNetRevenue: 'Net Revenue',
    kpiTarget: 'Revenue Target',
    kpiAchievementRate: 'Achievement Rate',
    kpiYoYGrowth: 'YoY Growth',
    kpiGrossProfit: 'Gross Profit',
    kpiGrossMargin: 'Gross Margin',
    kpiTotalOrders: 'Total Orders',
    kpiAOV: 'Average Order Value (AOV)',
    kpiTotalVolume: 'Total Volume',
    vsSamePeriod: 'vs prior year period',
    vsTarget: 'vs revenue target',
    completedOrders: 'Completed Orders',
    cancelledCount: 'cancelled orders',
    targetMet: 'Target Exceeded',
    targetLag: 'Below Target',

    // Charts Titles & Labels
    chartMonthlyTrendTitle: 'MONTHLY NET REVENUE TREND',
    chartMonthlyTrendSub: 'Comparison of 2026 actual net revenue vs 2025 prior period by month',
    chartRevenueVsTargetTitle: 'ACTUAL REVENUE VS TARGET',
    chartRevenueVsTargetSub: 'Tracking cumulative revenue plan fulfillment throughout months',
    chartRegionTitle: 'REVENUE PERFORMANCE BY REGION',
    chartRegionSub: 'Net revenue and share of contribution across 5 core market regions',
    chartCategoryTitle: 'REVENUE MIX BY PRODUCT CATEGORY',
    chartCategorySub: 'Revenue breakdown across cement bags, bulk cement, and clinker lines',
    chartChannelTitle: 'REVENUE & ORDERS BY SALES CHANNEL',
    chartChannelSub: 'Distribution performance across 5 strategic sales channels',
    chartTopRepsTitle: 'TOP 10 SALES REPRESENTATIVES',
    chartTopRepsSub: 'Ranking of leading sales reps by revenue and quota achievement',
    chartMarginTitle: 'MONTHLY GROSS MARGIN ANALYSIS',
    chartMarginSub: 'Evolution of gross profit margin (%) across sales operating periods',
    chartRegionalAchvTitle: 'TARGET ACHIEVEMENT RATE BY REGION',
    chartRegionalAchvSub: 'Comparison of plan achievement rates (%) across regional markets',

    // Chart Legends & Series
    legendActual: 'Actual Revenue',
    legendPriorYear: 'Prior Year',
    legendTarget: 'Target Plan',
    legendMargin: 'Gross Margin (%)',
    legendOrders: 'Orders Count',
    legendRevenue: 'Revenue (VND)',
    legendAchievement: 'Achieved (%)',

    // Leaderboard Table
    repsTableTitle: 'SALES REPRESENTATIVES PERFORMANCE LEADERBOARD',
    repsTableSub: 'Comprehensive evaluation of revenue, quotas, achievement rates, and profitability',
    searchRepsPlaceholder: 'Search sales reps by name, code or region...',
    colRank: 'Rank',
    colRepName: 'Sales Representative',
    colRegion: 'Region',
    colRevenue: 'Net Revenue',
    colTarget: 'Target',
    colAchievement: 'Achv %',
    colOrders: 'Orders',
    colMargin: 'Margin %',
    colStatus: 'Rating',
    statusHigh: 'Outstanding (>100%)',
    statusMed: 'On Track (80-100%)',
    statusLow: 'Needs Attention (<80%)',
    allStatuses: 'All Ratings',

    // Region Table
    regionTableTitle: 'REGIONAL PERFORMANCE SUMMARY TABLE',
    regionTableSub: 'Detailed breakdown of revenue, COGS, gross profits, and plan execution by territory',
    colManager: 'Regional Manager',
    colGrossProfit: 'Gross Profit',
    colContribution: 'Share %',

    // Transactions Table
    txnsTableTitle: 'DETAILED SALES TRANSACTION LOG',
    txnsTableSub: 'Granular order transaction records for executive auditing and financial reconciliation',
    searchTxnsPlaceholder: 'Search by transaction ID, customer, product...',
    colTxnId: 'Txn ID',
    colDate: 'Order Date',
    colCustomer: 'Customer',
    colProduct: 'Product',
    colQty: 'Qty',
    colUnitPrice: 'Unit Price',
    colDiscount: 'Discount',
    colNetRev: 'Net Revenue',
    colProfit: 'Gross Profit',
    colOrderStatus: 'Order Status',
    colPayStatus: 'Payment',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    statusPending: 'Pending',
    payPaid: 'Paid',
    payUnpaid: 'Unpaid',
    showingTxns: 'Showing',
    ofTotal: 'of',
    transactionsWord: 'transactions',
    prevPage: 'Previous',
    nextPage: 'Next',

    // Executive Insights
    insightsTitle: 'SALES INSIGHTS – EXECUTIVE BRIEFING & RECOMMENDATIONS',
    insightsSub: 'Synthesized directly from verified Google Sheets data to assist Board of Directors decision-making',
    aiMemoBadge: 'AI Executive Memo',
    executiveSummaryTitle: 'EXECUTIVE OVERVIEW',
    positiveHighlightsTitle: 'POSITIVE HIGHLIGHTS',
    areasOfConcernTitle: 'AREAS OF CONCERN & RISKS',
    strategicRecommendationsTitle: 'STRATEGIC RECOMMENDATIONS',

    // Units and Currency Format
    currencyUnit: 'VND',
    billionUnit: 'B',
    millionUnit: 'M',
    thousandUnit: 'K',
    tonUnit: 'tons',

    // Region names
    'REG_MB': 'Northern Region',
    'REG_MT': 'Central Region',
    'REG_MN': 'Southern Region',
    'REG_TN': 'Central Highlands',
    'REG_DBSCL': 'Mekong Delta',

    // Channels
    'CHN_DIST': 'Distributor Channel',
    'CHN_DIR': 'Direct Sales',
    'CHN_KA': 'Key Account (Enterprise)',
    'CHN_RET': 'Retail Outlets',
    'CHN_ONL': 'Online Channel',

    // Categories
    'Xi măng bao': 'Bagged Cement',
    'Xi măng rời': 'Bulk Cement',
    'Clinker': 'Clinker',
    'Xi măng đặc biệt': 'Specialized Cement',
    'Phụ gia xây dựng': 'Construction Additives',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['vi'], fallback?: string) => string;
  formatCurrencyVND: (val: number, compact?: boolean) => string;
  formatNumber: (val: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof translations['vi'], fallback?: string): string => {
    const dict = translations[language] || translations['vi'];
    return (dict as any)[key] ?? (translations['vi'] as any)[key] ?? fallback ?? String(key);
  };

  const formatNumber = (val: number): string => {
    if (isNaN(val)) return '0';
    return val.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const formatCurrencyVND = (val: number, compact = true): string => {
    if (isNaN(val)) return '0 ' + t('currencyUnit');
    const isEn = language === 'en';

    if (compact) {
      if (Math.abs(val) >= 1e9) {
        const b = (val / 1e9).toFixed(2);
        return isEn ? `${b} B VND` : `${b} tỷ VNĐ`;
      }
      if (Math.abs(val) >= 1e6) {
        const m = (val / 1e6).toFixed(1);
        return isEn ? `${m} M VND` : `${m} triệu VNĐ`;
      }
      if (Math.abs(val) >= 1e3) {
        const k = (val / 1e3).toFixed(0);
        return isEn ? `${k} K VND` : `${k} nghìn VNĐ`;
      }
    }

    return `${formatNumber(Math.round(val))} ${t('currencyUnit')}`;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatCurrencyVND,
      formatNumber,
    }),
    [language]
  );

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
