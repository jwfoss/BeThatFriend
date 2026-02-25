'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import DateCard from '@/components/DateCard'
import Button from '@/components/ui/Button'

interface InviterDate {
  label: string
  date_month: number
  date_day: number
}

interface Inviter {
  id: string
  name: string
  dates: InviterDate[]
}

export default function JoinPage() {
  const [inviter, setInviter] = useState<Inviter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const router = useRouter()
  const params = useParams()
  const code = params.code as string
  const supabase = createClient()

  useEffect(() => {
    loadInviterData()
  }, [code])

  const loadInviterData = async () => {
    try {
      // Get inviter by invite code
      const { data: inviterData, error: inviterError } = await (supabase as any)
        .from('users')
        .select('id, name')
        .eq('invite_code', code)
        .single()

      if (inviterError || !inviterData) {
        setError('Invalid invite link')
        setLoading(false)
        return
      }

      // Get inviter's dates
      const { data: dates } = await (supabase as any)
        .from('important_dates')
        .select('label, date_month, date_day')
        .eq('user_id', inviterData.id)
        .order('date_month')
        .order('date_day')

      setInviter({
        ...inviterData,
        dates: dates || [],
      })

      // Check if current user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)

        // Check if already connected
        const { data: connection } = await (supabase as any)
          .from('connections')
          .select('id')
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
          .or(`user_a_id.eq.${inviterData.id},user_b_id.eq.${inviterData.id}`)
          .single()

        if (connection) {
          setHasJoined(true)
        }
      }
    } catch (err) {
      console.error('Error loading inviter data:', err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCircle = async () => {
    if (!inviter) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // Store invite code and redirect to login
        sessionStorage.setItem('pendingInviteCode', code)
        router.push('/login')
        return
      }

      // Create connection (as pending, inviter will confirm)
      const { error: connectionError } = await (supabase as any).from('connections').insert({
        user_a_id: inviter.id,
        user_b_id: user.id,
        status: 'confirmed', // Auto-confirm since they accepted the invite
        confirmed_at: new Date().toISOString(),
      })

      if (connectionError) {
        if (connectionError.code === '23505') {
          // Already connected
          setHasJoined(true)
        } else {
          throw connectionError
        }
      } else {
        // Update invite status if exists
        await (supabase as any)
          .from('invites')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('inviter_id', inviter.id)
          .eq('contact_email', user.email)

        setHasJoined(true)
      }
    } catch (err) {
      console.error('Error joining circle:', err)
      setError('Failed to join circle. Please try again.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </main>
    )
  }

  if (error || !inviter) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {error || 'Invite not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            This invite link may have expired or is invalid.
          </p>
          <Link
            href="/"
            className="inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Go to homepage
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Be That Friend
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {inviter.name} invited you to their circle!
          </p>
        </div>

        {/* Inviter's dates preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
            {inviter.name}&apos;s Important Dates
          </h2>
          <div className="space-y-3">
            {inviter.dates.slice(0, 3).map((date, i) => (
              <DateCard
                key={i}
                label={date.label}
                month={date.date_month}
                day={date.date_day}
              />
            ))}
            {inviter.dates.length > 3 && (
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                +{inviter.dates.length - 3} more dates
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        {hasJoined ? (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-green-700 dark:text-green-400 font-medium">
              You&apos;re connected with {inviter.name}!
            </p>
            <Link
              href="/circle"
              className="inline-block mt-3 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Go to your circle
            </Link>
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-4">
            <Button onClick={handleJoinCircle} className="w-full">
              Join {inviter.name}&apos;s Circle
            </Button>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              They&apos;ll see your important dates too
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Join {inviter.name}&apos;s circle and never miss their important dates!
            </p>
            <Link href="/login" className="block">
              <Button className="w-full">
                Sign Up to Join
              </Button>
            </Link>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}

        {/* Reciprocity info */}
        {!hasJoined && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
            <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">
              How it works
            </h3>
            <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-2">
              <li className="flex items-start space-x-2">
                <span>1.</span>
                <span>Create your account and add your important dates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>2.</span>
                <span>Invite 10 friends to unlock full access</span>
              </li>
              <li className="flex items-start space-x-2">
                <span>3.</span>
                <span>Get email reminders so you never miss a date</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
