export type QualificationLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface LeadRequest {
  companyName: string;
  websiteUrl: string;
  serviceInterest: string;
  budgetRange: string;
  goal: string;
}

export interface LeadResponse {
  id: string;
  companyName: string;
  websiteUrl: string;
  serviceInterest: string;
  budgetRange: string;
  goal: string;
  qualification: QualificationLevel;
  score: number;
  reasoning: string;
  missingInformation: string[];
  recommendedAction: string;
  keyInsights: string[];
  createdAt: string;
}

export interface LeadStats {
  totalLeads: number;
  highQualificationCount: number;
  mediumQualificationCount: number;
  lowQualificationCount: number;
  highQualificationPercentage: number;
  averageFitScore: number;
  budgetDistribution: Record<string, number>;
}
