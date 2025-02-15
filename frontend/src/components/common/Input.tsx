import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full
              px-3.5
              py-2.5
              text-sm
              text-gray-900
              bg-white
              border
              border-gray-300
              rounded-lg
              shadow-sm
              placeholder:text-gray-500
              focus:outline-none
              focus:ring-2
              focus:ring-purple-500/20
              focus:border-purple-500
              transition-all
              hover:border-gray-400
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input 