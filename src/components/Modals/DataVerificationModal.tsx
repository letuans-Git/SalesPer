import React, { useMemo } from 'react';
import { X, CheckCircle2, XCircle, ShieldCheck, Play, Award } from 'lucide-react';
import { DatabaseState } from '../../types';
import { runDataIntegrityTestSuite } from '../../services/analytics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  db: DatabaseState;
}

export const DataVerificationModal: React.FC<Props> = ({ isOpen, onClose, db }) => {
  const testResults = useMemo(() => {
    if (!isOpen) return [];
    return runDataIntegrityTestSuite(db);
  }, [isOpen, db]);

  if (!isOpen) return null;

  const passedCount = testResults.filter((r) => r.passed).length;
  const isAllPassed = passedCount === testResults.length && testResults.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                BỘ KIỂM THỬ ĐỘC LẬP TÍNH CHÍNH XÁC DỮ LIỆU & KPI (12 RULES)
              </h3>
              <p className="text-xs text-slate-400">
                Đối chiếu độc lập tính toán toán học, bảo toàn dữ liệu và loại trừ sai số theo tiêu chuẩn BI
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

        {/* Status Scoreboard */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono tabular-nums flex items-center gap-1.5 ${
                isAllPassed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isAllPassed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> 12 / 12 KIỂM THỬ ĐẠT (100% PASS)
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> {passedCount} / {testResults.length} ĐẠT
                </>
              )}
            </span>
            <span className="text-xs text-slate-400">
              Kiểm tra trên {db.transactions.length.toLocaleString()} dòng giao dịch và 8 sheets
            </span>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Seed: <span className="text-slate-200">{db.settings.Data_Generation_Seed}</span>
          </div>
        </div>

        {/* Tests List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {testResults.map((test) => (
            <div
              key={test.ruleNumber}
              className={`p-3.5 rounded-lg border transition-all ${
                test.passed
                  ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  : 'bg-rose-950/30 border-rose-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      Quy tắc {test.ruleNumber}: {test.ruleName}
                    </h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{test.expectedDescription}</p>
                    <div className="mt-2 text-[11px] font-mono text-blue-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800/80 inline-block">
                      {test.actualValue}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      test.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {test.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
