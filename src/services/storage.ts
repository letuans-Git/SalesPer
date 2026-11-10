import * as XLSX from 'xlsx';
import { DatabaseState, Settings } from '../types';
import { fetchAndParseGoogleSheetsClientSide } from './clientSheetParser';

const STORAGE_KEY = 'CHINFON_BI_DATABASE_STATE_V2';
const GAS_URL_KEY = 'CHINFON_GAS_WEBAPP_URL';
const PUBLISHED_URL_KEY = 'CHINFON_PUBLISHED_SHEET_URL';
const AUTO_SYNC_KEY = 'CHINFON_AUTO_SYNC_INTERVAL';
const LAST_SYNC_KEY = 'CHINFON_LAST_SYNC_TIMESTAMP';

export function getGasWebAppUrl(): string {
  return localStorage.getItem(GAS_URL_KEY) || '';
}

export function saveGasWebAppUrl(url: string): void {
  localStorage.setItem(GAS_URL_KEY, url.trim());
}

export function getPublishedSheetUrl(): string {
  if (typeof window !== 'undefined') {
    // 1. Check URL query params for easy mobile sharing (?sheet=... or ?url=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('sheet') || params.get('url') || params.get('sheetUrl');
      if (urlParam && urlParam.trim()) {
        const clean = decodeURIComponent(urlParam.trim());
        localStorage.setItem(PUBLISHED_URL_KEY, clean);
        return clean;
      }
    } catch {}

    // 2. Check localStorage
    const stored = localStorage.getItem(PUBLISHED_URL_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return '';
}

export function savePublishedSheetUrl(url: string): void {
  localStorage.setItem(PUBLISHED_URL_KEY, url.trim());
  // Also persist to server in background so other devices and page reloads get it
  fetch('/api/sheets/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publishedUrl: url.trim() }),
  }).catch(() => {});
}

export async function fetchServerSheetConfig(): Promise<{ publishedUrl?: string; autoSyncInterval?: number }> {
  try {
    const res = await fetch('/api/sheets/config');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Failed to fetch server sheet config', e);
  }
  return {};
}

export function getAutoSyncInterval(): number {
  const val = localStorage.getItem(AUTO_SYNC_KEY);
  return val ? parseInt(val, 10) : 0; // 0 = off, 300 = 5m
}

export function saveAutoSyncInterval(seconds: number): void {
  localStorage.setItem(AUTO_SYNC_KEY, String(seconds));
}

export function getLastSyncTimestamp(): string {
  return localStorage.getItem(LAST_SYNC_KEY) || '';
}

export function saveLastSyncTimestamp(ts: string): void {
  localStorage.setItem(LAST_SYNC_KEY, ts);
}

/**
 * Fetch and sync live data from a Google Sheet published to the web
 */
export async function syncPublishedGoogleSheet(
  url: string,
  currentDb: DatabaseState
): Promise<{ success: boolean; newDb?: DatabaseState; message?: string; error?: string; rowCounts?: any }> {
  let parsedData: any = null;
  let rowCounts: any = null;
  let successMessage = '';
  let serverFetchError = '';

  // Step 1: Try server-side endpoint first via GET (zero preflight, optimal for mobile)
  try {
    const getEndpoint = `/api/sheets/fetch-published?url=${encodeURIComponent(url.trim())}`;
    const res = await fetch(getEndpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && data.success && data.parsedData) {
        parsedData = data.parsedData;
        rowCounts = data.rowCounts;
        successMessage = data.message || 'Đồng bộ từ máy chủ thành công';
      } else if (data && data.error) {
        serverFetchError = data.error;
      }
    } else {
      serverFetchError = `Máy chủ phản hồi HTTP ${res.status}`;
    }
  } catch (err: any) {
    serverFetchError = err?.message || 'Không thể kết nối máy chủ';
  }

  // Step 2: If server-side is unavailable (e.g. Vercel static deployment, GitHub Pages),
  // automatically fall back to pure client-side direct Google Sheets parsing!
  if (!parsedData) {
    try {
      const clientResult = await fetchAndParseGoogleSheetsClientSide(url);
      if (clientResult.success && clientResult.parsedData) {
        parsedData = clientResult.parsedData;
        rowCounts = clientResult.rowCounts;
        successMessage = `Đồng bộ thành công ${rowCounts.transactions.toLocaleString()} dòng giao dịch trực tiếp từ Google Sheets (Chế độ Client/Vercel)`;
      } else {
        return {
          success: false,
          error:
            clientResult.error ||
            serverFetchError ||
            'Không thể tải dữ liệu từ liên kết Google Sheets. Vui lòng kiểm tra lại liên kết xuất bản web (Tệp > Chia sẻ > Xuất bản lên web).',
        };
      }
    } catch (clientErr: any) {
      return {
        success: false,
        error: `Lỗi đọc Google Sheets: ${clientErr?.message || 'Không thể tải file'}`,
      };
    }
  }

  const nowStr = new Date().toISOString();

  const updatedDb: DatabaseState = {
    transactions: parsedData.transactions || currentDb.transactions,
    targets: parsedData.targets || currentDb.targets,
    products: parsedData.products || currentDb.products,
    salesReps: parsedData.salesReps || currentDb.salesReps,
    regions: parsedData.regions || currentDb.regions,
    channels: parsedData.channels || currentDb.channels,
    settings: {
      ...currentDb.settings,
      ...(parsedData.settings || {}),
      Dashboard_Title: parsedData.settings?.Dashboard_Title || currentDb.settings.Dashboard_Title,
      Company_Name: parsedData.settings?.Company_Name || currentDb.settings.Company_Name,
      Last_Data_Refresh: nowStr,
      Demo_Data_Version:
        parsedData.settings?.Demo_Data_Version ||
        parsedData.settings?.['demo_data_version'] ||
        parsedData.settings?.['Demo_Data_Version'] ||
        currentDb.settings.Demo_Data_Version,
    },
    dataLogs: [
      {
        Log_ID: `LOG_${Date.now()}`,
        Timestamp: nowStr,
        Version: 'Google Sheets Live',
        RowCount: parsedData.transactions ? parsedData.transactions.length : currentDb.transactions.length,
        Status: 'Success',
        Operator: 'Auto-Sync / Google Sheets',
        ErrorMsg: `Đồng bộ thành công từ ${url.slice(0, 45)}...`,
      },
      ...currentDb.dataLogs.slice(0, 15),
    ],
  };

  saveDatabase(updatedDb);
  saveLastSyncTimestamp(nowStr);

  return {
    success: true,
    newDb: updatedDb,
    message: successMessage,
    rowCounts,
  };
}

export function createEmptyDatabase(): DatabaseState {
  return {
    transactions: [],
    targets: [],
    products: [],
    salesReps: [],
    regions: [],
    channels: [],
    settings: {
      Company_Name: 'CHINFON CEMENT Corp.',
      Dashboard_Title: 'SALES PERFORMANCE DASHBOARD – EXECUTIVE EDITION',
      Currency: 'VND',
      Current_Year: 2026,
      Comparison_Year: 2025,
      Start_Month: 1,
      End_Month: 9,
      Last_Data_Refresh: new Date().toISOString(),
      Demo_Data_Version: '100% Google Sheets',
      Data_Generation_Seed: 0,
    },
    dataLogs: [],
  };
}

export function loadDatabase(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions) && parsed.transactions.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached database:', e);
  }

  // Clean initial state until Google Sheets is synchronized
  return createEmptyDatabase();
}

export function saveDatabase(db: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database to localStorage:', e);
  }
}

export function regenerateDemoData(): DatabaseState {
  return loadDatabase();
}

/**
 * Export full 8-sheet database to an actual multi-tab Excel (.xlsx) file
 */
export function exportDatabaseToExcel(db: DatabaseState, filename: string = 'CHINFON_Sales_Performance_Database.xlsx'): void {
  const wb = XLSX.utils.book_new();

  // 1. SALES_TRANSACTIONS
  const wsTxns = XLSX.utils.json_to_sheet(db.transactions);
  XLSX.utils.book_append_sheet(wb, wsTxns, 'SALES_TRANSACTIONS');

  // 2. SALES_TARGETS
  const wsTargets = XLSX.utils.json_to_sheet(db.targets);
  XLSX.utils.book_append_sheet(wb, wsTargets, 'SALES_TARGETS');

  // 3. PRODUCTS
  const wsProducts = XLSX.utils.json_to_sheet(db.products);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'PRODUCTS');

  // 4. SALES_REPS
  const wsReps = XLSX.utils.json_to_sheet(db.salesReps);
  XLSX.utils.book_append_sheet(wb, wsReps, 'SALES_REPS');

  // 5. REGIONS
  const wsRegions = XLSX.utils.json_to_sheet(db.regions);
  XLSX.utils.book_append_sheet(wb, wsRegions, 'REGIONS');

  // 6. CHANNELS
  const wsChannels = XLSX.utils.json_to_sheet(db.channels);
  XLSX.utils.book_append_sheet(wb, wsChannels, 'CHANNELS');

  // 7. SETTINGS
  const settingsRows = Object.entries(db.settings).map(([key, value]) => ({
    Setting_Key: key,
    Setting_Value: String(value),
  }));
  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'SETTINGS');

  // 8. DATA_LOG
  const wsLogs = XLSX.utils.json_to_sheet(db.dataLogs);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'DATA_LOG');

  // Write and trigger browser download
  XLSX.writeFile(wb, filename);
}

/**
 * Export current filtered transactions table to CSV
 */
export function exportFilteredToCsv(rows: any[], filename: string = 'transactions_export.csv'): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
