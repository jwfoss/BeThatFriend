'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import Input from '@/components/ui/Input'
import { isValidEmail } from '@/lib/utils'

export default function CirclePage() {
  const [invites, setInvites] = useState([
    { name: '', email: '' },
    { name: '', email: '' },
    { name: '', email: '' },
  ])
  const [sentInvites, setSentInvites] = useState([false, false, false])
  const [submitting, setSubmitting] = useState(false)
  const [announce, setAnnounce] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSendInvite = async (idx: number) => {
    if (!isValidEmail(invites[idx].email)) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAnnounce('Not authenticated'); setTimeout(() => setAnnounce(''), 3000); setSubmitting(false); return }
      const email = invites[idx].email.trim().toLowerCase()
      if (!email) { setAnnounce('Enter a valid email address'); setTimeout(() => setAnnounce(''), 3000); setSubmitting(false); return }
      await (supabase as any).from('invites').insert({
        inviter_id: user.id,
        contact_name: invites[idx].name,
        contact_email: email,
        status: 'sent',
      })
      setSentInvites(sentInvites.map((s, i) => i === idx ? true : s))
      setAnnounce(`${invites[idx].name || 'Contact'} added`)
      setTimeout(() => setAnnounce(''), 3000)
    } catch (e) {
      console.error(e)
      setAnnounce('Failed to add invite')
      setTimeout(() => setAnnounce(''), 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddFriend = () => {
    if (invites.length >= 3) return
    setInvites([...invites, { name: '', email: '' }])
    setSentInvites([...sentInvites, false])
  }

  const sentCount = sentInvites.filter(Boolean).length
  const canFinish = sentCount >= 3

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Add Friends To Circle
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm text-center">
            Invite 3 or more to see your meaningful dates.
          </p>
        </div>
        <div aria-live="polite" className="sr-only" role="status">{announce}</div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</span>
              </div>
              <div className="col-span-5">
                <span className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</span>
              </div>
              <div className="col-span-2"></div>
            </div>
            {invites.map((invite, idx) => {
              const canAdd = isValidEmail(invite.email)
              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center py-2">
                  <div className="col-span-5">
                    <Input
                      label={idx === 0 ? 'Name' : undefined}
                      placeholder={''}
                      value={invite.name}
                      disabled={sentInvites[idx]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvites(invites.map((inv, i) => i === idx ? { ...inv, name: e.target.value } : inv))}
                      maxLength={100}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      id={`email-${idx}`}
                      type="email"
                      label={idx === 0 ? 'Email' : undefined}
                      placeholder={''}
                      value={invite.email}
                      disabled={sentInvites[idx]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvites(invites.map((inv, i) => i === idx ? { ...inv, email: e.target.value } : inv))}
                      error={invite.email.length > 0 && !isValidEmail(invite.email) ? 'Enter a valid email' : undefined}
                      aria-invalid={!(invite.email === '' || isValidEmail(invite.email))}
                      aria-describedby={!(invite.email === '' || isValidEmail(invite.email)) ? `email-error-${idx}` : undefined}
                      className="w-full h-10"
                    />
                    {!(invite.email === '' || isValidEmail(invite.email)) && (
                      <p id={`email-error-${idx}`} className="text-xs text-red-500 mt-1">Enter a valid email</p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      type="button"
                      className={`w-28 h-10 rounded-xl font-semibold transition-colors text-sm ${sentInvites[idx] ? 'bg-green-500 text-white' : (submitting || !canAdd) ? 'bg-indigo-200 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      disabled={submitting || sentInvites[idx] || !canAdd}
                      onClick={() => handleSendInvite(idx)}
                      aria-disabled={submitting || sentInvites[idx] || !canAdd}
                      aria-label={sentInvites[idx] ? `Row ${idx + 1} added` : `Add contact ${invite.name || 'unnamed'}`}
                    >
                      {sentInvites[idx] ? (<><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Added</>) : 'Add'}
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="pt-2">
              <button
                type="button"
                className={`text-sm ${invites.length >= 3 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:underline'}`}
                onClick={() => { if (invites.length < 3) handleAddFriend() }}
                disabled={invites.length >= 3}
              >
                + Add another friend
              </button>
            </div>

          </div>
        </div>
        <button
          className="w-full py-3 rounded-xl bg-indigo-700 text-white font-bold text-lg disabled:opacity-50 mt-8"
          disabled={!canFinish}
          onClick={() => router.push('/dashboard')}
        >
          Finish
        </button>
        <button
          onClick={() => router.push('/onboard')}
          className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          style={{ marginTop: '8px' }}
        >
          Back to dates
        </button>
      </div>
    </main>
  )
}
