import React from 'react';
import { Sparkles, LayoutDashboard, Bot } from 'lucide-react';

interface NavbarProps {
  activeTab: 'qualify' | 'dashboard';
  setActiveTab: (tab: 'qualify' | 'dashboard') => void;
  onOpenDbModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#243047] bg-[#080D1A]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('qualify')}>
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base text-slate-50 tracking-tight">LeadPulse</span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                AI Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Enterprise Lead Qualification & Decision Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1.5 bg-[#0F172A] p-1 rounded-lg border border-[#243047]">
          <button
            onClick={() => setActiveTab('qualify')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'qualify'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151F32]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Qualify Lead</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151F32]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Right Status / Branding Indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-400 font-medium">Live AI Engine</span>
        </div>

      </div>
    </header>
  );
};
