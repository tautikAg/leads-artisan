/**
 * useEngagementStatus Hook
 * 
 * Manages the engagement status of a lead with associated UI configurations.
 * Provides utilities for:
 * - Tracking engaged/not engaged state
 * - Generating status-specific UI configurations
 * - Managing button styles and labels
 */
import { useState, useCallback } from 'react'
import { ENGAGEMENT_STATUSES } from '../constants/leads'

interface StatusConfig {
  label: string
  description: string
  className: string
}

interface UseEngagementStatusReturn {
  engaged: boolean
  setEngaged: (value: boolean) => void
  getStatusConfig: (isEngaged: boolean) => StatusConfig
}

export function useEngagementStatus(initialStatus = false): UseEngagementStatusReturn {
  const [engaged, setEngaged] = useState(initialStatus)

  // Generate UI configuration based on engagement status
  const getStatusConfig = useCallback((isEngaged: boolean): StatusConfig => {
    const status = isEngaged ? ENGAGEMENT_STATUSES.ENGAGED : ENGAGEMENT_STATUSES.NOT_ENGAGED
    
    return {
      label: status.label,
      description: status.description,
      className: `
        flex-1 px-4 py-3 rounded-lg transition-all cursor-pointer
        ${isEngaged === engaged
          ? 'bg-white shadow-md border-2 border-purple-600 text-purple-700'
          : 'bg-white/60 hover:bg-white hover:shadow-sm text-gray-600 hover:border-purple-200'
        }
      `.trim()
    }
  }, [engaged])

  return {
    engaged,
    setEngaged,
    getStatusConfig
  }
} 