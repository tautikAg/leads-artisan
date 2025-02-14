export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  engaged: boolean;
  lastContacted: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadCreate {
  name: string;
  email: string;
  company: string;
  status?: string;
  engaged?: boolean;
}

export interface LeadUpdate {
  name?: string;
  email?: string;
  company?: string;
  status?: string;
  engaged?: boolean;
}

export interface LeadFilters {
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  limit?: number;
}