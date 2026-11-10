import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Copy,
  Check,
  Send,
  HelpCircle,
  Radio,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import {
  getPublishedSheetUrl,
  savePublishedSheetUrl,
  getAutoSyncInterval,
  saveAutoSyncInterval,
  getLastSyncTimestamp,
  saveDatabase,
  saveLastSyncTimestamp,
  syncPublishedGoogleSheet,
} from '../../services/storage';
import { parseSpreadsheetBuffer } from '../../services/clientSheetParser';
import { fetchWebhookInfo, WebhookInfo } from '../../services/realtime';
import { DatabaseState } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseState;
  onDatabaseUpdated: (newDb: DatabaseState) => void;
}

export const PublishedSheetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  db,
  onDatabaseUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'webhook'>('publish');
  const [url, setUrl] = useState(getPublishedSheetUrl());
  const [autoSync, setAutoSync] = useState(getAutoSyncInterval());
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    rowCounts?: any;
    newDb?: DatabaseState;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWebhookInfo().then((info) => {
        if (info) setWebhookInfo(info);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    if (!url.trim()) {
      setResult({
        success: false,
        error: 'Vui lòng nhập đường dẫn Google Sheets đã được xuất bản lên web',
      });
      return;
    }

    savePublishedSheetUrl(url.trim());
    saveAutoSyncInterval(autoSync);

    setIsSyncing(true);
    setResult(null);

    const res = await syncPublishedGoogleSheet(url.trim(), db);
    setIsSyncing(false);

    if (res.success && res.newDb) {
      onDatabaseUpdated(res.newDb);
      setResult({
        success: true,
        message: res.message || 'Đồng bộ dữ liệu thành công!',
        rowCounts: res.rowCounts,
        newDb: res.newDb,
      });
    } else {
      setResult({
        success: false,
        error: res.error || 'Không thể đồng bộ',
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const parseResult = parseSpreadsheetBuffer(buffer);
      if (parseResult.success && parseResult.parsedData) {
        const nowStr = new Date().toISOString();
        const updatedDb: DatabaseState = {
          transactions: parseResult.parsedData.transactions || db.transactions,
          targets: parseResult.parsedData.targets || db.targets,
          products: parseResult.parsedData.products || db.products,
          salesReps: parseResult.parsedData.salesReps || db.salesReps,
          regions: parseResult.parsedData.regions || db.regions,
          channels: parseResult.parsedData.channels || db.channels,
          settings: {
            ...db.settings,
            ...(parseResult.parsedData.settings || {}),
            Last_Data_Refresh: nowStr,
            Demo_Data_Version:
              parseResult.parsedData.settings?.Demo_Data_Version ||
              db.settings.Demo_Data_Version,
          },
          dataLogs: [
            {
              Log_ID: `LOG_${Date.now()}`,
              Timestamp: nowStr,
              Version: 'Direct File Upload',
              RowCount: parseResult.parsedData.transactions ? parseResult.parsedData.transactions.length : db.transactions.length,
              Status: 'Success',
              Operator: 'Device File Picker',
              ErrorMsg: `Đã nạp file "${file.name}" trực tiếp trên thiết bị`,
            },
            ...db.dataLogs.slice(0, 15),
          ],
        };

        saveDatabase(updatedDb);
        saveLastSyncTimestamp(nowStr);
        onDatabaseUpdated(updatedDb);

        setResult({
          success: true,
          message: `Nạp thành công ${parseResult.rowCounts.transactions} dòng giao dịch từ tệp "${file.name}"!`,
          rowCounts: parseResult.rowCounts,
          newDb: updatedDb,
        });
      } else {
        setResult({
          success: false,
          error: parseResult.error || 'Không thể bóc tách dữ liệu từ tệp này.',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: `Lỗi đọc tệp: ${err?.message || 'Không thể mở tệp'}`,
      });
    } finally {
      setIsSyncing(false);
      e.target.value = '';
    }
  };

  const handleCopyWebhookUrl = () => {
    if (webhookInfo?.webhookUrl) {
      navigator.clipboard.writeText(webhookInfo.webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyGasCode = () => {
    if (webhookInfo?.gasTriggerCode) {
      navigator.clipboard.writeText(webhookInfo.gasTriggerCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSendTestWebhook = async () => {
    setIsSendingTest(true);
    setTestSuccess(null);
    try {
      const res = await fetch('/api/sheets/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'SIMULATED_TEST_EDIT',
          trigger: 'Manual User Test Button',
          sheetName: 'SALES_TRANSACTIONS',
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSuccess(`Đã phát tín hiệu thay đổi tức thì tới ${data.clientCount || 1} màn hình Dashboard đang mở!`);
      }
    } catch (err: any) {
      setTestSuccess(`Lỗi kiểm tra: ${err.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveSettings = () => {
    savePublishedSheetUrl(url.trim());
    saveAutoSyncInterval(autoSync);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                LIÊN KẾT & ĐỒNG BỘ DỮ LIỆU GOOGLE SHEETS
              </h3>
              <p className="text-xs text-slate-400">
                Tự động lấy dữ liệu ngay khi file Google Sheets có bất kỳ thay đổi nào
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3 text-xs">
          <button
            onClick={() => setActiveTab('publish')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>1. File Xuất bản Web (Publish to Web)</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Cập nhật Tức thì khi Sửa Sheet (Real-Time Webhook)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'publish' && (
            <>
              {/* URL Input Box */}
              <div className="space-y-2">
                <label className="font-bold text-white text-xs block">
                  Đường dẫn file Google Sheets đã xuất bản lên web:
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml hoặc /pub?output=xlsx"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Hỗ trợ tự động: Link Xuất bản lên web (<code className="text-blue-400">/pubhtml</code>, <code className="text-blue-400">/pub?output=xlsx</code>) hoặc Link Google Sheet chia sẻ thông thường (<code className="text-blue-400">/spreadsheets/d/ID/edit...</code>).
                </p>
              </div>

              {/* Auto Sync Interval */}
              <div className="space-y-2">
                <label className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Chu kỳ tự động thăm dò cập nhật (Polling Interval):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Tắt (Thủ công)', val: 0 },
                    { label: 'Mỗi 30 giây', val: 30 },
                    { label: 'Mỗi 1 phút', val: 60 },
                    { label: 'Mỗi 5 phút', val: 300 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setAutoSync(item.val)}
                      className={`py-2 px-3 rounded text-center font-medium border transition-colors cursor-pointer ${
                        autoSync === item.val
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sync Trigger & File Upload Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang tải & đọc Google Sheets...' : 'Đồng bộ từ Google Sheets'}</span>
                </button>

                {/* Direct Excel file upload option for mobile & desktop */}
                <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded border border-slate-700 transition-colors cursor-pointer shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hoặc nạp tệp Excel (.xlsx) từ máy</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Result Alert */}
              {result && (
                <div
                  className={`p-3.5 rounded-lg border flex flex-col gap-2 ${
                    result.success
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{result.message || result.error}</span>
                  </div>

                  {result.success && result.rowCounts && (
                    <div className="mt-1 pt-2 border-t border-emerald-800/40 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-emerald-200">
                      <div>• Giao dịch: {result.rowCounts.transactions} dòng</div>
                      <div>• Chỉ tiêu: {result.rowCounts.targets} dòng</div>
                      <div>• Sản phẩm: {result.rowCounts.products} mã</div>
                      <div>• Nhân viên: {result.rowCounts.salesReps} người</div>
                      <div>• Khu vực: {result.rowCounts.regions} vùng</div>
                      <div>• Kênh bán: {result.rowCounts.channels} kênh</div>
                      {result.newDb?.settings?.Dashboard_Title && (
                        <div className="col-span-2 sm:col-span-3 text-amber-200">
                          • Tiêu đề (SETTINGS): &quot;{result.newDb.settings.Dashboard_Title}&quot;
                        </div>
                      )}
                      {result.newDb?.settings?.Demo_Data_Version && (
                        <div className="col-span-2 sm:col-span-3 text-amber-300">
                          • Phiên bản (SETTINGS [Demo_Data_Version]): &quot;{result.newDb.settings.Demo_Data_Version}&quot;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quick instructions */}
              <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Cách lấy liên kết Google Sheets nhanh (Hỗ trợ 100% Mobile & PC):</span>
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed space-y-1.5">
                  <p>
                    <strong className="text-blue-300">Cách 1 (Nhanh nhất - khuyên dùng):</strong> Mở Google Sheets $\rightarrow$ Bấm nút <b>Chia sẻ (Share)</b> $\rightarrow$ Ở mục &ldquo;Quyền truy cập chung&rdquo;, chọn <b>&ldquo;Bất kỳ ai có đường liên kết đều có thể xem&rdquo;</b> (Anyone with the link can view) $\rightarrow$ Bấm <b>Sao chép đường liên kết</b> và dán vào đây. Ứng dụng tự động kết nối qua Google API mà không bị chặn CORS trên iOS/Android.
                  </p>
                  <p>
                    <strong className="text-emerald-300">Cách 2 (Xuất bản Web):</strong> Menu <b>Tệp (File)</b> $\rightarrow$ <b>Chia sẻ</b> $\rightarrow$ <b>Xuất bản lên web (Publish to web)</b> $\rightarrow$ Chọn toàn bộ tài liệu định dạng <b>Excel (.xlsx)</b> hoặc <b>Trang web</b> rồi bấm Xuất bản.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'webhook' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-lg text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Cập nhật Tức thì (Real-time Instant Trigger)</span>
                </div>
                <p className="leading-relaxed">
                  Mỗi khi có ai đó sửa một ô, nhập thêm một giao dịch hay thay đổi số liệu trong Google Sheet,
                  Apps Script Trigger (<code className="text-amber-300">onEdit</code> / <code className="text-amber-300">onChange</code>)
                  sẽ bắn tín hiệu Webhook ngay trong <b>1 giây</b> tới Dashboard qua Server-Sent Events (SSE).
                </p>
              </div>

              {/* Webhook URL Box */}
              <div className="space-y-1.5">
                <label className="font-bold text-white text-xs block">
                  Đường dẫn Webhook nhận tín hiệu của Dashboard:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookInfo?.webhookUrl || '/api/sheets/webhook'}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-amber-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Apps Script Trigger Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white text-xs block">
                    Đoạn mã kích hoạt tự động (Dán vào Apps Script trong Google Sheet):
                  </label>
                  <button
                    onClick={handleCopyGasCode}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 h-44 overflow-y-auto leading-relaxed select-all">
                  <pre>{webhookInfo?.gasTriggerCode || '// Đang tải mã trigger...'}</pre>
                </div>
              </div>

              {/* Test Button */}
              <div className="p-3.5 bg-slate-950/70 rounded-lg border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-white block">Thử nghiệm gửi tín hiệu thay đổi</span>
                  <p className="text-[11px] text-slate-400">
                    Bấm để giả lập 1 thao tác sửa dữ liệu từ Google Sheets và kiểm tra phản hồi thời gian thực.
                  </p>
                </div>
                <button
                  onClick={handleSendTestWebhook}
                  disabled={isSendingTest}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-spin' : ''}`} />
                  <span>{isSendingTest ? 'Đang gửi...' : 'Bắn tín hiệu Test'}</span>
                </button>
              </div>

              {testSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{testSuccess}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Kênh thời gian thực: Đang trực tuyến (SSE Listening)</span>
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors cursor-pointer"
          >
            Lưu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
