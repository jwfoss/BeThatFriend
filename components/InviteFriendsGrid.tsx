import Input from '@/components/ui/Input'
import { isValidEmail } from '@/lib/utils'

export type Friend = {
  id?: string
  name: string
  email: string
}

export default function InviteFriendsGrid({ friends, setFriends }: {
  friends: Friend[],
  setFriends: (friends: Friend[]) => void
}) {
  // Ensure at least 3 rows
  const filledFriends = friends.length >= 3 ? friends : [
    ...friends,
    ...Array(3 - friends.length).fill(0).map(() => ({ id: crypto.randomUUID(), name: '', email: '' }))
  ]

  const handleChange = (idx: number, field: string, value: any) => {
    const updated = filledFriends.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    )
    setFriends(updated)
  }

  const handleDelete = (idx: number) => {
    setFriends(filledFriends.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-4">
      {filledFriends.map((friend, idx) => (
        <div key={friend.id || idx} className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-5">
            <Input
              label={idx === 0 ? 'Name' : undefined}
              placeholder={''}
              value={friend.name}
              onChange={e => handleChange(idx, 'name', e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="col-span-6">
            <Input
              label={idx === 0 ? 'Email' : undefined}
              placeholder={''}
              value={friend.email}
              onChange={e => handleChange(idx, 'email', e.target.value)}
              maxLength={100}
              required
              type="email"
              error={friend.email.length > 0 && !isValidEmail(friend.email) ? 'Enter a valid email' : undefined}
            />
          </div>
          <div className="col-span-1 flex justify-center items-end">
            {filledFriends.length > 3 && (
              <button
                type="button"
                className="text-xs text-red-500 hover:underline"
                onClick={() => handleDelete(idx)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <button
          type="button"
          className="text-indigo-600 hover:underline text-sm"
          onClick={() => setFriends([...filledFriends, { id: crypto.randomUUID(), name: '', email: '' }])}
        >
          + Add another friend
        </button>
      </div>
    </div>
  )
}
