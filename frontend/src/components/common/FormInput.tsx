import { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormInput({ 
  label, 
  error,
  className = '', 
  ...props 
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg border
          ${error ? 'border-red-300' : 'border-gray-200'}
          focus:border-purple-400 focus:ring-purple-50 focus:ring-4
          transition-all outline-none text-sm text-gray-900
          ${className}
        `}
        {...props}
      />
    </div>
  )
} 