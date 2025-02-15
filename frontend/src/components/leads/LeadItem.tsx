import { format } from 'date-fns'
import { Lead, LeadUpdate } from '../../types/lead'
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import StageProgress from './StageProgress'
import LeadDetailsSheet from './LeadDetailsSheet'
import EditLeadModal from './EditLeadModal'
import { useLeads } from '../../hooks/useLeads'

interface LeadItemProps {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate?: (lead: Lead) => void
}

export default function LeadItem({ lead, onDelete, onUpdate }: LeadItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { updateLead } = useLeads({ page: 1 })

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open details if clicking the checkbox or menu
    if (
      !menuRef.current?.contains(e.target as Node) && 
      !(e.target as HTMLElement).closest('input[type="checkbox"]')
    ) {
      setShowDetails(true)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Calculate stage based on status and engaged
  const getStage = (status: string, engaged: boolean) => {
    if (status === 'Engaged' && engaged) return 4;
    if (status === 'Not Engaged' && !engaged) return 2;
    return 1;
  }

  const handleEditSubmit = async (id: string, data: LeadUpdate) => {
    try {
      updateLead({ id, data })  // Just pass a single object with id and data
      setShowEditModal(false)
      // Note: The UI will update automatically through React Query's cache invalidation
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer"
        onClick={handleRowClick}
      >
        <td className="py-4 pl-6" onClick={e => e.stopPropagation()}>
          <input 
            type="checkbox" 
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">
                {getInitials(lead.name)}
              </span>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
              <div className="text-sm text-gray-500">{lead.email}</div>
            </div>
          </div>
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{lead.company}</div>
        </td>
        <td className="px-3 py-4 text-sm text-gray-500">
          <StageProgress currentStage={lead.current_stage} />
        </td>
        <td className="px-3 py-4 whitespace-nowrap">
          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            lead.engaged
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {lead.status}
          </span>
        </td>
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
          {lead.last_contacted 
            ? format(new Date(lead.last_contacted), 'd MMM, yyyy')
            : '-'
          }
        </td>
        <td className="py-4 pr-6 relative">
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation() // Prevent row click
                setShowMenu(!showMenu)
              }}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditModal(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit2 className="mr-3 h-4 w-4" />
                  Edit Lead
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent row click
                    setShowDeleteConfirm(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-3 h-4 w-4" />
                  Delete Lead
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(lead.id)
          setShowDeleteConfirm(false)
        }}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <EditLeadModal
        lead={lead}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
      />

      <LeadDetailsSheet 
        lead={lead}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
} 