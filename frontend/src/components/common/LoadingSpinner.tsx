import { PulseLoader } from 'react-spinners'

interface LoadingSpinnerProps {
  text?: string
  size?: number
  color?: string
  fullWidth?: boolean
  className?: string
}

export default function LoadingSpinner({ 
  text = "Loading...", 
  size = 8,
  color = "#9333EA",
  fullWidth = false,
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`
      flex justify-center items-center py-8
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `}>
      <PulseLoader 
        color={color}
        size={size}
        margin={4}
        speedMultiplier={0.8}
      />
      {text && (
        <span className="ml-3 text-sm text-gray-500">
          {text}
        </span>
      )}
    </div>
  )
} 