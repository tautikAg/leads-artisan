import { LeadStage } from '../../types/lead'
import StageProgressBar from '../progress/StageProgressBar'
import StageStep from '../progress/StageStep'

interface StageSelectorProps {
  currentStage: LeadStage
  stages: LeadStage[]
  onStageChange: (stage: LeadStage) => void
}

export default function StageSelector({ 
  currentStage, 
  stages, 
  onStageChange 
}: StageSelectorProps) {
  return (
    <div className="pt-2 relative z-0">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Current Stage
      </label>
      <div className="bg-gray-50 rounded-lg p-6">
        <StageProgressBar currentStage={currentStage} />
        <nav className="relative flex justify-between">
          {stages.map((stage, idx) => {
            const currentIdx = stages.indexOf(currentStage)
            const isCompleted = idx < currentIdx
            const isActive = stage === currentStage

            return (
              <StageStep
                key={stage}
                stage={stage}
                isActive={isActive}
                isCompleted={isCompleted}
                onClick={() => onStageChange(stage)}
                index={idx}
              />
            )
          })}
        </nav>
      </div>
    </div>
  )
} 