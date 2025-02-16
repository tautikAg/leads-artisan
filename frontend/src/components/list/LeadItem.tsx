import { format } from 'date-fns'
import { Lead, LeadUpdate } from '../../types/lead'
import { MoreHorizontal, Trash2, Edit2, ChevronRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import StageProgress from '../progress/StageProgress'
import LeadDetailsSheet from './LeadDetailsSheet'
import EditLeadModal from '../modals/EditLeadModal'
import { useLeads } from '../../hooks/useLeads'

interface LeadItemProps {
  lead: Lead
  onDelete: (id: string) => void
  onUpdate: (lead: Lead) => void
  isMobile: boolean
}

export default function LeadItem({ lead, onDelete, onUpdate, isMobile }: LeadItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { updateLead } = useLeads({ page: 1 })

  // Add debug logs for state changes
  useEffect(() => {
    console.log('Menu state changed:', showMenu)
  }, [showMenu])

  useEffect(() => {
    console.log('Edit modal state changed:', showEditModal)
  }, [showEditModal])

  useEffect(() => {
    console.log('Delete confirm state changed:', showDeleteConfirm)
  }, [showDeleteConfirm])

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

  const handleEditClick = (e: React.MouseEvent) => {
    try {
      console.log('Edit button clicked for lead:', lead.id)
      e.stopPropagation()
      setShowEditModal(true)
      setShowMenu(false)
      console.log('Edit modal should be open now')
    } catch (error) {
      console.error('Error in handleEditClick:', error)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    try {
      console.log('Delete button clicked for lead:', lead.id)
      e.stopPropagation()
      setShowDeleteConfirm(true)
      setShowMenu(false)
      console.log('Delete confirm should be open now')
    } catch (error) {
      console.error('Error in handleDeleteClick:', error)
    }
  }

  const handleDeleteConfirm = () => {
    try {
      console.log('Confirming delete for lead:', lead.id)
      onDelete(lead.id)
      setShowDeleteConfirm(false)
      console.log('Delete confirmed and modal closed')
    } catch (error) {
      console.error('Error in handleDeleteConfirm:', error)
    }
  }

  const handleEditSubmitAsync = async (data: LeadUpdate) => {
    try {
      console.log('Submitting edit for lead:', lead.id, data)
      await updateLead({ id: lead.id, data })
      setShowEditModal(false)
      console.log('Edit submitted successfully')
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const handleEditSubmit = (id: string, data: LeadUpdate) => {
    handleEditSubmitAsync(data).catch(error => {
      console.error('Error in handleEditSubmit:', error)
    })
  }

  if (isMobile) {
    return (
      <>
        <div className="p-4 space-y-3">
          {/* Lead Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">
                  {getInitials(lead.name)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                <div className="text-sm text-gray-500">{lead.company}</div>
              </div>
            </div>
            <div ref={menuRef} className="relative">
              <button
                onClick={(e) => {
                  console.log('Mobile menu button clicked')
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <button
                    onClick={handleEditClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit2 className="mr-3 h-4 w-4" />
                    Edit Lead
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    Delete Lead
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stage and Status */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <StageProgress currentStage={lead.current_stage} />
            </div>
            <span className={`
              inline-flex rounded-full px-2 text-xs font-medium leading-5
              ${lead.engaged ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {lead.status}
            </span>
          </div>

          {/* View Details Button */}
          <div className="border-t border-gray-100 pt-3">
            <button 
              onClick={() => setShowDetails(true)}
              className="text-sm text-purple-600 font-medium flex items-center"
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Modals */}
          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => {
              console.log('Closing delete confirm')
              setShowDeleteConfirm(false)
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Lead"
            description={`Are you sure you want to delete ${lead.name}? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
          />

          <EditLeadModal
            lead={lead}
            isOpen={showEditModal}
            onClose={() => {
              console.log('Closing edit modal')
              setShowEditModal(false)
            }}
            onSubmit={handleEditSubmit}
            isLoading={false}
          />

          <LeadDetailsSheet 
            lead={lead}
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
          />
        </div>
      </>
    )
  }

  // Desktop view (existing table row code)
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
        onClose={() => {
          console.log('Closing delete confirm')
          setShowDeleteConfirm(false)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        description={`Are you sure you want to delete ${lead.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <EditLeadModal
        lead={lead}
        isOpen={showEditModal}
        onClose={() => {
          console.log('Closing edit modal')
          setShowEditModal(false)
        }}
        onSubmit={handleEditSubmit}
        isLoading={false}
      />

      <LeadDetailsSheet 
        lead={lead}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
} 