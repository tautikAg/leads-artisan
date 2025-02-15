import { Lead } from '../../types/lead'
import LeadItem from './LeadItem'
import { useState, useEffect, useRef, useMemo } from 'react'
import { debounce } from 'lodash'
import SearchInput from '../common/SearchInput'
import Select from '../common/Select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FilterSortDropdown from './FilterSortDropdown'

interface LeadListProps {
  initialLeads: Lead[]
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
  onDeleteLead: (id: string) => void
  onSort: (field: string, direction: 'asc' | 'desc') => void
  currentSort: {
    field: string
    direction: 'asc' | 'desc'
  }
}

export default function LeadList({ 
  initialLeads = [],
  isLoading,
  totalLeads,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onAddLead,
  onExportAll,
  onDeleteLead,
  onSort,
  currentSort,
}: LeadListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

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

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    )
  }

  // Update leads when initialLeads changes
  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: pageSize }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-100 rounded-md"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header Section */}
      <div className="">
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
          
          <FilterSortDropdown 
            onSort={onSort}
            currentSort={currentSort}
          />
        </form>

        <div className="mt-2 text-sm text-gray-500">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
        </div>
      </div>

      {/* Table Section */}
      <div className="">
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
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
                <tbody className="divide-y divide-gray-200 bg-white">
                  {Array.isArray(leads) && leads.length > 0 ? (
                    leads.map((lead) => (
                      <LeadItem 
                        key={lead.id} 
                        lead={lead} 
                        onDelete={onDeleteLead}
                        onUpdate={handleLeadUpdate}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        {isLoading ? 'Loading...' : 'No leads found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination - Now inside the table container */}
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Select
                      value={pageSize}
                      onChange={(value) => onPageSizeChange(Number(value))}
                      options={pageSizeOptions}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className={`
                        p-2 rounded-md transition-colors
                        ${currentPage === 1 
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }
                      `}
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => 
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      )
                      .map((pageNum, index, array) => {
                        if (index > 0 && pageNum - array[index - 1] > 1) {
                          return (
                            <span 
                              key={`ellipsis-${pageNum}`} 
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`
                              w-8 h-8 flex items-center justify-center rounded-md text-sm
                              ${currentPage === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                            `}
                            onClick={() => onPageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                    <button
                      className={`
                        p-2 rounded-md transition-colors
                        ${currentPage === totalPages 
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }
                      `}
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className=""></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 