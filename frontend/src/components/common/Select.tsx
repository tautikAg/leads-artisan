import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface Option {
  label: string
  value: string | number
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[]
  onChange?: (value: string | number) => void
  label?: string
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, onChange, label, error, ...props }, ref) => {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            onChange={(e) => onChange?.(e.target.value)}
            className={`
              appearance-none
              w-full
              px-3
              py-1.5
              pr-8
              text-sm
              bg-white
              border
              border-gray-200
              rounded-md
              cursor-pointer
              focus:outline-none
              focus:ring-1
              focus:ring-purple-500
              focus:border-purple-500
              transition-colors
              hover:bg-gray-50
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="py-2 px-3 text-gray-900 hover:bg-gray-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select 