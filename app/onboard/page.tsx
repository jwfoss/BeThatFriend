'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateInviteCode } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DateGrid from '@/components/DateGrid'

interface ImportantDate {
  id?: string
  label: string
  month: number
  day: number
}

export default function OnboardPage() {
  const [step, setStep] = useState<'name' | 'dates'>('name')
  const [name, setName] = useState('')
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setStep('dates')
    }
  }

  const handleAddDate = (date: { label: string; month: number; day: number }) => {
    setDates([...dates, { ...date, id: crypto.randomUUID() }])
  }

  const handleDeleteDate = (id: string) => {
    setDates(dates.filter((d) => d.id !== id))
  }

  const handleFinishOnboarding = async () => {
    if (dates.length < 3) {
      setError('Please add at least 3 important dates')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user already exists
      const { data: existingUser, error: fetchError } = await (supabase as any)
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      let inviteCode = generateInviteCode()

      if (existingUser) {
        // User exists, update their name if changed (optional)
        await (supabase as any).from('users').update({ name: name.trim() }).eq('id', user.id)
      } else {
        // New user, insert profile
        const { error: userError } = await (supabase as any).from('users').insert({
          id: user.id,
          email: user.email!,
          name: name.trim(),
          invite_code: inviteCode,
        })
        if (userError) throw userError
      }

      // Add important dates (delete old and insert new for idempotency)
      await (supabase as any).from('important_dates').delete().eq('user_id', user.id)
      const datesToInsert = dates.map((d) => ({
        user_id: user.id,
        label: d.label,
        date_month: d.month,
        date_day: d.day,
      }))
      const { error: datesError } = await (supabase as any).from('important_dates').insert(datesToInsert)
      if (datesError) throw datesError

      // Check for pending invite code from join page
      const pendingInviteCode = sessionStorage.getItem('pendingInviteCode')
      if (pendingInviteCode) {
        sessionStorage.removeItem('pendingInviteCode')
        router.push(`/join/${pendingInviteCode}`)
      } else {
        router.push('/circle')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {step === 'name' ? 'Welcome!' : 'Add 3 Meaningful Dates (Or More)'}
          </h1>
          {step === 'name' && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">Let&apos;s get to know you</p>
          )}
          {step === 'dates' && (
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm text-center">Think &quot;I&apos;d love for friends and family to reach out on these dates.&quot;</p>
          )}
        </div>


        {step === 'name' ? (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <Input
              label="What should we call you?"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={!name.trim()}
            >
              Continue
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <DateGrid dates={dates} setDates={setDates} />
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 font-semibold"
                  style={{ fontSize: '15px' }}
                  onClick={() => setDates([...dates, { id: crypto.randomUUID(), label: '', month: 1, day: 1 }])}
                >
                  + Add another date
                </button>
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            <Button
              onClick={handleFinishOnboarding}
              loading={loading}
              className="w-full"
              disabled={dates.filter(d => d.label.trim()).length < 3}
            >
              Continue
            </Button>
            <button
              onClick={() => setStep('name')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              style={{ marginTop: '8px' }}
            >
              Back to name
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">Don&apos;t worry, you can always add more later from your dashboard.</p>
          </div>
        )}
      </div>
    </main>
  )
}
