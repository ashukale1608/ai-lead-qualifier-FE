import React, { useState } from 'react';
import type { LeadRequest, LeadResponse } from '../types/lead';
import { qualifyLead, updateAndRequalifyLead } from '../services/api';
import { Sparkles, Globe, DollarSign, Target, Briefcase, Building2, Loader2, AlertCircle, X } from 'lucide-react';

interface LeadFormProps {
  onQualificationSuccess: (result: LeadResponse) => void;
  initialData?: LeadResponse | null;
  onCancelEdit?: () => void;
}

const BUDGET_OPTIONS = [
  'Under $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+',
];

const SERVICE_PRESETS = [
  'Enterprise Cloud & DevOps',
  'Custom AI Model Training',
  'Fullstack Web Application',
  'SEO & Content Marketing',
  'Cybersecurity & Audit',
];

export const LeadForm: React.FC<LeadFormProps> = ({ onQualificationSuccess, initialData, onCancelEdit }) => {
  const [formData, setFormData] = useState<LeadRequest>({
    companyName: initialData?.companyName || '',
    websiteUrl: initialData?.websiteUrl || '',
    serviceInterest: initialData?.serviceInterest || SERVICE_PRESETS[0],
    budgetRange: initialData?.budgetRange || BUDGET_OPTIONS[2],
    goal: initialData?.goal || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadingSteps = [
    'Scanning company domain & website signals...',
    'Analyzing budget vs technical scope requirements...',
    'Evaluating intent strength & identifying missing details...',
    'Synthesizing AI recommendation & action plan...',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!formData.companyName.trim()) {
      setErrorMessage('Please enter a valid company name.');
      return;
    }
    if (!formData.websiteUrl.trim() || !formData.websiteUrl.includes('.')) {
      setErrorMessage('Please provide a valid website URL (e.g., https://example.com).');
      return;
    }
    if (formData.goal.trim().length < 10) {
      setErrorMessage('Please describe the strategic goal with at least 10 characters.');
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      let result: LeadResponse;
      if (initialData?.id) {
        result = await updateAndRequalifyLead(initialData.id, formData);
      } else {
        result = await qualifyLead(formData);
      }
      clearInterval(interval);
      setIsLoading(false);
      onQualificationSuccess(result);
    } catch (err: unknown) {
      clearInterval(interval);
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Failed to qualify lead. Please check inputs and try again.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
      
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{initialData ? 'Re-Qualify Existing Lead' : 'Inbound Lead Intake'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-50 tracking-tight">
            {initialData ? `Update & Re-Qualify ${initialData.companyName}` : 'Qualify Inbound Website Prospect'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {initialData ? 'Modify budget range or project scope to trigger real-time AI re-evaluation.' : 'Enter company information to trigger real-time AI qualification scoring, fit reasoning, and next-best actions.'}
          </p>
        </div>
        {onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Popup Error Alert Banner (Stays on Form Page without Page Redirect) */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-rose-950/90 border border-rose-500/50 flex items-start space-x-3 text-rose-200 text-xs shadow-xl relative">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 pr-6">
            <h4 className="font-bold text-rose-300 mb-0.5 text-xs">Submission Rejection Alert</h4>
            <p className="text-rose-200 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="absolute top-3 right-3 text-rose-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Company Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Cloud Systems"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full glass-input px-3.5 py-2.5 text-xs placeholder-slate-500"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Website URL *</span>
            </label>
            <input
              type="url"
              required
              placeholder="https://acmecloud.example.com"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full glass-input px-3.5 py-2.5 text-xs placeholder-slate-500"
            />
          </div>
        </div>

        {/* Service Interest */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>Service / Solution Requested *</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {SERVICE_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setFormData({ ...formData, serviceInterest: preset })}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  formData.serviceInterest === preset
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            required
            placeholder="Custom service requirement..."
            value={formData.serviceInterest}
            onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
            className="w-full glass-input px-3.5 py-2.5 text-xs placeholder-slate-500"
          />
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span>Estimated Budget Range *</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setFormData({ ...formData, budgetRange: option })}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  formData.budgetRange === option
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Goal */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span>Primary Strategic Goal & Scope *</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe target objectives, project scope, launch timeline, or key technical goals..."
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="w-full glass-input px-3.5 py-2.5 text-xs placeholder-slate-500 resize-none"
          />
        </div>

        {/* Submit Button & Loading State */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-lg font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span className="text-xs font-medium">{loadingSteps[loadingStep]}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>{initialData ? 'Re-Run AI Qualification Analysis' : 'Run AI Qualification Analysis'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
