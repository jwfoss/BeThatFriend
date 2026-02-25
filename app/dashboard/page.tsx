'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ImportantDate {
  id: string
  label: string
  date_month: number
  date_day: number
  user_id: string
}

interface ConnectionDate {
  connection_user_id: string
  connection_name: string
  date_label: string
  date_month: number
  date_day: number
}

interface Connection {
  id: string
  user_a_id: string
  user_b_id: string
  status: string
  user_a: { id: string; name: string; email: string }
  user_b: { id: string; name: string; email: string }
}

interface Invite {
  id: string
  contact_name: string
  contact_email: string
  status: string
}

interface IncomingRequest {
  id: string
  user_a_id: string
  user_a: { id: string; name: string; email: string }
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatDate = (month: number, day: number) => {
  return `${months[month - 1]} ${day}`
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [myDates, setMyDates] = useState<ImportantDate[]>([])
  const [connectionDates, setConnectionDates] = useState<ConnectionDate[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([])
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([])
  const [activeTab, setActiveTab] = useState<'sharing' | 'pending' | 'requests'>('sharing')
  const [editingDate, setEditingDate] = useState<ImportantDate | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editMonth, setEditMonth] = useState(1)
  const [editDay, setEditDay] = useState(1)
  const [savingDate, setSavingDate] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const [
        { data: dates },
        { data: friendDates },
        { data: confirmedConnections },
        { data: invites },
        { data: incoming },
      ] = await Promise.all([
        (supabase as any).from('important_dates').select('*').eq('user_id', user.id),
        (supabase as any).rpc('get_connection_dates', { p_user_id: user.id }),
        (supabase as any)
          .from('connections')
          .select('*, user_a:users!connections_user_a_id_fkey(*), user_b:users!connections_user_b_id_fkey(*)')
          .eq('status', 'confirmed')
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`),
        (supabase as any)
          .from('invites')
          .select('*')
          .eq('inviter_id', user.id)
          .in('status', ['queued', 'sent']),
        (supabase as any)
          .from('connections')
          .select('*, user_a:users!connections_user_a_id_fkey(*)')
          .eq('user_b_id', user.id)
          .eq('status', 'pending'),
      ])

      setMyDates(dates || [])
      setConnectionDates(friendDates || [])
      setConnections(confirmedConnections || [])
      setPendingInvites(invites || [])
      setIncomingRequests(incoming || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await (supabase as any)
        .from('connections')
        .update({ status: 'confirmed' })
        .eq('id', connectionId)
      loadDashboard()
    } catch (error) {
      console.error('Error accepting request:', error)
    }
  }

  const openEditModal = (date: ImportantDate) => {
    setEditingDate(date)
    setEditLabel(date.label)
    setEditMonth(date.date_month)
    setEditDay(date.date_day)
  }

  const handleSaveDate = async () => {
    if (!editingDate || !editLabel.trim()) return
    setSavingDate(true)
    try {
      await (supabase as any)
        .from('important_dates')
        .update({
          label: editLabel.trim(),
          date_month: editMonth,
          date_day: editDay
        })
        .eq('id', editingDate.id)
      setEditingDate(null)
      loadDashboard()
    } catch (error) {
      console.error('Error saving date:', error)
    } finally {
      setSavingDate(false)
    }
  }

  const handleAddDate = async () => {
    if (!userId) return
    try {
      await (supabase as any)
        .from('important_dates')
        .insert({
          user_id: userId,
          label: 'New Date',
          date_month: 1,
          date_day: 1
        })
      loadDashboard()
    } catch (error) {
      console.error('Error adding date:', error)
    }
  }

  const getDaysInMonth = (month: number) => {
    const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return daysPerMonth[month - 1] || 31
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Sort connection dates chronologically by month/day
  const sortedConnectionDates = [...connectionDates].sort((a, b) => {
    if (a.date_month !== b.date_month) return a.date_month - b.date_month
    return a.date_day - b.date_day
  })

  // Sort my dates chronologically
  const sortedMyDates = [...myDates].sort((a, b) => {
    if (a.date_month !== b.date_month) return a.date_month - b.date_month
    return a.date_day - b.date_day
  })

  // Get friend info from connections for Sharing tab
  const sharingFriends = connections.map(c => {
    const friend = c.user_a_id === userId ? c.user_b : c.user_a
    return { id: c.id, name: friend?.name || 'Unknown' }
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Be That Friend
          </h1>
        </div>

        {/* Meaningful dates in my circle */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
            Meaningful dates in my circle
          </h2>
          {sortedConnectionDates.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Waiting for friends to join...
            </p>
          ) : (
            <div className="space-y-2">
              {sortedConnectionDates.map((date, i) => (
                <div key={`${date.connection_user_id}-${i}`} className="text-gray-700 dark:text-gray-300">
                  {formatDate(date.date_month, date.date_day)} | {date.date_label} | {date.connection_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My meaningful dates */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
            My meaningful dates
          </h2>
          <div className="space-y-2">
            {sortedMyDates.map(date => (
              <div key={date.id} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDate(date.date_month, date.date_day)} | {date.label}
                </span>
                <button
                  onClick={() => openEditModal(date)}
                  className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddDate}
            className="mt-4 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
          >
            + Add another date
          </button>
        </div>

        {/* Circle Management - Tabbed Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
            My Circle
          </h2>

          {/* Tabs */}
          <div className="flex space-x-1 mb-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sharing')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'sharing'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Sharing ({sharingFriends.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Pending ({pendingInvites.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Requests ({incomingRequests.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[100px]">
            {activeTab === 'sharing' && (
              <div className="space-y-2">
                {sharingFriends.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No connections yet</p>
                ) : (
                  sharingFriends.map(friend => (
                    <div key={friend.id} className="text-gray-700 dark:text-gray-300">
                      {friend.name}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-2">
                {pendingInvites.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No pending invites</p>
                ) : (
                  pendingInvites.map(invite => (
                    <div key={invite.id} className="text-gray-700 dark:text-gray-300">
                      {invite.contact_name || invite.contact_email}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-3">
                {incomingRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No pending requests</p>
                ) : (
                  incomingRequests.map(request => (
                    <div key={request.id} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {request.user_a?.name || 'Someone'}
                      </span>
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Accept
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Discreet Logout at bottom */}
        <div className="pt-4 text-center">
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Edit Date Modal */}
      {editingDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Date</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Occasion
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <select
                    value={editMonth}
                    onChange={(e) => {
                      const newMonth = parseInt(e.target.value)
                      setEditMonth(newMonth)
                      if (editDay > getDaysInMonth(newMonth)) {
                        setEditDay(getDaysInMonth(newMonth))
                      }
                    }}
                    className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                    value={editDay}
                    onChange={(e) => setEditDay(parseInt(e.target.value))}
                    className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: getDaysInMonth(editMonth) }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingDate(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDate}
                disabled={savingDate || !editLabel.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingDate ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
