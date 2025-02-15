import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
import Input from '../common/Input'
import { LeadStage } from '../../types/lead'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    company: string
    current_stage: LeadStage
    status: string
    engaged: boolean
  }) => void
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

export default function AddLeadModal({ isOpen, onClose, onSubmit, isLoading }: AddLeadModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [currentStage, setCurrentStage] = useState<LeadStage>("New Lead")
  const [engaged, setEngaged] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      email,
      company,
      current_stage: currentStage,
      status: engaged ? "Engaged" : "Not Engaged",
      engaged
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />

              <Input
                label="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Inc."
                required
              />

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Current Stage
                </label>
                <div className="relative mt-4 px-6">
                  {/* Progress Bar */}
                  <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200">
                    <div 
                      className="absolute top-0 left-0 h-full bg-purple-600 transition-all"
                      style={{ 
                        width: `${(STAGES.indexOf(currentStage) / (STAGES.length - 1)) * 100}%`
                      }}
                    />
                  </div>

                  {/* Stage Steps */}
                  <nav 
                    aria-label="Lead Stage Progress" 
                    className="relative flex justify-between"
                  >
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
                          onClick={() => setCurrentStage(stage)}
                        />
                      )
                    })}
                  </nav>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Engagement Status
                  </label>
                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => setEngaged(false)}
                      className={`
                        flex-1 px-4 py-3 rounded-lg border-2 transition-all
                        ${!engaged 
                          ? 'border-purple-600 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                          Not Engaged
                        </span>
                        <span className="text-xs mt-1 text-gray-500">
                          Initial contact pending
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEngaged(true)}
                      className={`
                        flex-1 px-4 py-3 rounded-lg border-2 transition-all
                        ${engaged 
                          ? 'border-purple-600 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-medium">
                          Engaged
                        </span>
                        <span className="text-xs mt-1 text-gray-500">
                          Active communication
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Add Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 