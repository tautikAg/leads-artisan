import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import { LeadCreate, LeadUpdate, LeadFilters, Lead } from '../types/lead';
import { useCallback, useEffect } from 'react';

interface UpdateLeadParams {
  id: string;
  data: LeadUpdate;
}

interface UseLeadsReturn {
  leads: Lead[];
  totalLeads: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  createLead: (data: LeadCreate) => void;
  updateLead: (params: UpdateLeadParams) => void;
  deleteLead: (id: string) => void;
  exportLeads: () => void;
  isUpdating: boolean;
}

export function useLeads(filters: LeadFilters): UseLeadsReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.getLeads(filters),
    staleTime: 1000 * 60, // Cache results for 1 minute
    placeholderData: (previousData) => previousData, // Use previous data while fetching
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    retry: false, // Don't retry failed requests automatically
  });

  // Prefetch next page
  const prefetchNextPage = useCallback(() => {
    if (filters.page && filters.page < (query.data?.total_pages ?? 0)) {
      const nextPage = filters.page + 1;
      queryClient.prefetchQuery({
        queryKey: ['leads', { ...filters, page: nextPage }],
        queryFn: () => leadsApi.getLeads({ ...filters, page: nextPage }),
      });
    }
  }, [filters, query.data?.total_pages, queryClient]);

  // Prefetch when data is available
  useEffect(() => {
    prefetchNextPage();
  }, [prefetchNextPage]);

  const createMutation = useMutation({
    mutationFn: (newLead: LeadCreate) => leadsApi.createLead(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateMutation = useMutation<Lead, Error, UpdateLeadParams>({
    mutationFn: ({ id, data }) => leadsApi.updateLead(id, data),
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

  const exportLeads = async () => {
    try {
      await leadsApi.exportLeads();
    } catch (error) {
      console.error('Failed to export leads:', error);
    }
  };

  return {
    leads: query.data?.items ?? [],
    totalLeads: query.data?.total ?? 0,
    currentPage: query.data?.page ?? filters.page ?? 1,
    pageSize: query.data?.page_size ?? filters.limit ?? 10,
    totalPages: query.data?.total_pages ?? 1,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    createLead: createMutation.mutate,
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    exportLeads,
    isUpdating: updateMutation.isPending
  };
}