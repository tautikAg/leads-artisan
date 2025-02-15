import { Lead } from '../../types/lead'
import LeadItem from './LeadItem'
import { useState, useEffect, useRef, useMemo } from 'react'
import { debounce } from 'lodash'
import SearchInput from '../common/SearchInput'
import Select from '../common/Select'

interface LeadListProps {
  leads: Lead[]
  isLoading: boolean
  totalLeads: number
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSearch: (searchTerm: string) => void
  onAddLead: () => void
  onExportAll: () => void
}

export default function LeadList({ 
  leads, 
  isLoading,
  totalLeads,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onAddLead,
  onExportAll
}: LeadListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce the search callback
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedSearch(value)
  }

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  // Prevent form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const pageSizeOptions = [
    { label: '10 per page', value: 10 },
    { label: '20 per page', value: 20 },
    { label: '50 per page', value: 50 }
  ]

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(pageSize)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-md" />
      ))}
    </div>
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <div className="flex gap-3">
            <button 
              onClick={onAddLead}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="mr-1">+</span> Add Lead
            </button>
            <button 
              onClick={onExportAll}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              <svg className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M15 15l-1.5-1.5M15 5l-1.5 1.5M5 15l1.5-1.5M5 5l1.5 1.5"/>
              </svg>
              Export All
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
          <SearchInput
            ref={searchInputRef}
            placeholder="Search by lead's name, email or company name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          
          <button 
            type="button"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filter & Sort
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="w-8 py-3 pl-6">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engaged
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contacted
              </th>
              <th scope="col" className="w-8 py-3 pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <LeadItem key={lead.id} lead={lead} />
            ))}
          </tbody>
        </table>

        {/* Pagination Section */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Select
                value={pageSize}
                onChange={(value) => onPageSizeChange(Number(value))}
                options={pageSizeOptions}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                className="p-2"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => 
                  pageNum === 1 || 
                  pageNum === totalPages || 
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                )
                .map((pageNum, index, array) => {
                  if (index > 0 && pageNum - array[index - 1] > 1) {
                    return <span key={`ellipsis-${pageNum}`} className="px-2">...</span>;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

              <button
                className="p-2"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div></div>
          </div>
        </div>
      </div>
    </div>
  )
} 