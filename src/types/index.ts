export interface Transaction {
  Transaction_ID: string;
  Order_ID: string;
  Order_Date: string; // YYYY-MM-DD
  Customer_ID: string;
  Customer_Name: string;
  Region_ID: string;
  Sales_Rep_ID: string;
  Product_ID: string;
  Channel_ID: string;
  Quantity: number;
  Unit_Price: number;
  Gross_Revenue: number;
  Discount: number;
  Net_Revenue: number;
  Cost_Amount: number;
  Gross_Profit: number;
  Order_Status: 'Completed' | 'Delivered' | 'Pending' | 'Cancelled';
  Payment_Status: 'Paid' | 'Partial' | 'Unpaid';
}

export interface SalesTarget {
  Target_ID: string;
  Year: number;
  Month: number;
  Region_ID: string;
  Sales_Rep_ID: string;
  Revenue_Target: number;
  Profit_Target: number;
  Quantity_Target: number;
}

export interface Product {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Unit: string;
  Standard_Price: number;
  Standard_Cost: number;
  Status: 'Active' | 'Inactive';
}

export interface SalesRep {
  Sales_Rep_ID: string;
  Sales_Rep_Name: string;
  Department: string;
  Region_ID: string;
  Join_Date: string;
  Status: 'Active' | 'Inactive';
}

export interface Region {
  Region_ID: string;
  Region_Name: string;
  Region_Manager: string;
  Status: 'Active' | 'Inactive';
}

export interface Channel {
  Channel_ID: string;
  Channel_Name: string;
  Description: string;
  Status: 'Active' | 'Inactive';
}

export interface Settings {
  Company_Name: string;
  Dashboard_Title: string;
  Currency: string;
  Current_Year: number;
  Comparison_Year: number;
  Start_Month: number;
  End_Month: number;
  Last_Data_Refresh: string;
  Demo_Data_Version: string;
  Data_Generation_Seed: number;
}

export interface DataLog {
  Log_ID: string;
  Timestamp: string;
  Version: string;
  RowCount: number;
  Status: 'Success' | 'Failed' | 'Warning';
  Operator: string;
  ErrorMsg: string;
}

export interface FilterState {
  year: number;
  period: '9M' | 'Q1' | 'Q2' | 'Q3' | 'custom';
  startMonth: number;
  endMonth: number;
  regionId: string; // 'ALL' or specific Region_ID
  salesRepId: string; // 'ALL' or specific Sales_Rep_ID
  category: string; // 'ALL' or Category Name
  channelId: string; // 'ALL' or specific Channel_ID
}

export interface KPIResult {
  // KPI 1 & 2 & 3
  netRevenue: number;
  prevNetRevenue: number;
  revenueGrowth: number; // percentage (-100 to +inf)
  revenueTarget: number;
  achievementRate: number; // percentage

  // KPI 4 & 5 & 6
  grossProfit: number;
  prevGrossProfit: number;
  profitGrowth: number;
  grossMargin: number; // percentage
  prevGrossMargin: number;
  grossMarginDiff: number; // percentage point difference

  // KPI 7 & 8
  totalOrders: number;
  prevTotalOrders: number;
  ordersGrowth: number;
  avgOrderValue: number;
  prevAvgOrderValue: number;
  aovGrowth: number;

  totalQuantity: number;
  cancelledOrdersCount: number;
  cancelledRevenue: number;
}

export interface MonthlyTrendData {
  month: number;
  monthName: string;
  revenue2025: number;
  revenue2026: number;
  target2026: number;
  growth: number;
  profit2026: number;
  margin2026: number;
  margin2025: number;
  variance2026: number; // Actual 2026 - Target 2026
}

export interface RegionPerformance {
  regionId: string;
  regionName: string;
  manager: string;
  revenue: number;
  prevRevenue: number;
  target: number;
  achievement: number;
  growth: number;
  profit: number;
  margin: number;
  orders: number;
  repsCount: number;
  share: number; // percentage of total
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  target: number;
  profit: number;
  margin: number;
  quantity: number;
  share: number;
  growth: number;
}

export interface ChannelPerformance {
  channelId: string;
  channelName: string;
  revenue: number;
  orders: number;
  profit: number;
  margin: number;
  share: number;
  growth: number;
}

export interface SalesRepLeaderboardItem {
  rank: number;
  salesRepId: string;
  salesRepName: string;
  regionId: string;
  regionName: string;
  revenue: number;
  target: number;
  achievement: number;
  growth: number;
  grossProfit: number;
  grossMargin: number;
  orders: number;
  statusBadge: 'Excellent' | 'Good' | 'Warning' | 'Below Target';
}

export interface SalesInsightsData {
  executiveSummary?: string;
  positiveHighlights: string[];
  areasOfConcern: string[];
  recommendedActions: string[];
  isAiGenerated?: boolean;
}

export interface DatabaseState {
  transactions: Transaction[];
  targets: SalesTarget[];
  products: Product[];
  salesReps: SalesRep[];
  regions: Region[];
  channels: Channel[];
  settings: Settings;
  dataLogs: DataLog[];
}
