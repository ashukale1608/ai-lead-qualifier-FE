import React, { useState } from 'react';
import { X, Database, Copy, Check, Code, Layers, FileText } from 'lucide-react';

interface DbArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_SNAPSHOT = `-- MySQL 8.0 Database DDL Snapshot (schema.sql)
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY,
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
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_leads_qualification (qualification),
    INDEX idx_leads_created_at (created_at DESC),
    INDEX idx_leads_company_name (company_name),
    UNIQUE KEY idx_leads_website_url (website_url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D1A]/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl rounded-xl border border-[#243047] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#243047] flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-50">Database Architecture & Schema Snapshot</h3>
              <p className="text-[11px] text-slate-400">MySQL 8.0 Entity Mapping & Architecture Specs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-[#0B1120] hover:bg-[#151F32] text-slate-400 hover:text-slate-200 border border-[#243047] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 py-2.5 bg-[#0B1120] border-b border-[#243047] flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151F32]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>schema.sql Snapshot</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#151F32]'
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
                  <span>schema.sql (MySQL 8.0 DDL)</span>
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-[#0B1120] hover:bg-[#151F32] text-slate-200 border border-[#243047] flex items-center space-x-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy DDL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-lg bg-[#0B1120] border border-[#243047] text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                {SQL_SCHEMA_SNAPSHOT}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-lg bg-[#0B1120] border border-[#243047]">
                <h4 className="font-bold text-slate-100 mb-2">Architectural Highlights</h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li><strong>Layered Separation:</strong> React UI connects via REST API (`/api/v1/leads`) to Spring Boot 3 Java backend.</li>
                  <li><strong>MySQL 8.0 Database:</strong> Schema with InnoDB engine, utf8mb4 collation, and case-insensitive unique indexes.</li>
                  <li><strong>Duplicate Prevention:</strong> Uniqueness enforced on `website_url` at both database level (Unique Key) and service layer.</li>
                  <li><strong>Indexed Queries:</strong> Indexed on `qualification`, `website_url`, and `created_at DESC` for fast dashboard filtering.</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200">
                <h4 className="font-bold text-blue-300 mb-1">Local MySQL Connection Settings</h4>
                <p className="font-mono text-[11px] text-blue-100">
                  SPRING_DATASOURCE_URL = jdbc:mysql://localhost:3306/lead_qualifier<br/>
                  SPRING_DATASOURCE_USERNAME = root<br/>
                  SPRING_DATASOURCE_PASSWORD = root
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#243047] bg-[#0B1120] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#151F32] hover:bg-[#1E293B] text-slate-200 border border-[#243047] cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
