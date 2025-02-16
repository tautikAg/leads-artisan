import React, { useState, useEffect } from 'react'
import { Lead } from '../types/lead'
import LeadList from '../components/list/LeadList'
import { leadsApi } from '../api/leads'
import { SortDirection } from '../types/common'

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalLeads, setTotalLeads] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [currentSort, setCurrentSort] = useState<{
    field: string;
    direction: SortDirection;
  }>({
    field: 'created_at',
    direction: 'desc'
  });

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await leadsApi.getLeads({
        page: currentPage,
        limit: pageSize
      })
      setLeads(response.items)
      setTotalLeads(response.total)
      setTotalPages(response.total_pages)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [currentPage, pageSize])

  const handleSearch = async (searchTerm: string) => {
    try {
      setIsLoading(true)
      const response = await leadsApi.getLeads({
        page: 1,
        limit: pageSize,
        search: searchTerm
      })
      setLeads(response.items)
      setTotalLeads(response.total)
      setTotalPages(response.total_pages)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error searching leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLead = async (id: string) => {
    try {
      await leadsApi.deleteLead(id)
      fetchLeads() // Refresh the list
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const handleSort = (field: string, direction: SortDirection) => {
    setCurrentSort({ field, direction });
    // Add your sorting logic here
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <LeadList
        initialLeads={leads}
        isLoading={isLoading}
        totalLeads={totalLeads}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearch={handleSearch}
        onAddLead={() => {/* Add lead logic */}}
        onExportAll={leadsApi.exportLeads}
        onDeleteLead={handleDeleteLead}
        onSort={handleSort}
        currentSort={currentSort}
      />
    </div>
  )
}

export default Leads 