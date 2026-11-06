import React from 'react';
import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ArrowRightCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { SalesInsightsData, KPIResult, RegionPerformance, SalesRepLeaderboardItem } from '../types';

interface Props {
  insights: SalesInsightsData;
  kpis?: KPIResult;
  regions?: RegionPerformance[];
  leaderboard?: SalesRepLeaderboardItem[];
  periodText?: string;
  onUpdateInsights?: (newInsights: SalesInsightsData) => void;
}

export const SalesInsights: React.FC<Props> = ({
  insights,
}) => {
  return (
    <section id="insights-section" className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              SALES INSIGHTS – NHẬN ĐỊNH VÀ KHUYẾN NGHỊ ĐIỀU HÀNH
            </h3>
            {insights.isAiGenerated && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" /> AI Executive Memo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Tổng hợp tự động từ dữ liệu Google Sheets đã kiểm định, hỗ trợ Ban Giám đốc ra quyết định
          </p>
        </div>
      </div>

      {/* Executive Summary Memo */}
      {insights.executiveSummary && (
        <div className="mb-4 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[11px] mb-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>TÓM TẮT ĐIỀU HÀNH (EXECUTIVE BRIEFING):</span>
          </div>
          <p className="text-slate-200">{insights.executiveSummary}</p>
        </div>
      )}

      {/* 3 Pillars: Highlights, Concerns, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Positive Highlights */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-3 pb-2 border-b border-slate-800">
            <CheckCircle className="w-4 h-4" />
            <span>ĐIỂM SÁNG KINH DOANH (POSITIVE HIGHLIGHTS)</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {insights.positiveHighlights.map((hl, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{hl}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pillar 2: Areas of Concern */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-3 pb-2 border-b border-slate-800">
            <AlertTriangle className="w-4 h-4" />
            <span>ĐIỂM NÓNG & RỦI RO (AREAS OF CONCERN)</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {insights.areasOfConcern.map((concern, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{concern}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pillar 3: Strategic Recommendations */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase mb-3 pb-2 border-b border-slate-800">
            <ArrowRightCircle className="w-4 h-4" />
            <span>HÀNH ĐỘNG KHUYẾN NGHỊ (RECOMMENDED ACTIONS)</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {insights.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
