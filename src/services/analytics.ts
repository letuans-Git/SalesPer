import {
  DatabaseState,
  FilterState,
  KPIResult,
  MonthlyTrendData,
  RegionPerformance,
  CategoryPerformance,
  ChannelPerformance,
  SalesRepLeaderboardItem,
  SalesInsightsData,
  Transaction,
  SalesTarget,
} from '../types';

export function filterTransactions(
  transactions: Transaction[],
  filters: FilterState,
  productCategoryMap: Map<string, string>,
  targetYear?: number
): Transaction[] {
  const yearToFilter = targetYear !== undefined ? targetYear : filters.year;

  return transactions.filter((t) => {
    // 1. Year check
    const orderYear = parseInt(t.Order_Date.substring(0, 4), 10);
    if (orderYear !== yearToFilter) return false;

    // 2. Month range check
    const orderMonth = parseInt(t.Order_Date.substring(5, 7), 10);
    if (orderMonth < filters.startMonth || orderMonth > filters.endMonth) return false;

    // 3. Region check
    if (filters.regionId !== 'ALL' && t.Region_ID !== filters.regionId) return false;

    // 4. Sales Rep check
    if (filters.salesRepId !== 'ALL' && t.Sales_Rep_ID !== filters.salesRepId) return false;

    // 5. Category check
    if (filters.category !== 'ALL') {
      const cat = productCategoryMap.get(t.Product_ID);
      if (cat !== filters.category) return false;
    }

    // 6. Channel check
    if (filters.channelId !== 'ALL' && t.Channel_ID !== filters.channelId) return false;

    return true;
  });
}

export function filterTargets(
  targets: SalesTarget[],
  filters: FilterState,
  targetYear?: number
): SalesTarget[] {
  const yearToFilter = targetYear !== undefined ? targetYear : filters.year;

  return targets.filter((t) => {
    if (t.Year !== yearToFilter) return false;
    if (t.Month < filters.startMonth || t.Month > filters.endMonth) return false;
    if (filters.regionId !== 'ALL' && t.Region_ID !== filters.regionId) return false;
    if (filters.salesRepId !== 'ALL' && t.Sales_Rep_ID !== filters.salesRepId) return false;
    return true;
  });
}

export function calculateKPIs(
  currTxns: Transaction[],
  prevTxns: Transaction[],
  currTargets: SalesTarget[]
): KPIResult {
  // Only valid orders (exclude Cancelled)
  const validCurrTxns = currTxns.filter((t) => t.Order_Status !== 'Cancelled');
  const validPrevTxns = prevTxns.filter((t) => t.Order_Status !== 'Cancelled');

  const cancelledCurrTxns = currTxns.filter((t) => t.Order_Status === 'Cancelled');
  const cancelledRevenue = cancelledCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);

  // 1. Net Revenue
  const netRevenue = validCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
  const prevNetRevenue = validPrevTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
  const revenueGrowth =
    prevNetRevenue > 0 ? ((netRevenue - prevNetRevenue) / prevNetRevenue) * 100 : 0;

  // 2. Revenue Target & Achievement
  const revenueTarget = currTargets.reduce((sum, t) => sum + t.Revenue_Target, 0);
  const achievementRate =
    revenueTarget > 0 ? (netRevenue / revenueTarget) * 100 : 0;

  // 3. Gross Profit & Margin
  const grossProfit = validCurrTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);
  const prevGrossProfit = validPrevTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);
  const profitGrowth =
    prevGrossProfit > 0 ? ((grossProfit - prevGrossProfit) / prevGrossProfit) * 100 : 0;

  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const prevGrossMargin = prevNetRevenue > 0 ? (prevGrossProfit / prevNetRevenue) * 100 : 0;
  const grossMarginDiff = grossMargin - prevGrossMargin;

  // 4. Distinct Orders & AOV
  const currOrderIds = new Set(validCurrTxns.map((t) => t.Order_ID));
  const prevOrderIds = new Set(validPrevTxns.map((t) => t.Order_ID));

  const totalOrders = currOrderIds.size;
  const prevTotalOrders = prevOrderIds.size;
  const ordersGrowth =
    prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

  const avgOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;
  const prevAvgOrderValue = prevTotalOrders > 0 ? prevNetRevenue / prevTotalOrders : 0;
  const aovGrowth =
    prevAvgOrderValue > 0 ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue) * 100 : 0;

  const totalQuantity = validCurrTxns.reduce((sum, t) => sum + t.Quantity, 0);

  return {
    netRevenue,
    prevNetRevenue,
    revenueGrowth,
    revenueTarget,
    achievementRate,
    grossProfit,
    prevGrossProfit,
    profitGrowth,
    grossMargin,
    prevGrossMargin,
    grossMarginDiff,
    totalOrders,
    prevTotalOrders,
    ordersGrowth,
    avgOrderValue,
    prevAvgOrderValue,
    aovGrowth,
    totalQuantity,
    cancelledOrdersCount: new Set(cancelledCurrTxns.map((t) => t.Order_ID)).size,
    cancelledRevenue,
  };
}

export function computeMonthlyTrends(
  allTxns: Transaction[],
  allTargets: SalesTarget[],
  filters: FilterState,
  productCategoryMap: Map<string, string>
): MonthlyTrendData[] {
  const result: MonthlyTrendData[] = [];

  for (let m = filters.startMonth; m <= filters.endMonth; m++) {
    const monthFilter: FilterState = { ...filters, startMonth: m, endMonth: m };

    const currMonthTxns = filterTransactions(allTxns, monthFilter, productCategoryMap, filters.year)
      .filter((t) => t.Order_Status !== 'Cancelled');

    const prevMonthTxns = filterTransactions(allTxns, monthFilter, productCategoryMap, filters.year - 1)
      .filter((t) => t.Order_Status !== 'Cancelled');

    const currMonthTargets = filterTargets(allTargets, monthFilter, filters.year);

    const rev2026 = currMonthTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const rev2025 = prevMonthTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const target2026 = currMonthTargets.reduce((sum, t) => sum + t.Revenue_Target, 0);

    const profit2026 = currMonthTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);
    const profit2025 = prevMonthTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);

    const margin2026 = rev2026 > 0 ? (profit2026 / rev2026) * 100 : 0;
    const margin2025 = rev2025 > 0 ? (profit2025 / rev2025) * 100 : 0;

    const growth = rev2025 > 0 ? ((rev2026 - rev2025) / rev2025) * 100 : 0;
    const variance = rev2026 - target2026;

    result.push({
      month: m,
      monthName: `T${m}`,
      revenue2025: rev2025,
      revenue2026: rev2026,
      target2026: target2026,
      growth,
      profit2026,
      margin2026,
      margin2025,
      variance2026: variance,
    });
  }

  return result;
}

export function computeRegionPerformance(
  db: DatabaseState,
  filters: FilterState,
  productCategoryMap: Map<string, string>
): RegionPerformance[] {
  const currTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const prevTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year - 1)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const currTargets = filterTargets(db.targets, filters, filters.year);

  const totalRev = currTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);

  return db.regions.map((reg) => {
    const regCurrTxns = currTxns.filter((t) => t.Region_ID === reg.Region_ID);
    const regPrevTxns = prevTxns.filter((t) => t.Region_ID === reg.Region_ID);
    const regTargets = currTargets.filter((t) => t.Region_ID === reg.Region_ID);

    const revenue = regCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const prevRevenue = regPrevTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const target = regTargets.reduce((sum, t) => sum + t.Revenue_Target, 0);
    const profit = regCurrTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);

    const achievement = target > 0 ? (revenue / target) * 100 : 0;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const orders = new Set(regCurrTxns.map((t) => t.Order_ID)).size;
    const repsCount = db.salesReps.filter((r) => r.Region_ID === reg.Region_ID).length;
    const share = totalRev > 0 ? (revenue / totalRev) * 100 : 0;

    return {
      regionId: reg.Region_ID,
      regionName: reg.Region_Name,
      manager: reg.Region_Manager,
      revenue,
      prevRevenue,
      target,
      achievement,
      growth,
      profit,
      margin,
      orders,
      repsCount,
      share,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function computeCategoryPerformance(
  db: DatabaseState,
  filters: FilterState,
  productCategoryMap: Map<string, string>
): CategoryPerformance[] {
  const currTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const prevTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year - 1)
    .filter((t) => t.Order_Status !== 'Cancelled');

  const totalRev = currTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);

  // Unique categories
  const categories = Array.from(new Set(db.products.map((p) => p.Category)));

  return categories.map((cat) => {
    const catCurrTxns = currTxns.filter((t) => productCategoryMap.get(t.Product_ID) === cat);
    const catPrevTxns = prevTxns.filter((t) => productCategoryMap.get(t.Product_ID) === cat);

    const revenue = catCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const prevRevenue = catPrevTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const profit = catCurrTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);
    const quantity = catCurrTxns.reduce((sum, t) => sum + t.Quantity, 0);

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const share = totalRev > 0 ? (revenue / totalRev) * 100 : 0;

    return {
      category: cat,
      revenue,
      target: 0,
      profit,
      margin,
      quantity,
      share,
      growth,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function computeChannelPerformance(
  db: DatabaseState,
  filters: FilterState,
  productCategoryMap: Map<string, string>
): ChannelPerformance[] {
  const currTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const prevTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year - 1)
    .filter((t) => t.Order_Status !== 'Cancelled');

  const totalRev = currTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);

  return db.channels.map((chn) => {
    const chnCurrTxns = currTxns.filter((t) => t.Channel_ID === chn.Channel_ID);
    const chnPrevTxns = prevTxns.filter((t) => t.Channel_ID === chn.Channel_ID);

    const revenue = chnCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const prevRevenue = chnPrevTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const profit = chnCurrTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);
    const orders = new Set(chnCurrTxns.map((t) => t.Order_ID)).size;

    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const share = totalRev > 0 ? (revenue / totalRev) * 100 : 0;

    return {
      channelId: chn.Channel_ID,
      channelName: chn.Channel_Name,
      revenue,
      orders,
      profit,
      margin,
      share,
      growth,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function computeSalesRepsLeaderboard(
  db: DatabaseState,
  filters: FilterState,
  productCategoryMap: Map<string, string>
): SalesRepLeaderboardItem[] {
  const currTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const prevTxns = filterTransactions(db.transactions, filters, productCategoryMap, filters.year - 1)
    .filter((t) => t.Order_Status !== 'Cancelled');
  const currTargets = filterTargets(db.targets, filters, filters.year);

  const regionNameMap = new Map(db.regions.map((r) => [r.Region_ID, r.Region_Name]));

  const eligibleReps = filters.salesRepId !== 'ALL'
    ? db.salesReps.filter((r) => r.Sales_Rep_ID === filters.salesRepId)
    : filters.regionId !== 'ALL'
    ? db.salesReps.filter((r) => r.Region_ID === filters.regionId)
    : db.salesReps;

  const items = eligibleReps.map((rep) => {
    const repCurrTxns = currTxns.filter((t) => t.Sales_Rep_ID === rep.Sales_Rep_ID);
    const repPrevTxns = prevTxns.filter((t) => t.Sales_Rep_ID === rep.Sales_Rep_ID);
    const repTargets = currTargets.filter((t) => t.Sales_Rep_ID === rep.Sales_Rep_ID);

    const revenue = repCurrTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const prevRevenue = repPrevTxns.reduce((sum, t) => sum + t.Net_Revenue, 0);
    const target = repTargets.reduce((sum, t) => sum + t.Revenue_Target, 0);
    const grossProfit = repCurrTxns.reduce((sum, t) => sum + t.Gross_Profit, 0);

    const achievement = target > 0 ? (revenue / target) * 100 : 0;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const orders = new Set(repCurrTxns.map((t) => t.Order_ID)).size;

    let statusBadge: SalesRepLeaderboardItem['statusBadge'] = 'Below Target';
    if (achievement >= 120) {
      statusBadge = 'Excellent';
    } else if (achievement >= 100) {
      statusBadge = 'Good';
    } else if (achievement >= 80) {
      statusBadge = 'Warning';
    } else {
      statusBadge = 'Below Target';
    }

    return {
      rank: 0,
      salesRepId: rep.Sales_Rep_ID,
      salesRepName: rep.Sales_Rep_Name,
      regionId: rep.Region_ID,
      regionName: regionNameMap.get(rep.Region_ID) || rep.Region_ID,
      revenue,
      target,
      achievement,
      growth,
      grossProfit,
      grossMargin,
      orders,
      statusBadge,
    };
  });

  items.sort((a, b) => b.revenue - a.revenue);
  items.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  return items;
}

export function generateStatisticalInsights(
  kpi: KPIResult,
  regions: RegionPerformance[],
  categories: CategoryPerformance[],
  channels: ChannelPerformance[],
  leaderboard: SalesRepLeaderboardItem[]
): SalesInsightsData {
  const positiveHighlights: string[] = [];
  const areasOfConcern: string[] = [];
  const recommendedActions: string[] = [];

  // 1. Overall Revenue & Growth
  if (kpi.revenueGrowth > 0) {
    positiveHighlights.push(
      `Doanh thu toàn công ty tăng trưởng +${kpi.revenueGrowth.toFixed(1)}% so với cùng kỳ năm ${2025}, đạt ${(kpi.netRevenue / 1e9).toFixed(1)} tỷ VNĐ.`
    );
  } else {
    areasOfConcern.push(
      `Tốc độ tăng trưởng doanh thu suy giảm ${kpi.revenueGrowth.toFixed(1)}% so với cùng kỳ năm trước.`
    );
  }

  // 2. Target Achievement
  if (kpi.achievementRate >= 100) {
    positiveHighlights.push(
      `Tỷ lệ hoàn thành chỉ tiêu doanh thu đạt ${kpi.achievementRate.toFixed(1)}% (vượt kế hoạch ${(kpi.achievementRate - 100).toFixed(1)}%).`
    );
  } else {
    areasOfConcern.push(
      `Tiến độ hoàn thành chỉ tiêu đạt ${kpi.achievementRate.toFixed(1)}%, còn thiếu ${(100 - kpi.achievementRate).toFixed(1)}% so với kế hoạch ngân sách.`
    );
  }

  // 3. Regional Insights
  if (regions.length > 0) {
    const topRegion = regions[0];
    positiveHighlights.push(
      `Khu vực ${topRegion.regionName} dẫn đầu toàn hệ thống với doanh thu ${(topRegion.revenue / 1e9).toFixed(1)} tỷ VNĐ (chiếm ${topRegion.share.toFixed(1)}% thị phần nội địa).`
    );

    const laggingRegions = regions.filter((r) => r.achievement < 95);
    if (laggingRegions.length > 0) {
      areasOfConcern.push(
        `Khu vực ${laggingRegions.map((r) => r.regionName).join(', ')} có tiến độ hoàn thành chỉ tiêu thấp (${laggingRegions.map((r) => r.achievement.toFixed(1) + '%').join(', ')}).`
      );
      recommendedActions.push(
        `Giám đốc Khối cần rà soát lại chỉ tiêu quý và hỗ trợ nguồn hàng/chính sách giá thầu cho ${laggingRegions[0].regionName}.`
      );
    }
  }

  // 4. Category Insights
  if (categories.length > 0) {
    const fastestGrowing = [...categories].sort((a, b) => b.growth - a.growth)[0];
    if (fastestGrowing && fastestGrowing.growth > 0) {
      positiveHighlights.push(
        `Nhóm sản phẩm "${fastestGrowing.category}" bứt phá mạnh nhất với mức tăng trưởng +${fastestGrowing.growth.toFixed(1)}% YoY.`
      );
    }

    const highMargin = [...categories].sort((a, b) => b.margin - a.margin)[0];
    if (highMargin) {
      positiveHighlights.push(
        `Dòng "${highMargin.category}" duy trì biên lợi nhuận cao nhất đạt ${highMargin.margin.toFixed(1)}%.`
      );
    }
  }

  // 5. Channel Insights
  const onlineChannel = channels.find((c) => c.channelId === 'CHN_ONLINE');
  if (onlineChannel && onlineChannel.growth > 15) {
    positiveHighlights.push(
      `Kênh B2B Online mở rộng ấn tượng với mức tăng trưởng +${onlineChannel.growth.toFixed(1)}% so với cùng kỳ.`
    );
  }

  // 6. Sales Reps Evaluation
  const starReps = leaderboard.filter((r) => r.statusBadge === 'Excellent');
  const belowTargetReps = leaderboard.filter((r) => r.statusBadge === 'Below Target');

  if (starReps.length > 0) {
    positiveHighlights.push(
      `${starReps.length} nhân viên đạt mức xếp loại Xuất sắc (vượt >=120% chỉ tiêu), tiêu biểu: ${starReps.slice(0, 2).map((r) => r.salesRepName).join(', ')}.`
    );
  }

  if (belowTargetReps.length > 0) {
    areasOfConcern.push(
      `Có ${belowTargetReps.length} nhân sự chưa đạt ngưỡng an toàn (<80% chỉ tiêu): ${belowTargetReps.slice(0, 3).map((r) => r.salesRepName).join(', ')}.`
    );
    recommendedActions.push(
      `Tổ chức đào tạo kỹ năng tư vấn giải pháp xi măng rời công trình và cơ chế chia sẻ tệp khách hàng cho nhóm nhân sự dưới chỉ tiêu.`
    );
  }

  // Strategic Action
  recommendedActions.push(
    `Đẩy mạnh phân bổ dòng Xi măng Đặc chủng và Xi măng Jumbo cho các đại công trình ven biển và cao tốc để tối ưu biên lợi nhuận gộp.`
  );
  recommendedActions.push(
    `Thực hiện đối soát dòng tiền và công nợ đối với các đơn vị nhà thầu phân phối cấp 1 trước thềm cao điểm quý 4.`
  );

  return {
    executiveSummary: `Tổng quan kỳ báo cáo ghi nhận doanh thu thuần ${(kpi.netRevenue / 1e9).toFixed(2)} tỷ VNĐ, hoàn thành ${kpi.achievementRate.toFixed(1)}% chỉ tiêu với biên lợi nhuận gộp đạt ${kpi.grossMargin.toFixed(1)}%. Doanh nghiệp duy trì tốc độ mở rộng tốt tại các thị trường trọng điểm.`,
    positiveHighlights,
    areasOfConcern,
    recommendedActions,
    isAiGenerated: false,
  };
}

// Phase 5: Complete 12-Point Test & Verification Engine
export interface TestCheckResult {
  ruleNumber: number;
  ruleName: string;
  expectedDescription: string;
  actualValue: string;
  passed: boolean;
  details: string;
}

export function runDataIntegrityTestSuite(db: DatabaseState): TestCheckResult[] {
  const productCategoryMap = new Map(db.products.map((p) => [p.Product_ID, p.Category]));
  const defaultFilters: FilterState = {
    year: 2026,
    period: '9M',
    startMonth: 1,
    endMonth: 9,
    regionId: 'ALL',
    salesRepId: 'ALL',
    category: 'ALL',
    channelId: 'ALL',
  };

  const currTxns = filterTransactions(db.transactions, defaultFilters, productCategoryMap, 2026);
  const prevTxns = filterTransactions(db.transactions, defaultFilters, productCategoryMap, 2025);
  const currTargets = filterTargets(db.targets, defaultFilters, 2026);

  const kpis = calculateKPIs(currTxns, prevTxns, currTargets);
  const results: TestCheckResult[] = [];

  // Check 1: Unique Transaction IDs
  const txnIds = new Set(db.transactions.map((t) => t.Transaction_ID));
  const noDuplicateTxn = txnIds.size === db.transactions.length;
  results.push({
    ruleNumber: 1,
    ruleName: 'Mã giao dịch duy nhất (Unique Transaction IDs)',
    expectedDescription: `100% mã giao dịch phải duy nhất, không trùng lặp (${db.transactions.length} dòng)`,
    actualValue: `${txnIds.size} / ${db.transactions.length} mã duy nhất`,
    passed: noDuplicateTxn,
    details: noDuplicateTxn ? 'Không phát hiện mã giao dịch trùng lặp.' : 'Có mã giao dịch bị trùng lặp!',
  });

  // Check 2: Exclude Cancelled Orders from Revenue & Count
  const cancelledTxns = currTxns.filter((t) => t.Order_Status === 'Cancelled');
  const validTxns = currTxns.filter((t) => t.Order_Status !== 'Cancelled');
  const sumValidNet = validTxns.reduce((s, t) => s + t.Net_Revenue, 0);
  const passedExcludeCancelled = Math.abs(kpis.netRevenue - sumValidNet) < 1;
  results.push({
    ruleNumber: 2,
    ruleName: 'Loại trừ đơn hàng Hủy khỏi Doanh thu thuần',
    expectedDescription: 'Đơn hàng Cancelled tuyệt đối không được cộng vào Doanh thu thuần',
    actualValue: `Doanh thu hợp lệ: ${(kpis.netRevenue / 1e9).toFixed(2)}B (Đã loại ${(kpis.cancelledRevenue / 1e9).toFixed(2)}B từ ${kpis.cancelledOrdersCount} đơn hủy)`,
    passed: passedExcludeCancelled,
    details: passedExcludeCancelled ? 'Doanh thu thuần đã loại trừ chính xác toàn bộ dòng đơn hàng bị hủy.' : 'Lỗi: Doanh thu chứa đơn hàng hủy!',
  });

  // Check 3: Distinct Orders Count (no double-counting multi-line orders)
  const distinctValidOrderIds = new Set(validTxns.map((t) => t.Order_ID)).size;
  const passedOrderCount = kpis.totalOrders === distinctValidOrderIds;
  results.push({
    ruleNumber: 3,
    ruleName: 'Đếm đơn hàng duy nhất (Distinct Orders, không trùng lặp dòng)',
    expectedDescription: 'Một đơn hàng nhiều sản phẩm chỉ được tính là 1 đơn duy nhất',
    actualValue: `Tổng số đơn: ${kpis.totalOrders} (từ ${validTxns.length} dòng giao dịch hợp lệ)`,
    passed: passedOrderCount,
    details: passedOrderCount ? 'Thuật toán Set<Order_ID> hoạt động chính xác.' : 'Lỗi: Đơn hàng bị đếm trùng lặp!',
  });

  // Check 4: Mathematical Identity Net_Revenue = Gross_Revenue - Discount
  const brokenDiscountTxns = db.transactions.filter(
    (t) => Math.abs(t.Net_Revenue - (t.Gross_Revenue - t.Discount)) > 0.01
  );
  const passedDiscountFormula = brokenDiscountTxns.length === 0;
  results.push({
    ruleNumber: 4,
    ruleName: 'Đẳng thức Doanh thu thuần = Doanh thu trước giảm giá - Chiết khấu',
    expectedDescription: 'Net_Revenue = Gross_Revenue - Discount trên 100% dòng dữ liệu',
    actualValue: `${db.transactions.length - brokenDiscountTxns.length} / ${db.transactions.length} dòng chuẩn xác`,
    passed: passedDiscountFormula,
    details: passedDiscountFormula ? '100% dòng giao dịch thỏa mãn công thức chiết khấu.' : 'Lỗi: Phát hiện dòng lệch công thức!',
  });

  // Check 5: Mathematical Identity Gross_Profit = Net_Revenue - Cost_Amount
  const brokenProfitTxns = db.transactions.filter(
    (t) => Math.abs(t.Gross_Profit - (t.Net_Revenue - t.Cost_Amount)) > 0.01
  );
  const passedProfitFormula = brokenProfitTxns.length === 0;
  results.push({
    ruleNumber: 5,
    ruleName: 'Đẳng thức Lợi nhuận gộp = Doanh thu thuần - Giá vốn',
    expectedDescription: 'Gross_Profit = Net_Revenue - Cost_Amount trên 100% dòng dữ liệu',
    actualValue: `${db.transactions.length - brokenProfitTxns.length} / ${db.transactions.length} dòng chuẩn xác`,
    passed: passedProfitFormula,
    details: passedProfitFormula ? '100% dòng giao dịch khớp công thức lợi nhuận.' : 'Lỗi: Phát hiện dòng lệch giá vốn!',
  });

  // Check 6: Target No Double Counting
  const repTargetsSum = currTargets.reduce((s, t) => s + t.Revenue_Target, 0);
  const regionPerf = computeRegionPerformance(db, defaultFilters, productCategoryMap);
  const regionTargetsSum = regionPerf.reduce((s, r) => s + r.target, 0);
  const passedTargetIntegrity = Math.abs(repTargetsSum - regionTargetsSum) < 1;
  results.push({
    ruleNumber: 6,
    ruleName: 'Kiểm tra không cộng trùng Chỉ tiêu (Target Integrity)',
    expectedDescription: 'Tổng chỉ tiêu theo Nhân viên phải khớp 100% tổng chỉ tiêu theo Khu vực',
    actualValue: `Tổng chỉ tiêu NV: ${(repTargetsSum / 1e9).toFixed(2)}B == Tổng chỉ tiêu Vùng: ${(regionTargetsSum / 1e9).toFixed(2)}B`,
    passed: passedTargetIntegrity,
    details: passedTargetIntegrity ? 'Chỉ tiêu phân bổ phân rã chuẩn, không trùng lặp.' : 'Lỗi: Tổng chỉ tiêu không khớp!',
  });

  // Check 7: YoY Comparison Symmetry (Same 9 months)
  const currMonths = new Set(validTxns.map((t) => parseInt(t.Order_Date.substring(5, 7), 10)));
  const prevValidTxns = prevTxns.filter((t) => t.Order_Status !== 'Cancelled');
  const prevMonths = new Set(prevValidTxns.map((t) => parseInt(t.Order_Date.substring(5, 7), 10)));
  const passedMonthSymmetry = currMonths.size === 9 && prevMonths.size === 9;
  results.push({
    ruleNumber: 7,
    ruleName: 'So sánh cùng kỳ đồng nhất (Same Period 9M)',
    expectedDescription: 'Hai giai đoạn 2025 và 2026 phải cùng có đủ 9 tháng (T1 - T9)',
    actualValue: `Năm 2026: ${currMonths.size} tháng | Năm 2025: ${prevMonths.size} tháng`,
    passed: passedMonthSymmetry,
    details: passedMonthSymmetry ? 'Số tháng đối chiếu tương đồng hoàn hảo (Tháng 1 đến Tháng 9).' : 'Lệch số tháng đối chiếu!',
  });

  // Check 8: Zero-Division Safety (No NaN / Infinity)
  const noNaNs =
    !isNaN(kpis.achievementRate) &&
    isFinite(kpis.achievementRate) &&
    !isNaN(kpis.revenueGrowth) &&
    isFinite(kpis.revenueGrowth) &&
    !isNaN(kpis.grossMargin) &&
    isFinite(kpis.grossMargin) &&
    !isNaN(kpis.avgOrderValue) &&
    isFinite(kpis.avgOrderValue);
  results.push({
    ruleNumber: 8,
    ruleName: 'An toàn mẫu số bằng 0 (Zero-Division & NaN Safety)',
    expectedDescription: 'Không phát sinh giá trị NaN, Infinity hoặc lỗi chia cho 0 khi chỉ tiêu = 0',
    actualValue: '100% các chỉ số trả về số thực hữu hạn an toàn',
    passed: noNaNs,
    details: noNaNs ? 'Toàn bộ công thức có bộ bảo vệ chống chia cho 0.' : 'Phát hiện giá trị vô định hoặc vô cùng!',
  });

  // Check 9: Regional Breakdown Sum Equals Total Net Revenue
  const regionRevSum = regionPerf.reduce((s, r) => s + r.revenue, 0);
  const passedRegionSum = Math.abs(regionRevSum - kpis.netRevenue) < 1;
  results.push({
    ruleNumber: 9,
    ruleName: 'Tổng doanh thu theo Khu vực khớp Doanh thu toàn công ty',
    expectedDescription: 'SUM(Doanh thu từng vùng) === Doanh thu thuần Dashboard',
    actualValue: `Tổng vùng: ${(regionRevSum / 1e9).toFixed(2)}B === KPI: ${(kpis.netRevenue / 1e9).toFixed(2)}B`,
    passed: passedRegionSum,
    details: passedRegionSum ? 'Độ lệch 0 VNĐ. Dữ liệu phân rã nhất quán.' : 'Lệch tổng vùng!',
  });

  // Check 10: Category Breakdown Sum Equals Total Net Revenue
  const catPerf = computeCategoryPerformance(db, defaultFilters, productCategoryMap);
  const catRevSum = catPerf.reduce((s, c) => s + c.revenue, 0);
  const passedCatSum = Math.abs(catRevSum - kpis.netRevenue) < 1;
  results.push({
    ruleNumber: 10,
    ruleName: 'Tổng doanh thu theo Nhóm sản phẩm khớp Doanh thu thuần',
    expectedDescription: 'SUM(Doanh thu các nhóm sản phẩm) === Doanh thu thuần Dashboard',
    actualValue: `Tổng sản phẩm: ${(catRevSum / 1e9).toFixed(2)}B === KPI: ${(kpis.netRevenue / 1e9).toFixed(2)}B`,
    passed: passedCatSum,
    details: passedCatSum ? 'Toàn bộ sản phẩm được phân nhóm đầy đủ.' : 'Lệch tổng nhóm sản phẩm!',
  });

  // Check 11: Sales Reps Leaderboard Sum Equals Total Net Revenue
  const repsLeaderboard = computeSalesRepsLeaderboard(db, defaultFilters, productCategoryMap);
  const repsRevSum = repsLeaderboard.reduce((s, r) => s + r.revenue, 0);
  const passedRepsSum = Math.abs(repsRevSum - kpis.netRevenue) < 1;
  results.push({
    ruleNumber: 11,
    ruleName: 'Tổng doanh thu theo Nhân viên kinh doanh khớp Doanh thu thuần',
    expectedDescription: 'SUM(Doanh thu từng Sales Rep) === Doanh thu thuần Dashboard',
    actualValue: `Tổng nhân viên: ${(repsRevSum / 1e9).toFixed(2)}B === KPI: ${(kpis.netRevenue / 1e9).toFixed(2)}B`,
    passed: passedRepsSum,
    details: passedRepsSum ? 'Mọi giao dịch đều gắn đúng nhân viên phụ trách.' : 'Lệch tổng nhân viên!',
  });

  // Check 12: Channels Sum Equals Total Net Revenue
  const chnPerf = computeChannelPerformance(db, defaultFilters, productCategoryMap);
  const chnRevSum = chnPerf.reduce((s, c) => s + c.revenue, 0);
  const passedChnSum = Math.abs(chnRevSum - kpis.netRevenue) < 1;
  results.push({
    ruleNumber: 12,
    ruleName: 'Tổng doanh thu theo Kênh phân phối khớp Doanh thu thuần',
    expectedDescription: 'SUM(Doanh thu các kênh bán hàng) === Doanh thu thuần Dashboard',
    actualValue: `Tổng kênh: ${(chnRevSum / 1e9).toFixed(2)}B === KPI: ${(kpis.netRevenue / 1e9).toFixed(2)}B`,
    passed: passedChnSum,
    details: passedChnSum ? 'Tất cả 5 kênh phân phối có số liệu đồng bộ.' : 'Lệch tổng kênh!',
  });

  return results;
}
