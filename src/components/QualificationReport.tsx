import React, { useState } from 'react';
import type { LeadResponse } from '../types/lead';
import { Sparkles, CheckCircle2, Copy, Check, ExternalLink, AlertTriangle, ArrowUpRight, Clock, ShieldCheck, Zap } from 'lucide-react';

interface QualificationReportProps {
  report: LeadResponse;
  onReset: () => void;
}

export const QualificationReport: React.FC<QualificationReportProps> = ({ report, onReset }) => {
  const [copied, setCopied] = useState(false);

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'badge-high text-emerald-400';
      case 'MEDIUM':
        return 'badge-medium text-amber-400';
      case 'LOW':
        return 'badge-low text-rose-400';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return '#10B981'; // Success Green
    if (score >= 50) return '#F59E0B'; // Warning Amber
    return '#EF4444'; // Danger Red
  };

  const handleCopySummary = () => {
    const summaryText = `
LEAD QUALIFICATION REPORT: ${report.companyName}
Qualification Level: ${report.qualification} (Score: ${report.score}/100)
Website: ${report.websiteUrl}
Budget Range: ${report.budgetRange}
Service Requested: ${report.serviceInterest}

REASONING:
${report.reasoning}

RECOMMENDED NEXT ACTION:
${report.recommendedAction}

MISSING INFORMATION TO REQUEST:
${report.missingInformation.map((item) => `- ${item}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HERO LEAD HEADER & AI SCORE SECTION */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Lead Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide inline-flex items-center space-x-1.5 ${getBadgeStyle(report.qualification)}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{report.qualification} FIT LEAD</span>
              </span>
              <span className="text-slate-500 text-xs font-mono">ID: {report.id.substring(0, 8)}</span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight">{report.companyName}</h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
              <a
                href={report.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <span>{report.websiteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Budget: <strong className="text-slate-100">{report.budgetRange}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Service: <strong className="text-slate-100">{report.serviceInterest}</strong></span>
            </div>
          </div>

          {/* Right Hero: AI Qualification Score Card */}
          <div className="ai-hero-card p-5 rounded-xl flex items-center space-x-5 shrink-0">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="#1E293B"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke={getScoreColor(report.score)}
                  strokeWidth="6"
                  strokeDasharray={201}
                  strokeDashoffset={201 - (201 * report.score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-50">{report.score}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">/ 100</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-purple-400 tracking-wide uppercase flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Score Benchmark</span>
              </div>
              <div className="text-base font-bold text-slate-100 mt-1">
                {report.score >= 75 ? 'High Conversion Potential' : report.score >= 50 ? 'Moderate Scope Alignment' : 'Low Strategic Fit'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Evaluated across budget, goal & domain</div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Reasoning & Missing Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Executive Reasoning Card */}
          <div className="glass-panel p-6">
            <div className="flex items-center space-x-2 text-purple-400 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              <span>AI Evaluation Reasoning</span>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800">
              {report.reasoning}
            </p>

            {/* Key Strategic Highlights */}
            <div className="mt-5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Key Strategic Highlights</h4>
              <div className="space-y-2">
                {report.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Information Identified Card */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Missing Information</span>
              </div>
              <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 font-mono">
                {report.missingInformation.length} items missing
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              The AI detected the following unstated items. Request these during sales discovery:
            </p>

            <div className="space-y-2">
              {report.missingInformation.map((info, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{info}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): AI RECOMMENDED ACTION FEATURE WIDGET */}
        <div className="space-y-6">
          
          {/* AI Recommended Decision Engine Feature Widget */}
          <div className="glass-panel p-6 border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-900/80 relative">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm mb-4">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>AI Recommended Action</span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/90 border border-blue-500/20 text-slate-200 text-xs leading-relaxed mb-4">
              <p className="font-medium text-slate-100 mb-2">{report.recommendedAction}</p>
            </div>

            {/* Decision Attributes */}
            <div className="space-y-2 mb-5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Action Priority:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getBadgeStyle(report.qualification)}`}>
                  {report.qualification} INTENT
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Recommended Within:</span>
                </span>
                <span className="text-slate-200 font-semibold">{report.qualification === 'HIGH' ? '24 Hours' : '3 Days'}</span>
              </div>
            </div>

            {/* Action CTA & Summary Controls */}
            <div className="space-y-2.5">
              <button
                onClick={onReset}
                className="w-full py-3 px-4 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Qualify Another Lead</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopySummary}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied AI Summary!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Full AI Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lead Context Summary Box */}
          <div className="glass-panel p-5 text-xs space-y-2">
            <h4 className="font-semibold text-slate-300 mb-2">Original Submission Context</h4>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Target Goal</span>
              <span className="text-slate-200 font-medium truncate max-w-[160px]">{report.goal}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Submitted</span>
              <span className="text-slate-200 font-medium">{new Date(report.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
