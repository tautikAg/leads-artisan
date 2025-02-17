import { ChevronLeft, ChevronRight } from 'lucide-react'
import Select from './Select'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions: { label: string; value: number }[]
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  pageSize, 
  onPageChange, 
  onPageSizeChange, 
  pageSizeOptions 
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Select
          value={pageSize}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={pageSizeOptions}
          className="w-32"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`
            p-2 rounded-md transition-colors
            ${currentPage === 1 
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }
          `}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(pageNum => 
            pageNum === 1 || 
            pageNum === totalPages || 
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          )
          .map((pageNum, index, array) => {
            if (index > 0 && pageNum - array[index - 1] > 1) {
              return (
                <span 
                  key={`ellipsis-${pageNum}`} 
                  className="px-2 text-gray-500"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNum}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-md text-sm
                  ${currentPage === pageNum
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

        <button
          className={`
            p-2 rounded-md transition-colors
            ${currentPage === totalPages 
              ? 'bg-gray-50 text-gray-400 cursor-not-allowed' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }
          `}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* dont show this div when in mobile view */}
      <div className="hidden sm:block sm:w-32">
      </div>
    </div>
  )
} 