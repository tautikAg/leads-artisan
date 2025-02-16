import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Lead, LeadStage, LeadUpdate } from '../../types/lead'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useStageHistory } from '../../hooks/useStageHistory'
import { LEAD_STAGES } from '../../constants/leads'
import StageProgressBar from '../progress/StageProgressBar'
import StageStep from '../progress/StageStep'
import EngagementStatusButtons from '../form/EngagementStatusButtons'
import { FormInput } from '../common/FormInput'
import { useLeadForm } from '../../hooks/useLeadForm'
import { showToast } from '../../utils/toast'
import { validateEmail } from '../../utils/validators'

interface EditLeadModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, data: LeadUpdate) => void
  isLoading?: boolean
}

/**
 * Modal component for editing existing leads.
 * Manages form state, validation, and stage history tracking.
 */
export default function EditLeadModal({ lead, isOpen, onClose, onSubmit, isLoading }: EditLeadModalProps) {
  const [emailError, setEmailError] = useState<string>('')
  // Use form management hook with initial lead data
  const {
    name,
    setName,
    email,
    setEmail,
    company,
    setCompany,
    currentStage,
    setCurrentStage,
    engaged,
    setEngaged,
    lastContacted,
    setLastContacted,
  } = useLeadForm({ initialData: lead })

  // Track stage history changes
  const { stageHistory, updateStageHistory } = useStageHistory(lead.stage_history)
  const [initialStage] = useState<LeadStage>(lead.current_stage)

  // Update form when lead data changes
  useEffect(() => {
    setName(lead.name)
    setEmail(lead.email)
    setCompany(lead.company)
    setCurrentStage(lead.current_stage)
    setEngaged(lead.engaged)
    setLastContacted(new Date(lead.last_contacted))
  }, [lead])

  // Handle stage changes and update history
  const handleStageChange = (newStage: LeadStage) => {
    setCurrentStage(newStage)
    updateStageHistory(currentStage, newStage)
  }

  const handleEmailValidation = (email: string): boolean => {
    const { isValid, error } = validateEmail(email)
    setEmailError(error || '')
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!handleEmailValidation(email)) {
      return
    }
    
    try {
      console.log('EditLeadModal handleSubmit - Initial lead:', lead);
      const now = new Date().toISOString()
      const updateData: LeadUpdate = {
        name,
        email,
        company,
        current_stage: currentStage,
        engaged,
        last_contacted: lastContacted.toISOString()
      }

      // If stage has changed, add stage history
      if (currentStage !== initialStage) {
        console.log('Stage changed from', initialStage, 'to', currentStage);
        console.log('Current stage history:', stageHistory);
        updateData.stage_history = stageHistory
        updateData.stage_updated_at = now
      }

      console.log('Submitting update data:', updateData);
      await onSubmit(lead.id, updateData)
      showToast.success('Lead updated successfully')
      onClose()
    } catch (error) {
      console.error('Error in EditLeadModal handleSubmit:', error);
      showToast.error('Failed to update lead')
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) {
      handleEmailValidation(e.target.value)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Edit Lead</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <FormInput
                  label="Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="john@example.com"
                  required
                />

                <FormInput
                  label="Company"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
              </div>

              {/* Last Contacted Field */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Last Contacted
                </label>
                <div className="relative">
                  <DatePicker
                    selected={lastContacted}
                    onChange={(date) => setLastContacted(date || new Date())}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={30}
                    dateFormat="MMMM d, yyyy HH:mm"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                      focus:border-purple-400 focus:ring-purple-50 focus:ring-4 
                      transition-all outline-none text-sm text-gray-900
                      bg-white shadow-sm min-w-[12rem]"
                    popperPlacement="bottom-start"
                    calendarClassName="shadow-lg rounded-lg border-gray-200"
                  />
                </div>
              </div>

              {/* Stage Selection */}
              <div className="pt-2 relative z-0">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Stage
                </label>
                <div className="bg-gray-50 rounded-lg p-6">
                  <StageProgressBar currentStage={currentStage} />
                  <nav className="relative flex justify-between">
                    {LEAD_STAGES.map((stage, idx) => {
                      const currentIdx = LEAD_STAGES.indexOf(currentStage)
                      const isCompleted = idx < currentIdx
                      const isActive = stage === currentStage

                      return (
                        <StageStep
                          key={stage}
                          stage={stage}
                          isActive={isActive}
                          isCompleted={isCompleted}
                          onClick={() => handleStageChange(stage)}
                          index={idx}
                        />
                      )
                    })}
                  </nav>
                </div>
              </div>

              {/* Engagement Status */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Engagement Status
                </label>
                <EngagementStatusButtons 
                  engaged={engaged}
                  onChange={setEngaged}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 