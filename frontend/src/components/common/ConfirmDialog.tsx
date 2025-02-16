import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText: string
  cancelText?: string
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/30" 
        />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[400px] bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-gray-900">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-gray-500">
                  {description}
                </Dialog.Description>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="min-w-[72px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="min-w-[72px] px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
} 