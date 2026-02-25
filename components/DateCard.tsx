'use client'

interface DateCardProps {
  label: string
  month: number
  day: number
  ownerName?: string
  onDelete?: () => void
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function DateCard({ label, month, day, ownerName, onDelete }: DateCardProps) {
  const isUpcoming = () => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    if (month > currentMonth) return true
    if (month === currentMonth && day >= currentDay) return true
    return false
  }

  const getDaysUntil = () => {
    const today = new Date()
    const thisYear = today.getFullYear()
    const nextYear = thisYear + 1

    let dateThisYear = new Date(thisYear, month - 1, day)
    let dateNextYear = new Date(nextYear, month - 1, day)

    const targetDate = dateThisYear >= today ? dateThisYear : dateNextYear
    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  const daysUntil = getDaysUntil()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3 text-center min-w-[60px]">
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase">
              {months[month - 1]}
            </div>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {day}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
            {ownerName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{ownerName}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {daysUntil === 0 ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Today!</span>
              ) : daysUntil === 1 ? (
                <span className="text-orange-600 dark:text-orange-400 font-medium">Tomorrow</span>
              ) : (
                `In ${daysUntil} days`
              )}
            </p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            aria-label="Delete date"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
