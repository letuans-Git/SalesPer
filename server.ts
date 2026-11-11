import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.resolve(__dirname, 'sheet-config.json');
const PUBLIC_CONFIG_FILE = path.resolve(__dirname, 'public', 'sheet-config.json');

interface StoredSheetConfig {
  publishedUrl: string;
  autoSyncInterval: number;
  lastSync: string;
}

function getStoredSheetConfig(): StoredSheetConfig {
  // Check files
  for (const filePath of [CONFIG_FILE, PUBLIC_CONFIG_FILE]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.publishedUrl === 'string' && parsed.publishedUrl.trim()) {
          return {
            publishedUrl: parsed.publishedUrl.trim(),
            autoSyncInterval: parsed.autoSyncInterval || 0,
            lastSync: parsed.lastSync || '',
          };
        }
      }
    } catch (e) {
      console.warn(`Could not read ${filePath}:`, e);
    }
  }

  // Fallback to process.env if configured
  const envUrl = process.env.VITE_GOOGLE_SHEETS_URL || process.env.GOOGLE_SHEETS_URL || '';
  return { publishedUrl: envUrl.trim(), autoSyncInterval: 0, lastSync: '' };
}

function saveStoredSheetConfig(cfg: Partial<StoredSheetConfig>): StoredSheetConfig {
  try {
    const current = getStoredSheetConfig();
    const updated = { ...current, ...cfg };
    const content = JSON.stringify(updated, null, 2);
    fs.writeFileSync(CONFIG_FILE, content, 'utf-8');
    try {
      fs.writeFileSync(PUBLIC_CONFIG_FILE, content, 'utf-8');
    } catch {}
    return updated;
  } catch (e) {
    console.error('Could not save sheet-config.json:', e);
    return getStoredSheetConfig();
  }
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// Config endpoints for Google Sheets synchronization
app.get('/api/sheets/config', (_req, res) => {
  return res.json(getStoredSheetConfig());
});

app.post('/api/sheets/config', (req, res) => {
  const { publishedUrl, autoSyncInterval } = req.body;
  const updated = saveStoredSheetConfig({
    ...(typeof publishedUrl === 'string' ? { publishedUrl: publishedUrl.trim() } : {}),
    ...(typeof autoSyncInterval === 'number' ? { autoSyncInterval } : {}),
  });
  return res.json({ success: true, config: updated });
});

// Initialize Google GenAI client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Gemini AI Executive Insights Endpoint
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { kpis, regionalSummary, topPerformers, periodText } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        message: 'GEMINI_API_KEY is not configured. Statistical algorithmic insights used.',
      });
    }

    const prompt = `Bạn là Chuyên gia Tư vấn Quản trị Hiệu suất Bán hàng Cấp cao (Sales Performance Management Consultant) cho Ban Giám đốc Công ty Xi măng Chinfon (CHINFON CEMENT Corp.).
Hãy phân tích dữ liệu hiệu suất kinh doanh dưới đây và viết một bản Báo cáo Điều hành ngắn gọn, sắc bén (Executive Briefing Memo) bằng tiếng Việt dành riêng cho Hội đồng Quản trị và Tổng Giám đốc.

Dữ liệu tổng hợp kỳ ${periodText || '2026'}:
- Doanh thu thuần: ${(kpis?.netRevenue / 1e9 || 0).toFixed(2)} tỷ VNĐ (Chỉ tiêu: ${(kpis?.revenueTarget / 1e9 || 0).toFixed(2)} tỷ VNĐ, Đạt: ${(kpis?.achievementRate || 0).toFixed(1)}%)
- Tăng trưởng YoY so với cùng kỳ 2025: ${(kpis?.revenueGrowth || 0).toFixed(1)}% (Doanh thu cùng kỳ: ${(kpis?.prevNetRevenue / 1e9 || 0).toFixed(2)} tỷ VNĐ)
- Lợi nhuận gộp: ${(kpis?.grossProfit / 1e9 || 0).toFixed(2)} tỷ VNĐ (Biên lợi nhuận gộp: ${(kpis?.grossMargin || 0).toFixed(1)}%)
- Tổng số đơn hàng: ${(kpis?.totalOrders || 0).toLocaleString()} đơn. Giá trị trung bình/đơn (AOV): ${(kpis?.avgOrderValue / 1e6 || 0).toFixed(1)} triệu VNĐ.
- Tóm tắt Khu vực: ${JSON.stringify(regionalSummary || [])}
- Top nhân viên xuất sắc: ${JSON.stringify(topPerformers || [])}

Yêu cầu xuất ra cấu trúc JSON chuẩn:
{
  "executiveSummary": "1 đoạn văn nhận định tổng quan về tình hình kinh doanh, tốc độ tăng trưởng và mức độ bám sát chỉ tiêu năm.",
  "positiveHighlights": ["Điểm sáng 1", "Điểm sáng 2", "Điểm sáng 3"],
  "areasOfConcern": ["Vấn đề/rủi ro 1", "Vấn đề/rủi ro 2", "Vấn đề/rủi ro 3"],
  "strategicRecommendations": ["Hành động khuyến nghị 1", "Hành động khuyến nghị 2", "Hành động khuyến nghị 3"]
}

Tuyệt đối KHÔNG tự bịa số liệu. Mọi con số phân tích phải nhất quán 100% với dữ liệu cung cấp. Chỉ trả về JSON hợp lệ.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    return res.json({
      success: true,
      insights: parsed,
    });
  } catch (error: any) {
    console.error('Error generating AI insights:', error);
    return res.status(200).json({
      fallback: true,
      error: error?.message || 'Error communicating with Gemini API',
    });
  }
});

import * as XLSX from 'xlsx';

// Helper: Normalize Google Sheets published link or standard link to downloadable Excel/CSV
function normalizeGoogleSheetsUrl(rawUrl: string): { url: string; isLikelyCsv: boolean } {
  let url = rawUrl.trim();

  // 1. Google Sheets "Publish to the web" URL with /pubhtml
  if (url.includes('/pubhtml')) {
    return { url: url.replace(/\/pubhtml.*$/, '/pub?output=xlsx'), isLikelyCsv: false };
  }

  // 2. Google Sheets "Publish to the web" URL with /pub
  if (url.includes('/pub?') || url.endsWith('/pub')) {
    if (url.includes('output=csv')) {
      // If user specifically published a single sheet as CSV
      return { url, isLikelyCsv: true };
    }
    if (!url.includes('output=xlsx')) {
      const sep = url.includes('?') ? '&' : '?';
      return { url: `${url}${sep}output=xlsx`, isLikelyCsv: false };
    }
    return { url, isLikelyCsv: false };
  }

  // 3. Standard Google Sheets URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...
  const matchId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matchId && matchId[1]) {
    const id = matchId[1];
    return {
      url: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
      isLikelyCsv: false,
    };
  }

  return { url, isLikelyCsv: false };
}

function parseExcelDate(val: any): string {
  if (!val) return '2026-01-01';
  if (typeof val === 'number') {
    // Excel serial date to YYYY-MM-DD
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return s;
}

function parseNumeric(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  let str = String(val).trim();
  // Remove currency units and symbols like VNĐ, đ, $, etc.
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

// Endpoint: Fetch and parse Google Sheets Published to the Web (Supports both GET and POST)
app.all('/api/sheets/fetch-published', async (req, res) => {
  try {
    const queryUrl = typeof req.query?.url === 'string' ? req.query.url.trim() : '';
    const bodyUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
    const requestedUrl = queryUrl || bodyUrl;
    const targetUrl = requestedUrl || getStoredSheetConfig().publishedUrl;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đường dẫn Google Sheets đã xuất bản lên web' });
    }

    const { url: downloadUrl, isLikelyCsv } = normalizeGoogleSheetsUrl(targetUrl);

    const fetchResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, */*',
      },
      redirect: 'follow',
    });

    if (!fetchResponse.ok) {
      return res.status(400).json({
        error: `Không thể tải dữ liệu từ Google Sheets (Mã lỗi HTTP ${fetchResponse.status}: ${fetchResponse.statusText}). Vui lòng đảm bảo bạn đã chọn "Tệp > Chia sẻ > Xuất bản lên web" và chọn "Toàn bộ tài liệu" định dạng "Microsoft Excel (.xlsx)".`,
      });
    }

    const arrayBuf = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(buffer, { type: 'buffer' });
    } catch (parseErr: any) {
      return res.status(400).json({
        error: 'Không thể phân tích định dạng bảng tính. Hãy đảm bảo bạn đã chọn xuất bản định dạng Microsoft Excel (.xlsx) hoặc CSV.',
      });
    }

    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return res.status(400).json({ error: 'File Google Sheets xuất bản không chứa trang tính (sheet) nào' });
    }

    // Helper: Find sheet by name patterns
    const findSheet = (patterns: string[]) => {
      const match = wb.SheetNames.find((name) =>
        patterns.some((p) => name.trim().toUpperCase().includes(p.toUpperCase()))
      );
      return match ? wb.Sheets[match] : null;
    };

    // 1. Transactions Sheet
    const txnSheet = findSheet(['SALES_TRANSACTIONS', 'TRANSACTIONS', 'GIAO_DICH', 'DON_HANG']) || wb.Sheets[wb.SheetNames[0]];
    const rawTxns = txnSheet ? XLSX.utils.sheet_to_json<any>(txnSheet, { defval: '' }) : [];

    const transactions = rawTxns.map((row, idx) => {
      const qty = parseNumeric(row['Quantity'] ?? row['Số lượng']);
      const unitPrice = parseNumeric(row['Unit_Price'] ?? row['Đơn giá']);
      const explicitGross = parseNumeric(row['Gross_Revenue'] ?? row['Doanh thu trước giảm giá']);
      const grossRev = explicitGross > 0 ? explicitGross : (qty * unitPrice);
      const discount = parseNumeric(row['Discount'] ?? row['Chiết khấu']);
      const explicitNet = parseNumeric(row['Net_Revenue'] ?? row['Doanh thu sau giảm giá'] ?? row['Doanh thu thuần']);
      const netRev = explicitNet > 0 ? explicitNet : (grossRev - discount);
      const costAmount = parseNumeric(row['Cost_Amount'] ?? row['Giá vốn']);
      const explicitProfit = parseNumeric(row['Gross_Profit'] ?? row['Lợi nhuận gộp']);
      const grossProfit = explicitProfit !== 0 ? explicitProfit : (netRev - costAmount);

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

    // 2. Targets Sheet
    const targetSheet = findSheet(['SALES_TARGETS', 'TARGETS', 'CHI_TIEU']);
    const rawTargets = targetSheet ? XLSX.utils.sheet_to_json<any>(targetSheet, { defval: '' }) : [];
    const targets = rawTargets.map((row, idx) => ({
      Target_ID: String(row['Target_ID'] || row['Mã chỉ tiêu'] || `TGT_${idx + 1}`),
      Year: parseInt(row['Year'] || row['Năm'] || 2026, 10),
      Month: parseInt(row['Month'] || row['Tháng'] || 1, 10),
      Region_ID: String(row['Region_ID'] || row['Khu vực'] || 'REG_MB'),
      Sales_Rep_ID: String(row['Sales_Rep_ID'] || row['Nhân viên'] || 'REP_MB_01'),
      Revenue_Target: parseNumeric(row['Revenue_Target'] ?? row['Chỉ tiêu doanh thu']),
      Profit_Target: parseNumeric(row['Profit_Target'] ?? row['Chỉ tiêu lợi nhuận']),
      Quantity_Target: parseNumeric(row['Quantity_Target'] ?? row['Chỉ tiêu số lượng']),
    }));

    // 3. Products Sheet
    const prodSheet = findSheet(['PRODUCTS', 'PRODUCT', 'SAN_PHAM']);
    const rawProducts = prodSheet ? XLSX.utils.sheet_to_json<any>(prodSheet, { defval: '' }) : [];
    const products = rawProducts.map((row, idx) => ({
      Product_ID: String(row['Product_ID'] || row['Mã sản phẩm'] || `PRD_${idx + 1}`),
      Product_Name: String(row['Product_Name'] || row['Tên sản phẩm'] || `Sản phẩm ${idx + 1}`),
      Category: String(row['Category'] || row['Nhóm sản phẩm'] || 'Xi măng bao'),
      Unit: String(row['Unit'] || row['Đơn vị tính'] || 'Tấn'),
      Standard_Price: parseNumeric(row['Standard_Price'] ?? row['Giá bán tham chiếu']),
      Standard_Cost: parseNumeric(row['Standard_Cost'] ?? row['Giá vốn tham chiếu']),
      Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
    }));

    // 4. Sales Reps Sheet
    const repSheet = findSheet(['SALES_REPS', 'REPS', 'NHAN_VIEN']);
    const rawReps = repSheet ? XLSX.utils.sheet_to_json<any>(repSheet, { defval: '' }) : [];
    const salesReps = rawReps.map((row, idx) => ({
      Sales_Rep_ID: String(row['Sales_Rep_ID'] || row['Mã nhân viên'] || `REP_${idx + 1}`),
      Sales_Rep_Name: String(row['Sales_Rep_Name'] || row['Tên nhân viên'] || `Nhân viên ${idx + 1}`),
      Department: String(row['Department'] || row['Phòng ban'] || 'Kinh doanh'),
      Region_ID: String(row['Region_ID'] || row['Khu vực'] || 'REG_MB'),
      Join_Date: parseExcelDate(row['Join_Date'] || row['Ngày tham gia']),
      Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
    }));

    // 5. Regions Sheet
    const regSheet = findSheet(['REGIONS', 'REGION', 'KHU_VUC']);
    const rawRegions = regSheet ? XLSX.utils.sheet_to_json<any>(regSheet, { defval: '' }) : [];
    const regions = rawRegions.map((row, idx) => ({
      Region_ID: String(row['Region_ID'] || row['Mã khu vực'] || `REG_${idx + 1}`),
      Region_Name: String(row['Region_Name'] || row['Tên khu vực'] || `Khu vực ${idx + 1}`),
      Region_Manager: String(row['Region_Manager'] || row['Quản lý khu vực'] || 'Quản lý vùng'),
      Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
    }));

    // 6. Channels Sheet
    const chnSheet = findSheet(['CHANNELS', 'CHANNEL', 'KENH_BAN']);
    const rawChannels = chnSheet ? XLSX.utils.sheet_to_json<any>(chnSheet, { defval: '' }) : [];
    const channels = rawChannels.map((row, idx) => ({
      Channel_ID: String(row['Channel_ID'] || row['Mã kênh'] || `CHN_${idx + 1}`),
      Channel_Name: String(row['Channel_Name'] || row['Tên kênh'] || `Kênh ${idx + 1}`),
      Description: String(row['Description'] || row['Mô tả'] || ''),
      Status: (String(row['Status'] || row['Trạng thái'] || 'Active') as any),
    }));

    // 7. Settings Sheet (Dashboard_Title, Company_Name, etc.)
    const setSheet = findSheet(['SETTINGS', 'SETTING', 'THIET_LAP', 'CAU_HINH']);
    let parsedSettings: Record<string, any> | undefined = undefined;
    if (setSheet) {
      const rawSettings = XLSX.utils.sheet_to_json<any>(setSheet, { defval: '' });
      const settingsMap: Record<string, any> = {};
      rawSettings.forEach((row) => {
        // Support Key-Value format
        const rowKeys = Object.keys(row);
        const kKey = rowKeys.find(k => /^(setting_key|key|khoa|khoá|tên thiết lập|mã cài đặt)$/i.test(k.trim()));
        const vKey = rowKeys.find(k => /^(setting_value|value|giá trị|gia tri|giatri)$/i.test(k.trim()));
        const k = kKey ? row[kKey] : (row['Setting_Key'] || row['Key']);
        const v = vKey ? row[vKey] : (row['Setting_Value'] || row['Value']);

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

        // Support column-based format
        const dtCol = rowKeys.find(k => /^(dashboard_title|tiêu đề|title)$/i.test(k.trim()));
        if (dtCol && row[dtCol]) settingsMap['Dashboard_Title'] = String(row[dtCol]).trim();

        const cnCol = rowKeys.find(k => /^(company_name|công ty|company)$/i.test(k.trim()));
        if (cnCol && row[cnCol]) settingsMap['Company_Name'] = String(row[cnCol]).trim();

        const verCol = rowKeys.find(k => /^(demo_data_version|demo_version|version|phiên bản|phien ban)$/i.test(k.trim()));
        if (verCol && row[verCol]) settingsMap['Demo_Data_Version'] = String(row[verCol]).trim();
      });
      if (Object.keys(settingsMap).length > 0) {
        parsedSettings = settingsMap;
      }
    }

    // Persist verified Google Sheet URL for auto-sync on load
    saveStoredSheetConfig({ publishedUrl: targetUrl, lastSync: new Date().toISOString() });

    return res.json({
      success: true,
      message: `Đồng bộ thành công ${transactions.length.toLocaleString()} dòng giao dịch từ Google Sheets`,
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
      sheetNames: wb.SheetNames,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching published Google Sheet:', error);
    return res.status(500).json({
      error: `Lỗi kết nối Google Sheets: ${error.message || 'Không thể đọc nội dung xuất bản'}`,
    });
  }
});

// Real-time Event Streaming (SSE) for Instant Google Sheets Updates
const sseClients = new Set<express.Response>();

function broadcastSheetChange(eventData: any) {
  const dataString = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(dataString);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Keep SSE connections alive with periodic heartbeat
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': heartbeat\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 20000);

// SSE Streaming Route: Frontend listens here for instant changes
app.get('/api/sheets/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Stream Active', timestamp: new Date().toISOString() })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Webhook Route: Google Apps Script calls this immediately upon onEdit / onChange
app.post('/api/sheets/webhook', (req, res) => {
  const payload = req.body || {};
  console.log('[Real-Time Webhook] Instant sheet modification event received:', payload);

  const eventData = {
    type: 'SHEET_EDITED_INSTANT',
    source: 'Google Sheets onEdit/onChange Webhook',
    timestamp: new Date().toISOString(),
    details: payload,
  };

  broadcastSheetChange(eventData);

  return res.status(200).json({
    success: true,
    message: 'Instant change notification broadcasted to connected dashboards',
    timestamp: eventData.timestamp,
    clientCount: sseClients.size,
  });
});

// Webhook Info endpoint: Provides exact webhook URL and GAS trigger snippet
app.get('/api/sheets/webhook-info', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const webhookUrl = `${baseUrl}/api/sheets/webhook`;

  const gasTriggerCode = `/**
 * TỰ ĐỘNG BÁO CHO DASHBOARD NGAY KHI SHEET CÓ BẤT KỲ THAY ĐỔI NÀO
 * Dán hàm này vào Extensions > Apps Script trong Google Sheet của bạn
 */
function onEdit(e) {
  notifyDashboardInstantChange("onEdit", e);
}

function onChange(e) {
  notifyDashboardInstantChange("onChange", e);
}

function notifyDashboardInstantChange(triggerType, e) {
  var webhookUrl = "${webhookUrl}";
  var payload = {
    trigger: triggerType,
    changeType: (e && e.changeType) || "EDIT",
    sheetName: e && e.range ? e.range.getSheet().getName() : "ACTIVE_SHEET",
    user: Session.getActiveUser().getEmail() || "Editor",
    timestamp: new Date().toISOString()
  };

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log("Webhook error: " + err);
  }
}`;

  return res.json({
    webhookUrl,
    activeSubscribers: sseClients.size,
    gasTriggerCode,
  });
});

// Setup dev server with Vite or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sales Performance Dashboard] Server running at http://localhost:${PORT}`);
  });
}

startServer();
