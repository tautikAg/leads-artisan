interface ModalFooterProps {
  onClose: () => void
  onSubmit?: () => void
  submitText: string
  isLoading?: boolean
}

export default function ModalFooter({ 
  onClose, 
  onSubmit, 
  submitText, 
  isLoading 
}: ModalFooterProps) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        {submitText}
      </button>
    </>
  )
} 