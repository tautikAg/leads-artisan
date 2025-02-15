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
              px-3.5
              py-2.5
              pr-10
              text-sm
              bg-white
              border
              border-gray-300
              rounded-lg
              shadow-sm
              cursor-pointer
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
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="py-2"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown 
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" 
          />
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