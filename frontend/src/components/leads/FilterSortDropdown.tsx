import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp,
  ListFilter
} from 'lucide-react'

interface FilterSortDropdownProps {
  onSort: (field: string, direction: 'asc' | 'desc') => void
  currentSort: {
    field: string
    direction: 'asc' | 'desc'
  }
}

const sortOptions = [
  { label: 'Name', field: 'name' },
  { label: 'Company', field: 'company' },
  { label: 'Last Contacted', field: 'last_contacted' }
]

export default function FilterSortDropdown({ 
  onSort, 
  currentSort = { field: 'created_at', direction: 'desc' }
}: FilterSortDropdownProps) {
  return (
    <Menu as="div" className="relative z-10">
      <Menu.Button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all h-10 whitespace-nowrap">
        <ListFilter className="w-4 h-4 mr-2" />
        Filter & Sort
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none py-1">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
            Sort by
          </div>
          {sortOptions.map((option) => (
            <Menu.Item key={option.field}>
              {({ active }: { active: boolean }) => (
                <button
                  className={`
                    flex items-center justify-between w-full px-3 py-2 text-sm text-gray-900
                    ${active ? 'bg-gray-50' : ''}
                  `}
                  onClick={() => {
                    const newDirection = 
                      currentSort?.field === option.field && currentSort?.direction === 'asc'
                        ? 'desc' 
                        : 'asc'
                    onSort(option.field, newDirection)
                  }}
                >
                  <span>{option.label}</span>
                  <span className="text-gray-400">
                    {currentSort?.field === option.field ? (
                      currentSort?.direction === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 