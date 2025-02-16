export const LEAD_STAGES = [
  "New Lead",
  "Initial Contact",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Closed Won"
] as const

export type LeadStage = typeof LEAD_STAGES[number]

// Helper functions
export const isLastStage = (stage: LeadStage): boolean => {
  return stage === LEAD_STAGES[LEAD_STAGES.length - 1]
}

export const getStageIndex = (stage: LeadStage): number => {
  return LEAD_STAGES.indexOf(stage)
}

export const getNextStage = (currentStage: LeadStage): LeadStage | null => {
  const currentIndex = getStageIndex(currentStage)
  return currentIndex < LEAD_STAGES.length - 1 ? LEAD_STAGES[currentIndex + 1] : null
}

export const calculateProgress = (currentStage: LeadStage): number => {
  const currentIndex = getStageIndex(currentStage)
  return Math.round((currentIndex / (LEAD_STAGES.length - 1)) * 100)
} 