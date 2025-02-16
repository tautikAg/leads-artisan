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
    placeholderData: (previousData) => previousData,
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
    updateLead: updateMutation.mutate,
    deleteLead: deleteMutation.mutate,
    exportLeads,
    isUpdating: updateMutation.isPending,
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