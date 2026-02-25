'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [emailOptedIn, setEmailOptedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await (supabase as any)
        .from('users')
        .select('name, email, email_opted_in')
        .eq('id', user.id)
        .single()

      if (profile) {
        setName(profile.name)
        setEmail(profile.email)
        setEmailOptedIn(profile.email_opted_in)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEmail = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newOptedIn = !emailOptedIn

      const { error } = await (supabase as any)
        .from('users')
        .update({
          email_opted_in: newOptedIn,
          email_opt_in_confirmed_at: newOptedIn ? new Date().toISOString() : null,
        })
        .eq('id', user.id)

      if (error) throw error
      setEmailOptedIn(newOptedIn)
    } catch (error) {
      console.error('Error toggling email reminders:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <Link
            href="/circle"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Profile section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white">{name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white">{email}</p>
            </div>
          </div>
        </section>

        {/* Email Notifications section */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Email Reminders</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 dark:text-white">Daily Reminders</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about upcoming dates
              </p>
            </div>
            <button
              onClick={handleToggleEmail}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailOptedIn ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailOptedIn ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {!emailOptedIn && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              When enabled, you&apos;ll receive email reminders for your friends&apos; important dates.
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
