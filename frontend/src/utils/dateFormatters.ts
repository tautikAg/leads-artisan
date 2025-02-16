import { format, parseISO } from 'date-fns'

export const formatDateTime = (dateTime: string | null): string => {
  if (!dateTime) return "N/A"
  try {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm aa')
  } catch {
    return "N/A"
  }
}

export const formatDateTimeForInput = (dateTime: string | null): string => {
  if (!dateTime) return ""
  try {
    return format(parseISO(dateTime), 'MMMM d, yyyy h:mm aa')
  } catch {
    return ""
  }
} 