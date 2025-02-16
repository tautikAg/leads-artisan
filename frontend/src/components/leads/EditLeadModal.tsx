import { useState, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import { Lead, LeadStage, LeadUpdate } from '../../types/lead'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useStageHistory } from '../../hooks/useStageHistory'

interface EditLeadModalProps {
  lead: Lead
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, data: LeadUpdate) => void
  isLoading?: boolean
}

const STAGES: LeadStage[] = [
  "New Lead",
  "Initial Contact",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Closed Won"
]

const StageStep = ({ stage, isActive, isCompleted, onClick }: {
  stage: LeadStage
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) => (
  <div className="relative group">
    <div 
      onClick={onClick}
      className={`
        relative flex items-center cursor-pointer
        ${isActive ? 'z-10' : ''}
      `}
    >
      <div 
        className={`
          flex h-12 w-12 items-center justify-center rounded-full transition-all
          ${isCompleted 
            ? 'bg-purple-600 group-hover:bg-purple-700' 
            : isActive 
              ? 'bg-purple-100 border-2 border-purple-600'
              : 'bg-white border-2 border-gray-300 group-hover:border-gray-400'
          }
        `}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-white" />
        ) : (
          <span className={`text-sm font-medium ${
            isActive ? 'text-purple-600' : 'text-gray-500'
          }`}>
            {STAGES.indexOf(stage) + 1}
          </span>
        )}
      </div>
    </div>

    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap">
        {stage}
      </div>
      <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
    </div>
  </div>
)

const FormInput = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <input
      {...props}
      className="
        w-full px-4 py-3 rounded-lg border-2 border-gray-200 
        focus:border-purple-400 focus:ring-purple-50 focus:ring-4 
        transition-all outline-none text-gray-800 placeholder-gray-400
      "
    />
  </div>
)

export default function EditLeadModal({ lead, isOpen, onClose, onSubmit, isLoading }: EditLeadModalProps) {
  const [name, setName] = useState(lead.name)
  const [email, setEmail] = useState(lead.email)
  const [company, setCompany] = useState(lead.company)
  const [currentStage, setCurrentStage] = useState<LeadStage>(lead.current_stage)
  const [engaged, setEngaged] = useState(lead.engaged)
  const [lastContacted, setLastContacted] = useState<Date>(new Date(lead.last_contacted))
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
                <div className="relative">
                  <DatePicker
                    selected={lastContacted}
                    onChange={(date) => setLastContacted(date as Date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy HH:mm"
                    className="
                      w-full px-4 py-3 rounded-lg border-2 border-gray-200 
                      focus:border-purple-400 focus:ring-purple-50 focus:ring-4 
                      transition-all outline-none text-gray-800
                    "
                    placeholderText="Select date and time"
                    calendarClassName="date-picker-calendar"
                    popperClassName="date-picker-popper"
                    popperPlacement="bottom-start"
                  />
                </div>
              </div>

              {/* Stage Selection */}
              <div className="pt-2 relative z-0">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Current Stage
                </label>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="relative px-6">
                    <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200">
                      <div 
                        className="absolute top-0 left-0 h-full bg-purple-600 transition-all"
                        style={{ 
                          width: `${(STAGES.indexOf(currentStage) / (STAGES.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    <nav className="relative flex justify-between">
                      {STAGES.map((stage, idx) => {
                        const currentIdx = STAGES.indexOf(currentStage)
                        const isCompleted = idx < currentIdx
                        const isActive = stage === currentStage

                        return (
                          <StageStep
                            key={stage}
                            stage={stage}
                            isActive={isActive}
                            isCompleted={isCompleted}
                            onClick={() => handleStageChange(stage)}
                          />
                        )
                      })}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Engagement Status */}
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Engagement Status
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEngaged(false)}
                      className={`
                        flex-1 px-4 py-3 rounded-lg transition-all
                        ${!engaged 
                          ? 'bg-white shadow-md border-2 border-purple-600 text-purple-700' 
                          : 'bg-white/60 hover:bg-white hover:shadow-sm text-gray-600'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">Not Engaged</span>
                        <span className="text-xs mt-1 text-gray-500">Initial contact pending</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngaged(true)}
                      className={`
                        flex-1 px-4 py-3 rounded-lg transition-all
                        ${engaged 
                          ? 'bg-white shadow-md border-2 border-purple-600 text-purple-700' 
                          : 'bg-white/60 hover:bg-white hover:shadow-sm text-gray-600'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">Engaged</span>
                        <span className="text-xs mt-1 text-gray-500">Active communication</span>
                      </div>
                    </button>
                  </div>
                </div>
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