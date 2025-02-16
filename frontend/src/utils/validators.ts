export const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const isValid = emailRegex.test(email)
  if (!isValid) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g., user@example.com)'
    }
  }
  return { isValid: true }
} 