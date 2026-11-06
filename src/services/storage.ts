import * as XLSX from 'xlsx';
import { DatabaseState, Settings } from '../types';
import { generateFullDemoDatabase } from '../data/generator';

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
  return localStorage.getItem(PUBLISHED_URL_KEY) || '';
}

export function savePublishedSheetUrl(url: string): void {
  localStorage.setItem(PUBLISHED_URL_KEY, url.trim());
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
  try {
    const res = await fetch('/api/sheets/fetch-published', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Lỗi khi đồng bộ dữ liệu từ Google Sheets xuất bản',
      };
    }

    const { parsedData, rowCounts } = data;
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
        Demo_Data_Version: 'v2.4.0-LIVE (Google Sheets Web)',
      },
      dataLogs: [
        {
          Log_ID: `LOG_${Date.now()}`,
          Timestamp: nowStr,
          Version: 'Google Sheets Web Live',
          RowCount: parsedData.transactions ? parsedData.transactions.length : currentDb.transactions.length,
          Status: 'Success',
          Operator: 'Auto-Sync / Google Sheets Published Web',
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
      message: data.message || 'Đồng bộ dữ liệu thành công',
      rowCounts,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Không thể kết nối máy chủ đồng bộ: ${err.message || 'Lỗi mạng'}`,
    };
  }
}

export function loadDatabase(): DatabaseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.transactions && parsed.transactions.length > 500) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached database, generating fresh demo data:', e);
  }

  // Generate fresh seed database
  const freshDb = generateFullDemoDatabase(20261105);
  saveDatabase(freshDb);
  return freshDb;
}

export function saveDatabase(db: DatabaseState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save database to localStorage:', e);
  }
}

export function regenerateDemoData(seed: number = Date.now()): DatabaseState {
  const newDb = generateFullDemoDatabase(seed);
  saveDatabase(newDb);
  return newDb;
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
