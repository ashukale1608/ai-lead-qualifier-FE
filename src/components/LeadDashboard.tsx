import React, { useState, useEffect } from 'react';
import type { LeadResponse } from '../types/lead';
import { fetchAllLeads } from '../services/api';
import { Search, Filter, ExternalLink, Calendar, Award, Building2, RefreshCw, Eye, X, AlertCircle } from 'lucide-react';

interface LeadDashboardProps {
  onSelectLead: (lead: LeadResponse) => void;
}

export const LeadDashboard: React.FC<LeadDashboardProps> = ({ onSelectLead }) => {
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadLeads = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAllLeads(searchQuery);
      setLeads(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve lead records from server.';
      console.error('Error fetching leads:', err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [searchQuery]);

  const filteredLeads = leads.filter((lead) => {
    if (selectedFilter === 'ALL') return true;
    return lead.qualification === selectedFilter;
  });

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'badge-high text-emerald-400';
      case 'MEDIUM':
        return 'badge-medium text-amber-400';
      case 'LOW':
        return 'badge-low text-red-400';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* API Query Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-lg bg-rose-950/90 border border-rose-500/50 flex items-center justify-between text-rose-200 text-xs shadow-xl relative">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-rose-300 block text-xs">API Service Error</span>
              <span className="text-xs text-rose-200">{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={loadLeads}
            className="px-3 py-1.5 rounded-md bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold text-rose-200 border border-rose-500/40 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      )}

      {/* Search & Filter Header Bar */}
      <div className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by company, domain or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-9 pr-8 py-2 text-xs placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              title="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-medium text-slate-400 mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((filter) => {
            const count = filter === 'ALL'
              ? leads.length
              : leads.filter((l) => l.qualification === filter).length;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                    : 'bg-[#0B1120] text-slate-400 hover:text-slate-200 hover:bg-[#151F32] border border-[#243047]'
                }`}
              >
                <span>{filter}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  selectedFilter === filter ? 'bg-blue-700 text-white font-bold' : 'bg-[#0F172A] text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={loadLeads}
            className="p-1.5 rounded-md bg-[#0F172A] hover:bg-[#151F32] text-slate-400 hover:text-slate-200 border border-[#243047] ml-2 cursor-pointer"
            title="Refresh Leads Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Leads Table Container */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1120] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#243047]">
              <tr>
                <th className="px-5 py-3.5">Company & Domain</th>
                <th className="px-5 py-3.5">Service Requested</th>
                <th className="px-5 py-3.5">Budget Range</th>
                <th className="px-5 py-3.5">Qualification Fit</th>
                <th className="px-5 py-3.5 text-center">Fit Score</th>
                <th className="px-5 py-3.5">Analyzed Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#243047]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Fetching qualified leads from PostgreSQL database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Building2 className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No qualified leads found</p>
                    <p className="text-xs text-slate-500 mt-1">Try clearing search filters or submit a new lead analysis.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-[#151F32] transition-colors group cursor-pointer"
                    onClick={() => onSelectLead(lead)}
                  >
                    {/* Company */}
                    <td className="px-5 py-3 font-medium text-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-md bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 shrink-0 text-xs">
                          {lead.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {lead.companyName}
                          </div>
                          <a
                            href={lead.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center space-x-1 mt-0.5"
                          >
                            <span className="truncate max-w-[140px]">{lead.websiteUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-3 text-slate-300 font-medium">
                      <span className="truncate max-w-[180px] block">{lead.serviceInterest}</span>
                    </td>

                    {/* Budget */}
                    <td className="px-5 py-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-[#0B1120] border border-[#243047] font-mono text-[11px]">
                        {lead.budgetRange}
                      </span>
                    </td>

                    {/* Badge */}
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase inline-flex items-center space-x-1 ${getBadgeStyle(lead.qualification)}`}>
                        <Award className="w-3 h-3" />
                        <span>{lead.qualification}</span>
                      </span>
                    </td>

                    {/* Fit Score */}
                    <td className="px-5 py-3 text-center font-bold text-slate-100">
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0B1120] border border-[#243047] font-mono text-xs">
                        {lead.score}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3 text-slate-400 text-[11px]">
                      <div className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="p-1 rounded-md bg-[#0B1120] hover:bg-blue-600 text-slate-400 hover:text-white transition-all border border-[#243047] cursor-pointer"
                        title="View Qualification Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
