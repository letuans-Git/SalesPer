import * as XLSX from 'xlsx';
import { DatabaseState, Transaction, SalesTarget, Product, SalesRep, Region, Channel } from '../types/index';

export interface SpreadsheetInfo {
  spreadsheetId?: string;
  publishId?: string;
  isPublishedWeb: boolean;
  downloadUrl: string;
}

export function extractSpreadsheetInfo(rawUrl: string): SpreadsheetInfo {
  const url = rawUrl.trim();

  // 1. Google Sheets "Publish to the web" with /d/e/2PACX-...
  const pubMatch = url.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    const pubId = pubMatch[1];
    let downloadUrl = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=xlsx`;
    if (url.includes('/pubhtml')) {
      downloadUrl = url.replace(/\/pubhtml.*$/, '/pub?output=xlsx');
    } else if (url.includes('/pub?')) {
      downloadUrl = url.includes('output=xlsx') ? url : `${url}&output=xlsx`;
    }
    return {
      publishId: pubId,
      isPublishedWeb: true,
      downloadUrl,
    };
  }

  // 2. Standard Google Sheets URL: /spreadsheets/d/{ID}
  const stdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (stdMatch && stdMatch[1] && stdMatch[1] !== 'e') {
    const id = stdMatch[1];
    return {
      spreadsheetId: id,
      isPublishedWeb: false,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
    };
  }

  // 3. Google Drive view URL: /file/d/{ID}
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (driveMatch && driveMatch[1]) {
    const id = driveMatch[1];
    return {
      spreadsheetId: id,
      isPublishedWeb: false,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
    };
  }

  // 4. Raw Spreadsheet ID (25-60 chars)
  if (/^[a-zA-Z0-9-_]{25,60}$/.test(url)) {
    return {
      spreadsheetId: url,
      isPublishedWeb: false,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${url}/export?format=xlsx`,
    };
  }

  return {
    isPublishedWeb: false,
    downloadUrl: url,
  };
}

export function parseExcelDate(val: any): string {
  if (!val) return '2026-01-01';
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  // Handle Google Visualization Date string: Date(2026, 0, 15)
  const gvizDateMatch = s.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (gvizDateMatch) {
    const y = parseInt(gvizDateMatch[1], 10);
    const m = String(parseInt(gvizDateMatch[2], 10) + 1).padStart(2, '0');
    const d = String(parseInt(gvizDateMatch[3], 10)).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return s;
}

export function parseNumeric(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).trim();
  str = str.replace(/[^\d.,-]/g, '');
  if (!str) return 0;

  if (str.includes(',') && !str.includes('.')) {
    if ((str.match(/,/g) || []).length > 1) {
      str = str.replace(/,/g, '');
    } else {
      const parts = str.split(',');
      if (parts[1] && parts[1].length === 3) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(',', '.');
      }
    }
  } else if (str.includes('.') && str.includes(',')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes('.') && (str.match(/\./g) || []).length > 1) {
    str = str.replace(/\./g, '');
  }
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

export interface ParsedSheetResult {
  success: boolean;
  parsedData: {
    transactions?: Transaction[];
    targets?: SalesTarget[];
    products?: Product[];
    salesReps?: SalesRep[];
    regions?: Region[];
    channels?: Channel[];
    settings?: Record<string, any>;
  };
  rowCounts: {
    transactions: number;
    targets: number;
    products: number;
    salesReps: number;
    regions: number;
    channels: number;
    hasSettings: boolean;
  };
  sheetNames: string[];
  error?: string;
  sourceMode?: 'jsonp' | 'xlsx-buffer' | 'server-proxy' | 'csv-direct';
}

/**
 * Fetch a single sheet from Google Sheets using JSONP (Google Visualization API).
 * JSONP operates via dynamic <script> tags, which are NEVER blocked by CORS on any
 * mobile device (iOS Safari, Android Chrome, mobile webviews).
 */
export function fetchSheetViaJsonp(spreadsheetId: string, sheetName?: string): Promise<any[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve([]);
      return;
    }

    const callbackName = 'gviz_cb_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    let resolved = false;

    const cleanup = () => {
      resolved = true;
      try {
        delete (window as any)[callbackName];
      } catch {}
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timeout = setTimeout(() => {
      if (!resolved) {
        cleanup();
        resolve([]);
      }
    }, 9000);

    (window as any)[callbackName] = (data: any) => {
      clearTimeout(timeout);
      cleanup();

      if (!data || !data.table) {
        resolve([]);
        return;
      }

      try {
        const table = data.table;
        const cols = table.cols || [];
        const rows = table.rows || [];

        const colNames: string[] = cols.map((col: any, idx: number) => {
          return (col && col.label && col.label.trim()) || `col_${idx}`;
        });

        let startRowIdx = 0;
        const allColNamesEmpty = cols.every((c: any) => !c || !c.label || !c.label.trim());
        if (allColNamesEmpty && rows.length > 0) {
          const firstRow = rows[0];
          firstRow?.c?.forEach((cell: any, idx: number) => {
            if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '') {
              colNames[idx] = String(cell.v).trim();
            }
          });
          startRowIdx = 1;
        }

        const resultRows: any[] = [];
        for (let r = startRowIdx; r < rows.length; r++) {
          const rowObj: Record<string, any> = {};
          const rowData = rows[r];
          if (!rowData || !rowData.c) continue;
          let hasVal = false;

          rowData.c.forEach((cell: any, cIdx: number) => {
            const key = colNames[cIdx] || `col_${cIdx}`;
            let val = cell ? (cell.v !== undefined ? cell.v : cell.f) : '';
            if (val !== undefined && val !== null && val !== '') hasVal = true;
            rowObj[key] = val !== undefined && val !== null ? val : '';
          });

          if (hasVal) {
            resultRows.push(rowObj);
          }
        }
        resolve(resultRows);
      } catch (err) {
        resolve([]);
      }
    };

    const script = document.createElement('script');
    let src = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=responseHandler:${callbackName}`;
    if (sheetName) {
      src += `&sheet=${encodeURIComponent(sheetName)}`;
    }
    script.src = src;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve([]);
    };

    document.head.appendChild(script);
  });
}

/**
 * Maps raw JSON objects into application database tables
 */
export function buildDatabaseFromRawRows(data: {
  transactionsRows: any[];
  targetsRows: any[];
  productsRows: any[];
  salesRepsRows: any[];
  regionsRows: any[];
  channelsRows: any[];
  settingsRows: any[];
}): ParsedSheetResult {
  const {
    transactionsRows,
    targetsRows,
    productsRows,
    salesRepsRows,
    regionsRows,
    channelsRows,
    settingsRows,
  } = data;

  const transactions: Transaction[] = transactionsRows.map((row, idx) => {
    const qty = parseNumeric(row['Quantity'] ?? row['Số lượng']);
    const unitPrice = parseNumeric(row['Unit_Price'] ?? row['Đơn giá']);
    const explicitGross = parseNumeric(row['Gross_Revenue'] ?? row['Doanh thu trước giảm giá']);
    const grossRev = explicitGross > 0 ? explicitGross : qty * unitPrice;
    const discount = parseNumeric(row['Discount'] ?? row['Chiết khấu']);
    const explicitNet = parseNumeric(row['Net_Revenue'] ?? row['Doanh thu sau giảm giá'] ?? row['Doanh thu thuần']);
    const netRev = explicitNet > 0 ? explicitNet : grossRev - discount;
    const costAmount = parseNumeric(row['Cost_Amount'] ?? row['Giá vốn']);
    const explicitProfit = parseNumeric(row['Gross_Profit'] ?? row['Lợi nhuận gộp']);
    const grossProfit = explicitProfit !== 0 ? explicitProfit : netRev - costAmount;

    return {
      Transaction_ID: String(row['Transaction_ID'] || row['Mã giao dịch'] || `TXN_${idx + 1}`),
      Order_ID: String(row['Order_ID'] || row['Mã đơn hàng'] || `ORD-${idx + 1}`),
      Order_Date: parseExcelDate(row['Order_Date'] || row['Ngày bán'] || row['Ngày']),
      Customer_ID: String(row['Customer_ID'] || row['Mã khách hàng'] || `CUST_${(idx % 30) + 1}`),
      Customer_Name: String(row['Customer_Name'] || row['Tên khách hàng'] || 'Khách hàng Chinfon'),
      Region_ID: String(row['Region_ID'] || row['Khu vực'] || row['Mã khu vực'] || 'REG_MB'),
      Sales_Rep_ID: String(row['Sales_Rep_ID'] || row['Nhân viên'] || row['Mã nhân viên'] || 'REP_MB_01'),
      Product_ID: String(row['Product_ID'] || row['Sản phẩm'] || row['Mã sản phẩm'] || 'PRD_BAO_PCB40'),
      Channel_ID: String(row['Channel_ID'] || row['Kênh'] || row['Mã kênh'] || 'CHN_DIST'),
      Quantity: qty,
      Unit_Price: unitPrice,
      Gross_Revenue: grossRev,
      Discount: discount,
      Net_Revenue: netRev,
      Cost_Amount: costAmount,
      Gross_Profit: grossProfit,
      Order_Status: (String(row['Order_Status'] || row['Trạng thái đơn hàng'] || 'Completed') as any),
      Payment_Status: (String(row['Payment_Status'] || row['Trạng thái thanh toán'] || 'Paid') as any),
    };
  });

  const targets: SalesTarget[] = targetsRows.map((row, idx) => ({
    Target_ID: String(row['Target_ID'] || row['Mã chỉ tiêu'] || `TGT_${idx + 1}`),
    Year: parseInt(row['Year'] || row['Năm'] || 2026, 10),
    Month: parseInt(row['Month'] || row['Tháng'] || 1, 10),
    Region_ID: String(row['Region_ID'] || row['Khu vực'] || 'REG_MB'),
    Sales_Rep_ID: String(row['Sales_Rep_ID'] || row['Nhân viên'] || 'REP_MB_01'),
    Revenue_Target: parseNumeric(row['Revenue_Target'] ?? row['Chỉ tiêu doanh thu']),
    Profit_Target: parseNumeric(row['Profit_Target'] ?? row['Chỉ tiêu lợi nhuận']),
    Quantity_Target: parseNumeric(row['Quantity_Target'] ?? row['Chỉ tiêu số lượng']),
  }));

  const products: Product[] = productsRows.map((row, idx) => ({
    Product_ID: String(row['Product_ID'] || row['Mã sản phẩm'] || `PRD_${idx + 1}`),
    Product_Name: String(row['Product_Name'] || row['Tên sản phẩm'] || `Sản phẩm ${idx + 1}`),
    Category: String(row['Category'] || row['Nhóm sản phẩm'] || 'Xi măng bao'),
    Unit: String(row['Unit'] || row['Đơn vị tính'] || 'Tấn'),
    Standard_Price: parseNumeric(row['Standard_Price'] ?? row['Giá bán tham chiếu']),
    Standard_Cost: parseNumeric(row['Standard_Cost'] ?? row['Giá vốn tham chiếu']),
    Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
  }));

  const salesReps: SalesRep[] = salesRepsRows.map((row, idx) => ({
    Sales_Rep_ID: String(row['Sales_Rep_ID'] || row['Mã nhân viên'] || `REP_${idx + 1}`),
    Sales_Rep_Name: String(row['Sales_Rep_Name'] || row['Tên nhân viên'] || `Nhân viên ${idx + 1}`),
    Department: String(row['Department'] || row['Phòng ban'] || 'Kinh doanh'),
    Region_ID: String(row['Region_ID'] || row['Khu vực'] || 'REG_MB'),
    Join_Date: parseExcelDate(row['Join_Date'] || row['Ngày tham gia']),
    Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
  }));

  const regions: Region[] = regionsRows.map((row, idx) => ({
    Region_ID: String(row['Region_ID'] || row['Mã khu vực'] || `REG_${idx + 1}`),
    Region_Name: String(row['Region_Name'] || row['Tên khu vực'] || `Khu vực ${idx + 1}`),
    Region_Manager: String(row['Region_Manager'] || row['Quản lý khu vực'] || 'Quản lý vùng'),
    Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
  }));

  const channels: Channel[] = channelsRows.map((row, idx) => ({
    Channel_ID: String(row['Channel_ID'] || row['Mã kênh'] || `CHN_${idx + 1}`),
    Channel_Name: String(row['Channel_Name'] || row['Tên kênh'] || `Kênh ${idx + 1}`),
    Description: String(row['Description'] || row['Mô tả'] || ''),
    Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
  }));

  const settingsMap: Record<string, any> = {};
  settingsRows.forEach((row) => {
    const rowKeys = Object.keys(row);
    const kKey = rowKeys.find((k) =>
      /^(setting_key|key|khoa|khoá|tên thiết lập|mã cài đặt)$/i.test(k.trim())
    );
    const vKey = rowKeys.find((k) =>
      /^(setting_value|value|giá trị|gia tri|giatri)$/i.test(k.trim())
    );
    const k = kKey ? row[kKey] : row['Setting_Key'] || row['Key'];
    const v = vKey ? row[vKey] : row['Setting_Value'] || row['Value'];

    if (k && v !== undefined && String(v).trim() !== '') {
      const cleanK = String(k).trim();
      const cleanV = String(v).trim();
      settingsMap[cleanK] = cleanV;

      if (/^(dashboard_title|tiêu đề|tiêu đề dashboard|tieu de|tieu_de|title)$/i.test(cleanK)) {
        settingsMap['Dashboard_Title'] = cleanV;
      }
      if (/^(company_name|công ty|tên công ty|cong ty|company)$/i.test(cleanK)) {
        settingsMap['Company_Name'] = cleanV;
      }
      if (/^(demo_data_version|demo_version|version|phiên bản|phien ban|phien_ban)$/i.test(cleanK)) {
        settingsMap['Demo_Data_Version'] = cleanV;
      }
    }

    const dtCol = rowKeys.find((k) => /^(dashboard_title|tiêu đề|title)$/i.test(k.trim()));
    if (dtCol && row[dtCol]) settingsMap['Dashboard_Title'] = String(row[dtCol]).trim();

    const cnCol = rowKeys.find((k) => /^(company_name|công ty|company)$/i.test(k.trim()));
    if (cnCol && row[cnCol]) settingsMap['Company_Name'] = String(row[cnCol]).trim();

    const verCol = rowKeys.find((k) =>
      /^(demo_data_version|demo_version|version|phiên bản|phien ban)$/i.test(k.trim())
    );
    if (verCol && row[verCol]) settingsMap['Demo_Data_Version'] = String(row[verCol]).trim();
  });

  const parsedSettings = Object.keys(settingsMap).length > 0 ? settingsMap : undefined;

  return {
    success: true,
    rowCounts: {
      transactions: transactions.length,
      targets: targets.length,
      products: products.length,
      salesReps: salesReps.length,
      regions: regions.length,
      channels: channels.length,
      hasSettings: !!parsedSettings,
    },
    parsedData: {
      transactions: transactions.length > 0 ? transactions : undefined,
      targets: targets.length > 0 ? targets : undefined,
      products: products.length > 0 ? products : undefined,
      salesReps: salesReps.length > 0 ? salesReps : undefined,
      regions: regions.length > 0 ? regions : undefined,
      channels: channels.length > 0 ? channels : undefined,
      settings: parsedSettings,
    },
    sheetNames: [
      'SALES_TRANSACTIONS',
      'SALES_TARGETS',
      'PRODUCTS',
      'SALES_REPS',
      'REGIONS',
      'CHANNELS',
      'SETTINGS',
    ],
  };
}

/**
 * Parse an Excel/CSV file from an ArrayBuffer (client-side via xlsx library)
 */
export function parseSpreadsheetBuffer(buffer: ArrayBuffer): ParsedSheetResult {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  } catch (err: any) {
    return {
      success: false,
      error: `Không thể đọc cấu trúc file bảng tính: ${err.message || 'Lỗi định dạng'}`,
      parsedData: {},
      rowCounts: {
        transactions: 0,
        targets: 0,
        products: 0,
        salesReps: 0,
        regions: 0,
        channels: 0,
        hasSettings: false,
      },
      sheetNames: [],
    };
  }

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    return {
      success: false,
      error: 'File Google Sheets không chứa trang tính (sheet) nào',
      parsedData: {},
      rowCounts: {
        transactions: 0,
        targets: 0,
        products: 0,
        salesReps: 0,
        regions: 0,
        channels: 0,
        hasSettings: false,
      },
      sheetNames: [],
    };
  }

  const findSheet = (patterns: string[]) => {
    const match = wb.SheetNames.find((name) =>
      patterns.some((p) => name.trim().toUpperCase().includes(p.toUpperCase()))
    );
    return match ? wb.Sheets[match] : null;
  };

  const txnSheet =
    findSheet(['SALES_TRANSACTIONS', 'TRANSACTIONS', 'GIAO_DICH', 'DON_HANG']) ||
    wb.Sheets[wb.SheetNames[0]];
  const targetSheet = findSheet(['SALES_TARGETS', 'TARGETS', 'CHI_TIEU']);
  const prodSheet = findSheet(['PRODUCTS', 'PRODUCT', 'SAN_PHAM']);
  const repSheet = findSheet(['SALES_REPS', 'REPS', 'NHAN_VIEN']);
  const regSheet = findSheet(['REGIONS', 'REGION', 'KHU_VUC']);
  const chnSheet = findSheet(['CHANNELS', 'CHANNEL', 'KENH_BAN']);
  const setSheet = findSheet(['SETTINGS', 'SETTING', 'THIET_LAP', 'CAU_HINH']);

  const transactionsRows = txnSheet ? XLSX.utils.sheet_to_json<any>(txnSheet, { defval: '' }) : [];
  const targetsRows = targetSheet ? XLSX.utils.sheet_to_json<any>(targetSheet, { defval: '' }) : [];
  const productsRows = prodSheet ? XLSX.utils.sheet_to_json<any>(prodSheet, { defval: '' }) : [];
  const salesRepsRows = repSheet ? XLSX.utils.sheet_to_json<any>(repSheet, { defval: '' }) : [];
  const regionsRows = regSheet ? XLSX.utils.sheet_to_json<any>(regSheet, { defval: '' }) : [];
  const channelsRows = chnSheet ? XLSX.utils.sheet_to_json<any>(chnSheet, { defval: '' }) : [];
  const settingsRows = setSheet ? XLSX.utils.sheet_to_json<any>(setSheet, { defval: '' }) : [];

  const res = buildDatabaseFromRawRows({
    transactionsRows,
    targetsRows,
    productsRows,
    salesRepsRows,
    regionsRows,
    channelsRows,
    settingsRows,
  });

  res.sheetNames = wb.SheetNames;
  res.sourceMode = 'xlsx-buffer';
  return res;
}

/**
 * Pure Client-Side Google Sheets Fetcher & Parser
 * Automatically tries:
 * 1. Google Visualization JSONP (Zero-CORS, 100% reliable on iOS Safari, Android Chrome, and all mobile webviews)
 * 2. Direct published CSV export
 * 3. Fast fallback mirrors
 */
export async function fetchAndParseGoogleSheetsClientSide(targetUrl: string): Promise<ParsedSheetResult> {
  const info = extractSpreadsheetInfo(targetUrl);

  // Strategy 1: Google Visualization API via JSONP (Bypasses CORS completely on iOS & Android!)
  if (info.spreadsheetId) {
    try {
      const [
        transactionsRows,
        targetsRows,
        productsRows,
        salesRepsRows,
        regionsRows,
        channelsRows,
        settingsRows,
      ] = await Promise.all([
        fetchSheetViaJsonp(info.spreadsheetId, 'SALES_TRANSACTIONS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'SALES_TARGETS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'PRODUCTS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'SALES_REPS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'REGIONS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'CHANNELS'),
        fetchSheetViaJsonp(info.spreadsheetId, 'SETTINGS'),
      ]);

      let finalTxns = transactionsRows;
      // If SALES_TRANSACTIONS sheet name wasn't found, try the default first sheet
      if (!finalTxns || finalTxns.length === 0) {
        finalTxns = await fetchSheetViaJsonp(info.spreadsheetId);
      }

      if (finalTxns && finalTxns.length > 0) {
        const result = buildDatabaseFromRawRows({
          transactionsRows: finalTxns,
          targetsRows: targetsRows || [],
          productsRows: productsRows || [],
          salesRepsRows: salesRepsRows || [],
          regionsRows: regionsRows || [],
          channelsRows: channelsRows || [],
          settingsRows: settingsRows || [],
        });
        result.sourceMode = 'jsonp';
        return result;
      }
    } catch (jsonpErr) {
      console.warn('JSONP strategy encountered an error, falling back to buffer fetch:', jsonpErr);
    }
  }

  // Strategy 2: Direct Fetch (for published Google Sheets)
  const candidateUrls: string[] = [
    info.downloadUrl,
  ];

  if (info.publishId) {
    candidateUrls.push(`https://docs.google.com/spreadsheets/d/e/${info.publishId}/pub?output=csv`);
  }
  if (info.spreadsheetId) {
    candidateUrls.push(`https://docs.google.com/spreadsheets/d/${info.spreadsheetId}/gviz/tq?tqx=out:csv`);
  }

  // Public CORS gateways as fallback
  candidateUrls.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(info.downloadUrl)}`);

  let lastError = '';

  for (const candidate of candidateUrls) {
    try {
      const resp = await fetch(candidate, {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, */*',
        },
      });

      if (!resp.ok) {
        lastError = `HTTP ${resp.status}: ${resp.statusText}`;
        continue;
      }

      const buffer = await resp.arrayBuffer();
      if (!buffer || buffer.byteLength < 50) {
        lastError = 'Nội dung file rỗng';
        continue;
      }

      // Check for HTML error response
      const firstBytes = new Uint8Array(buffer.slice(0, 40));
      const strHead = String.fromCharCode(...firstBytes).toLowerCase();
      if (strHead.includes('<!doctype') || strHead.includes('<html')) {
        lastError = 'Nhận được trang HTML thay vì dữ liệu bảng tính';
        continue;
      }

      const parsed = parseSpreadsheetBuffer(buffer);
      if (parsed.success) {
        return parsed;
      } else {
        lastError = parsed.error || 'Lỗi đọc file';
      }
    } catch (err: any) {
      lastError = err?.message || 'Lỗi kết nối';
    }
  }

  return {
    success: false,
    error: `Không thể kết nối đến Google Sheets: ${lastError}. Hãy đảm bảo Google Sheet của bạn đã bật chia sẻ: "Bất kỳ ai có liên kết đều có thể xem" (Anyone with the link can view) hoặc "Xuất bản lên web" (Publish to web).`,
    parsedData: {},
    rowCounts: {
      transactions: 0,
      targets: 0,
      products: 0,
      salesReps: 0,
      regions: 0,
      channels: 0,
      hasSettings: false,
    },
    sheetNames: [],
  };
}
