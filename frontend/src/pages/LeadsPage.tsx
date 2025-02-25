/**
 * LeadsPage Component
 * 
 * Main page component for lead management.
 * Handles:
 * - Lead data fetching and state management
 * - CRUD operations for leads
 * - Filtering and pagination
 * - Modal interactions
 */
import React, { useState } from 'react'
import { useLeads } from '../hooks/useLeads'
import { LeadFilters } from '../types/lead'
import LeadTable from '../components/list/LeadTable'
import AddLeadModal from '../components/modals/AddLeadModal'
import { showToast } from '../utils/toast'
import { ExportService } from '../utils/exportCsv'

const LeadsPage: React.FC = () => {
  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Filter state management
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortDesc: true,
    search: ''
  })

  // Get lead data and operations from hook
  const { 
    leads = [],
    totalLeads = 0,
    currentPage = 1,
    pageSize = 10,
    totalPages = 1,
    isLoading, 
    createLead,
    deleteLead,
    onPageChange,
    onPageSizeChange,
    onSearch,
    onSort,
    sort
  } = useLeads(filters)


  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id)
      showToast.success('Lead deleted successfully')
      
      // Handle pagination when deleting last item on page
      if (leads.length === 1 && currentPage > 1) {
        setFilters(prev => ({ 
          ...prev, 
          page: Math.max(1, (prev.page ?? 1) - 1)
        }))
      }
    } catch (error) {
      showToast.error('Failed to delete lead')
      console.error('Error deleting lead:', error)
    }
  }

  const handleExportAll = async () => {
    try {
      await ExportService.exportLeads(filters, totalLeads)
      showToast.success('Export completed successfully')
    } catch (error) {
      showToast.error('Failed to export leads')
      console.error('Error exporting leads:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LeadTable 
        initialLeads={leads ?? []}  // Provide empty array as fallback
        isLoading={isLoading}
        totalLeads={totalLeads}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSearch={onSearch}
        onAddLead={() => setIsAddModalOpen(true)}
        onDeleteLead={handleDeleteLead}
        onSort={onSort}
        currentSort={sort}
        onExportAll={handleExportAll}
      />
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createLead}
      />
    </div>
  )
}

export default LeadsPage 