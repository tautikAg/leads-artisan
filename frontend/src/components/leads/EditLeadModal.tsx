import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Lead, LeadStage, LeadUpdate } from '../../types/lead'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useStageHistory } from '../../hooks/useStageHistory'
import { LEAD_STAGES } from '../../constants/leads'
import StageProgressBar from './StageProgressBar'
import StageStep from './StageStep'
import EngagementStatusButtons from './EngagementStatusButtons'
import { FormInput } from '../common/FormInput'
import { useLeadForm } from '../../hooks/useLeadForm'

interface EditLeadModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, data: LeadUpdate) => void
  isLoading?: boolean
}

export default function EditLeadModal({ lead, isOpen, onClose, onSubmit, isLoading }: EditLeadModalProps) {
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

  const { stageHistory, updateStageHistory } = useStageHistory(lead.stage_history)
  const [initialStage] = useState<LeadStage>(lead.current_stage)

  // Update form when lead changes
  useEffect(() => {
    setName(lead.name)
    setEmail(lead.email)
    setCompany(lead.company)
    setCurrentStage(lead.current_stage)
    setEngaged(lead.engaged)
    setLastContacted(new Date(lead.last_contacted))
  }, [lead])

  const handleStageChange = (newStage: LeadStage) => {
    setCurrentStage(newStage)
    updateStageHistory(currentStage, newStage)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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
      updateData.stage_history = stageHistory
      updateData.stage_updated_at = now
    }

    onSubmit(lead.id, updateData)
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
                  onChange={e => setEmail(e.target.value)}
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
                <DatePicker
                  selected={lastContacted}
                  onChange={(date) => setLastContacted(date || new Date())}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-50 focus:ring-4 transition-all outline-none"
                />
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