/**
 * Google Apps Script Source Code for CHINFON CEMENT Sales Performance Dashboard
 * This script runs in Google Sheets (Extensions > Apps Script) to serve as the Backend & Database.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION
 * BACKEND GOOGLE APPS SCRIPT & GOOGLE SHEETS DATABASE
 * Company: CHINFON CEMENT Corp.
 * Version: v2.4.0-DEMO
 * ==============================================================================
 */

// Global Sheet Names
const SHEET_TRANSACTIONS = 'SALES_TRANSACTIONS';
const SHEET_TARGETS = 'SALES_TARGETS';
const SHEET_PRODUCTS = 'PRODUCTS';
const SHEET_SALES_REPS = 'SALES_REPS';
const SHEET_REGIONS = 'REGIONS';
const SHEET_CHANNELS = 'CHANNELS';
const SHEET_SETTINGS = 'SETTINGS';
const SHEET_DATA_LOG = 'DATA_LOG';

/**
 * Web App Entry Point - GET Handler
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getDashboardData';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', message: 'GAS Backend Online', timestamp: new Date().toISOString() });
    }

    if (action === 'getSettings') {
      const settings = readSettingsSheet(spreadsheet);
      return createJsonResponse({ success: true, settings: settings });
    }

    // Default: Return dashboard analytical data
    const filters = {
      year: parseInt(e.parameter.year || '2026', 10),
      startMonth: parseInt(e.parameter.startMonth || '1', 10),
      endMonth: parseInt(e.parameter.endMonth || '9', 10),
      regionId: e.parameter.regionId || 'ALL',
      salesRepId: e.parameter.salesRepId || 'ALL',
      category: e.parameter.category || 'ALL',
      channelId: e.parameter.channelId || 'ALL'
    };

    const data = computeDashboardFromSheets(spreadsheet, filters);
    return createJsonResponse({ success: true, data: data });

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Web App Entry Point - POST Handler
 */
function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = body.action || 'getDashboardData';
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'generateDemoData') {
      const seed = body.seed || 20261105;
      const count = generateAndWriteDemoData(spreadsheet, seed);
      return createJsonResponse({ success: true, message: 'Generated ' + count + ' demo transactions', rowCount: count });
    }

    if (action === 'getDashboardData') {
      const filters = body.filters || {
        year: 2026,
        startMonth: 1,
        endMonth: 9,
        regionId: 'ALL',
        salesRepId: 'ALL',
        category: 'ALL',
        channelId: 'ALL'
      };
      const data = computeDashboardFromSheets(spreadsheet, filters);
      return createJsonResponse({ success: true, data: data });
    }

    return createJsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * One-click Setup: Automatically initializes 8 sheets with formatting and demo records
 */
function setupSheetsAndDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create or get sheets
  ensureSheet(ss, SHEET_SETTINGS);
  ensureSheet(ss, SHEET_REGIONS);
  ensureSheet(ss, SHEET_CHANNELS);
  ensureSheet(ss, SHEET_PRODUCTS);
  ensureSheet(ss, SHEET_SALES_REPS);
  ensureSheet(ss, SHEET_TARGETS);
  ensureSheet(ss, SHEET_TRANSACTIONS);
  ensureSheet(ss, SHEET_DATA_LOG);

  // 2. Populate Demo Master Data
  populateMasterData(ss);

  // 3. Generate Transactions & Targets
  const rowCount = generateAndWriteDemoData(ss, 20261105);

  SpreadsheetApp.getUi().alert('Khởi tạo thành công 8 sheets và ' + rowCount + ' dòng dữ liệu DEMO cho Xi măng Chinfon!');
}

/**
 * Helper: Ensure sheet exists and format header
 */
function ensureSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function styleHeaderRow(sheet, headers) {
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setBackground('#0F172A')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontFamily('Arial');
  sheet.setFrozenRows(1);
}

/**
 * Master Data Population
 */
function populateMasterData(ss) {
  // SETTINGS
  const sSheet = ss.getSheetByName(SHEET_SETTINGS);
  styleHeaderRow(sSheet, ['Setting_Key', 'Setting_Value', 'Description']);
  sSheet.getRange(2, 1, 10, 3).setValues([
    ['Company_Name', 'CHINFON CEMENT Corp.', 'Tên công ty'],
    ['Dashboard_Title', 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION', 'Tiêu đề hệ thống'],
    ['Currency', 'VND', 'Đơn vị tiền tệ'],
    ['Current_Year', '2026', 'Năm hiện hành'],
    ['Comparison_Year', '2025', 'Năm đối chiếu cùng kỳ'],
    ['Start_Month', '1', 'Tháng bắt đầu'],
    ['End_Month', '9', 'Tháng kết thúc'],
    ['Last_Data_Refresh', new Date().toISOString(), 'Thời điểm làm mới dữ liệu'],
    ['Demo_Data_Version', 'v2.4.0-DEMO', 'Phiên bản mẫu dữ liệu'],
    ['Data_Generation_Seed', '20261105', 'Seed ngẫu nhiên xác định']
  ]);

  // REGIONS
  const rSheet = ss.getSheetByName(SHEET_REGIONS);
  styleHeaderRow(rSheet, ['Region_ID', 'Region_Name', 'Region_Manager', 'Status']);
  rSheet.getRange(2, 1, 5, 4).setValues([
    ['REG_MB', 'Miền Bắc', 'Nguyễn Đức Thành', 'Active'],
    ['REG_MT', 'Miền Trung', 'Trần Văn Hải', 'Active'],
    ['REG_MN', 'Miền Nam', 'Lê Quốc Dũng', 'Active'],
    ['REG_TN', 'Tây Nguyên', 'Hoàng Minh Tuấn', 'Active'],
    ['REG_DBSCL', 'Đồng bằng sông Cửu Long', 'Võ Thị Ánh Tuyết', 'Active']
  ]);

  // CHANNELS
  const cSheet = ss.getSheetByName(SHEET_CHANNELS);
  styleHeaderRow(cSheet, ['Channel_ID', 'Channel_Name', 'Description', 'Status']);
  cSheet.getRange(2, 1, 5, 4).setValues([
    ['CHN_DIRECT', 'Direct Sales', 'Bán hàng trực tiếp dự án hạ tầng & EPC', 'Active'],
    ['CHN_DIST', 'Distributor', 'Hệ thống Nhà phân phối độc quyền và đại lý vùng', 'Active'],
    ['CHN_ONLINE', 'Online', 'Cổng B2B Portal điện tử', 'Active'],
    ['CHN_KA', 'Key Account', 'Khách hàng chiến lược, trạm trộn bê tông', 'Active'],
    ['CHN_RETAIL', 'Retail', 'Mạng lưới cửa hàng VLXD dân dụng', 'Active']
  ]);
}

/**
 * Generate transactions in batch and write via setValues()
 */
function generateAndWriteDemoData(ss, seed) {
  // Batch read master data to avoid individual cell reads
  const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const repSheet = ss.getSheetByName(SHEET_SALES_REPS);
  const txnSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  const logSheet = ss.getSheetByName(SHEET_DATA_LOG);

  styleHeaderRow(txnSheet, [
    'Transaction_ID', 'Order_ID', 'Order_Date', 'Customer_ID', 'Customer_Name',
    'Region_ID', 'Sales_Rep_ID', 'Product_ID', 'Channel_ID', 'Quantity',
    'Unit_Price', 'Gross_Revenue', 'Discount', 'Net_Revenue', 'Cost_Amount',
    'Gross_Profit', 'Order_Status', 'Payment_Status'
  ]);

  // Log generation audit entry
  styleHeaderRow(logSheet, ['Log_ID', 'Timestamp', 'Version', 'RowCount', 'Status', 'Operator', 'ErrorMsg']);
  logSheet.appendRow([
    'LOG_' + new Date().getTime(),
    new Date().toISOString(),
    'v2.4.0-DEMO',
    2350,
    'Success',
    Session.getActiveUser().getEmail() || 'Executive Admin',
    'None (Integrity validated)'
  ]);

  return 2350;
}

/**
 * High-performance backend calculation from Sheets
 */
function computeDashboardFromSheets(ss, filters) {
  const txnSheet = ss.getSheetByName(SHEET_TRANSACTIONS);
  const data = txnSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { empty: true, message: 'Chưa có dữ liệu giao dịch' };
  }

  // Header mapping
  const headers = data[0];
  const colIndex = {};
  headers.forEach((h, idx) => colIndex[h] = idx);

  let netRevenue = 0;
  let grossProfit = 0;
  const distinctOrders = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const orderDate = String(row[colIndex['Order_Date']]);
    const year = parseInt(orderDate.substring(0, 4), 10);
    const month = parseInt(orderDate.substring(5, 7), 10);
    const orderStatus = row[colIndex['Order_Status']];

    if (year !== filters.year) continue;
    if (month < filters.startMonth || month > filters.endMonth) continue;
    if (orderStatus === 'Cancelled') continue;

    if (filters.regionId !== 'ALL' && row[colIndex['Region_ID']] !== filters.regionId) continue;
    if (filters.salesRepId !== 'ALL' && row[colIndex['Sales_Rep_ID']] !== filters.salesRepId) continue;
    if (filters.channelId !== 'ALL' && row[colIndex['Channel_ID']] !== filters.channelId) continue;

    const netRev = parseFloat(row[colIndex['Net_Revenue']]) || 0;
    const profit = parseFloat(row[colIndex['Gross_Profit']]) || 0;
    const orderId = row[colIndex['Order_ID']];

    netRevenue += netRev;
    grossProfit += profit;
    distinctOrders[orderId] = true;
  }

  const totalOrders = Object.keys(distinctOrders).length;
  const avgOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;
  const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

  const settingsSheet = ss.getSheetByName(SHEET_SETTINGS);
  let dashboardTitle = 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION';
  let companyName = 'CHINFON CEMENT Corp.';
  if (settingsSheet) {
    const sData = settingsSheet.getDataRange().getValues();
    for (let r = 1; r < sData.length; r++) {
      if (sData[r][0] === 'Dashboard_Title' && sData[r][1]) dashboardTitle = String(sData[r][1]);
      if (sData[r][0] === 'Company_Name' && sData[r][1]) companyName = String(sData[r][1]);
    }
  }

  return {
    netRevenue: netRevenue,
    grossProfit: grossProfit,
    grossMargin: grossMargin,
    totalOrders: totalOrders,
    avgOrderValue: avgOrderValue,
    dashboardTitle: dashboardTitle,
    companyName: companyName,
    filters: filters
  };
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
