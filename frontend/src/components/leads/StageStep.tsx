import { CheckCircle2 } from 'lucide-react'
import { LeadStage } from '../../types/lead'

interface StageStepProps {
  stage: LeadStage
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}

export default function StageStep({ 
  stage, 
  isActive, 
  isCompleted, 
  onClick 
}: StageStepProps) {
  return (
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
              {stage}
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
} 