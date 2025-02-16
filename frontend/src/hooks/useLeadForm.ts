import { useState, useEffect } from 'react'
import { Lead, LeadStage } from '../types/lead'

interface UseLeadFormProps {
  initialData?: Lead
}

export function useLeadForm({ initialData }: UseLeadFormProps = {}) {
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [company, setCompany] = useState(initialData?.company || '')
  const [currentStage, setCurrentStage] = useState<LeadStage>(initialData?.current_stage || "New Lead")
  const [engaged, setEngaged] = useState(initialData?.engaged || false)
  const [lastContacted, setLastContacted] = useState<Date>(
    initialData?.last_contacted ? new Date(initialData.last_contacted) : new Date()
  )

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setEmail(initialData.email)
      setCompany(initialData.company)
      setCurrentStage(initialData.current_stage)
      setEngaged(initialData.engaged)
      setLastContacted(new Date(initialData.last_contacted))
    }
  }, [initialData])

  return {
    name,
    setName,
    email,
    setEmail,
    company,
    setCompany,
    currentStage,
    setCurrentStage,
    engaged,
    setEngaged,
    lastContacted,
    setLastContacted,
  }
} 