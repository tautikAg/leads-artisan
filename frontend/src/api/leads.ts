import { api } from './axios';
import { Lead, LeadCreate, LeadUpdate, LeadFilters } from '../types/lead';

export const leadsApi = {
  getLeads: async (filters: LeadFilters) => {
    const { search, sortBy, sortDesc, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;
    
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(sortBy && { sort_by: sortBy }),
      ...(sortDesc !== undefined && { sort_desc: sortDesc.toString() }),
      ...(search && { search }),
    });

    const { data } = await api.get<Lead[]>(`/leads?${params}`);
    return data;
  },

  createLead: async (lead: LeadCreate) => {
    const { data } = await api.post<Lead>('/leads', lead);
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
};