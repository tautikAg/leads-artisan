import { LeadStage } from '../types/lead'

export const LEAD_STAGES: LeadStage[] = [
  "New Lead",
  "Initial Contact",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Closed Won"
]

export const ENGAGEMENT_STATUSES = {
  ENGAGED: {
    label: "Engaged",
    description: "Active communication"
  },
  NOT_ENGAGED: {
    label: "Not Engaged",
    description: "Initial contact pending"
  }
} 