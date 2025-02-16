import { useEngagementStatus } from '../../hooks/useEngagementStatus'

interface EngagementStatusButtonsProps {
  engaged: boolean
  onChange: (engaged: boolean) => void
}

export default function EngagementStatusButtons({ engaged, onChange }: EngagementStatusButtonsProps) {
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
              className={config.className}
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