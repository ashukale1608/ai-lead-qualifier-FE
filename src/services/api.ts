import type { LeadRequest, LeadResponse, LeadStats } from '../types/lead';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1/leads';

// Local storage fallback cache key for seamless demo execution
const LOCAL_STORAGE_KEY = 'lead_qualifier_saved_leads';

const getLocalLeads = (): LeadResponse[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialMockLeads();
  } catch {
    return getInitialMockLeads();
  }
};

const saveLocalLead = (lead: LeadResponse) => {
  try {
    const existing = getLocalLeads();
    const updated = [lead, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
};

export const qualifyLead = async (payload: LeadRequest): Promise<LeadResponse> => {
  console.info(`[LeadPulse API] POST ${API_BASE_URL}/qualify - Submitting lead qualification for: "${payload.companyName}"`);
  try {
    const res = await fetch(`${API_BASE_URL}/qualify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (res.ok && (json.success === undefined || json.success === true)) {
      const data = json.data !== undefined ? json.data : json;
      console.info(`[LeadPulse API] REST API qualification success for "${payload.companyName}": Level=${data.qualification}, Score=${data.score}`);
      saveLocalLead(data);
      return data;
    } else {
      const errMsg = json.message || `API error (${res.status}): ${res.statusText}`;
      console.warn(`[LeadPulse API] REST API returned error status ${res.status}: ${errMsg}`);
      throw new Error(errMsg);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('fetch failed')) {
      throw err;
    }
    console.warn('[LeadPulse API] Backend server unreachable at http://localhost:8080. Executing client-side fallback AI engine.', err);
  }

  // Client-Side AI Heuristic Fallback (Executed ONLY if backend server is completely offline/unreachable)
  await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate AI processing delay
  const simulated = generateClientSideQualification(payload);
  console.info(`[LeadPulse API] Client-side fallback AI evaluation completed for "${payload.companyName}": Level=${simulated.qualification}, Score=${simulated.score}`);
  saveLocalLead(simulated);
  return simulated;
};

export const updateAndRequalifyLead = async (id: string, payload: LeadRequest): Promise<LeadResponse> => {
  console.info(`[LeadPulse API] PUT ${API_BASE_URL}/${id} - Re-qualifying lead for: "${payload.companyName}"`);
  try {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (res.ok && (json.success === undefined || json.success === true)) {
      const data = json.data !== undefined ? json.data : json;
      console.info(`[LeadPulse API] REST API re-qualification success for "${payload.companyName}": Level=${data.qualification}, Score=${data.score}`);
      saveLocalLead(data);
      return data;
    } else {
      const errMsg = json.message || `API error (${res.status}): ${res.statusText}`;
      console.warn(`[LeadPulse API] REST API update returned error status ${res.status}: ${errMsg}`);
      throw new Error(errMsg);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('fetch failed')) {
      throw err;
    }
    console.warn('[LeadPulse API] Backend server unreachable. Executing client-side fallback AI engine for update.', err);
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  const simulated = generateClientSideQualification(payload);
  simulated.id = id;
  saveLocalLead(simulated);
  return simulated;
};

export const fetchAllLeads = async (searchQuery?: string): Promise<LeadResponse[]> => {
  try {
    const url = searchQuery
      ? `${API_BASE_URL}?search=${encodeURIComponent(searchQuery)}`
      : API_BASE_URL;
    console.info(`[LeadPulse API] GET ${url} - Fetching qualified leads`);
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      const leads = json.data !== undefined ? json.data : json;
      console.info(`[LeadPulse API] Received ${leads.length} leads from PostgreSQL database`);
      return leads;
    }
  } catch (err) {
    console.warn('[LeadPulse API] Backend server unreachable. Using local storage cached leads fallback.', err);
  }

  let leads = getLocalLeads();
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    leads = leads.filter(
      (l) =>
        l.companyName.toLowerCase().includes(q) ||
        l.websiteUrl.toLowerCase().includes(q) ||
        l.serviceInterest.toLowerCase().includes(q)
    );
  }
  console.info(`[LeadPulse API] Returned ${leads.length} leads from local storage fallback`);
  return leads;
};

export const fetchLeadStats = async (): Promise<LeadStats> => {
  try {
    console.info(`[LeadPulse API] GET ${API_BASE_URL}/stats - Fetching lead metrics`);
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (res.ok) {
      const json = await res.json();
      const stats = json.data !== undefined ? json.data : json;
      console.info('[LeadPulse API] Received stats from backend PostgreSQL database:', stats);
      return stats;
    }
  } catch (err) {
    console.warn('[LeadPulse API] Backend server unreachable. Calculating stats from local storage fallback.', err);
  }

  const leads = getLocalLeads();
  const total = leads.length;
  const high = leads.filter((l) => l.qualification === 'HIGH').length;
  const medium = leads.filter((l) => l.qualification === 'MEDIUM').length;
  const low = leads.filter((l) => l.qualification === 'LOW').length;

  const totalScore = leads.reduce((acc, l) => acc + l.score, 0);
  const avgScore = total > 0 ? Math.round((totalScore / total) * 10) / 10 : 0;
  const highPct = total > 0 ? Math.round((high / total) * 100 * 10) / 10 : 0;

  const budgetDist: Record<string, number> = {};
  leads.forEach((l) => {
    budgetDist[l.budgetRange] = (budgetDist[l.budgetRange] || 0) + 1;
  });

  return {
    totalLeads: total,
    highQualificationCount: high,
    mediumQualificationCount: medium,
    lowQualificationCount: low,
    highQualificationPercentage: highPct,
    averageFitScore: avgScore,
    budgetDistribution: budgetDist,
  };
};

function extractNumericBudget(budgetString: string): number {
  if (!budgetString) return 0;
  const lower = budgetString.toLowerCase();
  const isUnderPrefix = lower.includes('under') || lower.includes('<') || lower.includes('less');

  const cleaned = lower
    .replace(/(\d+)\s*k\b/g, '$1000')
    .replace(/(?<=\d),(?=\d)/g, '')
    .replace(/[^0-9]/g, ' ');

  const numbers = cleaned.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;

  const sum = numbers.reduce((acc, num) => acc + num, 0);
  let avg = sum / numbers.length;

  if (isUnderPrefix) {
    avg = avg * 0.5; // "Under $5,000" -> 2500.0
  }

  return avg;
}

function generateClientSideQualification(payload: LeadRequest): LeadResponse {
  const budgetAmount = extractNumericBudget(payload.budgetRange);
  const goal = payload.goal.toLowerCase();
  const service = payload.serviceInterest.toLowerCase();

  let score = 40;
  let qual: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  const insights: string[] = [];
  const missing: string[] = [];

  const isEnterpriseScope = service.includes('cloud') || service.includes('ai') || 
                            service.includes('devops') || service.includes('web') || 
                            service.includes('security') || service.includes('cyber');

  if (budgetAmount >= 50000) {
    score += 45;
    insights.push('High enterprise budget ($50k+) indicates strong purchasing capability');
  } else if (budgetAmount >= 25000 && budgetAmount < 50000) {
    score += 30;
    insights.push('Solid commercial budget ($25k - $50k) suitable for custom development');
  } else if (budgetAmount >= 10000 && budgetAmount < 25000) {
    score += 15;
    insights.push('Mid-tier budget ($10k - $25k) fits standard solution implementation');
  } else if (budgetAmount >= 5000 && budgetAmount < 10000) {
    score += 5;
    insights.push('Entry-level budget ($5k - $10k) suitable for starter scope');
  } else if (budgetAmount < 5000) {
    score -= 25;
    insights.push('Constrained budget tier (< $5k) is below customary implementation costs');
    missing.push('Flexible budget authorization and scope reduction approvals');
  }

  if (goal.length > 60) {
    score += 10;
    insights.push('Well-articulated strategic goal demonstrates mature project planning');
  } else if (goal.length < 25) {
    score -= 10;
    missing.push('Quantifiable ROI targets and specific success metrics');
  }

  if (service.includes('ai') || service.includes('cloud') || service.includes('devops') || service.includes('custom')) {
    score += 5;
    insights.push('High strategic fit with core solution capabilities');
  }

  missing.push('Expected project completion/launch deadline');
  missing.push('Primary decision maker contacts and procurement workflow');

  // Hard cap for low-budget enterprise requests
  if (isEnterpriseScope && budgetAmount < 5000) {
    score = Math.min(38, score);
  } else if (isEnterpriseScope && budgetAmount < 10000) {
    score = Math.min(62, score);
  }

  score = Math.max(15, Math.min(98, score));

  let action = '';
  let reasoning = '';

  if (score >= 75) {
    qual = 'HIGH';
    reasoning = `${payload.companyName} is a high-intent opportunity. Budget tier (${payload.budgetRange}) strongly aligns with requested ${payload.serviceInterest}.`;
    action = 'Priority Lead: Schedule a 30-minute Discovery Session with a Principal Solutions Architect within 24h.';
  } else if (score >= 50) {
    qual = 'MEDIUM';
    reasoning = `${payload.companyName} demonstrates solid baseline fit for ${payload.serviceInterest}, though scope and budget boundary definition is required.`;
    action = 'Send our detailed technical brochure and offer a pre-recorded custom architecture video walkthrough.';
  } else {
    qual = 'LOW';
    reasoning = `${payload.companyName} presents a low strategic fit. Budget (${payload.budgetRange}) is constrained for the requested ${payload.serviceInterest}.`;
    action = 'Route to self-serve documentation, productized starter tiers, or automated nurture sequences.';
  }

  return {
    id: crypto.randomUUID(),
    companyName: payload.companyName,
    websiteUrl: payload.websiteUrl,
    serviceInterest: payload.serviceInterest,
    budgetRange: payload.budgetRange,
    goal: payload.goal,
    qualification: qual,
    score,
    reasoning,
    missingInformation: missing,
    recommendedAction: action,
    keyInsights: insights,
    createdAt: new Date().toISOString(),
  };
}

function getInitialMockLeads(): LeadResponse[] {
  return [
    {
      id: 'mock-1',
      companyName: 'Acme Cloud Solutions',
      websiteUrl: 'https://acmecloud.example.com',
      serviceInterest: 'Enterprise Cloud Migration & DevOps',
      budgetRange: '$50,000 - $100,000',
      goal: 'Migrate legacy monolithic architecture to Kubernetes microservices before Q4.',
      qualification: 'HIGH',
      score: 92,
      reasoning: 'Strong enterprise budget alignment, clear strategic objective, and well-defined technical scope.',
      missingInformation: ['Current cloud provider details', 'Internal decision-making timeline', 'Security compliance standards required'],
      recommendedAction: 'Schedule an urgent 30-minute discovery call with a Senior Cloud Solutions Architect.',
      keyInsights: ['$50k+ budget indicates immediate buying power', 'Clear Q4 target launch timeline', 'High alignment with core DevOps service offering'],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'mock-2',
      companyName: 'GreenLeaf Organics',
      websiteUrl: 'https://greenleaforganics.example.com',
      serviceInterest: 'SEO & Content Marketing',
      budgetRange: '$5,000 - $10,000',
      goal: 'Increase organic e-commerce traffic by 40% in 6 months.',
      qualification: 'MEDIUM',
      score: 68,
      reasoning: 'Good domain fit for organic marketing, but budget is on the lower tier for comprehensive content creation.',
      missingInformation: ['Current monthly organic traffic numbers', 'Target product SKUs', 'In-house content capacity'],
      recommendedAction: 'Send our standard E-commerce SEO Growth Package brochure and offer a pre-recorded video audit.',
      keyInsights: ['Realistic growth objective (40% in 6m)', 'Budget fits starter tier', 'Requires scope boundary definition'],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: 'mock-3',
      companyName: 'TechStart Micro',
      websiteUrl: 'https://techstart.example.com',
      serviceInterest: 'Custom AI Model Training',
      budgetRange: 'Under $1,000',
      goal: 'Build a custom GPT model for customer support.',
      qualification: 'LOW',
      score: 35,
      reasoning: 'Budget under $1,000 is significantly below minimum threshold for custom model training and fine-tuning.',
      missingInformation: ['Monthly active user count', 'API hosting budget', 'Data labeling availability'],
      recommendedAction: 'Direct to our self-serve documentation and standard SaaS chatbot template tier.',
      keyInsights: ['Unrealistic budget-to-scope ratio', 'High support requirement', 'Best fit for self-serve template'],
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
  ];
}
