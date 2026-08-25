import React from 'react';
import type { LeadStats } from '../types/lead';
import { Users, Award, TrendingUp, BarChart2 } from 'lucide-react';

interface StatsOverviewProps {
  stats: LeadStats;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Total Leads Card */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">Total Leads Analyzed</div>
          <div className="text-2xl font-black text-slate-50 mt-1 tracking-tight">{stats.totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">PostgreSQL database</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* High Intent Rate Card */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">High Qualification %</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 tracking-tight">{stats.highQualificationPercentage}%</div>
          <div className="text-[11px] text-emerald-400/80 mt-1 font-mono">{stats.highQualificationCount} High-fit leads</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Award className="w-5 h-5" />
        </div>
      </div>

      {/* Average Score Card */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-slate-400">Average Fit Score</div>
          <div className="text-2xl font-black text-slate-50 mt-1 tracking-tight">{stats.averageFitScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">AI heuristic benchmark</div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Distribution Breakdown Card */}
      <div className="glass-panel p-5 flex items-center justify-between">
        <div className="w-full">
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center justify-between">
            <span>Fit Breakdown</span>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"/><span>High</span></span>
              <span className="font-bold text-slate-100">{stats.highQualificationCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"/><span>Medium</span></span>
              <span className="font-bold text-slate-100">{stats.mediumQualificationCount}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5"><span className="w-2 h-2 rounded-full bg-red-400"/><span>Low</span></span>
              <span className="font-bold text-slate-100">{stats.lowQualificationCount}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
