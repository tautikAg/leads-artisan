import { LeadStage } from '@/types/lead'

const STAGES: LeadStage[] = [
  "New Lead",
  "Initial Contact",
  "Meeting Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Closed Won"
]

interface StageProgressProps {
  currentStage: LeadStage
}

export default function StageProgress({ currentStage }: StageProgressProps) {
  const currentIndex = STAGES.indexOf(currentStage)
  
  return (
    <div className="flex gap-0.5">
      {STAGES.map((stage, index) => (
        <div 
          key={stage}
          className={`h-5 w-1 rounded-sm ${
            index <= currentIndex ? 'bg-purple-600' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
} 