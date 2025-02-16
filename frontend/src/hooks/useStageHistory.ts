/**
 * useStageHistory Hook
 * 
 * Manages the stage history for a lead.
 * Provides functionality for:
 * - Tracking stage transitions
 * - Updating stage timestamps
 * - Maintaining history order
 */
import { useState, useEffect } from 'react'
import { StageHistoryItem, LeadStage } from '../types/lead'
import { LEAD_STAGES } from '../constants/leads'

interface UseStageHistoryReturn {
  stageHistory: StageHistoryItem[]
  updateStageHistory: (fromStage: LeadStage, toStage: LeadStage) => void
  editStageDate: (index: number, newDate: Date) => void
}

export function useStageHistory(initialHistory: StageHistoryItem[] = []): UseStageHistoryReturn {
  const [stageHistory, setStageHistory] = useState<StageHistoryItem[]>(initialHistory)

  // Update history when initialHistory changes, but only if it's different
  useEffect(() => {
    if (JSON.stringify(initialHistory) !== JSON.stringify(stageHistory)) {
      setStageHistory(initialHistory)
    }
  }, [initialHistory])

  const updateStageHistory = (fromStage: LeadStage, toStage: LeadStage) => {
    // Get the indices to determine if we're moving forward or backward
    const fromIndex = LEAD_STAGES.indexOf(fromStage)

    const newHistoryItem: StageHistoryItem = {
      from_stage: fromStage,
      to_stage: toStage,
      changed_at: new Date().toISOString(),
      notes: `Updated from ${fromStage} to ${toStage}`
    }

    // Create new history array with the direct transition
    setStageHistory(prevHistory => {
      // Get the base history (all items before the current stage)
      const baseHistory = prevHistory.filter(item => 
        LEAD_STAGES.indexOf(item.to_stage) <= fromIndex
      )
      
      return [...baseHistory, newHistoryItem]
    })
  }

  const editStageDate = (index: number, newDate: Date) => {
    setStageHistory(prev => {
      const updated = [...prev]
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          changed_at: newDate.toISOString()
        }
      }
      return updated
    })
  }

  return {
    stageHistory,
    updateStageHistory,
    editStageDate
  }
} 