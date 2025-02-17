import { Lead } from '../types/lead'
import { format } from 'date-fns'
import { LeadFilters } from '../types/lead'
import { leadsApi } from '../api/leads'

export class ExportService {
  private static readonly HEADERS = [
    'Name',
    'Company',
    'Stage',
    'Engaged',
    'Last Contacted',
    'Email'
  ]

  private static formatRow(lead: Lead): string[] {
    return [
      lead.name,
      lead.company,
      lead.current_stage,
      lead.engaged ? 'Yes' : 'No',
      lead.last_contacted ? format(new Date(lead.last_contacted), 'MMM d, yyyy') : '-',
      lead.email
    ]
  }

  private static createCSV(leads: Lead[]): string {
    const rows = leads.map(this.formatRow)
    return [
      this.HEADERS.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  private static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  static async exportLeads(filters: LeadFilters, totalCount: number): Promise<void> {
    const response = await leadsApi.getLeads({
      ...filters,
      limit: totalCount,
      page: 1
    })

    const csvContent = this.createCSV(response.items)
    const filename = `all-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`
    this.downloadCSV(csvContent, filename)
  }
}