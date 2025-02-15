import { api } from './axios';
import { Lead, LeadCreate, LeadUpdate, LeadFilters } from '../types/lead';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const leadsApi = {
  getLeads: async (filters: LeadFilters) => {
    const { search, sortBy, sortDesc, page = 1, limit = 10 } = filters;
    
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: limit.toString(),
      ...(sortBy && { sort_by: sortBy }),
      ...(sortDesc !== undefined && { sort_desc: sortDesc.toString() }),
      ...(search && { search }),
    });

    const { data } = await api.get<PaginatedResponse<Lead>>(`/leads?${params}`);
    return data;
  },

  createLead: async (lead: LeadCreate) => {
    const leadData = {
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.engaged ? "Engaged" : "Not Engaged",
      engaged: lead.engaged,
      current_stage: lead.current_stage,
      stage_updated_at: new Date().toISOString(),
      stage_history: [
        {
          from_stage: null,
          to_stage: lead.current_stage,
          changed_at: new Date().toISOString()
        }
      ],
      last_contacted: lead.last_contacted
    };
    const { data } = await api.post<Lead>('/leads/', leadData);
    return data;
  },

  updateLead: async (id: string, lead: LeadUpdate) => {
    const { data } = await api.put<Lead>(`/leads/${id}`, lead);
    return data;
  },

  deleteLead: async (id: string) => {
    const { data } = await api.delete<Lead>(`/leads/${id}`);
    return data;
  },

  exportLeads: async () => {
    const { data } = await api.get('/leads/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};