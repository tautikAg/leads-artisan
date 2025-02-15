import { Download } from 'lucide-react'
import { useState } from 'react'

interface ExportMenuProps {
  onExport: () => void
}

export default function ExportMenu({ onExport }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport()
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button 
      onClick={handleExport}
      disabled={isExporting}
      className={`
        inline-flex items-center px-4 py-2 text-sm font-medium text-white 
        bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 
        disabled:cursor-not-allowed transition-all
      `}
    >
      <Download className={`w-4 h-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
      {isExporting ? 'Exporting...' : 'Export'}
    </button>
  )
} 