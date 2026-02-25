'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Contact {
  name: string
  phone: string
}

interface ContactPickerProps {
  onContactsSelected: (contacts: Contact[]) => void
  loading?: boolean
}

export default function ContactPicker({ onContactsSelected, loading }: ContactPickerProps) {
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(true)

  const handleSelectContacts = async () => {
    setError('')

    // Check if Contact Picker API is supported
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
      setIsSupported(false)
      setError('Contact Picker not supported on this device. Please add contacts manually.')
      return
    }

    try {
      const props = ['name', 'tel']
      const opts = { multiple: true }

      // @ts-ignore - Contact Picker API types
      const contacts = await navigator.contacts.select(props, opts)

      const formattedContacts: Contact[] = contacts
        .filter((c: any) => c.tel && c.tel.length > 0)
        .map((c: any) => ({
          name: c.name?.[0] || 'Unknown',
          phone: c.tel[0],
        }))

      if (formattedContacts.length === 0) {
        setError('No contacts with phone numbers were selected')
        return
      }

      onContactsSelected(formattedContacts)
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        setError('Please close other apps using contacts and try again')
      } else if (err.name === 'SecurityError') {
        setError('Permission denied. Please allow access to contacts.')
      } else if (err.name !== 'AbortError') {
        setError('Failed to access contacts. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSelectContacts}
        loading={loading}
        className="w-full"
        variant="primary"
      >
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Select from Contacts</span>
        </span>
      </Button>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {!isSupported && (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Tip: This works best on mobile Chrome or Safari
        </p>
      )}
    </div>
  )
}
