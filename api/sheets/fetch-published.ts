import * as XLSX from 'xlsx';

function normalizeGoogleSheetsUrl(rawUrl: string): { url: string; isLikelyCsv: boolean } {
  let url = rawUrl.trim();

  if (url.includes('/pubhtml')) {
    return { url: url.replace(/\/pubhtml.*$/, '/pub?output=xlsx'), isLikelyCsv: false };
  }

  if (url.includes('/pub?') || url.endsWith('/pub')) {
    if (url.includes('output=csv')) {
      return { url, isLikelyCsv: true };
    }
    if (!url.includes('output=xlsx')) {
      const sep = url.includes('?') ? '&' : '?';
      return { url: `${url}${sep}output=xlsx`, isLikelyCsv: false };
    }
    return { url, isLikelyCsv: false };
  }

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

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const requestedUrl = req.body?.url || req.query?.url;
    if (!requestedUrl || typeof requestedUrl !== 'string' || !requestedUrl.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đường dẫn Google Sheets đã xuất bản lên web' });
    }

    const { url: downloadUrl } = normalizeGoogleSheetsUrl(requestedUrl.trim());

    const fetchResponse = await fetch(downloadUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv, */*',
      },
      redirect: 'follow',
    });

    if (!fetchResponse.ok) {
      return res.status(400).json({
        error: `Không thể tải dữ liệu từ Google Sheets (HTTP ${fetchResponse.status}: ${fetchResponse.statusText})`,
      });
    }

    const arrayBuf = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      return res.status(400).json({
        error: 'Không thể phân tích định dạng bảng tính. Hãy đảm bảo bạn đã chọn xuất bản định dạng Microsoft Excel (.xlsx)',
      });
    }

    if (!wb.SheetNames || wb.SheetNames.length === 0) {
      return res.status(400).json({ error: 'File Google Sheets xuất bản không chứa trang tính nào' });
    }

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

    // 7. Settings Sheet
    const setSheet = findSheet(['SETTINGS', 'SETTING', 'THIET_LAP', 'CAU_HINH']);
    let parsedSettings: Record<string, any> | undefined = undefined;
    if (setSheet) {
      const rawSettings = XLSX.utils.sheet_to_json<any>(setSheet, { defval: '' });
      const settingsMap: Record<string, any> = {};
      rawSettings.forEach((row) => {
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
      if (Object.keys(settingsMap).length > 0) {
        parsedSettings = settingsMap;
      }
    }

    return res.status(200).json({
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
    return res.status(500).json({
      success: false,
      error: `Lỗi máy chủ khi xử lý file Google Sheets: ${error?.message || 'Không xác định'}`,
    });
  }
}
