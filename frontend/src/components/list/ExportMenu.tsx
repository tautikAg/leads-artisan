import { useState } from 'react'
import downloadIcon from '../../assets/downloadIcon.svg'
import { Lead } from '../../types/lead'
import { format } from 'date-fns'

interface ExportMenuProps {
  leads: Lead[]
}

export default function ExportMenu({ leads }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)
    try {
      // Define headers
      const headers = [
        'Name',
        'Company',
        'Stage',
        'Status',
        'Last Contacted',
        'Email'
      ];

      // Convert leads to CSV rows
      const rows = leads.map(lead => [
        lead.name,
        lead.company,
        lead.current_stage,
        lead.status,
        lead.last_contacted ? format(new Date(lead.last_contacted), 'MMM d, yyyy') : '-',
        lead.email
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `leads-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button 
      onClick={exportToCSV}
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