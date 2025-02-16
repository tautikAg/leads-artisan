import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

interface DatePickerFieldProps {
  label: string
  selected: Date
  onChange: (date: Date) => void
}

export default function DatePickerField({ label, selected, onChange }: DatePickerFieldProps) {
  return (
    <div className="pt-2">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      <DatePicker
        selected={selected}
        onChange={(date) => onChange(date || new Date())}
        showTimeSelect
        dateFormat="MMMM d, yyyy h:mm aa"
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-400 focus:ring-purple-50 focus:ring-4 transition-all outline-none"
      />
    </div>
  )
} 