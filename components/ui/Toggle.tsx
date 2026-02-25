'use client'

interface ToggleProps {
  enabled: boolean
  onChange: () => void
  disabled?: boolean
  label?: string
  description?: string
}

export default function Toggle({ enabled, onChange, disabled, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div>
          {label && <p className="text-gray-900 dark:text-white">{label}</p>}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
