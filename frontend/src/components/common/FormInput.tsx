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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <input
        className={`
          w-full px-4 py-3 rounded-lg border-2 border-gray-200 
          focus:border-purple-400 focus:ring-purple-50 focus:ring-4 
          transition-all outline-none text-gray-800 placeholder-gray-400
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 