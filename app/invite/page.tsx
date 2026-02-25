'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isValidEmail } from '@/lib/utils'
import Button from '@/components/ui/Button'
import InviteFriendsGrid, { Friend } from '@/components/InviteFriendsGrid'



export default function InvitePage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch invite code for share link
    const fetchInviteCode = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await (supabase as any)
        .from('users')
        .select('invite_code')
        .eq('id', user.id)
        .single()
      if (profile) setInviteCode(profile.invite_code)
    }
    fetchInviteCode()
  }, [])

  const handleSubmit = async () => {
    if (friends.filter(f => f.name && isValidEmail(f.email)).length < 3) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const newInvites = friends
        .filter(f => f.name && isValidEmail(f.email))
        .map(f => ({
          inviter_id: user.id,
          contact_name: f.name,
          contact_email: f.email.trim().toLowerCase(),
          status: 'queued',
        }))
      if (newInvites.length === 0) return
      await (supabase as any).from('invites').insert(newInvites)
      router.push('/circle')
    } catch (error) {
      console.error('Error sending invites:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex flex-col items-center">
          <Link
            href="/circle"
            className="self-start text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Invite 3 Friends (or more)</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-2">
            Share your meaningful dates with friends. Add at least 3 to get started.
          </p>
        </div>
      </header>
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <InviteFriendsGrid friends={friends} setFriends={setFriends} />
          <p className="text-sm text-gray-500 mt-2">
            {friends.filter(f => f.name && isValidEmail(f.email)).length} of 3 friends added
          </p>
          <Button
            className="w-full mt-4"
            disabled={friends.filter(f => f.name && isValidEmail(f.email)).length < 3 || submitting}
            onClick={handleSubmit}
            loading={submitting}
          >
            Continue
          </Button>
        </div>
        {/* Optionally, keep the share link fallback. If you want to remove it, delete this block. */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mt-8">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Or share your invite link directly:
          </p>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${inviteCode}` : ''}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/join/${inviteCode}`)
              }}
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
