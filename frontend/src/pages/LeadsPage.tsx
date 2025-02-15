import { useState, useCallback } from 'react'
import { useLeads } from '../hooks/useLeads'
import { LeadFilters } from '../types/lead'
import LeadList from '../components/leads/LeadList'
import AddLeadModal from '../components/leads/AddLeadModal'

export default function LeadsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortDesc: true,
    search: ''
  })

  const { 
    leads = [],
    totalLeads = 0,
    currentPage = 1,
    pageSize = 10,
    totalPages = 1,
    isLoading, 
    error, 
    createLead,
    exportLeads 
  } = useLeads(filters)

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ 
      ...prev, 
      search: searchTerm, 
      page: 1 
    }))
  }, [])

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, limit: pageSize, page: 1 }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error ? (
        <div className="text-red-500">Error loading leads</div>
      ) : (
        <LeadList 
          leads={leads}
          isLoading={isLoading}
          totalLeads={totalLeads}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSearch={handleSearch}
          onAddLead={() => setIsAddModalOpen(true)}
          onExportAll={exportLeads}
        />
      )}

      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createLead}
      />
    </div>
  )
} 