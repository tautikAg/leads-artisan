import { X } from 'lucide-react'
import { LeadStage } from '../../types/lead'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { LEAD_STAGES } from '../../constants/leads'
import StageProgressBar from '../progress/StageProgressBar'
import StageStep from '../progress/StageStep'
import EngagementStatusButtons from '../form/EngagementStatusButtons'
import { FormInput } from '../common/FormInput'
import { useLeadForm } from '../../hooks/useLeadForm'
import { useState } from 'react'
import { validateEmail } from '../../utils/validators'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    email: string
    company: string
    current_stage: LeadStage
    engaged: boolean
    last_contacted: string
    status?: string
  }) => void
  isLoading?: boolean
}

/**
 * Modal component for adding new leads to the system.
 * Handles form state and validation for creating lead records.
 */
export default function AddLeadModal({ isOpen, onClose, onSubmit, isLoading }: AddLeadModalProps) {
  const [emailError, setEmailError] = useState<string>('')
  // Use custom hook to manage form state and validation
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
  } = useLeadForm()

  const handleEmailValidation = (email: string): boolean => {
    const { isValid, error } = validateEmail(email)
    setEmailError(error || '')
    return isValid
  }

  // Handle form submission and data validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!handleEmailValidation(email)) {
      return
    }
    
    try {
      await onSubmit({
        name,
        email,
        company,
        engaged,
        current_stage: currentStage,
        status: engaged ? "Engaged" : "Not Engaged",
        last_contacted: lastContacted.toISOString()
      })
      // Just close the modal, let the mutation handle the success message
      onClose()
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Error submitting form:', error)
    }
  }

  // Email change handler
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (emailError) {
      handleEmailValidation(e.target.value)
    }
  }

  // Don't render if modal is not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-[95%] sm:w-full sm:max-w-md overflow-hidden mx-4 sm:mx-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
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

                <div>
                  <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="john@example.com"
                    required
                    error={emailError}
                    className={emailError ? 'border-red-300' : ''}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError}
                    </p>
                  )}
                </div>

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
                          onClick={() => setCurrentStage(stage)}
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
                Add Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 