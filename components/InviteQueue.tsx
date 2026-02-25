'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Invite {
  id: string
  contact_name: string
  contact_email: string | null
  status: string
}

interface InviteQueueProps {
  invites: Invite[]
  inviteCode: string
  onMarkSent: (inviteId: string) => void
}

export default function InviteQueue({ invites, inviteCode: _inviteCode, onMarkSent }: InviteQueueProps) {
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const queuedInvites = invites.filter((i) => i.status === 'queued')
  const sentInvites = invites.filter((i) => i.status === 'sent')

  const handleSendNext = async (invite: Invite) => {
    if (!invite.contact_email) return

    setSendingId(invite.id)
    setErrorId(null)

    try {
      const res = await fetch('/api/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: invite.id }),
      })

      if (!res.ok) {
        throw new Error('Failed to send invite')
      }

      onMarkSent(invite.id)
    } catch {
      setErrorId(invite.id)
    } finally {
      setSendingId(null)
    }
  }

  if (queuedInvites.length === 0 && sentInvites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No invites in queue.</p>
        <p className="text-sm mt-1">Add friends using the form above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Queued invites */}
      {queuedInvites.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Ready to Send ({queuedInvites.length})
          </h3>
          <div className="space-y-2">
            {queuedInvites.map((invite, index) => (
              <div
                key={invite.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {invite.contact_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {invite.contact_email}
                  </p>
                </div>
                {index === 0 ? (
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSendNext(invite)}
                      loading={sendingId === invite.id}
                    >
                      Send Invite
                    </Button>
                    {errorId === invite.id && (
                      <p className="text-xs text-red-500">Failed to send. Try again.</p>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    #{index + 1} in queue
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent invites */}
      {sentInvites.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sent ({sentInvites.length})
          </h3>
          <div className="space-y-2">
            {sentInvites.map((invite) => (
              <div
                key={invite.id}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {invite.contact_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Invite sent
                  </p>
                </div>
                <span className="text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
