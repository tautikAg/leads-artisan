/**
 * EngagementStatusButtons Component
 * 
 * A toggle button group for selecting lead engagement status.
 * Provides visual feedback for engaged/not engaged states with
 * descriptions for each option.
 */
import { useEngagementStatus } from '../../hooks/useEngagementStatus'

interface EngagementStatusButtonsProps {
  engaged: boolean
  onChange: (engaged: boolean) => void
  disabled?: boolean
}

export default function EngagementStatusButtons({ 
  engaged, 
  onChange,
  disabled = false 
}: EngagementStatusButtonsProps) {
  const { getStatusConfig } = useEngagementStatus(engaged)

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {[false, true].map(isEngaged => {
          const config = getStatusConfig(isEngaged)
          return (
            <button
              key={config.label}
              type="button"
              onClick={() => onChange(isEngaged)}
              disabled={disabled}
              className={`
                flex-1 px-4 py-3 rounded-lg transition-all
                ${isEngaged === engaged
                  ? 'bg-white shadow-md border-2 border-purple-600 text-purple-700'
                  : 'bg-white/60 hover:bg-white hover:shadow-sm text-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs mt-1 text-gray-500">{config.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
} 