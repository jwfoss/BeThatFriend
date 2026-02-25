import Input from '@/components/ui/Input'
import { useState } from 'react'

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const getDaysInMonth = (month: number) => {
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return daysPerMonth[month - 1] || 31
}

export default function DateGrid({ dates, setDates }: {
  dates: { id?: string, label: string, month: number, day: number }[],
  setDates: (dates: { id?: string, label: string, month: number, day: number }[]) => void
}) {
  // Ensure at least 3 rows
  const filledDates = dates.length >= 3 ? dates : [
    ...dates,
    ...Array(3 - dates.length).fill(0).map(() => ({ id: crypto.randomUUID(), label: '', month: 1, day: 1 }))
  ]

  const handleChange = (idx: number, field: string, value: any) => {
    const updated = filledDates.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    )
    setDates(updated)
  }

  const handleDelete = (idx: number) => {
    setDates(filledDates.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {filledDates.map((date, idx) => (
        <div key={date.id || idx} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-5">
            <Input
              label={idx === 0 ? 'Occasion' : undefined}
              placeholder={''}
              value={date.label}
              onChange={e => handleChange(idx, 'label', e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="col-span-3">
            {idx === 0 && (
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            )}
            <select
              value={date.month}
              onChange={e => handleChange(idx, 'month', parseInt(e.target.value))}
              className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            {idx === 0 && (
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
            )}
            <select
              value={date.day}
              onChange={e => handleChange(idx, 'day', parseInt(e.target.value))}
              className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {Array.from({ length: getDaysInMonth(date.month) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 flex justify-center items-end">
            {filledDates.length > 3 && (
              <button
                type="button"
                className="text-xs text-red-500 hover:underline"
                onClick={() => handleDelete(idx)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}