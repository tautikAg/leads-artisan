import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import { LeadCreate, LeadUpdate, LeadFilters } from '../types/lead';

export function useLeads(filters: LeadFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.getLeads(filters),
  });

  const createMutation = useMutation({
    mutationFn: (newLead: LeadCreate) => leadsApi.createLead(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, lead }: { id: string; lead: LeadUpdate }) =>
      leadsApi.updateLead(id, lead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createLead: createMutation.mutate,
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
  };
}