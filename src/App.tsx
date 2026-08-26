import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LeadForm } from './components/LeadForm';
import { QualificationReport } from './components/QualificationReport';
import { LeadDashboard } from './components/LeadDashboard';
import { StatsOverview } from './components/StatsOverview';
import { DbArchitectureModal } from './components/DbArchitectureModal';
import type { LeadResponse, LeadStats } from './types/lead';
import { fetchLeadStats } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'qualify' | 'dashboard'>('qualify');
  const [currentReport, setCurrentReport] = useState<LeadResponse | null>(null);
  const [editingLead, setEditingLead] = useState<LeadResponse | null>(null);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  const loadStats = async () => {
    try {
      const data = await fetchLeadStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [currentReport, activeTab]);

  const handleQualificationSuccess = (result: LeadResponse) => {
    setCurrentReport(result);
    setEditingLead(null);
    loadStats();
  };

  const handleResetForm = () => {
    setCurrentReport(null);
    setEditingLead(null);
  };

  const handleSelectLeadFromDashboard = (lead: LeadResponse) => {
    setCurrentReport(lead);
    setEditingLead(null);
    setActiveTab('qualify');
  };

  const handleEditLeadFromDashboard = (lead: LeadResponse) => {
    setEditingLead(lead);
    setCurrentReport(null);
    setActiveTab('qualify');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 selection:bg-blue-500 selection:text-white">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Statistics Bar */}
        {stats && <StatsOverview stats={stats} />}

        {/* Tab 1: Qualify Lead Form / Report View */}
        {activeTab === 'qualify' && (
          <div>
            {currentReport ? (
              <QualificationReport
                report={currentReport}
                onReset={handleResetForm}
              />
            ) : (
              <div className="max-w-3xl mx-auto">
                <LeadForm
                  onQualificationSuccess={handleQualificationSuccess}
                  initialData={editingLead}
                  onCancelEdit={() => setEditingLead(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History Dashboard */}
        {activeTab === 'dashboard' && (
          <LeadDashboard
            onSelectLead={handleSelectLeadFromDashboard}
            onEditLead={handleEditLeadFromDashboard}
          />
        )}

      </main>

      {/* Database Architecture Modal */}
      <DbArchitectureModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />

      {/* Clean Production Footer */}
      <footer className="border-t border-[#243047] bg-[#080D1A] py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>© 2026 LeadPulse AI • Enterprise Lead Qualification & Decision Engine</div>
          <div className="text-[11px] text-slate-500 font-mono">v1.2.0 Production</div>
        </div>
      </footer>

    </div>
  );
}

export default App;
