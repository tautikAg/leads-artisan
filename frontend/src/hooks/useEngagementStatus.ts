/**
 * useEngagementStatus Hook
 * 
 * Manages the engagement status of a lead with associated UI configurations.
 * Provides utilities for:
 * - Tracking engaged/not engaged state
 * - Generating status-specific UI configurations
 * - Managing button styles and labels
 */
import { useState } from 'react'
import { ENGAGEMENT_STATUSES } from '../constants/leads'

interface UseEngagementStatusReturn {
  engaged: boolean
  setEngaged: (value: boolean) => void
  getStatusConfig: (isEngaged: boolean) => {
    label: string
    description: string
    className: string
  }
}

export function useEngagementStatus(initialStatus = false): UseEngagementStatusReturn {
  const [engaged, setEngaged] = useState(initialStatus)

  // Generate UI configuration based on engagement status
  const getStatusConfig = (isEngaged: boolean) => ({
    label: isEngaged ? ENGAGEMENT_STATUSES.ENGAGED.label : ENGAGEMENT_STATUSES.NOT_ENGAGED.label,
    description: isEngaged ? ENGAGEMENT_STATUSES.ENGAGED.description : ENGAGEMENT_STATUSES.NOT_ENGAGED.description,
    className: `
      flex-1 px-4 py-3 rounded-lg transition-all
      ${isEngaged === engaged
        ? 'bg-white shadow-md border-2 border-purple-600 text-purple-700'
        : 'bg-white/60 hover:bg-white hover:shadow-sm text-gray-600'
      }
    `
  })

  return {
    engaged,
    setEngaged,
    getStatusConfig
  }
} 