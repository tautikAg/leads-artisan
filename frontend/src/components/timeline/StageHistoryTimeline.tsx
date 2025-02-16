import { format, parseISO } from 'date-fns'
import { Edit2, Save, X } from 'lucide-react'
import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { StageHistoryItem } from '../../types/lead'
import "react-datepicker/dist/react-datepicker.css"

interface StageHistoryTimelineProps {
  history: StageHistoryItem[]
  onEditDate: (index: number, newDate: Date) => void
  isUpdating?: boolean
}

export default function StageHistoryTimeline({ 
  history, 
  onEditDate,
  isUpdating = false 
}: StageHistoryTimelineProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editDate, setEditDate] = useState<Date | null>(null)

  console.log('Stage History:', history)

  const handleEdit = (index: number, date: string) => {
    setEditingIndex(index)
    try {
      setEditDate(date ? parseISO(date) : new Date())
    } catch (error) {
      console.warn('Invalid date string:', date)
      setEditDate(new Date())
    }
  }

  const handleSave = (index: number) => {
    if (editDate) {
      onEditDate(index, editDate)
      setEditingIndex(null)
      setEditDate(null)
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm aa')
    } catch (error) {
      console.warn('Invalid date string:', dateString)
      return 'Invalid date'
    }
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No stage history available
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex gap-3">
                <div className="shrink-0">
                  <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 font-medium mb-1 break-words">
                    {item.from_stage ? 
                      `Moved from ${item.from_stage} to ${item.to_stage}` : 
                      `Started as ${item.to_stage}`
                    }
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg border border-gray-200 p-1.5 w-full max-w-[300px]">
                        <DatePicker
                          selected={editDate}
                          onChange={setEditDate}
                          className="w-full text-sm bg-transparent outline-none text-gray-600"
                          dateFormat="MMM d, yyyy h:mm aa"
                          showTimeSelect
                          timeFormat="h:mm aa"
                          timeIntervals={15}
                        />
                        <div className="flex gap-1.5 border-l pl-1.5 shrink-0">
                          <button 
                            onClick={() => handleSave(index)}
                            disabled={isUpdating}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            onClick={() => setEditingIndex(null)}
                            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-50 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-gray-500">
                          {formatDate(item.changed_at)}
                        </span>
                        <button 
                          onClick={() => handleEdit(index, item.changed_at)}
                          className="p-1.5 hover:bg-gray-100 rounded-md transition-all shrink-0"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 