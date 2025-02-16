import { forwardRef } from 'react'
import { SearchIcon } from 'lucide-react'

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
  error?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="relative">
          <SearchIcon 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
          />
          <input
            ref={ref}
            type="text"
            className={`
              w-full
              px-4
              py-2
              sm:py-2.5
              pl-10
              text-sm
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

SearchInput.displayName = 'SearchInput'

export default SearchInput 