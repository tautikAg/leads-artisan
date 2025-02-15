import { format } from 'date-fns'
import { Lead } from '../../types/lead'
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'
import StageProgress from './StageProgress'
import LeadDetailsSheet from './LeadDetailsSheet'

interface LeadItemProps {
  lead: Lead
  onEdit?: (lead: Lead) => void
  onDelete?: (id: string) => void
}

export default function LeadItem({ lead, onEdit, onDelete }: LeadItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <>
      <tr 
        className="hover:bg-gray-50 cursor-pointer" 
        onClick={() => setShowDetails(true)}
      >
        <td className="py-4 pl-6">
          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
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
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-400" />
          </button>

          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 divide-y divide-gray-100"
            >
              <div className="py-1">
                <button
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    onEdit?.(lead)
                    setShowMenu(false)
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              </div>
              <div className="py-1">
                <button
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={() => {
                    setShowDeleteConfirm(true)
                    setShowMenu(false)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </td>
      </tr>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDelete?.(lead.id)
          setShowDeleteConfirm(false)
        }}
        title="Delete Lead"
        description={`Are you sure you want to delete ${lead.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <LeadDetailsSheet 
        lead={lead}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  )
} 