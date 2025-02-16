/**
 * useLeads Hook
 * 
 * Central hook for lead management functionality.
 * Provides comprehensive lead operations including:
 * - CRUD operations
 * - Pagination
 * - Sorting
 * - Filtering
 * - Data prefetching
 * - Export functionality
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads';
import { LeadCreate, LeadUpdate, LeadFilters, Lead } from '../types/lead';
import { useCallback, useEffect, useState } from 'react';
import { showToast } from '../utils/toast';

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

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
  sort: { field: string; direction: 'asc' | 'desc' };
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onSearch: (search: string) => void;
}

export function useLeads(initialFilters: LeadFilters): UseLeadsReturn {
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);
  const queryClient = useQueryClient();

  // Main query for fetching leads
  const query = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsApi.getLeads(filters),
    staleTime: 1000 * 60,
    placeholderData: (previousData) => {
      return previousData;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Prefetch next page for smoother pagination
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

  // Mutations for CRUD operations
  const createMutation = useMutation({
    mutationFn: (newLead: LeadCreate) => leadsApi.createLead(newLead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error: any) => {
      // Handle specific error cases
      if (error.response?.status === 409) {
        showToast.error('A lead with this email already exists');
      } else if (error.response?.data?.detail) {
        showToast.error(error.response.data.detail);
      } else {
        showToast.error('Failed to create lead');
      }
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LeadUpdate }) => {
      const updateData = {
        ...data,
        ...(data.stage_history && { 
          stage_history: data.stage_history,
          stage_updated_at: data.stage_updated_at 
        })
      };
      
      return await leadsApi.updateLead(id, updateData);
    },
    onSuccess: (updatedLead) => {
      queryClient.setQueryData<PaginatedResponse<Lead>>(
        ['leads'],
        (old: PaginatedResponse<Lead> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((lead: Lead) =>
              lead.id === updatedLead.id ? updatedLead : lead
            ),
          };
        }
      );
    },
    onError: (error) => {
      console.error('Update mutation error:', error);
      showToast.error('Failed to update lead');
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

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortDesc: direction === 'desc',
      page: 1 // Reset to first page when sorting changes
    }));
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
    updateLead: (params: UpdateLeadParams) => {
      console.log('updateLead called with params:', params);
      updateLead.mutate(params);
    },
    deleteLead: deleteMutation.mutate,
    exportLeads,
    isUpdating: updateLead.isPending,
    sort: {
      field: filters.sortBy ?? 'created_at',
      direction: filters.sortDesc ? 'desc' : 'asc'
    },
    onSort: handleSort,
    onPageChange: (page: number) => setFilters(prev => ({ ...prev, page })),
    onPageSizeChange: (limit: number) => setFilters(prev => ({ ...prev, limit, page: 1 })),
    onSearch: (search: string) => setFilters(prev => ({ ...prev, search, page: 1 }))
  };
}