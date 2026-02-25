'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface DateFormProps {
  onAdd: (date: { label: string; month: number; day: number }) => void
  loading?: boolean
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const getDaysInMonth = (month: number) => {
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return daysPerMonth[month - 1] || 31
}

export default function DateForm({ onAdd, loading }: DateFormProps) {
  const [label, setLabel] = useState('')
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (label.trim()) {
      onAdd({ label: label.trim(), month, day })
      setLabel('')
      setMonth(1)
      setDay(1)
    }
  }

  const maxDays = getDaysInMonth(month)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="What's the occasion?"
        placeholder="e.g., Mom's Birthday, Wedding Anniversary"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        maxLength={100}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Month
          </label>
          <select
            value={month}
            onChange={(e) => {
              const newMonth = parseInt(e.target.value)
              setMonth(newMonth)
              if (day > getDaysInMonth(newMonth)) {
                setDay(getDaysInMonth(newMonth))
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
          >
            {months.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Day
          </label>
          <select
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20"
          >
            {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!label.trim()} loading={loading}>
        Add Date
      </Button>
    </form>
  )
}
