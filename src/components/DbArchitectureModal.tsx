import React, { useState } from 'react';
import { X, Database, Copy, Check, Code, Layers, FileText } from 'lucide-react';

interface DbArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_SNAPSHOT = `-- PostgreSQL Database DDL Snapshot (schema.sql)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500) NOT NULL,
    service_interest VARCHAR(255) NOT NULL,
    budget_range VARCHAR(100) NOT NULL,
    goal TEXT NOT NULL,
    
    -- AI Evaluation Output
    qualification VARCHAR(20) NOT NULL CHECK (qualification IN ('HIGH', 'MEDIUM', 'LOW')),
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    reasoning TEXT NOT NULL,
    missing_information TEXT NOT NULL, -- Formatted JSON string
    recommended_action TEXT NOT NULL,
    key_insights TEXT NOT NULL,       -- Formatted JSON string
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_leads_qualification ON leads(qualification);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);`;

export const DbArchitectureModal: React.FC<DbArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'architecture'>('sql');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SNAPSHOT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Database Architecture & Schema Snapshot</h3>
              <p className="text-xs text-slate-400">PostgreSQL 14+ Entity Mapping & Architecture Specs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>schema.sql Snapshot</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'sql' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>schema.sql (PostgreSQL DDL)</span>
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy DDL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {SQL_SCHEMA_SNAPSHOT}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <h4 className="font-bold text-white mb-2">Architectural Highlights</h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li><strong>Layered Separation:</strong> React 18 UI connects via REST API (`/api/v1/leads`) to Spring Boot 3 Java backend.</li>
                  <li><strong>Structured AI Output:</strong> Gemini API returns strict JSON parsed directly into Java DTOs (`LeadResponseDto`).</li>
                  <li><strong>Heuristic Fallback:</strong> If cloud API key is offline, backend evaluates lead parameters locally with zero error downtime.</li>
                  <li><strong>Indexed Queries:</strong> PostgreSQL indexed on `qualification` and `created_at DESC` for fast dashboard filtering.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                <h4 className="font-bold text-blue-300 mb-1">Local Database Connection Settings</h4>
                <p className="font-mono text-[11px] text-blue-100">
                  SPRING_DATASOURCE_URL = jdbc:postgresql://localhost:5432/lead_qualifier<br/>
                  SPRING_DATASOURCE_USERNAME = postgres<br/>
                  SPRING_DATASOURCE_PASSWORD = postgres
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
