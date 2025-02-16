import { ChangeEvent } from 'react'
import { FormInput } from '../common/FormInput'
import DatePicker from 'react-datepicker'
import { LeadStage } from '../../types/lead'
import StageStep from '../progress/StageStep'

interface LeadFormFieldsProps {
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  company: string
  setCompany: (company: string) => void
  currentStage: LeadStage
  setCurrentStage: (stage: LeadStage) => void
  engaged: boolean
  setEngaged: (engaged: boolean) => void
  lastContacted: Date
  setLastContacted: (date: Date) => void
  stages: LeadStage[]
}

export default function LeadFormFields({
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
  stages
}: LeadFormFieldsProps) {
  const handleInputChange = (setter: (value: string) => void) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.target.value)
  }

  return (
    <div className="space-y-6">
      <FormInput
        label="Name"
        value={name}
        onChange={handleInputChange(setName)}
        placeholder="Enter lead name"
        required
      />

      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={handleInputChange(setEmail)}
        placeholder="Enter email address"
        required
      />

      <FormInput
        label="Company"
        value={company}
        onChange={handleInputChange(setCompany)}
        placeholder="Enter company name"
        required
      />

      {/* Stage Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Current Stage
        </label>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="relative px-6">
            <div className="absolute top-6 left-0 w-full h-0.5 bg-gray-200">
              <div 
                className="absolute top-0 left-0 h-full bg-purple-600 transition-all"
                style={{ 
                  width: `${(stages.indexOf(currentStage) / (stages.length - 1)) * 100}%`
                }}
              />
            </div>
            <nav className="relative flex justify-between">
              {stages.map((stage, idx) => {
                const currentIdx = stages.indexOf(currentStage)
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
      </div>

      {/* Last Contacted */}
      <div>
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

      {/* Engagement Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Engagement Status
        </label>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3">
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
  )
} 