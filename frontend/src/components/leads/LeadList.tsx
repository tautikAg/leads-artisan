import { Lead } from '../../types/lead'
import LeadItem from './LeadItem'
import { useState, useEffect, useRef, useMemo } from 'react'
import { debounce } from 'lodash'
import SearchInput from '../common/SearchInput'
import Select from '../common/Select'
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react'
import FilterSortDropdown from './FilterSortDropdown'
import ExportMenu from './ExportMenu'
import { format } from 'date-fns'
import StageProgress from './StageProgress'

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

// First, let's extract the pagination component to avoid duplication
const Pagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  onPageChange, 
  onPageSizeChange, 
  pageSizeOptions 
}: { 
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions: { label: string; value: number }[]
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    <div className="w-full sm:w-auto">
      <Select
        value={pageSize}
        onChange={(value) => onPageSizeChange(Number(value))}
        options={pageSizeOptions}
        className="w-full sm:w-32"
      />
    </div>

    <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible py-2 sm:py-0">
      <button
        className={`
          p-2 rounded-md transition-colors shrink-0
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
      
      <div className="flex items-center gap-2">
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
                  className="px-2 text-gray-500 shrink-0"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-md text-sm shrink-0
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
      </div>

      <button
        className={`
          p-2 rounded-md transition-colors shrink-0
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
    <div></div>
  </div>
)

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

  const exportToCSV = (leads: Lead[]) => {
    // Define headers
    const headers = [
      'Name',
      'Company',
      'Stage',
      'Engaged',
      'Last Contacted',
      'Email'
    ];

    // Convert leads to CSV rows
    const rows = leads.map(lead => [
      lead.name,
      lead.company,
      lead.current_stage,
      lead.engaged ? 'Yes' : 'No',
      lead.last_contacted ? format(new Date(lead.last_contacted), 'MMM d, yyyy') : '-',
      lead.email
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
    <div className="w-full">
      {/* Header Section */}
      <div className="px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Leads</h1>
          <div className="flex gap-3">
            <button 
              onClick={onAddLead}
              className="flex-1 sm:flex-none inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </button>
            <ExportMenu onExport={() => exportToCSV(leads)} />
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchInput
            ref={searchInputRef}
            placeholder="Search leads..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
          
          <FilterSortDropdown 
            onSort={onSort}
            currentSort={currentSort}
          />
        </form>

        <div className="mt-4 text-sm text-gray-500">
          Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
        </div>
      </div>

      {/* Mobile List View */}
      <div className="block sm:hidden mt-4">
        {Array.isArray(leads) && leads.length > 0 ? (
          <div className="space-y-3 px-4">
            {leads.map((lead) => (
              <div 
                key={lead.id}
                className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                onClick={() => {/* Handle lead click */}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {lead.name.split(' ').map(part => part[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </div>
                  {/* Mobile menu */}
                  <button className="p-2 hover:bg-gray-50 rounded-full">
                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Company</span>
                    <span className="text-sm font-medium">{lead.company}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stage</span>
                    <StageProgress currentStage={lead.current_stage} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      lead.engaged
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Last Contacted</span>
                    <span className="text-sm">
                      {lead.last_contacted 
                        ? format(new Date(lead.last_contacted), 'd MMM, yyyy')
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            {isLoading ? 'Loading...' : 'No leads found'}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
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

              {/* Desktop Pagination - Inside table container */}
              <div className="px-6 py-4 bg-white border-t border-gray-200 hidden sm:block">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  pageSizeOptions={pageSizeOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pagination - Outside table */}
      <div className="block sm:hidden px-4 sm:px-6 py-4 bg-white border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      </div>
    </div>
  )
} 