import { useState } from 'react'
import { StageHistoryItem, LeadStage } from '../types/lead'

interface UseStageHistoryReturn {
  stageHistory: StageHistoryItem[]
  updateStageHistory: (fromStage: LeadStage | null, toStage: LeadStage) => void
  editStageDate: (index: number, newDate: Date) => void
}

export function useStageHistory(initialHistory: StageHistoryItem[] = []): UseStageHistoryReturn {
  const [stageHistory, setStageHistory] = useState<StageHistoryItem[]>(initialHistory)

  const updateStageHistory = (fromStage: LeadStage | null, toStage: LeadStage) => {
    const newHistoryItem: StageHistoryItem = {
      from_stage: fromStage,
      to_stage: toStage,
      changed_at: new Date().toISOString()
    }
    setStageHistory(prev => [...prev, newHistoryItem])
  }

  const editStageDate = (index: number, newDate: Date) => {
    setStageHistory(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        changed_at: newDate.toISOString()
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