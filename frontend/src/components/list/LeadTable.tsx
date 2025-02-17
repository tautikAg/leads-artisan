import { Lead } from '../../types/lead'
import LeadItem from './LeadItem'
import { useState, useEffect, useRef, useMemo } from 'react'
import { debounce } from 'lodash'
import SearchInput from '../common/SearchInput'
import { Plus, MoreHorizontal } from 'lucide-react'
import FilterSortDropdown from './FilterSortDropdown'
import ExportMenu from './ExportMenu'
import LeadDetailsSheet from './LeadDetailsSheet'
import { Menu, Transition } from '@headlessui/react'
import LoadingSpinner from '../common/LoadingSpinner'
import Pagination from '../common/Pagination'

interface LeadTableProps {
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
  onDeleteLead: (id: string) => void
  onSort: (field: string, direction: 'asc' | 'desc') => void
  currentSort: {
    field: string
    direction: 'asc' | 'desc'
  }
  onExportAll: () => Promise<void>
}

/**
 * Main lead list component that handles:
 * - Pagination
 * - Sorting
 * - Filtering
 * - Lead CRUD operations
 */
export default function LeadTable({ 
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
  onDeleteLead,
  onSort,
  currentSort,
  onExportAll,
}: LeadTableProps) {
  // State for search and selected leads
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState<string | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  // Debounce search to prevent excessive API calls
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

  // Update leads when initialLeads changes
  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showMobileMenu && !(event.target as Element).closest('.mobile-menu-container')) {
        setShowMobileMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  // Add handler for select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all visible leads
      setSelectedLeads(new Set(leads.map(lead => lead.id)))
    } else {
      // Deselect all
      setSelectedLeads(new Set())
    }
  }

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
          <h1 className="text-2xl sm:text-4xl font-[600] text-gray-900 font-fraunces">Leads</h1>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-3">
            <button 
              onClick={onAddLead}
              className="flex-1 sm:flex-none inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </button>
            <ExportMenu 
              onExportAll={onExportAll}
            />
          </div>

          {/* Mobile Actions Menu */}
          <div className="sm:hidden absolute right-4 top-4 z-30">
            <Menu as="div" className="relative">
              <Menu.Button className="p-2 hover:bg-gray-50 rounded-full">
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
              </Menu.Button>

              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-in"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onAddLead}
                        className={`
                          flex w-full items-center px-4 py-2 text-sm
                          ${active ? 'bg-gray-50' : ''}
                        `}
                      >
                        <Plus className="h-4 w-4 mr-3 text-gray-400" />
                        Add Lead
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {() => (
                      <ExportMenu 
                        onExportAll={onExportAll}
                      />
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
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
        {isLoading ? (
          <LoadingSpinner text="Loading leads..." />
        ) : Array.isArray(leads) && leads.length > 0 ? (
          <div className="space-y-2 px-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-white rounded-lg border border-gray-200">
                <LeadItem 
                  lead={lead} 
                  onDelete={onDeleteLead}
                  isMobile={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            No leads found
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-8 py-3 pl-6">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={selectedLeads.size === leads.length && leads.length > 0}
                        onChange={handleSelectAll}
                      />
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={7}>
                        <LoadingSpinner text="Loading leads..." />
                      </td>
                    </tr>
                  ) : Array.isArray(leads) && leads.length > 0 ? (
                    leads.map((lead) => (
                      <LeadItem
                        key={lead.id}
                        lead={lead}
                        onDelete={onDeleteLead}
                        isMobile={false}
                        isSelected={selectedLeads.has(lead.id)}
                        onSelectChange={(checked) => {
                          const newSelected = new Set(selectedLeads)
                          if (checked) {
                            newSelected.add(lead.id)
                          } else {
                            newSelected.delete(lead.id)
                          }
                          setSelectedLeads(newSelected)
                        }}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-gray-500">
                        No leads found
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
      <div className="block sm:hidden px-4 sm:px-6 py-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      </div>

      {/* Lead Details Sheet */}
      <LeadDetailsSheet
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </div>
  )
} 