import { useEffect, useState } from 'react'
import { Lead } from '../../types/lead'
import type { StageHistoryItem, LeadUpdate } from '../../types/lead'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../common/Sheet'
import { format, parseISO } from 'date-fns'
import { Edit2, Mail, Phone, Building2, Calendar, Save, X } from 'lucide-react'
import EditLeadModal from './EditLeadModal'
import { useLeads } from '../../hooks/useLeads'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface LeadDetailsSheetProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

interface EditingStage {
  index: number;
  date: Date | null;
}

interface StageHistoryItemProps {
  stage: StageHistoryItem;
  stageIdx: number;
  isLast: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editDate: Date | null;
  onDateChange: (date: Date | null) => void;
  isUpdating: boolean;
  formatDate: (date: string | null) => string;
}

const StageHistoryItem = ({ 
  stage, 
  stageIdx, 
  isLast, 
  isEditing, 
  onEdit, 
  onSave, 
  onCancel, 
  editDate, 
  onDateChange,
  isUpdating,
  formatDate
}: StageHistoryItemProps) => {
  return (
    <div className="relative pb-8">
      {!isLast && (
        <span
          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
          aria-hidden="true"
        />
      )}
      <div className="relative flex space-x-3">
        <div>
          <span className={`
            h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
            ${stage.changed_at ? 'bg-purple-100' : 'bg-gray-100'}
            transition-colors duration-200
          `}>
            <div className={`
              h-2.5 w-2.5 rounded-full 
              ${stage.changed_at ? 'bg-purple-600' : 'bg-gray-400'}
              transition-colors duration-200
            `} />
          </span>
        </div>
        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
          <div className="flex-1">
            <p className="text-sm text-gray-900 font-medium">
              {stage.from_stage ? 
                `Moved from ${stage.from_stage} to ${stage.to_stage}` : 
                `Started as ${stage.to_stage}`
              }
            </p>
            {stage.notes && (
              <p className="mt-0.5 text-sm text-gray-500">
                {stage.notes}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg border border-gray-200 p-1.5">
                <DatePicker
                  selected={editDate}
                  onChange={onDateChange}
                  className="w-36 text-sm bg-transparent outline-none text-gray-600"
                  dateFormat="MMM d, yyyy h:mm aa"
                  placeholderText="Select date & time"
                  calendarClassName="shadow-lg rounded-lg border-gray-200"
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  timeCaption="Time"
                />
                <div className="flex gap-1.5 border-l pl-1.5">
                  <button 
                    onClick={onSave}
                    className={`
                      p-1.5 rounded-md text-green-600 hover:bg-green-50
                      transition-colors duration-200
                      ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={isUpdating}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={onCancel}
                    className="p-1.5 rounded-md text-gray-400 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 min-w-[150px] text-right">
                  {formatDate(stage.changed_at)}
                </span>
                <button 
                  onClick={onEdit}
                  className="group p-1.5 hover:bg-gray-100 rounded-md transition-all duration-200"
                  title="Edit date and time"
                >
                  <Edit2 className="h-2.5 w-2.5 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LeadDetailsSheet({ lead, isOpen, onClose }: LeadDetailsSheetProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const { updateLead, isUpdating } = useLeads({ page: 1 })
  const [editingStage, setEditingStage] = useState<EditingStage | null>(null)
  const [stageHistory, setStageHistory] = useState<StageHistoryItem[]>([])

  useEffect(() => {
    if (lead) {
      setStageHistory(lead.stage_history)
    }
  }, [lead])

  useEffect(() => {
    const handleCloseSheet = () => onClose()
    document.addEventListener('closeSheet', handleCloseSheet)
    return () => document.removeEventListener('closeSheet', handleCloseSheet)
  }, [onClose])

  if (!lead) return null

  const formatDateTime = (dateTime: string | null): string => {
    if (!dateTime) return "N/A"
    try {
      return format(parseISO(dateTime), 'MMM d, yyyy h:mm aa')
    } catch {
      return "N/A"
    }
  }

  const handleEditSubmit = async (id: string, data: any) => {
    try {
      await updateLead({ id, data })
      setShowEditModal(false)
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const handleSaveStageDate = async (index: number) => {
    if (!editingStage || !lead) return

    const newHistory = [...stageHistory]
    newHistory[index] = {
      ...newHistory[index],
      changed_at: editingStage.date?.toISOString() || null
    }

    try {
      const updateData: LeadUpdate = {
        stage_history: newHistory,
        stage_updated_at: newHistory[newHistory.length - 1].changed_at || undefined
      }

      await updateLead({ 
        id: lead.id, 
        data: updateData
      })
      setStageHistory(newHistory)
      setEditingStage(null)
    } catch (error) {
      console.error('Failed to update stage date:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingStage(null)
    setStageHistory(lead.stage_history) // Reset to original
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className={`fixed right-0 top-0 h-full w-full sm:w-[540px] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out`}>
          <SheetHeader>
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-semibold">{lead.name}</SheetTitle>
                <div className="text-sm text-gray-500">{lead.email}</div>
              </div>
            </div>
          </SheetHeader>
          
          <div className="px-4 sm:px-6 py-4">
            {/* Quick Actions */}
            <div className="mb-6 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Send Email</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Schedule Meeting</span>
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Company Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{lead.company}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Status: {lead.status}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage History */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900">Stage History</h3>
              <div className="mt-4 flow-root">
                <ul className="-mb-8">
                  {stageHistory.map((stage, stageIdx) => (
                    <li key={`${stage.to_stage}-${stageIdx}`}>
                      <StageHistoryItem
                        stage={stage}
                        stageIdx={stageIdx}
                        isLast={stageIdx === stageHistory.length - 1}
                        isEditing={editingStage?.index === stageIdx}
                        onEdit={() => setEditingStage({ 
                          index: stageIdx, 
                          date: stage.changed_at ? new Date(stage.changed_at) : null 
                        })}
                        onSave={() => handleSaveStageDate(stageIdx)}
                        onCancel={handleCancelEdit}
                        editDate={editingStage?.date ?? null}
                        onDateChange={(date) => setEditingStage({ index: stageIdx, date })}
                        isUpdating={isUpdating}
                        formatDate={formatDateTime}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Details</h3>
              <dl className="divide-y divide-gray-100 bg-gray-50 rounded-lg overflow-hidden">
                <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {lead.status}
                  </dd>
                </div>
                <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Last Contacted</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formatDateTime(lead.last_contacted)}
                  </dd>
                </div>
                <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formatDateTime(lead.created_at)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <EditLeadModal
        lead={lead}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        isLoading={isUpdating}
      />
    </>
  )
} 