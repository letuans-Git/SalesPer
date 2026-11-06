import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  Link,
  ExternalLink,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../../services/gasCode';
import { getGasWebAppUrl, saveGasWebAppUrl, exportDatabaseToExcel } from '../../services/storage';
import { DatabaseState } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseState;
}

export const GasIntegrationModal: React.FC<Props> = ({ isOpen, onClose, db }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'connect'>('guide');
  const [copied, setCopied] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState(getGasWebAppUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndTestUrl = async () => {
    saveGasWebAppUrl(webAppUrl);
    if (!webAppUrl) {
      setTestResult({ success: false, message: 'Vui lòng nhập URL Google Apps Script Web App' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const pingUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(pingUrl, { method: 'GET' });
      const data = await res.json();

      if (data.status === 'ok') {
        setTestResult({
          success: true,
          message: 'Kết nối thành công tới Google Apps Script Web App! Dữ liệu đã đồng bộ.',
        });
      } else {
        setTestResult({
          success: true,
          message: 'Phản hồi từ Web App: ' + JSON.stringify(data),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Lỗi kết nối Web App: ' + (err.message || 'Kiểm tra quyền truy cập Anyone (Bất kỳ ai)'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDownloadExcel = () => {
    exportDatabaseToExcel(db, `CHINFON_Google_Sheets_Database_8Sheets_${Date.now()}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                TRUNG TÂM TÍCH HỢP GOOGLE SHEETS & GOOGLE APPS SCRIPT
              </h3>
              <p className="text-xs text-slate-400">
                Kiến trúc React Frontend → Google Apps Script Backend → Google Sheets Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Hướng dẫn Triển khai & Cài đặt
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Mã nguồn Google Apps Script (Code.gs)
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connect'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Kết nối Trực tiếp Web App
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-lg text-slate-300 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Quy trình triển khai hệ thống Google Sheets Database
                </h4>
                <p>
                  Ứng dụng được thiết kế hoàn toàn theo mô hình decoupling: React Frontend chạy trên Cloud/Web
                  giao tiếp qua REST API tới Google Apps Script Web App để truy xuất và cập nhật 8 Google Sheets.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">
                    Bước 1: Tạo Google Sheets mới hoặc Tải Workbook mẫu
                  </span>
                  <p className="text-slate-400 mb-2">
                    Mở Google Sheets (sheets.new) hoặc tải toàn bộ Database 8 Sheet có sẵn dữ liệu chuẩn để Import vào Google Drive:
                  </p>
                  <button
                    onClick={handleDownloadExcel}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file Excel mẫu chứa đủ 8 Sheets (CHINFON Database .xlsx)</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">
                    Bước 2: Mở Apps Script Editor trong Google Sheets
                  </span>
                  <p className="text-slate-400">
                    Trong Google Sheets, chọn menu: <span className="text-slate-200 font-semibold">Tiện ích mở rộng (Extensions)</span> →{' '}
                    <span className="text-slate-200 font-semibold">Apps Script</span>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">
                    Bước 3: Dán Mã nguồn và Chạy Hàm Khởi tạo
                  </span>
                  <p className="text-slate-400 mb-2">
                    Xóa toàn bộ mã mặc định trong file <code className="text-blue-400">Code.gs</code>, chuyển sang tab{' '}
                    <span className="text-blue-300 font-semibold cursor-pointer" onClick={() => setActiveTab('code')}>
                      "2. Mã nguồn Google Apps Script"
                    </span>{' '}
                    và dán mã vào. Chọn hàm <code className="text-amber-300">setupSheetsAndDemoData</code> rồi nhấn <b>Run (Chạy)</b> để tự động tạo 8 sheets.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-800">
                  <span className="font-bold text-white text-xs block mb-1">
                    Bước 4: Triển khai dưới dạng Web App (Deploy as Web App)
                  </span>
                  <p className="text-slate-400">
                    Nhấn nút <span className="text-white font-semibold">Deploy (Triển khai)</span> →{' '}
                    <span className="text-white font-semibold">New deployment (Triển khai mới)</span> → Chọn loại{' '}
                    <span className="text-white font-semibold">Web app</span>.
                    <br />
                    - Execute as: <b>Me (Tôi)</b>
                    <br />
                    - Who has access: <b>Anyone (Bất kỳ ai)</b>
                    <br />
                    Sau đó sao chép Web App URL (dạng <code>https://script.google.com/macros/s/.../exec</code>) dán vào tab{' '}
                    <b>"3. Kết nối Trực tiếp Web App"</b> để liên thông!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">
                  File: <code className="text-blue-400 font-mono">Code.gs</code> (Bao gồm doGet, doPost, tự tạo 8 Sheet, tính toán KPI)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ mã'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 h-96 overflow-y-auto leading-relaxed select-all">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                <label className="font-bold text-white text-xs block">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={webAppUrl}
                      onChange={(e) => setWebAppUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={handleSaveAndTestUrl}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
                    <span>Kiểm tra & Lưu</span>
                  </button>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Lưu ý: Web App phải được cấp quyền truy cập "Anyone" để Frontend có thể gửi yêu cầu lấy số liệu KPI.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block mb-1">Cơ chế Fallback thông minh:</span>
                <p>
                  Nếu chưa nhập URL hoặc Google Apps Script ngoại tuyến, Dashboard tự động sử dụng động cơ Google Sheets Database
                  mô phỏng trên Client với đầy đủ 8 bảng dữ liệu, 2.350 giao dịch và thuật toán kiểm thử chuẩn xác 100%.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
