import React, { useState } from 'react';
import { X, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seed: number) => void;
  currentSeed: number;
}

export const GenerateDataConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  currentSeed,
}) => {
  const [seed, setSeed] = useState(currentSeed);
  const [useRandomSeed, setUseRandomSeed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalSeed = useRandomSeed ? Math.floor(Math.random() * 10000000) : seed;
    onConfirm(finalSeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">TẠO LẠI DỮ LIỆU DEMO</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Xác nhận tạo lại bộ dữ liệu DEMO</p>
              <p className="mt-1 text-[11px] text-amber-300/90 leading-relaxed">
                Hành động này sẽ sinh lại 2.300+ dòng giao dịch và chỉ tiêu mới cho cả hai năm 2025 & 2026,
                cập nhật nhật ký DATA_LOG và tải lại toàn bộ các biểu đồ BI.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">
              Mã hạt giống ngẫu nhiên (Seed):
            </label>
            <input
              type="number"
              value={seed}
              disabled={useRandomSeed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 20261105)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-blue-500 disabled:opacity-40"
            />
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="randomSeedCheck"
                checked={useRandomSeed}
                onChange={(e) => setUseRandomSeed(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="randomSeedCheck" className="text-slate-400 cursor-pointer">
                Tạo hạt giống hoàn toàn ngẫu nhiên (New random batch)
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tạo lại dữ liệu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
