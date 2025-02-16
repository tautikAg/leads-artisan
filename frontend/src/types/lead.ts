import { LeadStage } from '../constants/stages'
export type { LeadStage }

export interface StageHistory {
  from_stage: LeadStage | null
  to_stage: LeadStage
  changed_at: string
  notes?: string
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  engaged: boolean;
  current_stage: LeadStage;
  stage_updated_at: string;
  stage_history: StageHistory[];
  last_contacted: string;
  created_at: string;
  updated_at: string;
}

export interface LeadCreate {
  name: string;
  email: string;
  company: string;
  current_stage: LeadStage;
  status?: string;
  engaged: boolean;
  last_contacted: string;
}

export interface LeadUpdate {
  name?: string;
  email?: string;
  company?: string;
  current_stage?: LeadStage;
  engaged?: boolean;
  last_contacted?: string;
  status?: string;
  stage_history?: StageHistoryItem[];
  stage_updated_at?: string;
}

export interface StageHistoryItem {
  from_stage: LeadStage | null;
  to_stage: LeadStage;
  changed_at: string;
  notes?: string;
}

export interface LeadFilters {
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  limit?: number;
}