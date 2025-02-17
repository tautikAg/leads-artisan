import { useState } from 'react'
import { Lead } from '../../types/lead'
import type {  LeadUpdate } from '../../types/lead'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../common/Sheet'
import { format, parseISO } from 'date-fns'
import {  Mail, Building2, Calendar, X } from 'lucide-react'
import { useLeads } from '../../hooks/useLeads'
import "react-datepicker/dist/react-datepicker.css"
import StageHistoryTimeline from '../timeline/StageHistoryTimeline'
import { useStageHistory } from '../../hooks/useStageHistory'

interface LeadDetailsSheetProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Slide-out sheet component that displays detailed lead information.
 * Includes stage history, contact info, and quick actions.
 */
export default function LeadDetailsSheet({ lead, isOpen, onClose }: LeadDetailsSheetProps) {
  const { updateLead } = useLeads({ page: 1 })
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Initialize stage history from lead data
  const { stageHistory, editStageDate } = useStageHistory(lead?.stage_history || [])

  // Handle saving stage date changes
  const handleSaveStageDate = async (index: number, newDate: Date) => {
    if (!lead) return
    
    setIsUpdating(true)
    try {
      editStageDate(index, newDate)
      const newChangedAt = newDate.toISOString()
      
      // Update stage_updated_at if modifying the latest stage
      const isLatestStage = index === stageHistory.length - 1
      
      const updateData: LeadUpdate = {
        name: lead.name,
        email: lead.email,
        company: lead.company,
        current_stage: lead.current_stage,
        engaged: lead.engaged,
        last_contacted: lead.last_contacted,
        status: lead.status,
        stage_history: stageHistory,
        stage_updated_at: isLatestStage ? newChangedAt : lead.stage_updated_at
      }

      await updateLead({ 
        id: lead.id, 
        data: updateData
      })
    } catch (error) {
      console.error('Failed to update stage date:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        {lead && (
          <>
            {/* Wrap SheetHeader in a div with the sticky styling */}
            <div className="sticky top-0 bg-white z-10">
              <SheetHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-xl font-semibold">{lead.name}</SheetTitle>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </div>
                  {/* Add close button */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </SheetHeader>
            </div>
            
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
                <h3 className="text-sm font-medium text-gray-900 mb-4">Stage History</h3>
                <StageHistoryTimeline
                  history={stageHistory}
                  onEditDate={handleSaveStageDate}
                  isUpdating={isUpdating}
                />
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
                      {format(parseISO(lead.last_contacted), 'MMM d, yyyy h:mm aa')}
                    </dd>
                  </div>
                  <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {format(parseISO(lead.created_at), 'MMM d, yyyy h:mm aa')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
} 