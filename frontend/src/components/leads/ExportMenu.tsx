import { useState } from 'react'
import downloadIcon from '../../assets/downloadIcon.svg'

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
      <img 
        src={downloadIcon} 
        alt="download" 
        className={`w-5 h-5 mr-2 ${isExporting ? 'animate-bounce' : ''}`}
      />
      {isExporting ? 'Exporting...' : 'Export All'}
    </button>
  )
} 