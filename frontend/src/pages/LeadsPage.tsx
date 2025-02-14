import { useState } from 'react'
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
    sortDesc: true
  })

  const { leads, isLoading, error, createLead } = useLeads(filters)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Add Lead
        </button>
      </div>

      {error ? (
        <div className="text-red-500">Error loading leads</div>
      ) : (
        <LeadList 
          leads={leads}
          isLoading={isLoading}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
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