
export default function InviteRows({ invites, setInvites, sentInvites }: {
  invites: { name: string, email: string }[],
  setInvites: (invites: { name: string, email: string }[]) => void,
  sentInvites: boolean[]
}) {
  return (
    <div className="space-y-4">
      {invites.map((invite, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <button
            type="button"
            className={`flex-1 px-4 py-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left focus:outline-none transition-all ${sentInvites[idx] ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-400'}`}
            disabled={sentInvites[idx]}
          >
            {invite.name ? (
              <span className="block text-lg font-semibold text-gray-900 dark:text-white">{invite.name}</span>
            ) : (
              <span className="text-gray-500">Enter Contact</span>
            )}
            {invite.name && invite.email && !sentInvites[idx] && (
              <span className="block text-xs text-gray-500 mt-1">{invite.email}</span>
            )}
            {invite.name && invite.email && sentInvites[idx] && (
              <span className="block text-xs text-gray-500 mt-1">{invite.email}</span>
            )}
          </button>
          {sentInvites[idx] && (
            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Sent
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
