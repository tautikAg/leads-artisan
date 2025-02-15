import { useEffect, useState } from 'react'
import { Lead } from '../../types/lead'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../common/Sheet'
import { format } from 'date-fns'
import { Edit2, Mail, Phone, Building2, Calendar } from 'lucide-react'
import EditLeadModal from './EditLeadModal'
import { useLeads } from '../../hooks/useLeads'

interface LeadDetailsSheetProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export default function LeadDetailsSheet({ lead, isOpen, onClose }: LeadDetailsSheetProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const { updateLead, isUpdating } = useLeads({ page: 1 })

  useEffect(() => {
    const handleCloseSheet = () => onClose()
    document.addEventListener('closeSheet', handleCloseSheet)
    return () => document.removeEventListener('closeSheet', handleCloseSheet)
  }, [onClose])

  if (!lead) return null

  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    try {
      return format(new Date(date), 'MMM d, yyyy')
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <div className="flex justify-between items-start">
              <div>
                <SheetTitle className="text-xl font-semibold">{lead.name}</SheetTitle>
                <div className="text-sm text-gray-500">{lead.email}</div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Edit2 className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </SheetHeader>
          
          <div className="px-6 py-4">
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
              <div className="mt-2 flow-root">
                <ul className="-mb-8">
                  {lead.stage_history.map((stage, stageIdx) => (
                    <li key={`${stage.to_stage}-${stageIdx}`}>
                      <div className="relative pb-8">
                        {stageIdx !== lead.stage_history.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`
                              h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                              ${stage.changed_at ? 'bg-purple-100' : 'bg-gray-100'}
                            `}>
                              <div className={`
                                h-2.5 w-2.5 rounded-full 
                                ${stage.changed_at ? 'bg-purple-600' : 'bg-gray-400'}
                              `} />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                {stage.from_stage ? 
                                  `Moved from ${stage.from_stage} to ${stage.to_stage}` : 
                                  `Started as ${stage.to_stage}`
                                }
                              </p>
                              {stage.notes && (
                                <p className="mt-0.5 text-xs text-gray-400">
                                  {stage.notes}
                                </p>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDate(stage.changed_at)}
                            </div>
                          </div>
                        </div>
                      </div>
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
                    {formatDate(lead.last_contacted)}
                  </dd>
                </div>
                <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formatDate(lead.created_at)}
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